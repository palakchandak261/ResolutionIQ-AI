import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateComplaint, useListComplaints, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit, Mic, MicOff, Upload, Image as ImageIcon, MapPin, AlertTriangle,
  CheckCircle2, ArrowRight, Sparkles, Loader2, ThumbsUp, Bell, Plus, Camera,
  Globe, Users, TrendingUp, Shield, Zap, ChevronRight, X, FileText,
  Activity, Clock
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "text" | "voice" | "image";
type Step = "input" | "analyzing" | "review" | "success";

interface AiAnalysis {
  issueType: string;
  department: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  priority: "Normal" | "High" | "Critical";
  confidence: number;
  ward: string;
  estimatedDays: number;
  riskScore: number;
  affectedCitizens: number;
  generatedTitle: string;
  formalDraft: string;
  citizenSummary: string;
  departmentNotes: string;
}

interface DuplicateResult {
  count: number;
  topVotes: number;
  nearestId: number | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEPT_MAP: Record<string, string> = {
  Pothole: "Public Works Department",
  Garbage: "Sanitation Department",
  "Water Leakage": "Water Supply Department",
  "Broken Streetlight": "Electricity Department",
  "Illegal Construction": "Town Planning Department",
  "Sewage Overflow": "Sewage & Drainage Department",
};

const SEV_MAP: Record<string, "Low" | "Medium" | "High" | "Critical"> = {
  Pothole: "High", Garbage: "Medium", "Water Leakage": "High",
  "Broken Streetlight": "Medium", "Illegal Construction": "Critical", "Sewage Overflow": "Critical",
};

const KEYWORDS: Record<string, string[]> = {
  Pothole: ["pothole", "road", "crater", "cavity", "road damage", "broken road", "road repair"],
  Garbage: ["garbage", "trash", "waste", "dump", "litter", "rubbish", "dirty", "stench", "smell"],
  "Water Leakage": ["water", "pipe", "leak", "flood", "burst", "supply", "contamination", "brown water"],
  "Broken Streetlight": ["light", "streetlight", "lamp", "dark", "electrical", "wire", "shock", "power"],
  "Illegal Construction": ["construction", "building", "excavation", "illegal", "unauthorized", "demolish"],
  "Sewage Overflow": ["sewage", "drain", "overflow", "manhole", "sewer", "blocked", "wastewater"],
};

const WARDS = ["Ward 1","Ward 2","Ward 3","Ward 4","Ward 5","Ward 6","Ward 7","Ward 8","Ward 9","Ward 10","Ward 11","Ward 12"];
const LANGUAGES = ["English", "Hindi", "Marathi"];

const SEV_COLOR: Record<string, string> = {
  Critical: "text-red-400 bg-red-500/15 border-red-500/30",
  High: "text-orange-400 bg-orange-500/15 border-orange-500/30",
  Medium: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
  Low: "text-green-400 bg-green-500/15 border-green-500/30",
};

// ─── AI simulation ────────────────────────────────────────────────────────────

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [cat, kws] of Object.entries(KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) return cat;
  }
  return "Pothole";
}

function detectWard(text: string): string {
  const lower = text.toLowerCase();
  for (const w of WARDS) {
    if (lower.includes(w.toLowerCase())) return w;
  }
  return WARDS[Math.floor(Math.random() * WARDS.length)];
}

