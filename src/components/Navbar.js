export default function Navbar({ page, lang, setLang, onBack }) {
  return (
    <nav style={{ background: "#0F6E56" }} className="sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {page !== "land" && (
            <button
              onClick={onBack}
              aria-label="Go back to home"
              style={{ color: "#9FE1CB" }}
              className="hover:text-white transition-colors text-2xl leading-none p-1 -ml-1"
            >
              ←
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="leaf">🌿</span>
            <div>
              <span style={{ fontFamily: "'Playfair Display', serif", color: "#fff" }}
                className="text-lg font-bold leading-none">
                CropSense
              </span>
              <span style={{ color: "#9FE1CB" }}
                className="text-xs ml-2 font-medium opacity-75">
                by FarmForge
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {page === "land" && (
            <span
              style={{ color: "#9FE1CB" }}
              className="hidden sm:inline text-xs font-medium opacity-75"
            >
              AI-Powered Crop Disease Detection
            </span>
          )}
          <button
            onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
            aria-label="Switch language"
            style={{ borderColor: "#5DCAA5", color: "#E1F5EE" }}
            className="text-xs font-semibold px-4 py-1.5 rounded-full border-2 hover:bg-green-800 transition-colors tracking-wide"
          >
            {lang === "en" ? "हिंदी" : "English"}
          </button>
        </div>
      </div>
    </nav>
  );
}
