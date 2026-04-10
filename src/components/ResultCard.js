import { useEffect } from "react";
import { SEV } from "../constants/crops";
import { useVoice, buildScript } from "../hooks/useVoice";

function Label({ text }) {
  return <p className="section-label mb-3">{text}</p>;
}

// ── Urgency banner — big and color-coded ─────────────────────────────────────
const URGENCY_STYLE = {
  High:   { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", icon: "🔴", label: "High Priority" },
  Medium: { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", icon: "🟡", label: "Medium Priority" },
  Low:    { bg: "#f0fdf4", border: "#86efac", text: "#166534", icon: "🟢", label: "Low Priority"  },
  None:   { bg: "#f0fdf8", border: "#6ee7b7", text: "#065f46", icon: "✅", label: "No Urgency"    },
};

function UrgencyBanner({ severity, urgency, hi }) {
  const s = URGENCY_STYLE[severity] || URGENCY_STYLE.None;
  return (
    <div
      style={{ background: s.bg, border: `2px solid ${s.border}` }}
      className="rounded-2xl px-5 py-4 flex items-start gap-4"
    >
      <span className="text-3xl mt-0.5 shrink-0">{s.icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: s.text }}>
          {hi ? "तात्कालिकता" : "Urgency Level"} · {hi
            ? severity === "High" ? "उच्च प्राथमिकता"
            : severity === "Medium" ? "मध्यम प्राथमिकता"
            : "कम प्राथमिकता"
            : s.label}
        </p>
        <p className="font-semibold text-gray-900 text-base leading-snug">{urgency}</p>
      </div>
    </div>
  );
}

// ── Symptom chips — subtle rainbow tint ──────────────────────────────────────
const CHIP_COLORS = [
  { bg: "#fef9c3", text: "#854d0e" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#e0f2fe", text: "#075985" },
  { bg: "#ede9fe", text: "#4c1d95" },
  { bg: "#dcfce7", text: "#14532d" },
  { bg: "#fff7ed", text: "#7c2d12" },
];

function SymptomChips({ symptoms }) {
  return (
    <div className="flex flex-wrap gap-2">
      {symptoms.map((s, i) => {
        const c = CHIP_COLORS[i % CHIP_COLORS.length];
        return (
          <span
            key={i}
            style={{ background: c.bg, color: c.text }}
            className="text-sm font-semibold px-4 py-1.5 rounded-full"
          >
            {s}
          </span>
        );
      })}
    </div>
  );
}

// ── Cause callout ────────────────────────────────────────────────────────────
function CauseBox({ cause, hi }) {
  return (
    <div className="flex gap-3 items-start bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100">
      <span className="text-2xl">🦠</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
          {hi ? "कारण" : "Root Cause"}
        </p>
        <p className="text-base font-semibold text-gray-800 leading-snug">{cause}</p>
      </div>
    </div>
  );
}

// ── Soil Advisory Card ────────────────────────────────────────────────────────
const NUTRIENT_COLORS = [
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#ede9fe", text: "#4c1d95" },
];

function SoilAdvisoryCard({ soil, hi }) {
  if (!soil) return null;

  const phRange   = hi ? soil.ph_range_hi   : soil.ph_range;
  const phTip     = hi ? soil.ph_tip_hi     : soil.ph_tip;
  const nutrients = (hi ? soil.deficient_nutrients_hi : soil.deficient_nutrients) || [];
  const treatment = hi ? soil.soil_treatment_hi : soil.soil_treatment;
  const next      = hi ? soil.next_season_hi    : soil.next_season;

  return (
    <div
      style={{ background: "#fafaf7", border: "2px solid #d6d3c4" }}
      className="rounded-3xl p-6 lg:p-8 mt-6 lg:mt-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🌱</span>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {hi ? "मिट्टी सलाह" : "Soil Advisory"}
          </h3>
          <p className="text-sm text-gray-500">
            {hi ? "मिट्टी स्वास्थ्य और अगली फसल के सुझाव" : "Soil health & next crop recommendations"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* pH Range */}
        <div
          style={{ background: "#fff8e7", border: "1.5px solid #fde68a" }}
          className="rounded-2xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🧪</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {hi ? "मिट्टी pH" : "Soil pH"}
            </span>
          </div>
          <p className="text-xl font-bold text-amber-900">{phRange}</p>
          {phTip && <p className="text-sm text-amber-800 leading-relaxed">{phTip}</p>}
        </div>

        {/* Deficient Nutrients */}
        <div
          style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}
          className="rounded-2xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">💊</span>
            <span className="text-xs font-bold uppercase tracking-wider text-green-700">
              {hi ? "कमी वाले पोषक" : "Deficient Nutrients"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {nutrients.length > 0 ? nutrients.map((n, i) => (
              <span
                key={i}
                style={{ background: NUTRIENT_COLORS[i % NUTRIENT_COLORS.length].bg, color: NUTRIENT_COLORS[i % NUTRIENT_COLORS.length].text }}
                className="text-sm font-semibold px-3 py-1 rounded-full"
              >
                {n}
              </span>
            )) : (
              <span className="text-sm text-green-700 font-medium">{hi ? "सभी पोषक पर्याप्त" : "All nutrients adequate"}</span>
            )}
          </div>
        </div>

        {/* Soil Treatment */}
        <div
          style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}
          className="rounded-2xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🪣</span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              {hi ? "मिट्टी उपचार" : "Soil Treatment"}
            </span>
          </div>
          <p className="text-sm text-red-900 leading-relaxed">{treatment}</p>
        </div>

        {/* Next Season */}
        <div
          style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe" }}
          className="rounded-2xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🔄</span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {hi ? "अगला मौसम" : "Next Season"}
            </span>
          </div>
          <p className="text-sm text-blue-900 leading-relaxed">{next}</p>
        </div>

      </div>
    </div>
  );
}

// ── Voice button ─────────────────────────────────────────────────────────────
function VoiceButton({ result, lang, cropName }) {
  const { speak, stop, speaking, supported } = useVoice();
  if (!supported) return null;
  const hi = lang === "hi";

  return (
    <button
      onClick={() => speaking ? stop() : speak(buildScript(result, lang, cropName), hi ? "hi-IN" : "en-IN")}
      title={hi ? "आवाज़ में सुनें" : "Listen aloud"}
      style={{
        background: speaking ? "#0F6E56" : "transparent",
        borderColor: "#1D9E75",
        color: speaking ? "#fff" : "#0F6E56",
        transition: "all 0.2s ease",
      }}
      className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border-2 hover:bg-green-50 shrink-0"
    >
      {speaking ? (
        <>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
          {hi ? "रोकें" : "Stop"}
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          {hi ? "सुनें" : "Listen"}
        </>
      )}
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ResultCard({ result, lang, crop, imgSrc, onReset }) {
  const { stop } = useVoice();
  const hi      = lang === "hi";
  const healthy = result.disease === "Healthy Crop";
  const invalid = result.disease === "Not a crop image";
  const sev     = SEV[result.severity] || SEV["None"];

  useEffect(() => () => stop(), [stop]);

  const pick       = (en, hiVal) => (hi && hiVal ? hiVal : en);
  const disease    = pick(result.disease,    result.disease_hi);
  const cause      = pick(result.cause,      result.cause_hi);
  const symptoms   = (hi ? result.symptoms_hi : result.symptoms) || result.symptoms || [];
  const treatment  = pick(result.treatment,  result.treatment_hi);
  const prevention = pick(result.prevention, result.prevention_hi);

  return (
    <div className="fade-up max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-10">
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 xl:gap-16">

        {/* ── Left ── */}
        <div className="space-y-4 lg:space-y-6">

          {imgSrc && (
            <div className="scan-card p-0 overflow-hidden">
              <img src={imgSrc} alt="Scanned crop" className="w-full object-cover" style={{ maxHeight: "360px" }} />
              <div className="p-4 flex items-center gap-2">
                {crop && <span className="text-2xl">{crop.emoji}</span>}
                <span className="text-base font-semibold text-gray-600">{crop ? (hi ? crop.hi : crop.en) : ""}</span>
              </div>
            </div>
          )}

          {/* Diagnosis card */}
          <div className="scan-card">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <Label text={hi ? "निदान" : "Diagnosis"} />
              <VoiceButton result={result} lang={lang} cropName={crop ? (hi ? crop.hi : crop.en) : ""} />
            </div>

            <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug flex-1"
              >
                {healthy ? "✅ " : invalid ? "❓ " : "⚠️ "}{disease}
              </h2>
              {result.severity !== "None" && (
                <span className={`text-sm font-bold px-4 py-1.5 rounded-full whitespace-nowrap ${sev.pill}`}>
                  {result.severity}
                </span>
              )}
            </div>

            {/* Confidence */}
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span className="font-medium">{hi ? "AI विश्वसनीयता" : "AI Confidence"}</span>
              <span className="font-bold text-gray-700">{result.confidence}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-3 rounded-full bar-fill"
                style={{ width: `${result.confidence}%`, background: sev.bar }}
              />
            </div>
          </div>

          <button onClick={onReset} className="btn-ghost hidden lg:block">
            {hi ? "← दूसरी फसल स्कैन करें" : "← Scan Another Crop"}
          </button>
        </div>

        {/* ── Right ── */}
        <div className="mt-4 lg:mt-0 space-y-4 lg:space-y-5">

          {!invalid && (
            <>
              {/* Urgency banner — prominent */}
              {!healthy && (
                <UrgencyBanner severity={result.severity} urgency={result.urgency} hi={hi} />
              )}

              {/* Cause callout */}
              {!healthy && <CauseBox cause={cause} hi={hi} />}

              {/* Symptoms */}
              {symptoms.length > 0 && (
                <div className="scan-card">
                  <Label text={hi ? "लक्षण" : "Symptoms"} />
                  <SymptomChips symptoms={symptoms} />
                </div>
              )}

              {/* Treatment & Prevention */}
              {!healthy ? (
                <div className="scan-card space-y-5">
                  <div>
                    <Label text={hi ? "उपचार" : "Treatment"} />
                    <p className="text-base text-gray-700 leading-relaxed">{treatment}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-5">
                    <Label text={hi ? "बचाव" : "Prevention"} />
                    <p className="text-base text-gray-700 leading-relaxed">{prevention}</p>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#f0fdf8", border: "2px solid #bbf7d0" }} className="rounded-2xl p-6">
                  <p className="text-base text-green-800 leading-relaxed font-semibold">
                    {hi
                      ? "✅ आपकी फसल स्वस्थ दिखती है! नियमित निगरानी और अच्छी कृषि पद्धतियाँ जारी रखें।"
                      : "✅ Your crop looks healthy! Keep up good practices and continue monitoring regularly."}
                  </p>
                </div>
              )}
            </>
          )}

          <p className="text-sm text-gray-400 leading-relaxed px-1 lg:px-0">
            {hi
              ? "यह AI का पहला अनुमान है। गंभीर मामलों में कृषि विशेषज्ञ से सलाह लें।"
              : "This is an AI first opinion. For critical decisions, consult a local agricultural expert."}
          </p>

          <button onClick={onReset} className="btn-ghost lg:hidden">
            {hi ? "← दूसरी फसल स्कैन करें" : "← Scan Another Crop"}
          </button>
        </div>

      </div>

      {/* 🌱 Soil Advisory — full width below the two columns */}
      {!invalid && result.soil && (
        <SoilAdvisoryCard soil={result.soil} hi={hi} />
      )}

    </div>
  );
}
