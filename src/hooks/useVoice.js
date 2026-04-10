// ─────────────────────────────────────────────────────────────────────────────
//  useVoice — Web Speech API hook for Hindi/English readout
//  Uses the browser's built-in SpeechSynthesis — no API key needed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";

export function useVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const uttRef = useRef(null);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback((text, lang = "hi-IN") => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = lang;
    utt.rate  = 0.88;
    utt.pitch = 1;

    // Pick the best available voice for the language
    const voices = window.speechSynthesis.getVoices();
    const match  = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
    if (match) utt.voice = match;

    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);

    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, supported };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Build the voice script from a result object
// ─────────────────────────────────────────────────────────────────────────────
export function buildScript(result, lang, cropName) {
  const hi = lang === "hi";

  if (result.disease === "Not a crop image") {
    return hi
      ? "यह फसल की छवि नहीं है। कृपया एक स्पष्ट फसल फोटो अपलोड करें।"
      : "This does not appear to be a crop image. Please upload a clear photo of your crop.";
  }

  if (result.disease === "Healthy Crop") {
    return hi
      ? `बधाई हो! आपकी ${cropName || "फसल"} पूरी तरह स्वस्थ दिखती है। नियमित निगरानी जारी रखें।`
      : `Great news! Your ${cropName || "crop"} looks completely healthy. Keep up your good practices.`;
  }

  const disease    = hi ? result.disease_hi    || result.disease    : result.disease;
  const cause      = hi ? result.cause_hi      || result.cause      : result.cause;
  const treatment  = hi ? result.treatment_hi  || result.treatment  : result.treatment;
  const prevention = hi ? result.prevention_hi || result.prevention : result.prevention;
  const severity   = result.severity;
  const confidence = result.confidence;

  if (hi) {
    return (
      `आपकी फसल में ${disease} की पहचान हुई है। ` +
      `AI विश्वसनीयता ${confidence} प्रतिशत है। ` +
      `गंभीरता ${severity === "High" ? "अधिक" : severity === "Medium" ? "मध्यम" : "कम"} है। ` +
      `कारण: ${cause}। ` +
      `उपचार: ${treatment}। ` +
      `बचाव: ${prevention}। ` +
      `तात्कालिकता: ${result.urgency}।`
    );
  }

  return (
    `Your crop has been diagnosed with ${disease}. ` +
    `AI confidence is ${confidence} percent. ` +
    `Severity is ${severity}. ` +
    `Cause: ${cause}. ` +
    `Treatment: ${treatment}. ` +
    `Prevention: ${prevention}. ` +
    `Urgency: ${result.urgency}.`
  );
}
