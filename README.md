# 🌿 CropSense AI — Team FarmForge

AI crop disease detector. Now powered by **Google Gemini 1.5 Flash** — free, fast, no rate limit issues.

---

## ⚡ Run in 3 steps

```bash
# 1. Install dependencies
npm install

# 2. Your .env is already set up with Gemini key — just run:
npm start
# Opens at http://localhost:3000
```

---

## 🤖 AI Engine — Google Gemini 1.5 Flash

Switched from Anthropic Claude to **Gemini 1.5 Flash** because:

| Feature        | Gemini 1.5 Flash (current)  | Anthropic Claude (old)     |
|---------------|------------------------------|----------------------------|
| Cost           | FREE                         | FREE (but low limit)       |
| Rate limit     | 15 req/min, 1500/day         | Very limited free tier     |
| Vision support | ✅ Yes                       | ✅ Yes                     |
| Speed          | Very fast (~2-4 seconds)     | ~5-10 seconds              |
| No proxy needed| ✅ Direct browser call       | ❌ Needed proxy server      |

**No more proxy server needed!** Gemini calls go directly from the browser.

---

## 🔑 Get a New Gemini Key (if yours expires)

1. Go to **https://aistudio.google.com/app/apikey**
2. Click "Create API Key" — it's free
3. Open `.env` → update `REACT_APP_GEMINI_API_KEY=your-new-key`
4. Restart `npm start`

---

## 📁 Key Files Changed

- `src/utils/api.js` — Now calls Gemini Vision API instead of Anthropic
- `src/App.js` — Warning banner updated for Gemini key
- `.env` — REACT_APP_GEMINI_API_KEY is now the primary key
- `server.js` — No longer needed (kept as Anthropic backup)

---

## 🌐 Deploy Free

```bash
npm run build
# Drag /build folder to netlify.com/drop
```

---

*Team FarmForge · Hackathon 2025*
