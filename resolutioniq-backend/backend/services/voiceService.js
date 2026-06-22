const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");

/**
 * 3. Voice Complaint Processing
 * Audio file -> Whisper STT -> language detection -> (translation handled by Gemini text model
 * as a follow-up step in the controller, since Whisper itself only transcribes/translates to English).
 */
async function transcribeAudio(filePath) {
  const apiKey = process.env.WHISPER_API_KEY;
  const apiUrl = process.env.WHISPER_API_URL || "https://api.openai.com/v1/audio/transcriptions";

  if (!apiKey) {
    console.warn("WHISPER_API_KEY not configured, returning empty transcript.");
    return { transcript: "", detectedLanguage: "unknown" };
  }

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("model", "whisper-1");
  form.append("response_format", "verbose_json");

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, ...form.getHeaders() },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Whisper API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return {
    transcript: data.text || "",
    detectedLanguage: data.language || "unknown",
  };
}

module.exports = { transcribeAudio };
