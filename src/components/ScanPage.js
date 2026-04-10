import { useState, useRef, useCallback } from "react";
import { CROPS } from "../constants/crops";
import { analyzeCrop } from "../utils/api";
import ResultCard from "./ResultCard";

// ── Loading screen ───────────────────────────────────────────────────────────────
function Loader({ lang, status }) {
  const hi      = lang === "hi";
  const waiting = status?.type === "waiting";
  const sLeft   = status?.secondsLeft || 0;
  const pct     = Math.round(((62 - sLeft) / 62) * 100);

  if (waiting) {
    return (
      <div className="flex flex-col items-center justify-center py-32 fade-up px-6 text-center min-h-[60vh]">
        <div className="relative w-24 h-24 mb-6">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="#1D9E75" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 0.9s linear" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
            {sLeft}
          </span>
        </div>
        <p className="text-base font-semibold text-gray-800 mb-1">
          {hi ? "कोटा भरा — 62 सेकंड में दोबारा होगा" : "Quota hit — retrying in 62s"}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {hi ? "कुछ नहीं करना, हम अपने आप दोबारा करेंगे" : "Hang tight — retrying automatically"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-32 fade-up px-6 text-center min-h-[60vh]">
      <div className="flex gap-2.5 mb-6">
        <div className="dot" /><div className="dot dot-2" /><div className="dot dot-3" />
      </div>
      <p className="text-base font-semibold text-gray-800 mb-1">
        {hi ? "आपकी फसल का विश्लेषण हो रहा है..." : "Analyzing your crop..."}
      </p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">
        {hi ? "5–10 सेकंड लगेंगे" : "Usually 5–10 seconds"}
      </p>
    </div>
  );
}


// ── Error screen ────────────────────────────────────────────────────────────
function ErrorScreen({ msg, lang, onRetry }) {
  const hi = lang === "hi";
  const isKeyError = msg.includes("API key") || msg.includes("console.anthropic");
  return (
    <div className="px-4 py-8 fade-up max-w-2xl mx-auto">
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">
            {isKeyError ? "🔑" : "⚠️"}
          </span>
          <div>
            <p className="text-sm font-bold text-red-800 mb-1">
              {hi
                ? (isKeyError ? "API Key सेट नहीं है" : "विश्लेषण नहीं हो सका")
                : (isKeyError ? "API Key not configured" : "Analysis failed")}
            </p>
            <p className="text-sm text-red-700 leading-relaxed">{msg}</p>
            {isKeyError && (
              <div className="mt-3 bg-red-100 rounded-xl p-3 text-xs text-red-800 font-mono leading-relaxed">
                1. Open <strong>.env</strong><br />
                2. Set: REACT_APP_GEMINI_KEY_1=...<br />
                3. Restart: <strong>npm start</strong><br />
                4. Free key: <strong>aistudio.google.com</strong>
              </div>
            )}
          </div>
        </div>
      </div>
      <button onClick={onRetry} className="btn-ghost">
        {hi ? "← दोबारा कोशिश करें" : "← Try Again"}
      </button>
    </div>
  );
}

// ── History bar ─────────────────────────────────────────────────────────────
function HistoryBar({ history, lang, onSelect }) {
  if (history.length === 0) return null;
  const hi = lang === "hi";
  return (
    <div className="px-4 pt-4 pb-2 flex items-center gap-2 overflow-x-auto border-b border-gray-100">
      <span className="section-label shrink-0">{hi ? "पिछले" : "Recent"}:</span>
      {history.slice(-5).reverse().map((h, i) => (
        <button key={i} className="history-pill shrink-0" onClick={() => onSelect(h)}>
          {h.crop.emoji} {hi ? h.result.disease_hi || h.result.disease : h.result.disease}
        </button>
      ))}
    </div>
  );
}

// ── Main ScanPage ───────────────────────────────────────────────────────────
export default function ScanPage({ lang }) {
  const [crop,     setCrop]    = useState(null);
  const [imgSrc,   setImgSrc]  = useState("");
  const [imgB64,   setImgB64]  = useState("");
  const [imgMime,  setImgMime] = useState("image/jpeg");
  const [imgReady, setImgReady]= useState(false);
  const [status,   setStatus]  = useState("idle"); // idle | loading | result | error
  const [result,   setResult]  = useState(null);
  const [errMsg,   setErrMsg]  = useState("");
  const [history,  setHistory] = useState([]);
  const [dragOver, setDragOver]= useState(false);
  const [loaderStatus, setLoaderStatus] = useState({ type: "analyzing" });

  const cameraRef   = useRef(null);
  const fileRef     = useRef(null);
  const isAnalyzing = useRef(false);
  const hi = lang === "hi";

  // ── Load file ─────────────────────────────────────────────────────────────
  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImgMime(file.type);
    setImgReady(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target.result);
      setImgB64(e.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDragOver  = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);
  const handleDrop      = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    loadFile(e.dataTransfer.files[0]);
  }, [loadFile]);

  // ── Analyze ───────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!imgB64 || !crop || isAnalyzing.current) return;
    isAnalyzing.current = true;
    setLoaderStatus({ type: "analyzing" });
    setStatus("loading");
    try {
      const data = await analyzeCrop(imgB64, imgMime, crop.en, (s) => setLoaderStatus(s));
      setResult(data);
      setHistory((prev) => [...prev, { crop, result: data, imgSrc }]);
      setStatus("result");
    } catch (err) {
      setErrMsg(err.message || "Unknown error. Please try again.");
      setStatus("error");
    } finally {
      isAnalyzing.current = false;
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setCrop(null); setImgSrc(""); setImgB64(""); setImgMime("image/jpeg");
    setImgReady(false); setStatus("idle"); setResult(null); setErrMsg("");
    if (cameraRef.current) cameraRef.current.value = "";
    if (fileRef.current)   fileRef.current.value   = "";
  };

  // ── Load from history ─────────────────────────────────────────────────────
  const loadHistory = (h) => {
    setCrop(h.crop); setImgSrc(h.imgSrc);
    setResult(h.result); setStatus("result");
  };

  // ── Special states ────────────────────────────────────────────────────────
  if (status === "loading") return <Loader lang={lang} status={loaderStatus} />;
  if (status === "result" && result)
    return <ResultCard result={result} lang={lang} crop={crop} imgSrc={imgSrc} onReset={reset} />;
  if (status === "error")
    return <ErrorScreen msg={errMsg} lang={lang} onRetry={reset} />;

  const canAnalyze = Boolean(crop && imgB64);

  return (
    <div className="fade-up">
      <HistoryBar history={history} lang={lang} onSelect={loadHistory} />

      {/* ── Desktop: two-column | Mobile: stacked ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-10 xl:gap-16">

          {/* ── Left column: Step 1 + Step 2 ── */}
          <div className="space-y-6 lg:space-y-8">

            {/* Step 1 — Crop selector */}
            <section className="scan-card">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="step-num">1</div>
                <p className="section-label">{hi ? "अपनी फसल चुनें" : "Select your crop"}</p>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {CROPS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCrop(c)}
                    className={`crop-btn ${crop?.id === c.id ? "selected" : ""}`}
                    aria-pressed={crop?.id === c.id}
                    aria-label={c.en}
                  >
                    <span className="text-2xl block mb-1.5">{c.emoji}</span>
                    <p className="text-xs font-semibold text-gray-700 leading-tight">
                      {hi ? c.hi : c.en}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2 — Photo */}
            <section className="scan-card">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="step-num">2</div>
                <p className="section-label">
                  {hi ? "फोटो लें या अपलोड करें" : "Take photo or upload"}
                </p>
              </div>

              {imgSrc ? (
                <div className="relative">
                  {!imgReady && <div className="img-skeleton" />}
                  <img
                    src={imgSrc}
                    alt="Crop preview"
                    onLoad={() => setImgReady(true)}
                    style={{ display: imgReady ? "block" : "none", maxHeight: "320px" }}
                    className="w-full object-cover rounded-2xl border border-gray-100"
                  />
                  {imgReady && (
                    <button
                      onClick={reset}
                      aria-label="Remove photo"
                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-md transition-colors text-xl font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button className="btn-camera sm:hidden" onClick={() => cameraRef.current?.click()}>
                    <span className="text-2xl">📷</span>
                    <span className={hi ? "lang-hi" : ""}>
                      {hi ? "कैमरा खोलें (पिछला कैमरा)" : "Open Camera (rear)"}
                    </span>
                  </button>

                  <div
                    className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label={hi ? "फोटो अपलोड करें" : "Upload photo"}
                    onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                  >
                    <span className="text-4xl lg:text-5xl">🖼️</span>
                    <p className="text-sm font-semibold text-gray-700">
                      {hi ? "गैलरी से फोटो चुनें" : "Upload from gallery / files"}
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      {hi
                        ? "या यहाँ खींचें और छोड़ें • JPG, PNG"
                        : "Or drag & drop here • JPG, PNG supported"}
                    </p>
                  </div>

                  <input ref={cameraRef} type="file" accept="image/*" capture="environment"
                    className="hidden" onChange={(e) => loadFile(e.target.files[0])} />
                  <input ref={fileRef} type="file" accept="image/*"
                    className="hidden" onChange={(e) => loadFile(e.target.files[0])} />
                </div>
              )}
            </section>
          </div>

          {/* ── Right column: Step 3 + preview hint ── */}
          <div className="mt-6 lg:mt-0 space-y-6 lg:space-y-8">

            {/* Step 3 — Analyze */}
            <section className="scan-card">
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`step-num ${canAnalyze ? "" : "inactive"}`}>3</div>
                <p className="section-label">{hi ? "विश्लेषण करें" : "Analyze"}</p>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || status === "loading"}
                className="btn-primary"
              >
                {hi ? "🔍 फसल का विश्लेषण करें" : "🔍 Analyze Crop"}
              </button>

              {!canAnalyze && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  {!crop && !imgB64
                    ? (hi ? "फसल चुनें और फोटो अपलोड करें" : "Select a crop and upload a photo to continue")
                    : !crop
                    ? (hi ? "पहले फसल चुनें" : "Select a crop type first")
                    : (hi ? "फोटो अपलोड करें" : "Upload a photo to continue")}
                </p>
              )}
            </section>

            {/* Desktop info panel — tips */}
            <div className="hidden lg:block scan-card" style={{ background: "#f0fdf8", border: "1px solid #d1fae5" }}>
              <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-3">
                {hi ? "💡 टिप्स" : "💡 Tips for best results"}
              </p>
              <ul className="space-y-2 text-sm text-green-900">
                {(hi ? [
                  "🌿 प्रभावित पत्ते या तने की स्पष्ट फोटो लें",
                  "☀️ अच्छी रोशनी में फोटो खींचें",
                  "📏 पत्ते को फ्रेम में भर दें — क्लोज-अप बेहतर है",
                  "🔄 यदि नतीजा गलत लगे, दोबारा कोशिश करें",
                ] : [
                  "🌿 Photograph the affected leaf or stem clearly",
                  "☀️ Use good natural lighting — avoid shadows",
                  "📏 Fill the frame with the leaf — close-ups work best",
                  "🔄 Try again with a different angle if results seem off",
                ]).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop info panel — what you'll get */}
            <div className="hidden lg:block scan-card">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                {hi ? "📋 आपको क्या मिलेगा" : "📋 What you'll receive"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(hi ? [
                  { icon: "🦠", label: "रोग का नाम" },
                  { icon: "📊", label: "AI विश्वसनीयता" },
                  { icon: "⚗️", label: "कारण और लक्षण" },
                  { icon: "💊", label: "उपचार और बचाव" },
                ] : [
                  { icon: "🦠", label: "Disease name" },
                  { icon: "📊", label: "AI confidence %" },
                  { icon: "⚗️", label: "Cause & symptoms" },
                  { icon: "💊", label: "Treatment & prevention" },
                ]).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
