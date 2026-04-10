import { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import ScanPage from "./components/ScanPage";

//ye function tab run hoga jab koi api ky nhi hogi 
function KeyWarningBanner({ lang }) {
  const hasKey = [
    process.env.REACT_APP_GEMINI_KEY_1,
    process.env.REACT_APP_GEMINI_KEY_2,
    process.env.REACT_APP_GEMINI_KEY_3,
    //process.env.REACT_APP_GEMINI_KEY_4,
    //process.env.REACT_APP_GEMINI_KEY_5,
  ].some((k) => k && k.trim() !== "");
  if (hasKey) return null;
  const hi = lang === "hi";
  return (
    <div style={{
      background: "#fef3c7", borderBottom: "1px solid #fcd34d",
      color: "#92400e", fontSize: "14px", fontWeight: 500,
      padding: "10px 16px", textAlign: "center", lineHeight: 1.5
    }}>
      {hi
        ? "⚠️ Gemini API Key सेट नहीं है। .env में REACT_APP_GEMINI_KEY_1 डालें और npm start restart करें।"
        : "⚠️ No Gemini API key set. Add REACT_APP_GEMINI_KEY_1 to .env and restart npm start. Free key at: aistudio.google.com"}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("land");
  const [lang, setLang] = useState("en");

  return (
    <div className="min-h-screen" style={{ background: "#f3f4f6" }}>
      <Navbar
        page={page}
        lang={lang}
        setLang={setLang}
        onBack={() => setPage("land")}
      />
      <KeyWarningBanner lang={lang} />
      {page === "land"
        ? <LandingPage lang={lang} onStart={() => setPage("scan")} />
        : <ScanPage    lang={lang} />
      }
    </div>
  );
}
