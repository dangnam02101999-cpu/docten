import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create audio cache directory
const CACHE_DIR = path.join(process.cwd(), "audio_cache");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Serve cached audio files
  app.use("/audio", express.static(CACHE_DIR));

  // API Route for Google Sheets / Apps Script Sync
  app.post("/api/sync-sheet", async (req, res) => {
    const { sheetUrl } = req.body;

    if (!sheetUrl) {
      return res.status(400).json({ error: "Thiếu đường dẫn (Sheet URL hoặc script URL)" });
    }

    try {
      let results = [];

      // Check if it's a Google Apps Script Web App
      if (sheetUrl.includes("script.google.com")) {
        const response = await axios.get(sheetUrl);
        results = response.data.map((item: any) => ({
          stt: item.stt.toString().padStart(3, '0'),
          fullname: item.ten,
          extractedName: item.ten,
          group: "APPS SCRIPT",
          mp3: item.mp3
        }));
      } else {
        // Handle as regular Google Sheet
        const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) {
          return res.status(400).json({ error: "Link Google Sheet không hợp lệ" });
        }
        const sheetId = match[1];
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        const response = await axios.get(csvUrl);
        const csvData = response.data;
        
        const lines = csvData.split("\n");
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const columns = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
          
          const sttRaw = columns[0] || (i).toString();
          const stt = parseInt(sttRaw);
          const fullname = columns[1] || "";
          
          if (fullname) {
            const batchNum = Math.floor((stt - 1) / 8 + 1);
            const posInBatch = ((stt - 1) % 8 + 1);
            // Format requested by user
            const ttsText = `Lượt ${batchNum} số ${posInBatch} ${fullname}`;
            const mp3Url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(ttsText)}`;
            
            results.push({
              stt: stt.toString().padStart(3, '0'),
              fullname: fullname,
              extractedName: fullname, // Use full name for quality
              group: `Lượt ${batchNum}`,
              mp3: mp3Url
            });
          }
        }
      }

      // Optional: Logic to download and cache files (in background or sync)
      // For now, return the metadata. We will serve via a proxy if requested.

      res.json({ 
        success: true, 
        data: results,
        syncTime: new Date().toLocaleString('vi-VN'),
        count: results.length
      });

    } catch (error: any) {
      console.error("Sync Error:", error.message);
      res.status(500).json({ error: "Lỗi đồng bộ: " + error.message });
    }
  });

  // Proxy endpoint to stream audio through server (Helps ESP32 bypass HTTPS issues if needed)
  app.get("/api/proxy-audio", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send("No URL");

    try {
      const response = await axios({
        method: 'get',
        url: url as string,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      res.set('Content-Type', 'audio/mpeg');
      response.data.pipe(res);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
