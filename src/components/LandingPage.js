const FEATURES = [
  {
    icon: "📸",
    en: { title: "Photo Detection",  desc: "Snap a leaf — AI diagnoses in seconds" },
    hi: { title: "फोटो से पहचान",   desc: "पत्ते की फोटो लें — AI सेकंड में बताएगा" },
  },
  {
    icon: "🌾",
    en: { title: "10+ Crops",        desc: "Wheat, rice, tomato, potato, maize & more" },
    hi: { title: "10+ फसलें",        desc: "गेहूं, चावल, टमाटर, आलू, मक्का और अधिक" },
  },
  {
    icon: "🇮🇳",
    en: { title: "Hindi + English",  desc: "Full bilingual results for every farmer" },
    hi: { title: "हिंदी + English",  desc: "हर किसान के लिए दोनों भाषाओं में जानकारी" },
  },
  {
    icon: "💊",
    en: { title: "Treatment Guide",  desc: "Remedy, prevention tips & urgency level" },
    hi: { title: "उपचार गाइड",       desc: "उपाय, बचाव के टिप्स और तात्कालिकता" },
  },
];

const STEPS = [
  { en: "Select your crop type from the grid",      hi: "ग्रिड से अपनी फसल का प्रकार चुनें"      },
  { en: "Take a photo or upload from your gallery", hi: "फोटो लें या गैलरी से अपलोड करें"        },
  { en: "AI analyzes and returns a full diagnosis", hi: "AI विश्लेषण करता है और पूरा निदान देता है" },
  { en: "Get treatment in Hindi or English",        hi: "हिंदी या English में उपचार जानें"          },
];

const STATS = [
  { v: "30+",  en: "Diseases Detected", hi: "रोग पहचाने"    },
  { v: "10+",  en: "Crops Supported",   hi: "फसलें"         },
  { v: "5s",   en: "Avg. Diagnosis",    hi: "औसत निदान"     },
  { v: "Free", en: "Always Free",       hi: "हमेशा मुफ़्त"  },
];

export default function LandingPage({ lang, onStart }) {
  const hi = lang === "hi";

  return (
    <div className="fade-up">

      {/* ── Hero — desktop: two columns, mobile: stacked ── */}
      <section style={{ background: "#0A2E23" }} className="px-6 sm:px-10 lg:px-0 py-16 lg:py-0">
        <div className="max-w-7xl mx-auto lg:flex lg:items-stretch lg:min-h-[520px]">

          {/* Left — text */}
          <div className="lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:py-20 lg:pr-16 text-center lg:text-left">
            <span
              style={{ background: "#0F6E56", color: "#9FE1CB" }}
              className="inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest"
            >
              AI-Powered • Free • FarmForge
            </span>

            <h1
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
            >
              {hi ? "फसल रोग" : "Detect Crop"}
              <br />
              <span style={{ color: "#5DCAA5" }}>
                {hi ? "AI से पहचानें" : "Disease with AI"}
              </span>
            </h1>

            <p style={{ color: "#9FE1CB" }} className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-sm mx-auto lg:mx-0 mb-3">
              {hi
                ? "फसल की फोटो लें। AI रोग पहचानेगा, कारण बताएगा और इलाज सुझाएगा — सिर्फ 5 सेकंड में।"
                : "Take a photo of your crop. AI identifies the disease, explains the cause, and suggests treatment — in 5 seconds."}
            </p>

            <p style={{ color: "#5DCAA5" }} className="text-xs lg:text-sm mb-8 font-medium">
              {hi ? "कोई लॉगिन नहीं • कोई ऐप नहीं • हमेशा मुफ़्त" : "No login • No app install • Always free"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                onClick={onStart}
                className="btn-primary"
                style={{ width: "auto", padding: "16px 48px", fontSize: "16px" }}
              >
                {hi ? "अभी स्कैन करें →" : "Scan Your Crop →"}
              </button>
              <div
                style={{ color: "#9FE1CB", border: "1px solid #1D9E75" }}
                className="hidden lg:flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-medium"
              >
                <span>✓</span>
                <span>{hi ? "30+ रोग • 10+ फसलें" : "30+ diseases • 10+ crops"}</span>
              </div>
            </div>
          </div>

          {/* Right — visual panel (desktop only) */}
          <div
            className="hidden lg:flex flex-col justify-center lg:w-96 xl:w-[480px] px-12 py-16"
            style={{ background: "rgba(255,255,255,0.04)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p style={{ color: "#5DCAA5" }} className="text-xs font-bold uppercase tracking-widest mb-6">How it works</p>
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-4 mb-6 last:mb-0">
                <div
                  style={{ background: "#1D9E75", color: "#fff", minWidth: 28, minHeight: 28 }}
                  className="rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  {i + 1}
                </div>
                <p style={{ color: "#d1fae5" }} className="text-sm leading-relaxed">
                  {hi ? step.hi : step.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-4 divide-x divide-gray-100">
          {STATS.map((s, i) => (
            <div key={i} className="py-5 text-center">
              <div style={{ color: "#0F6E56" }} className="text-xl lg:text-2xl font-bold">{s.v}</div>
              <div className="text-xs lg:text-sm text-gray-400 mt-0.5">{hi ? s.hi : s.en}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features + How it works (main content area) ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Features grid */}
        <section className="py-10 lg:py-14">
          <p className="section-label mb-6">{hi ? "विशेषताएं" : "Features"}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => {
              const t = hi ? f.hi : f.en;
              return (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-3xl lg:text-4xl block mb-3">{f.icon}</span>
                  <p className="text-sm lg:text-base font-semibold text-gray-800 mb-1">{t.title}</p>
                  <p className="text-xs lg:text-sm text-gray-500 leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works — mobile only (desktop shown in hero panel) */}
        <section className="pb-10 lg:hidden">
          <p className="section-label mb-4">{hi ? "कैसे काम करता है" : "How it works"}</p>
          <div className="card p-0 overflow-hidden bg-white">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 ${i < STEPS.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="step-num">{i + 1}</div>
                <p className="text-sm text-gray-700 leading-relaxed">{hi ? step.hi : step.en}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-14 lg:pb-20 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="hidden lg:block">
            <p className="text-xl font-bold text-gray-800 mb-1">
              {hi ? "अभी शुरू करें — बिल्कुल मुफ़्त" : "Ready to protect your crops?"}
            </p>
            <p className="text-sm text-gray-500">
              {hi ? "फसल की फोटो खींचें और AI से तुरंत जानें।" : "Upload a photo and get an AI diagnosis in seconds."}
            </p>
          </div>
          <button
            onClick={onStart}
            className="btn-primary lg:flex-shrink-0"
            style={{ fontSize: "16px", width: "auto", padding: "16px 48px" }}
          >
            {hi ? "अभी शुरू करें →" : "Get Started — Free →"}
          </button>
        </section>
      </div>

    </div>
  );
}
