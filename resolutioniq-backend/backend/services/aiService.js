const fetch = require("node-fetch");
const { ISSUE_TYPES, DEPARTMENT_ROUTING, SEVERITY } = require("../config/constants");

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return key;
}

async function callGemini(model, parts) {
  const key = getApiKey();
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");
  return text;
}

function safeParseJSON(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

/**
 * 1. AI Complaint Generator
 * Converts a citizen's raw description into a formal civic complaint.
 */
async function generateFormalComplaint(rawDescription, context = {}) {
  const model = process.env.GEMINI_TEXT_MODEL || "gemini-1.5-flash";
  const prompt = `You are a civic complaint drafting assistant for a municipal government platform.
Convert the citizen's informal complaint into a clear, formal, professional complaint suitable for
a government department, while preserving all factual details (location, issue, impact).

Citizen description: "${rawDescription}"
${context.address ? `Location: ${context.address}` : ""}

Respond ONLY with JSON in this exact shape:
{"formalComplaint": "string", "summary": "one sentence string"}`;

  try {
    const text = await callGemini(model, [{ text: prompt }]);
    const parsed = safeParseJSON(text, null);
    if (parsed?.formalComplaint) return parsed;
  } catch (err) {
    console.error("generateFormalComplaint failed, using fallback:", err.message);
  }

  // Fallback if Gemini is unavailable or key missing (keeps the MVP demoable offline)
  return {
    formalComplaint: `This is to formally report the following civic issue: ${rawDescription}. The undersigned requests prompt inspection and remedial action by the concerned department.`,
    summary: rawDescription.slice(0, 140),
  };
}

/**
 * 2. AI Department Routing
 * Classifies the complaint into an issue type and returns routing + confidence.
 */
async function classifyAndRoute(rawDescription) {
  const model = process.env.GEMINI_TEXT_MODEL || "gemini-1.5-flash";
  const issueTypeList = Object.values(ISSUE_TYPES).join(", ");
  const prompt = `Classify this civic complaint into exactly one issue type from: [${issueTypeList}].
Also estimate severity from: [low, medium, high, critical].

Complaint: "${rawDescription}"

Respond ONLY with JSON: {"issueType": "string", "confidence": number (0-1), "severity": "string", "severityConfidence": number (0-1), "reasoning": "short string"}`;

  let result;
  try {
    const text = await callGemini(model, [{ text: prompt }]);
    result = safeParseJSON(text, null);
  } catch (err) {
    console.error("classifyAndRoute failed, using keyword fallback:", err.message);
  }

  if (!result || !Object.values(ISSUE_TYPES).includes(result.issueType)) {
    result = keywordFallbackClassify(rawDescription);
  }

  const department = DEPARTMENT_ROUTING[result.issueType] || DEPARTMENT_ROUTING[ISSUE_TYPES.OTHER];
  return { ...result, departmentName: department };
}

// Simple keyword-based fallback so the pipeline still works without an API key
function keywordFallbackClassify(text) {
  const lower = text.toLowerCase();
  const rules = [
    { type: ISSUE_TYPES.POTHOLE, keywords: ["pothole", "road damage", "crater", "broken road"] },
    { type: ISSUE_TYPES.GARBAGE, keywords: ["garbage", "trash", "waste", "litter", "dump"] },
    { type: ISSUE_TYPES.STREETLIGHT, keywords: ["streetlight", "street light", "lamp", "dark street"] },
    { type: ISSUE_TYPES.WATER_LEAKAGE, keywords: ["water leak", "pipe burst", "leakage", "low pressure"] },
    {
      type: ISSUE_TYPES.ILLEGAL_CONSTRUCTION,
      keywords: ["illegal construction", "unauthorized building", "encroachment"],
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return { issueType: rule.type, confidence: 0.6, severity: SEVERITY.MEDIUM, severityConfidence: 0.5, reasoning: "keyword match (offline fallback)" };
    }
  }

  return { issueType: ISSUE_TYPES.OTHER, confidence: 0.3, severity: SEVERITY.MEDIUM, severityConfidence: 0.3, reasoning: "no keyword match (offline fallback)" };
}

/**
 * 4. Image Complaint Processing via Gemini Vision
 * imageBase64: raw base64 string (no data: prefix), mimeType e.g. "image/jpeg"
 */
async function analyzeImage(imageBase64, mimeType) {
  const model = process.env.GEMINI_VISION_MODEL || "gemini-1.5-flash";
  const issueTypeList = Object.values(ISSUE_TYPES).join(", ");
  const prompt = `Analyze this civic infrastructure photo. Identify the issue type from: [${issueTypeList}].
Estimate severity from: [low, medium, high, critical]. If nothing relevant is visible, use issueType "other" with low confidence.

Respond ONLY with JSON: {"issueType": "string", "confidence": number (0-1), "severity": "string", "severityConfidence": number (0-1), "description": "short string describing what's visible"}`;

  try {
    const text = await callGemini(model, [
      { text: prompt },
      { inline_data: { mime_type: mimeType, data: imageBase64 } },
    ]);
    const parsed = safeParseJSON(text, null);
    if (parsed?.issueType) return parsed;
  } catch (err) {
    console.error("analyzeImage failed:", err.message);
  }

  return {
    issueType: ISSUE_TYPES.OTHER,
    confidence: 0,
    severity: SEVERITY.MEDIUM,
    severityConfidence: 0,
    description: "Image analysis unavailable (Gemini Vision not configured or request failed).",
  };
}

module.exports = {
  generateFormalComplaint,
  classifyAndRoute,
  analyzeImage,
};
