// ─────────────────────────────────────────────────────────────────────────────
//  CropSense AI — Gemini API with model cascade
//  Tries models in order; falls back on 429 (quota) or 503 (overload).
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS = [
  "gemini-2.0-flash",   // fast, no thinking — primary
  "gemini-2.5-flash",   // fallback (thinking disabled via thinkingBudget:0)
];




const PROMPT = `You are an expert plant pathologist and soil scientist specializing in Indian agriculture.
Analyze this crop image carefully. Respond ONLY with a valid JSON object — no markdown, no backticks, nothing else.

Required JSON:
{
  "disease": "Disease name in English, OR 'Healthy Crop', OR 'Not a crop image'",
  "disease_hi": "हिंदी में रोग का नाम",
  "confidence": 85,
  "severity": "Low",
  "cause": "Short cause in English (fungal/bacterial/viral/pest/deficiency)",
  "cause_hi": "कारण हिंदी में",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "symptoms_hi": ["लक्षण 1", "लक्षण 2", "लक्षण 3"],
  "treatment": "2-3 clear treatment sentences in English.",
  "treatment_hi": "2-3 वाक्य में उपचार हिंदी में।",
  "prevention": "One clear prevention tip in English.",
  "prevention_hi": "एक वाक्य में बचाव।",
  "urgency": "Act within 3 days",
  "soil": {
    "ph_range": "6.0 – 7.0",
    "ph_range_hi": "6.0 – 7.0 (थोड़ा अम्लीय से उदासीन)",
    "ph_tip": "One sentence on how to adjust soil pH if needed (lime to raise, sulphur to lower).",
    "ph_tip_hi": "pH सुधार पर एक वाक्य।",
    "deficient_nutrients": ["Nitrogen", "Potassium"],
    "deficient_nutrients_hi": ["नाइट्रोजन", "पोटेशियम"],
    "soil_treatment": "1-2 sentences on what to do to the soil to stop disease recurrence (e.g. compost, fungicide drench, crop rotation).",
    "soil_treatment_hi": "1-2 वाक्य में मिट्टी उपचार।",
    "next_season": "One crop rotation or soil preparation tip for next planting season.",
    "next_season_hi": "अगले मौसम के लिए एक सुझाव।"
  }
}

Rules:
- severity MUST be exactly one of: Low, Medium, High, None
- confidence is an integer 0-100
- If healthy: disease="Healthy Crop", disease_hi="स्वस्थ फसल", severity="None"
- If not a plant/crop: disease="Not a crop image", severity="None", confidence=100
- Always include the soil object with all fields, even for healthy crops
- Never omit any field`;


// ── Image compression ─────────────────────────────────────────────────────────
function compressImage(base64, mime) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1024;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      const outMime = mime === "image/png" ? "image/png" : "image/jpeg";
      const out = canvas.toDataURL(outMime, 0.82);
      resolve({ base64: out.split(",")[1], mime: outMime });
    };
    img.onerror = () => resolve({ base64, mime });
    img.src = `data:${mime};base64,${base64}`;
  });
}

// ── Main export ───────────────────────────────────────────────────────────────
// onStatus({ type: "analyzing" | "waiting", secondsLeft? })
export async function analyzeCrop(base64, mime, cropName, onStatus = () => { }) {

  // Collect all non-empty keys from .env
  const keys = [
    process.env.REACT_APP_GEMINI_KEY_1,
    process.env.REACT_APP_GEMINI_KEY_2,
    process.env.REACT_APP_GEMINI_KEY_3,
    process.env.REACT_APP_GEMINI_KEY_4,
    process.env.REACT_APP_GEMINI_KEY_5,
  ].filter((k) => k && k.trim() !== "");

  if (keys.length === 0) {
    throw new Error("No Gemini API key set. Add REACT_APP_GEMINI_KEY_1 to your .env file.");
  }

  onStatus({ type: "analyzing" });
  const img = await compressImage(base64, mime);

  const body = JSON.stringify({
    contents: [{
      parts: [
        { inline_data: { mime_type: img.mime, data: img.base64 } },
        { text: `Crop type: ${cropName}. ${PROMPT}` },
      ],
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 }, // disable reasoning for speed
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  });

  // ── Key × Model cascade ───────────────────────────────────────────────────
  // Try every key with every model. Skip on 429 (quota) or 503 (overload).
  let res = null;
  let usedKey = null;
  let usedModel = null;

  outer:
  for (const key of keys) {
    for (const model of MODELS) {
      const url = `${BASE}/${model}:generateContent?key=${key.trim()}`;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } catch {
        continue; // network error — try next combo
      }

      if (res.status === 429 || res.status === 503) {
        console.warn(`⚠️ Key …${key.slice(-6)} / ${model} → ${res.status}. Trying next…`);
        res = null;
        continue;
      }

      usedKey = key;
      usedModel = model;
      break outer; // got a usable response (200 or real error like 400/403)
    }
  }

  // All keys + models exhausted → wait 62s then retry with first key + model
  if (!res) {
    const WAIT = 62;
    for (let s = WAIT; s > 0; s--) {
      onStatus({ type: "waiting", secondsLeft: s });
      await new Promise((r) => setTimeout(r, 1000));
    }
    onStatus({ type: "analyzing" });

    const url = `${BASE}/${MODELS[0]}:generateContent?key=${keys[0].trim()}`;
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    usedKey = keys[0];
    usedModel = MODELS[0];

    if (res.status === 429 || res.status === 503) {
      throw new Error("All API keys are quota-limited. Please wait a minute and try again.");
    }
  }

  console.log(`✅ Key …${usedKey?.slice(-6)} / ${usedModel}`);


  // ── Other errors ──────────────────────────────────────────────────────────
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.message || "";
    if (res.status === 400) throw new Error("Invalid image format. Please try a different photo.");
    if (res.status === 403) throw new Error("Invalid Gemini API key. Check REACT_APP_GEMINI_KEY_1 in .env.");
    throw new Error(msg || `Gemini error (${res.status}). Please try again.`);
  }


  // ── Parse response ────────────────────────────────────────────────────────
  const data = await res.json();

  // Thinking models (gemini-3-flash-preview) return reasoning in parts[0] with
  // {thought: true}. Filter those out and join the remaining text parts.
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text || "")
    .join("")
    .trim();

  if (!text) {
    const reason = data?.candidates?.[0]?.finishReason;
    if (reason === "SAFETY") throw new Error("Image blocked by safety filters. Try a clearer crop photo.");
    throw new Error("AI returned empty response. Please try again with a different photo.");
  }


  // Extract the JSON object from the response (handles preamble text and
  // truncation from thinking models using their reasoning budget)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("No JSON found in response:", text.slice(0, 300));
    throw new Error("AI returned unexpected format. Please try again.");
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.disease || !parsed.severity || parsed.confidence === undefined) {
      throw new Error("incomplete");
    }
    return parsed;
  } catch {
    console.error("JSON parse failed:", jsonMatch[0].slice(0, 300));
    throw new Error("AI returned unexpected format. Please try again.");
  }
}