function buildAnalysis(text: string, extraWard?: string): AiAnalysis {
  const cat = detectCategory(text);
  const dept = DEPT_MAP[cat];
  const sev = SEV_MAP[cat];
  const conf = 0.88 + Math.random() * 0.09;
  const ward = extraWard || detectWard(text);
  const days = sev === "Critical" ? 3 : sev === "High" ? 5 : 7;
  const affected = Math.floor(50 + Math.random() * 450);
  const risk = sev === "Critical" ? 88 + Math.floor(Math.random() * 11) : sev === "High" ? 65 + Math.floor(Math.random() * 20) : 30 + Math.floor(Math.random() * 30);
  const shortText = text.slice(0, 80);
  return {
    issueType: cat, department: dept, severity: sev,
    priority: sev === "Critical" ? "Critical" : "High",
    confidence: Math.round(conf * 100),
    ward, estimatedDays: days, riskScore: risk,
    affectedCitizens: affected,
    generatedTitle: `${sev} ${cat} Issue at ${ward} — Requires Immediate Attention`,
    formalDraft: `This is to formally bring to your attention a ${sev.toLowerCase()}-severity ${cat.toLowerCase()} issue reported in ${ward}. The issue described by the citizen is as follows: "${shortText}...". Based on AI analysis, this complaint has been routed to ${dept} for resolution within ${days} business days. Immediate inspection and remediation is requested.`,
    citizenSummary: `Your ${cat.toLowerCase()} complaint in ${ward} has been received. The AI has assessed it as ${sev.toLowerCase()} severity and routed it to ${dept}. Expected resolution within ${days} days.`,
    departmentNotes: `AI Confidence: ${Math.round(conf * 100)}%. Category: ${cat}. Severity: ${sev}. Risk Score: ${risk}/100. ${affected} citizens potentially affected. Priority action recommended.`,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm ${glow ? "shadow-[0_0_30px_rgba(14,165,233,0.12)]" : ""} ${className}`}>
      {children}
    </div>
  );
}

function AiBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25 text-[10px] font-semibold uppercase tracking-wider font-mono">
      <Sparkles className="w-2.5 h-2.5" />{label}
    </span>
  );
}

function ConfidenceBar({ pct }: { pct: number }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400" />
    </div>
  );
}

function SeverityPill({ sev }: { sev: string }) {
  return <span className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider font-mono ${SEV_COLOR[sev] ?? SEV_COLOR.Medium}`}>{sev}</span>;
}

// ─── Analysis Panel ───────────────────────────────────────────────────────────

