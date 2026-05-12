import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import fs from "fs";
import cors from "cors";
import crypto from "crypto";

console.log(">>> SERVER BOOTING... NODE_ENV:", process.env.NODE_ENV);

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

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route for Google Sheets / Apps Script Sync
  app.post("/api/sync-sheet", async (req, res) => {
    console.log("--- BẮT ĐẦU YÊU CẦU ĐỒNG BỘ ---");
    const { sheetUrl } = req.body;
    console.log(`Nhận yêu cầu đồng bộ cho URL: ${sheetUrl}`);

    if (!sheetUrl) {
      return res.status(400).json({ error: "Thiếu đường dẫn (Sheet URL hoặc script URL)" });
    }

    try {
      let results = [];

      // Kiểm tra nếu là Google Apps Script Web App
      if (sheetUrl.includes("script.google.com")) {
        console.log("Đang xử lý link Apps Script...");
        const response = await axios.get(sheetUrl);
        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        
        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu từ Apps Script không phải là một danh sách (Array)");
        }

        results = data.map((item: any) => ({
          stt: item.stt?.toString().padStart(3, '0') || "000",
          fullname: item.ten || item.fullname || "Không xác định",
          extractedName: item.ten || item.fullname || "Không xác định",
          group: "APPS SCRIPT",
          mp3: item.mp3
        }));
      } else {
        // Trích xuất ID và GID (tab) từ link Google Sheet
        let sheetId = "";
        const idMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]{15,})/);
        if (idMatch) {
          sheetId = idMatch[1];
        } else if (sheetUrl.match(/^[a-zA-Z0-9-_]{15,}$/)) {
          sheetId = sheetUrl;
        }

        if (!sheetId) {
          console.error("Không trích xuất được Sheet ID từ:", sheetUrl);
          return res.status(400).json({ error: "Link hoặc ID Google Sheet không hợp lệ. Vui lòng kiểm tra lại link." });
        }

        // Kiểm tra xem có parameter gid không (để lấy đúng tab)
        const gidMatch = sheetUrl.match(/[?&]gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : "0";
        
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        
        console.log(`Đang tải dữ liệu CSV từ: ${csvUrl}`);
        const response = await axios.get(csvUrl);
        const csvData = response.data;

        // Kiểm tra nếu nhận được HTML thay vì CSV (Lỗi quyền truy cập)
        if (typeof csvData === 'string' && (csvData.includes('<!DOCTYPE html>') || csvData.includes('<html'))) {
          console.error("Nhận được HTML thay vì CSV cho Sheet ID:", sheetId);
          return res.status(403).json({ 
            error: "Tệp Google Sheet chưa được công khai. Tại Google Sheets, hãy bấm 'Chia sẻ' -> 'Bất kỳ ai có liên kết đều có thể xem'." 
          });
        }
        
        const lines = csvData.split("\n");
        console.log(`Tìm thấy ${lines.length} dòng trong CSV.`);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Xử lý CSV split có dấu ngoặc kép
          const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ""));
          
          // Bỏ qua dòng tiêu đề
          const firstCol = columns[0]?.toLowerCase() || "";
          const secondCol = columns[1]?.toLowerCase() || "";
          if (i === 0 && (firstCol.includes("stt") || secondCol.includes("họ tên") || secondCol.includes("fullname"))) {
            continue;
          }

          if (columns.length < 2) continue;

          const sttRaw = columns[0] || (i + 1).toString();
          const stt = parseInt(sttRaw) || (i + 1);
          const fullname = columns[1] || "";
          
          if (fullname && fullname !== "Họ và Tên") {
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

      console.log(`Đồng bộ thành công ${results.length} bản ghi.`);
      res.json({ 
        success: true, 
        data: results,
        syncTime: new Date().toLocaleString('vi-VN'),
        count: results.length
      });

    } catch (error: any) {
      console.error("Lỗi đồng bộ chi tiết:", error.message);
      if (error.response) {
        console.error("Mã lỗi HTTP:", error.response.status);
        console.error("Dữ liệu phản hồi:", error.response.data?.substring?.(0, 100));
        return res.status(error.response.status).json({ 
          error: `Google Sheets trả về lỗi ${error.response.status}. Hãy đảm bảo link tồn tại và đã được chia sẻ công khai.` 
        });
      }
      res.status(500).json({ error: "Lỗi hệ thống: " + error.message });
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

  // Catch-all for unknown /api routes
  app.all("/api/*", (req, res) => {
    console.warn(`Unknown API route requested: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Đường dẫn API không tồn tại: ${req.url}` });
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
