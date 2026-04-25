import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import fs from "fs";
import cors from "cors";
import crypto from "crypto";

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

  app.use(cors());
  app.use(express.json());

  // Serve cached audio files
  app.use("/audio", express.static(CACHE_DIR));

  // API Route for Google Sheets / Apps Script Sync
  app.post("/api/sync-sheet", async (req, res) => {
    const { sheetUrl } = req.body;
    console.log(`Received sync request for URL: ${sheetUrl}`);

    if (!sheetUrl) {
      return res.status(400).json({ error: "Thiếu đường dẫn (Sheet URL hoặc script URL)" });
    }

    try {
      let results = [];

      // Check if it's a Google Apps Script Web App
      if (sheetUrl.includes("script.google.com")) {
        const response = await axios.get(sheetUrl);
        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        
        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu từ Apps Script không phải là một danh sách (Array)");
        }

        results = data.map((item: any) => ({
          stt: item.stt?.toString().padStart(3, '0') || "000",
          fullname: item.ten || item.fullname || "N/A",
          extractedName: item.ten || item.fullname || "N/A",
          group: "APPS SCRIPT",
          mp3: item.mp3
        }));
      } else {
        // More robust Sheet ID extraction
        let sheetId = "";
        const idMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]{15,})/);
        if (idMatch) {
          sheetId = idMatch[1];
        } else if (sheetUrl.match(/^[a-zA-Z0-9-_]{15,}$/)) {
          sheetId = sheetUrl;
        }

        if (!sheetId) {
          return res.status(400).json({ error: "Link hoặc ID Google Sheet không hợp lệ" });
        }
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        
        console.log(`Fetching CSV from: ${csvUrl}`);
        const response = await axios.get(csvUrl);
        const csvData = response.data;

        // Check if we got HTML instead of CSV (Google redirects to login if not public)
        if (typeof csvData === 'string' && (csvData.includes('<!DOCTYPE html>') || csvData.includes('<html'))) {
          console.error("Received HTML instead of CSV for Sheet ID:", sheetId);
          return res.status(403).json({ 
            error: "Tệp Google Sheet chưa được công khai. Vui lòng chọn 'Bất kỳ ai có liên kết đều có thể xem' (Anyone with the link can view)." 
          });
        }
        
        const lines = csvData.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Better CSV split handling quotes
          const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ""));
          
          // Skip header if it looks like one (contains 'Họ tên' or 'FullName' or 'STT')
          if (i === 0 && (line.toLowerCase().includes("họ tên") || line.toLowerCase().includes("fullname") || line.toLowerCase().includes("stt"))) {
            continue;
          }

          if (columns.length < 2) continue;

          const sttRaw = columns[0] || i.toString();
          const stt = parseInt(sttRaw);
          const fullname = columns[1] || "";
          
          if (fullname) {
            const batchNum = Math.floor((stt - 1) / 8 + 1);
            const posInBatch = ((stt - 1) % 8 + 1);
            const ttsText = `Lượt ${batchNum} số ${posInBatch} ${fullname}`;
            const mp3Url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(ttsText)}`;
            
            results.push({
              stt: stt.toString().padStart(3, '0'),
              fullname: fullname,
              extractedName: fullname,
              group: `Lượt ${batchNum}`,
              mp3: mp3Url
            });
          }
        }
      }

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

  // Proxy endpoint with Caching
  app.get("/api/proxy-audio", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send("No URL");

    // Create a unique filename for the URL
    const hash = crypto.createHash('md5').update(url as string).digest('hex');
    const cachePath = path.join(CACHE_DIR, `${hash}.mp3`);

    // Check if already cached
    if (fs.existsSync(cachePath)) {
      console.log(`Serving cached audio: ${hash}.mp3`);
      return res.sendFile(cachePath);
    }

    try {
      console.log(`Downloading audio for cache: ${url}`);
      const response = await axios({
        method: 'get',
        url: url as string,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      fs.writeFileSync(cachePath, response.data);
      res.set('Content-Type', 'audio/mpeg');
      res.send(response.data);
    } catch (error: any) {
      console.error("Proxy Audio Error:", error.message);
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