function AnalysisPanel({ analysis, loading }: { analysis: AiAnalysis | null; loading: boolean }) {
  return (
    <GlassCard className="p-5 h-full flex flex-col" glow={!!analysis}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center">
          <BrainCircuit className="w-4 h-4 text-sky-400" />
        </div>
        <span className="text-sm font-semibold text-white">AI Analysis</span>
        {loading && <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin ml-auto" />}
        {analysis && !loading && <AiBadge label="Live" />}
      </div>

      {!analysis && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">Start describing your issue to see live AI analysis</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {analysis && (
          <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-4">
            {/* Issue type */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/8">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1.5">Detected Issue</div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">{analysis.issueType}</span>
                <SeverityPill sev={analysis.severity} />
              </div>
            </div>

            {/* Department */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/8">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">Department</div>
              <div className="text-sm font-medium text-white leading-snug">{analysis.department}</div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Priority", value: analysis.priority, mono: false },
                { label: "Est. Days", value: `${analysis.estimatedDays}d`, mono: true },
                { label: "Ward", value: analysis.ward, mono: false },
                { label: "Risk Score", value: `${analysis.riskScore}/100`, mono: true },
              ].map(item => (
                <div key={item.label} className="p-2.5 rounded-lg bg-white/5 border border-white/8">
                  <div className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{item.label}</div>
                  <div className={`text-sm font-bold text-white mt-0.5 ${item.mono ? "font-mono" : ""}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Confidence */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">AI Confidence</span>
                <span className="text-sm font-bold font-mono text-sky-400">{analysis.confidence}%</span>
              </div>
              <ConfidenceBar pct={analysis.confidence} />
            </div>

            {/* Affected */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <Users className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-sky-300">{analysis.affectedCitizens.toLocaleString()} citizens potentially affected</div>
                <div className="text-[10px] text-sky-400/60 mt-0.5">Based on complaint density in {analysis.ward}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// ─── Text Tab ─────────────────────────────────────────────────────────────────

function TextTab({ onAnalysis }: { onAnalysis: (text: string, a: AiAnalysis | null) => void }) {
  const [text, setText] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(val: string) {
    setText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 15) { onAnalysis(val, null); return; }
    debounceRef.current = setTimeout(() => {
      onAnalysis(val, buildAnalysis(val));
    }, 600);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          className="min-h-[200px] bg-white/5 border-white/15 text-white placeholder:text-white/25 text-base resize-none rounded-xl focus:border-sky-500/50 focus:ring-sky-500/20 leading-relaxed"
          placeholder="Describe the issue in your own words...&#10;&#10;Example: There is a huge pothole outside City College on MG Road causing accidents every morning. The hole is about 2 feet wide and cars are swerving dangerously."
          value={text}
          onChange={e => handleChange(e.target.value)}
        />
        {text.length > 15 && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-500/30">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span className="text-[10px] font-mono text-sky-400">AI analyzing...</span>
            </div>
          </motion.div>
        )}
      </div>
      {text.length > 0 && (
        <div className="text-[10px] text-white/30 font-mono text-right">{text.length} chars · AI activates at 15+</div>
      )}
    </div>
  );
}

// ─── Voice Tab ────────────────────────────────────────────────────────────────

function VoiceTab({ onAnalysis }: { onAnalysis: (text: string, a: AiAnalysis | null) => void }) {
  const [recording, setRecording] = useState(false);
  const [language, setLanguage] = useState("English");
  const [transcript, setTranscript] = useState("");
  const [translated, setTranslated] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const recognitionRef = useRef<any>(null);

  function startRecording() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language === "Hindi" ? "hi-IN" : language === "Marathi" ? "mr-IN" : "en-IN";
    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(t);
      setDetectedLang(language);
      setTranslated(t);
      onAnalysis(t, t.length > 15 ? buildAnalysis(t) : null);
    };
    rec.start();
    recognitionRef.current = rec;
    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="space-y-5">
      {/* Language selector */}
      <div className="flex gap-2">
        {LANGUAGES.map(l => (
          <button key={l} onClick={() => setLanguage(l)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${language === l ? "bg-sky-500/20 border-sky-500/40 text-sky-300" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/8"}`}>
            <Globe className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />{l}
          </button>
        ))}
      </div>

      {/* Recording area */}
      <div className={`rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-4 transition-all ${recording ? "border-red-500/50 bg-red-500/5" : "border-white/15 bg-white/3"}`}>
        <motion.div animate={recording ? { scale: [1, 1.15, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2 }}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${recording ? "bg-red-500/20 border-2 border-red-500/50" : "bg-white/8 border border-white/20"}`}>
          {recording ? <MicOff className="w-7 h-7 text-red-400" /> : <Mic className="w-7 h-7 text-white/60" />}
        </motion.div>
        {recording ? (
          <div className="text-center">
            <div className="text-sm font-medium text-red-400 animate-pulse">Recording in {language}...</div>
            <div className="text-xs text-white/40 mt-1">Speak clearly into your microphone</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-sm text-white/50">Press to record your complaint</div>
            <div className="text-xs text-white/30 mt-1">Supports {LANGUAGES.join(", ")}</div>
          </div>
        )}
        <div className="flex gap-3">
          {!recording ? (
            <Button onClick={startRecording} className="bg-sky-500 hover:bg-sky-400 text-white border-0 gap-2">
              <Mic className="w-4 h-4" /> Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive" className="gap-2">
              <MicOff className="w-4 h-4" /> Stop Recording
            </Button>
          )}
          <Button variant="outline" className="border-white/15 text-white/60 hover:bg-white/8 gap-2">
            <Upload className="w-4 h-4" /> Upload Audio
          </Button>
        </div>
      </div>

      {/* Transcript result */}
      <AnimatePresence>
        {transcript && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AiBadge label="Transcript" />
                {detectedLang && <span className="text-[10px] text-white/40 font-mono">Detected: {detectedLang}</span>}
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{transcript}</p>
            </GlassCard>
            {translated !== transcript && (
              <GlassCard className="p-4">
                <AiBadge label="Translated" />
                <p className="text-sm text-white/80 mt-2 leading-relaxed">{translated}</p>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Image Tab ────────────────────────────────────────────────────────────────

function ImageTab({ onAnalysis }: { onAnalysis: (text: string, a: AiAnalysis | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<{ type: string; severity: string; confidence: number; dept: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(e.target?.result as string);
      setScanning(true);
      setDetected(null);
      setTimeout(() => {
        const cats = Object.keys(DEPT_MAP);
        const cat = cats[Math.floor(Math.random() * cats.length)];
        const d = {
          type: cat, severity: SEV_MAP[cat],
          confidence: Math.round((0.85 + Math.random() * 0.12) * 100),
          dept: DEPT_MAP[cat],
        };
        setDetected(d);
        setScanning(false);
        const synth = `${cat} issue detected in uploaded image. Severity ${SEV_MAP[cat]}.`;
        onAnalysis(synth, buildAnalysis(synth));
      }, 2000);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        className="rounded-2xl border-2 border-dashed border-white/15 bg-white/3 p-8 text-center hover:border-sky-500/40 hover:bg-sky-500/5 transition-all cursor-pointer"
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/15 flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-white/40" />
          </div>
          <div>
            <div className="text-sm font-medium text-white/70">Drag & drop or click to upload</div>
            <div className="text-xs text-white/35 mt-1">PNG, JPG, WEBP — AI will auto-detect the issue</div>
          </div>
          <div className="flex gap-2 mt-1">
            <Button size="sm" variant="outline" className="border-white/15 text-white/60 hover:bg-white/8 gap-1.5 text-xs">
              <Camera className="w-3.5 h-3.5" /> Camera
            </Button>
            <Button size="sm" variant="outline" className="border-white/15 text-white/60 hover:bg-white/8 gap-1.5 text-xs">
              <ImageIcon className="w-3.5 h-3.5" /> Gallery
            </Button>
          </div>
        </div>
      </div>

      {/* Preview + detection */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 relative">
              <img src={preview} alt="Uploaded" className="w-full h-40 object-cover" />
              {scanning && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                  <span className="text-xs text-sky-300 font-mono">AI scanning image...</span>
                  <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-sky-400 rounded-full" animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, ease: "linear" }} />
                  </div>
                </div>
              )}
            </div>
            {detected && (
              <GlassCard className="p-4 space-y-3">
                <AiBadge label="AI Detection" />
                <div className="space-y-2 text-sm">
                  <Row label="Issue Type" value={detected.type} />
                  <Row label="Severity" value={<SeverityPill sev={detected.severity} />} />
                  <Row label="Confidence" value={<span className="font-mono text-sky-400">{detected.confidence}%</span>} />
                  <Row label="Department" value={<span className="text-xs leading-tight text-white/80">{detected.dept}</span>} />
                </div>
                <ConfidenceBar pct={detected.confidence} />
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/40 text-xs">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ─── Location Picker ──────────────────────────────────────────────────────────

function LocationPicker({ ward, onChange }: { ward: string; onChange: (w: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = search ? WARDS.filter(w => w.toLowerCase().includes(search.toLowerCase())) : WARDS;

  return (
    <div className="space-y-4">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-sky-500/50"
          placeholder="Search address or ward..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button size="sm" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-300 text-xs gap-1 h-7 hover:bg-sky-500/10">
          <MapPin className="w-3 h-3" /> Use My Location
        </Button>
      </div>

      {/* Simulated map */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900" style={{ height: 180 }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="flex gap-1 flex-wrap justify-center max-w-xs">
              {WARDS.map(w => (
                <button key={w} onClick={() => onChange(w)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all ${ward === w ? "bg-sky-500/30 border-sky-500/50 text-sky-300 scale-105" : "bg-white/8 border-white/15 text-white/50 hover:bg-white/12"}`}>
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>
        {ward && (
          <motion.div key={ward} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 bg-sky-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            <MapPin className="w-3 h-3 inline mr-1" />{ward}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────

function DuplicateAlert({ dup, complaintId, onCreateNew }: { dup: DuplicateResult; complaintId: number | null; onCreateNew: () => void }) {
  if (!dup.count) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-yellow-300">{dup.count} similar complaint{dup.count > 1 ? "s" : ""} already exist nearby</div>
          <div className="text-xs text-yellow-400/70 mt-0.5">Top complaint has {dup.topVotes} votes</div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button size="sm" className="h-7 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 gap-1.5">
              <ThumbsUp className="w-3 h-3" /> Upvote Existing
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-yellow-400/80 hover:text-yellow-300 hover:bg-yellow-500/10 gap-1.5">
              <Bell className="w-3 h-3" /> Subscribe for Updates
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-white/50 hover:text-white/80 hover:bg-white/8 gap-1.5" onClick={onCreateNew}>
              <Plus className="w-3 h-3" /> Create New Complaint
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Community Impact ─────────────────────────────────────────────────────────

function CommunityImpact({ analysis }: { analysis: AiAnalysis }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-sky-400" />
        <span className="text-sm font-semibold text-white">Community Impact</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { icon: Users, label: "Affected", value: analysis.affectedCitizens.toLocaleString(), color: "text-sky-400" },
          { icon: Shield, label: "Risk Score", value: `${analysis.riskScore}/100`, color: analysis.riskScore > 70 ? "text-red-400" : "text-yellow-400" },
          { icon: Activity, label: "Nearby", value: `${Math.floor(2 + Math.random() * 8)}`, color: "text-purple-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-lg bg-white/5 border border-white/8 p-3 text-center">
            <Icon className={`w-4 h-4 mx-auto mb-1.5 ${color}`} />
            <div className={`text-base font-bold font-mono ${color}`}>{value}</div>
            <div className="text-[10px] text-white/40">{label}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-white/40 p-3 rounded-lg bg-white/4 border border-white/8 leading-relaxed">
        <Sparkles className="w-3 h-3 text-sky-400 inline mr-1.5" />
        <strong className="text-white/60">AI Impact Assessment:</strong> {analysis.issueType} in {analysis.ward} affects civic mobility and safety. Based on complaint density, escalation risk is <span className={analysis.riskScore > 70 ? "text-red-400" : "text-yellow-400"}>{analysis.riskScore > 70 ? "high" : "moderate"}</span>. Recommend {analysis.priority.toLowerCase()} priority action within {analysis.estimatedDays} days.
      </div>
    </GlassCard>
  );
}

// ─── Generated Complaint ──────────────────────────────────────────────────────

function GeneratedComplaint({ analysis, editable, onEdit }: { analysis: AiAnalysis; editable: boolean; onEdit: (field: string, val: string) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [vals, setVals] = useState({
    title: analysis.generatedTitle,
    draft: analysis.formalDraft,
    summary: analysis.citizenSummary,
    notes: analysis.departmentNotes,
  });

  return (
    <GlassCard className="p-5 space-y-4" glow>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-sky-400" />
        <span className="text-sm font-semibold text-white">AI-Generated Complaint</span>
        <AiBadge label="Auto-drafted" />
      </div>
      {[
        { key: "title", label: "Professional Title", rows: 1 },
        { key: "draft", label: "Formal Draft", rows: 3 },
        { key: "summary", label: "Citizen Summary", rows: 2 },
        { key: "notes", label: "Department Notes", rows: 2 },
      ].map(({ key, label, rows }) => (
        <div key={key}>
          <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1.5">{label}</div>
          {editing === key ? (
            <Textarea rows={rows} className="bg-white/8 border-sky-500/40 text-white text-sm resize-none focus:border-sky-500/70"
              value={vals[key as keyof typeof vals]}
              onChange={e => { setVals(v => ({ ...v, [key]: e.target.value })); onEdit(key, e.target.value); }}
              onBlur={() => setEditing(null)}
              autoFocus
            />
          ) : (
            <div onClick={() => editable && setEditing(key)}
              className={`text-sm text-white/80 leading-relaxed p-2.5 rounded-lg border border-transparent transition-all ${editable ? "hover:bg-white/5 hover:border-white/10 cursor-text" : ""}`}>
              {vals[key as keyof typeof vals]}
            </div>
          )}
        </div>
      ))}
      {editable && <div className="text-[10px] text-white/25 font-mono">Click any field to edit the AI draft</div>}
    </GlassCard>
  );
}

// ─── Submit Review ────────────────────────────────────────────────────────────

function SubmitReview({ analysis, ward, citizenName, citizenEmail, onSubmit, loading }: {
  analysis: AiAnalysis; ward: string;
  citizenName: string; citizenEmail: string;
  onSubmit: () => void; loading: boolean;
}) {
  return (
    <div className="space-y-5">
      <GlassCard className="p-5 space-y-4" glow>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-semibold text-white">AI Review Summary</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Issue Type", value: analysis.issueType },
            { label: "Department", value: analysis.department.split(" ")[0] + "..." },
            { label: "Priority", value: analysis.priority },
            { label: "Severity", value: analysis.severity },
            { label: "Ward", value: ward || analysis.ward },
            { label: "Est. Resolution", value: `${analysis.estimatedDays} days` },
            { label: "AI Confidence", value: `${analysis.confidence}%` },
            { label: "Risk Score", value: `${analysis.riskScore}/100` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white/5 border border-white/8 text-sm">
              <span className="text-white/40 text-xs font-mono">{label}</span>
              <span className="font-semibold text-white">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-[10px] text-white/30 font-mono">READY TO SUBMIT</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>
        <Button className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white border-0 font-semibold h-12 text-base gap-2 shadow-lg shadow-sky-500/25" onClick={onSubmit} disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
          {loading ? "Submitting to AI Engine..." : "Submit Complaint"}
        </Button>
        <div className="text-[10px] text-white/25 text-center font-mono">
          You'll receive updates at {citizenEmail || "your email"}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ result, onAnother }: { result: any; onAnother: () => void }) {
  const [, navigate] = useLocation();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-8 py-12">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500/30 to-cyan-500/30 border-2 border-sky-500/50 flex items-center justify-center shadow-[0_0_60px_rgba(14,165,233,0.3)]">
        <CheckCircle2 className="w-12 h-12 text-sky-400" />
      </motion.div>
      <div className="space-y-3">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-bold text-white">
          Complaint Submitted
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-white/50 max-w-sm">
          Your complaint has been received and AI-routed. The relevant department will act within {result?.estimatedResolutionDays} days.
        </motion.p>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="w-full max-w-sm">
        <GlassCard className="p-5 space-y-3" glow>
          <div className="text-xs font-mono text-white/40 uppercase tracking-wider">Reference Details</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-white/40">ID</div><div className="font-mono text-sky-400 font-bold">#{result?.id}</div>
            <div className="text-white/40">Department</div><div className="text-white/80 text-xs">{result?.department}</div>
            <div className="text-white/40">Severity</div><SeverityPill sev={result?.severity ?? "Medium"} />
            <div className="text-white/40">Est. Days</div><div className="font-mono text-white/80">{result?.estimatedResolutionDays}d</div>
          </div>
        </GlassCard>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3">
        <Button className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 gap-2" onClick={() => navigate(`/citizen/complaint/${result?.id}`)}>
          Track Status <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="border-white/15 text-white/60 hover:bg-white/8 gap-2" onClick={onAnother}>
          <Plus className="w-4 h-4" /> File Another
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${i === currentStep ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : i < currentStep ? "text-sky-500/60" : "text-white/25"}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${i < currentStep ? "bg-sky-500/30 text-sky-400" : i === currentStep ? "bg-sky-500/40 text-sky-300" : "bg-white/8 text-white/30"}`}>{i < currentStep ? "✓" : i + 1}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < steps.length - 1 && <div className={`w-4 h-px ${i < currentStep ? "bg-sky-500/50" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewComplaint() {
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const [tab, setTab] = useState<Tab>("text");
  const [analysisStep, setAnalysisStep] = useState(0); // 0=input, 1=details, 2=review
  const [rawText, setRawText] = useState("");
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [ward, setWard] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [citizenEmail, setCitizenEmail] = useState("");
  const [location, setLocation] = useState("");
  const [duplicate, setDuplicate] = useState<DuplicateResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [editedTitle, setEditedTitle] = useState("");

  const { data: existingComplaints } = useListComplaints();

  const createMutation = useCreateComplaint({
    mutation: {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getListComplaintsQueryKey() });
        setResult(data);
        setAnalysisStep(3);
        setSubmitting(false);
      },
      onError: () => setSubmitting(false),
    },
  });

  function handleAnalysis(text: string, a: AiAnalysis | null) {
    setRawText(text);
    if (a) {
      setAnalysisLoading(true);
      setTimeout(() => {
        setAnalysis(a);
        setWard(w => w || a.ward);
        setAnalysisLoading(false);
        // duplicate check
        if (existingComplaints) {
          const similar = existingComplaints.filter(c =>
            c.category === a.issueType || c.ward === a.ward
          );
          if (similar.length > 0) {
            setDuplicate({ count: similar.length, topVotes: Math.max(...similar.map(c => c.votes)), nearestId: similar[0].id });
          }
        }
      }, 400);
    } else {
      setAnalysis(null);
      setDuplicate(null);
    }
  }

  function handleSubmit() {
    if (!analysis || !ward || !citizenName || !citizenEmail) return;
    setSubmitting(true);
    createMutation.mutate({
      data: {
        title: editedTitle || analysis.generatedTitle,
        description: rawText,
        category: analysis.issueType,
        ward,
        location: location || `${ward} — AI Location`,
        citizenName,
        citizenEmail,
        status: "Pending",
      },
    });
  }

  const STEPS = ["Describe", "Location", "Review", "Done"];
  const isDarkMode = true;

  if (analysisStep === 3 && result) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white p-6">
        <SuccessScreen result={result} onAnother={() => { setAnalysisStep(0); setAnalysis(null); setResult(null); setRawText(""); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white -m-6 md:-m-8 p-6 md:p-8">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">AI Complaint Assistant</h1>
              <AiBadge label="Gemini" />
            </div>
            <p className="text-sm text-white/40">Describe your issue — AI will classify, route, and prioritize automatically</p>
          </div>
          <StepIndicator currentStep={analysisStep} steps={STEPS} />
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">

          {/* Step 0: Input */}
          {analysisStep === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid lg:grid-cols-[1fr_340px] gap-6">
              {/* Left: input */}
              <div className="space-y-5">
                {/* Input method tabs */}
                <GlassCard className="p-1">
                  <div className="flex">
                    {([
                      { id: "text", icon: FileText, label: "Text" },
                      { id: "voice", icon: Mic, label: "Voice" },
                      { id: "image", icon: ImageIcon, label: "Image" },
                    ] as { id: Tab; icon: any; label: string }[]).map(({ id, icon: Icon, label }) => (
                      <button key={id} onClick={() => setTab(id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${tab === id ? "bg-sky-500/20 text-sky-300 border border-sky-500/25 shadow-sm" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
                        <Icon className="w-3.5 h-3.5" />{label}
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {tab === "text" && <TextTab onAnalysis={handleAnalysis} />}
                      {tab === "voice" && <VoiceTab onAnalysis={handleAnalysis} />}
                      {tab === "image" && <ImageTab onAnalysis={handleAnalysis} />}
                    </motion.div>
                  </AnimatePresence>
                </GlassCard>

                {/* Duplicate alert */}
                {duplicate && (
                  <DuplicateAlert dup={duplicate} complaintId={null} onCreateNew={() => setDuplicate(null)} />
                )}

                {/* Community impact */}
                {analysis && <CommunityImpact analysis={analysis} />}

                {/* Continue button */}
                <Button
                  className="w-full h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white border-0 font-semibold text-base gap-2 shadow-lg shadow-sky-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!analysis}
                  onClick={() => setAnalysisStep(1)}
                >
                  Continue to Location <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Right: AI analysis panel */}
              <div className="lg:sticky lg:top-6 h-fit">
                <AnalysisPanel analysis={analysis} loading={analysisLoading} />
              </div>
            </motion.div>
          )}

          {/* Step 1: Location + Generated */}
          {analysisStep === 1 && analysis && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid lg:grid-cols-[1fr_340px] gap-6">
              <div className="space-y-5">
                <GlassCard className="p-5 space-y-5">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" /> Location Picker
                  </div>
                  <LocationPicker ward={ward} onChange={setWard} />
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50 font-mono uppercase tracking-wider">Specific Address / Landmark</label>
                    <Input className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-sky-500/50"
                      placeholder="e.g. Near City Park, Main Street, Sector 4"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                </GlassCard>

                <GlassCard className="p-5 space-y-4">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" /> Your Details
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/50 font-mono uppercase tracking-wider">Full Name</label>
                      <Input className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-sky-500/50" placeholder="Your name" value={citizenName} onChange={e => setCitizenName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/50 font-mono uppercase tracking-wider">Email Address</label>
                      <Input type="email" className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-sky-500/50" placeholder="For status updates" value={citizenEmail} onChange={e => setCitizenEmail(e.target.value)} />
                    </div>
                  </div>
                </GlassCard>

                <GeneratedComplaint analysis={analysis} editable onEdit={(f, v) => { if (f === "title") setEditedTitle(v); }} />

                <div className="flex gap-3">
                  <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/8 gap-2" onClick={() => setAnalysisStep(0)}>
                    <X className="w-4 h-4" /> Back
                  </Button>
                  <Button className="flex-1 h-11 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white border-0 font-semibold gap-2 shadow-lg shadow-sky-500/25"
                    disabled={!ward || !citizenName || !citizenEmail}
                    onClick={() => setAnalysisStep(2)}
                  >
                    Review & Submit <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="lg:sticky lg:top-6 h-fit">
                <AnalysisPanel analysis={analysis} loading={false} />
              </div>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {analysisStep === 2 && analysis && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid lg:grid-cols-[1fr_380px] gap-6">
              <div className="space-y-5">
                <GeneratedComplaint analysis={analysis} editable={false} onEdit={() => {}} />
                <CommunityImpact analysis={analysis} />
                <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/8 gap-2" onClick={() => setAnalysisStep(1)}>
                  <X className="w-4 h-4" /> Back
                </Button>
              </div>
              <div className="lg:sticky lg:top-6 h-fit">
                <SubmitReview analysis={analysis} ward={ward} citizenName={citizenName} citizenEmail={citizenEmail} onSubmit={handleSubmit} loading={submitting} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
