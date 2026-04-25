import { useState, useEffect } from 'react';
import { 
  Menu, 
  Table, 
  Mic2, 
  Cpu, 
  LayoutDashboard, 
  Search, 
  Filter, 
  RefreshCw, 
  Settings, 
  Info, 
  Wand2, 
  CheckCircle2,
  Trash2, 
  PlayCircle, 
  Copy, 
  Terminal, 
  RefreshCw as SyncIcon,
  MemoryStick as Memory,
  User,
  Radio,
  FileAudio,
  Code,
  HardDrive,
  ChevronRight,
  Expand
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'sheets' | 'audio' | 'esp32';

interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'stream' | 'input' | 'warning';
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [entities, setEntities] = useState<any[]>([]);
  const [syncInfo, setSyncInfo] = useState({ time: 'Chưa đồng bộ', count: 0 });
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '10:45:01', type: 'info', message: 'Initializing I2S peripheral...' },
    { time: '10:45:02', type: 'info', message: 'Connecting to SSID: "Lab-WiFi-Guest"' },
    { time: '10:45:05', type: 'info', message: 'WiFi connected, IP: 192.168.1.102' },
    { time: '10:45:05', type: 'info', message: 'HTTP Client connecting to 192.168.1.45:8080...' },
    { time: '10:45:06', type: 'success', message: 'Connection established. Requesting stream.' },
    { time: '10:45:07', type: 'stream', message: 'Receiving "thong_bao_chuyen_tau.mp3" (2.4MB)' },
    { time: '10:45:08', type: 'info', message: 'Buffer status: 16384 bytes (100%)' },
    { time: '10:45:09', type: 'info', message: 'Playback started via Internal DAC' },
  ]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    setLogs(prev => [...prev, { time, type, message }]);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-container/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[100px] rounded-full" />
      </div>

      {/* Navigation Drawer (Desktop) */}
      <aside className="hidden md:flex w-64 bg-surface-container-low border-r border-outline-variant flex-col fixed h-full z-20">
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
              <Cpu size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-on-surface leading-none">VietTTS</h1>
              <span className="text-[10px] font-display font-bold text-on-surface-variant tracking-widest uppercase">Admin Panel</span>
            </div>
          </div>
          <div className="bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
                <User size={16} className="text-on-surface-variant" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Admin</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] text-secondary font-bold uppercase">Online</span>
                </div>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Tổng quan" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Table size={20} />} 
            label="Bảng tính" 
            isActive={activeTab === 'sheets'} 
            onClick={() => setActiveTab('sheets')} 
          />
          <NavItem 
            icon={<FileAudio size={20} />} 
            label="Âm thanh" 
            isActive={activeTab === 'audio'} 
            onClick={() => setActiveTab('audio')} 
          />
          <NavItem 
            icon={<Terminal size={20} />} 
            label="Logs & ESP32" 
            isActive={activeTab === 'esp32'} 
            onClick={() => setActiveTab('esp32')} 
          />
        </nav>

        <div className="p-6 border-t border-outline-variant mt-auto text-on-surface-variant">
          <p className="text-[10px] font-display font-bold tracking-widest uppercase mb-1">Version 1.0.4</p>
          <p className="text-[10px]">ESP32-TTS-Viet-Stable</p>
        </div>
      </aside>

      {/* Top Bar (Mobile/Tablets) */}
      <header className="md:hidden sticky top-0 bg-surface/80 backdrop-blur-md border-b border-outline-variant z-30 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-container/20 rounded-lg text-primary">
            <Cpu size={20} />
          </div>
          <h1 className="font-display font-bold text-lg">SheetTalk AI</h1>
        </div>
        <button className="p-2 text-on-surface-variant">
          <Menu size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative z-10 px-4 py-6 md:px-8 md:py-10 pb-28 md:pb-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard key="dashboard" setActiveTab={setActiveTab} logs={logs} syncInfo={syncInfo} />}
          {activeTab === 'sheets' && <SheetsConfig key="sheets" addLog={addLog} entities={entities} setEntities={setEntities} syncInfo={syncInfo} setSyncInfo={setSyncInfo} />}
          {activeTab === 'audio' && <AudioManagement key="audio" addLog={addLog} entities={entities} />}
          {activeTab === 'esp32' && <DeviceControls key="esp32" logs={logs} addLog={addLog} />}
        </AnimatePresence>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-4 right-4 bg-surface-container/90 backdrop-blur-lg border border-outline-variant rounded-2xl p-2 mb-6 shadow-2xl flex items-center justify-around z-50">
        <MobileNavItem 
          icon={<LayoutDashboard size={20} />} 
          isActive={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <MobileNavItem 
          icon={<Table size={20} />} 
          isActive={activeTab === 'sheets'} 
          onClick={() => setActiveTab('sheets')} 
        />
        <MobileNavItem 
          icon={<FileAudio size={20} />} 
          isActive={activeTab === 'audio'} 
          onClick={() => setActiveTab('audio')} 
        />
        <MobileNavItem 
          icon={<Terminal size={20} />} 
          isActive={activeTab === 'esp32'} 
          onClick={() => setActiveTab('esp32')} 
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
        isActive 
          ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/20' 
          : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
      }`}
    >
      <span className={`${isActive ? 'text-inherit' : 'text-on-surface-variant group-hover:text-primary'}`}>{icon}</span>
      <span className="font-sans text-sm">{label}</span>
      {isActive && <motion.div layoutId="active-nav" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
    </button>
  );
}

function MobileNavItem({ icon, isActive, onClick }: { icon: any, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-xl transition-all ${isActive ? 'bg-primary-container text-white' : 'text-on-surface-variant'}`}
    >
      {icon}
    </button>
  );
}

/* --- VIEW COMPONENTS --- */

function Dashboard({ setActiveTab, logs, syncInfo }: { key?: any, setActiveTab: (t: Tab) => void, logs: LogEntry[], syncInfo: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header>
        <h2 className="text-3xl font-bold font-h2 mb-2">Bảng Điều Khiển</h2>
        <p className="text-on-surface-variant">Tổng quan hệ thống VietTTS và trạng thái thiết bị.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard title="ESP32 STATUS" value="ONLINE" subValue="IP: 192.168.1.102" status="success" icon={<Cpu size={24} />} />
        <StatusCard title="STREAM STATUS" value="ACTIVE" subValue="8080:TCP/HTTP" status="primary" icon={<Radio size={24} />} />
        <StatusCard title="SD CARD" value="42%" subValue="13.2GB / 32GB" status="tertiary" icon={<HardDrive size={24} />} />
        <StatusCard title="SHEET SYNC" value="OK" subValue={syncInfo.time} status="success" icon={<RefreshCw size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Section glass title="LUỒNG ĐANG HOẠT ĐỘNG" icon={<Radio size={18} />}>
            <div className="bg-surface-container-high rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileAudio size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-display font-bold text-primary tracking-widest uppercase mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Preview
                </div>
                <h4 className="text-sm font-display font-bold text-on-surface-variant uppercase mb-1">FILE_ID: 992-VN-F01</h4>
                <p className="text-xl font-bold mb-4">thong_bao_chuyen_tau.mp3</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-display font-bold text-on-surface-variant">
                    <span>PROGRESS: 65%</span>
                    <span>128 kbps</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="GẦN ĐÂY" icon={<RefreshCw size={18} />} onAction={() => setActiveTab('esp32')} actionLabel="Xem tất cả">
             <div className="bg-black/40 rounded-2xl border border-outline-variant overflow-hidden">
                <div className="p-4 h-48 overflow-y-auto font-mono text-xs terminal-scrollbar">
                  {logs.slice(-10).map((log, idx) => (
                    <div key={idx} className="flex gap-3 py-0.5">
                      <span className="text-slate-600">[{log.time}]</span>
                      <span className={`${
                        log.type === 'success' ? 'text-secondary' : 
                        log.type === 'stream' ? 'text-primary' : 
                        log.type === 'warning' ? 'text-tertiary' : 
                        'text-slate-400'
                      }`}>
                        {log.type.toUpperCase()}: {log.message}
                      </span>
                    </div>
                  ))}
                </div>
             </div>
          </Section>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary-container/20 border-2 border-primary/30 flex items-center justify-center text-primary mb-4 shadow-xl shadow-primary/10">
                <Table size={32} />
              </div>
              <h3 className="font-bold text-lg mb-1">Cấu hình Bảng tính</h3>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">Tự động đồng bộ hóa danh sách người nhận thông báo từ Google Sheets.</p>
              <button 
                onClick={() => setActiveTab('sheets')}
                className="w-full py-3 bg-surface-container-highest border border-outline-variant rounded-xl text-xs font-bold font-display uppercase tracking-widest hover:bg-primary-container hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Cấu hình ngay <ChevronRight size={14} />
              </button>
           </div>

           <div className="bg-tertiary-container/10 border border-tertiary/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 text-tertiary/10 rotate-12">
                <Info size={120} />
              </div>
              <h4 className="text-tertiary font-bold mb-2 flex items-center gap-2">
                <Info size={18} />
                Lưu ý hệ thống
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed relative z-10">
                Khi sử dụng trực tiếp trên ESP32, hãy đảm bảo thư viện <code className="bg-tertiary/20 px-1 rounded text-tertiary font-bold">Audio.h</code> đã được cập nhật phiên bản mới nhất.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function SheetsConfig({ addLog, entities, setEntities, syncInfo, setSyncInfo }: { key?: any, addLog: (m: string, t?: LogEntry['type']) => void, entities: any[], setEntities: any, syncInfo: any, setSyncInfo: any }) {
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1o_XfosXZXcoYIP7CHMO5fqeY5js8m231w8h_yzrzK-0/edit?gid=0#gid=0');
  const [loading, setLoading] = useState(false);

  const speak = (text: string) => {
    try {
      // Using the exact parameter order and common client variant for best compatibility
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(text)}`;
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      const audio = new Audio();
      // Use local proxy by default to avoid CORS and potential loading issues in the browser
      const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(url)}`;
      audio.src = proxyUrl;

      audio.oncanplaythrough = () => {
        audio.play().catch(err => {
          console.error("Audio playback interrupted/blocked:", err);
          addLog(`Playback error: ${err.message}`, 'warning');
          fallbackToSpeechSynthesis(text);
        });
      };

      audio.onerror = (e) => {
        console.error("Audio engine failed to load:", e);
        addLog(`Lỗi tải âm thanh từ proxy: ${text.substring(0, 30)}...`, 'warning');
        fallbackToSpeechSynthesis(text);
      };

      addLog(`Yêu cầu phát âm thanh: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, 'stream');
    } catch (err: any) {
      addLog(`Lỗi hệ thống âm thanh: ${err.message}`, 'warning');
      fallbackToSpeechSynthesis(text);
    }
  };

  const fallbackToSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95; // Slightly slower for clarity
      
      // Try to find a better Vietnamese voice
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi'));
      if (viVoice) {
        utterance.voice = viVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      addLog('Trình duyệt không hỗ trợ phát âm thanh', 'warning');
    }
  };

  const playTTS = (text: string) => {
    speak(text);
  };

  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sync-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl }),
      });
      
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Phản hồi từ máy chủ không hợp lệ (Không phải JSON): ${text.substring(0, 50)}...`);
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Lỗi không xác định');
      }

      setEntities(result.data.map((item: any) => ({
        ...item,
        status: 'primary'
      })));
      setSyncInfo({ time: result.syncTime, count: result.count });
      addLog(`Đồng bộ thành công ${result.count} thực thể từ Google Sheets.`, 'success');
    } catch (err: any) {
      setError(err.message);
      addLog(`Lỗi đồng bộ: ${err.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-3xl mx-auto"
    >
      <header>
        <h2 className="text-3xl font-bold font-h2 mb-2">Cấu hình Bảng tính</h2>
        <p className="text-on-surface-variant">Kết nối dữ liệu từ Google Sheets để tự động hóa thông báo.</p>
      </header>

      <section className="bg-surface-container border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="mb-6 p-4 rounded-xl bg-primary-container/10 border border-primary/20">
          <p className="text-[10px] font-display font-bold text-primary mb-3 flex items-center gap-2 tracking-widest uppercase">
            <Info size={14} />
            Cấu trúc bảng yêu cầu
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
             <div className="bg-surface p-2 rounded-lg border border-outline-variant text-center">
               <span className="text-[10px] font-bold font-display text-on-surface uppercase">Cột A: STT</span>
             </div>
             <div className="bg-surface p-2 rounded-lg border border-outline-variant text-center">
               <span className="text-[10px] font-bold font-display text-on-surface uppercase">Cột B: Họ và Tên</span>
             </div>
          </div>
          <div className="flex items-start gap-2">
            <Wand2 size={14} className="text-secondary mt-0.5 shrink-0" />
            <p className="text-[10px] text-on-surface-variant leading-relaxed">Hệ thống sẽ <b>tự động đánh số</b> và <b>tự động tách tên</b> từ cột Họ Tên để tối ưu hóa xử lý giọng nói TTS.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-display font-bold text-on-surface-variant mb-2 uppercase tracking-widest">ID Google Sheet / URL</label>
            <div className="relative">
              <input 
                type="text" 
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600 pr-12"
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
              <button 
                onClick={() => setSheetUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex items-center gap-2">
              <Info size={14} />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={handleSync}
              disabled={loading}
              className={`flex-1 bg-primary-container text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-primary-container/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              <span className="font-display text-sm tracking-wide">
                {loading ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ & TỰ ĐỘNG TÁCH'}
              </span>
            </button>
            <button className="w-14 bg-surface-container-high border border-outline-variant rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors">
              <Settings size={22} />
            </button>
          </div>
        </div>
      </section>

      {/* Status Info */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase tracking-widest">Đồng bộ:</span>
          <span className="text-[10px] font-mono font-bold text-secondary">{syncInfo.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase tracking-widest">Số lượng:</span>
          <span className="text-[10px] font-mono font-bold text-primary">{syncInfo.count} TÊN</span>
        </div>
      </div>

      <section className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold uppercase text-xs tracking-widest">Danh sách thực thể</h3>
            <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[8px] font-bold rounded border border-secondary/20">AUTO-SYNCED</span>
          </div>
          <div className="flex gap-4">
            <Search size={16} className="text-on-surface-variant cursor-pointer" />
            <Filter size={16} className="text-on-surface-variant cursor-pointer" />
          </div>
        </div>
        
        <div className="divide-y divide-outline-variant/30">
          {entities.length > 0 ? entities.map((entity, idx) => (
            <EntityRow 
              key={idx}
              stt={entity.stt} 
              name={entity.fullname} 
              group={entity.group} 
              tag={entity.extractedName} 
              status={entity.status as any} 
              onPlay={playTTS}
            />
          )) : (
            <div className="p-10 text-center text-on-surface-variant text-sm">
              Chưa có dữ liệu. Vui lòng bấm đồng bộ.
            </div>
          )}
        </div>

        {entities.length > 4 && (
          <div className="p-4 bg-surface-container-low/50 flex justify-center">
              <button className="text-[10px] font-display font-bold text-primary uppercase tracking-widest flex items-center gap-2 hover:underline">
                Xem thêm {entities.length - 4} dòng khác
              </button>
          </div>
        )}
      </section>
    </motion.div>
  );
}

function EntityRow({ stt, name, group, tag, status, onPlay }: { key?: any, stt: string, name: string, group: string, tag: string, status: 'success' | 'primary', onPlay?: (name: string) => void }) {
  return (
    <div className="flex items-center p-4 hover:bg-surface-container-highest/30 transition-colors group">
      <div className="w-12 text-xs font-mono text-on-surface-variant">{stt}</div>
      <div className="flex-1">
        <p className="text-sm font-bold">{name}</p>
        <p className="text-[10px] font-display font-bold text-on-surface-variant uppercase">{group}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${status === 'success' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
          {tag}
        </span>
        <button 
          onClick={() => onPlay?.(name)}
          className="p-2 bg-surface-container-low border border-outline-variant rounded-full text-primary hover:bg-primary-container hover:text-white transition-all shadow-sm active:scale-90"
          title="Đọc họ tên đầy đủ"
        >
          <Mic2 size={14} />
        </button>
      </div>
    </div>
  );
}

function AudioManagement({ addLog, entities }: { key?: any, addLog: (m: string, t?: LogEntry['type']) => void, entities: any[] }) {
  const speak = (text: string) => {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(text)}`;
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      const audio = new Audio();
      const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(url)}`;
      audio.src = proxyUrl;

      audio.oncanplaythrough = () => {
        audio.play().catch(err => {
          console.error("Audio playback interrupted/blocked:", err);
          addLog(`Playback error: ${err.message}`, 'warning');
          fallbackToSpeechSynthesis(text);
        });
      };

      audio.onerror = (e) => {
        console.error("Audio engine failed to load:", e);
        addLog(`Lỗi tải âm thanh từ proxy: ${text.substring(0, 30)}...`, 'warning');
        fallbackToSpeechSynthesis(text);
      };

      addLog(`Yêu cầu phát âm thanh: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, 'stream');
    } catch (err: any) {
      addLog(`Lỗi hệ thống âm thanh: ${err.message}`, 'warning');
      fallbackToSpeechSynthesis(text);
    }
  };

  const fallbackToSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi'));
      if (viVoice) {
        utterance.voice = viVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      addLog('Trình duyệt không hỗ trợ phát âm thanh', 'warning');
    }
  };

  const playTTS = (text: string) => {
    speak(text);
  };

  const playBatch = (batchIndices: number[]) => {
    const batchNum = Math.floor(batchIndices[0] / 8) + 1;
    const batchText = batchIndices.map((i, idx) => {
      const entity = entities[i];
      const posInBatch = (i % 8) + 1;
      if (idx === 0) return `Lượt ${batchNum} số ${posInBatch} ${entity.fullname}`;
      return `số ${posInBatch} ${entity.fullname}`;
    }).join(", ");
    
    playTTS(batchText);
  };

  // Group entities into batches of 8
  const batches = [];
  for (let i = 0; i < entities.length; i += 8) {
    const batch = entities.slice(i, i + 8).map((_, idx) => i + idx);
    batches.push({
      id: Math.floor(i / 8) + 1,
      indices: batch,
      startStt: entities[i].stt,
      endStt: entities[Math.min(i + 7, entities.length - 1)].stt
    });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-h2 mb-2">Quản lý âm thanh</h2>
          <p className="text-on-surface-variant">Đồng bộ tệp MP3 và quản lý HTTP Streaming cho thiết bị.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-[10px] font-display font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-all flex items-center gap-2">
             <RefreshCw size={14} /> Làm mới
           </button>
           <button className="px-5 py-2 bg-primary-container text-white rounded-xl text-[10px] font-display font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary-container/20">
             <LayoutDashboard size={14} /> Tải tệp mới
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-surface-container border border-outline-variant rounded-2xl p-6">
          <p className="text-[10px] font-display font-bold text-on-surface-variant mb-6 uppercase tracking-widest">Trạng thái lưu trữ (SD Card)</p>
          <div className="flex justify-between items-end mb-4">
            <h4 className="text-4xl font-bold text-secondary">42%</h4>
            <span className="text-xs font-mono text-on-surface-variant italic">13.2 GB / 32 GB</span>
          </div>
          <div className="h-2 bg-surface-container-low rounded-full overflow-hidden mb-6">
            <div className="h-full bg-secondary w-[42%]" />
          </div>
          <div className="space-y-3">
             <StatItem label="Tổng số tệp" value="128 tệp" />
             <StatItem label="Định dạng hỗ trợ" value="MP3, WAV Mono" highlight />
          </div>
        </div>

        <div className="lg:col-span-8 bg-surface-container border border-outline-variant rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
           <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-5 pointer-events-none">
             <Radio size={200} />
           </div>
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-primary-container/20 border-2 border-primary/30 flex items-center justify-center text-primary shadow-xl">
                 <Radio size={32} />
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <h3 className="text-xl font-bold">Máy chủ Streaming: <span className="text-secondary">ĐANG CHẠY</span></h3>
                   <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                 </div>
                 <p className="text-sm text-on-surface-variant">IP cục bộ: <span className="text-primary font-mono font-bold tracking-tight">192.168.1.105</span> (sheet-talk.local)</p>
              </div>
           </div>
           <div className="text-right shrink-0">
             <p className="text-[10px] font-display font-bold text-on-surface-variant uppercase tracking-widest mb-1">Uptime</p>
             <p className="text-lg font-mono font-bold text-primary">14:22:05</p>
           </div>
        </div>

        <div className="lg:col-span-12 bg-surface-container border border-outline-variant rounded-2xl overflow-hidden shadow-2xl">
           <div className="px-6 py-4 bg-surface-container-highest/50 border-b border-outline-variant flex justify-between items-center">
              <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase tracking-widest">DANH SÁCH TỆP ÂM THANH THEO LƯỢT (BATCH MODE)</span>
              <div className="relative">
                <input type="text" className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none min-w-[200px]" placeholder="Tìm kiếm lượt..." />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-display font-bold text-on-surface-variant uppercase tracking-tighter border-b border-outline-variant/30">
                    <th className="px-6 py-4">Nhóm / Lượt</th>
                    <th className="px-6 py-4">Phạm vi STT</th>
                    <th className="px-6 py-4">HTTP Stream Link</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                    {batches.length > 0 ? batches.map((batch, idx) => {
                     // Create a batch text for TTS
                     const batchNum = batch.id;
                     const batchText = batch.indices.map((i, subIdx) => {
                       const entity = entities[i];
                       const posInBatch = (i % 8) + 1;
                       if (subIdx === 0) return `Lượt ${batchNum} số ${posInBatch} ${entity.fullname}`;
                       return `số ${posInBatch} ${entity.fullname}`;
                     }).join(", ");
                     
                     const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(batchText)}`;
                     // Proxy URL for ESP32 compatibility
                     const localProxyUrl = `${window.location.origin}/api/proxy-audio?url=${encodeURIComponent(googleUrl)}`;

                     return (
                       <AudioRow 
                        key={idx}
                        name={`Lượt ${batch.id}`} 
                        id={`BATCH_ID: ${batch.id.toString(16).padStart(4, '0')}`} 
                        url={localProxyUrl} 
                        size={`${batch.startStt} - ${batch.endStt}`}
                        onPlay={() => playBatch(batch.indices)} 
                       />
                     );
                   }) : (
                     <tr className="hover:bg-surface-container-highest/20 transition-colors group">
                        <td className="px-6 py-10 text-center text-on-surface-variant text-sm font-display italic" colSpan={4}>
                           Chưa có dữ liệu lượt. Hãy đồng bộ ở Bảng tính trước.
                        </td>
                     </tr>
                   )}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function AudioRow({ name, id, url, size, onPlay }: { key?: any, name: string, id: string, url: string, size: string, onPlay?: () => void }) {
  return (
    <tr className="hover:bg-surface-container-highest/20 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <FileAudio size={18} className="text-primary" />
          <div>
            <p className="text-sm font-bold text-on-surface">{name}</p>
            <p className="text-[10px] font-mono text-on-surface-variant">{id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">{size}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-2 py-1 w-fit">
          <span className="text-[10px] font-mono text-secondary truncate max-w-[200px]">{url}</span>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Copy size={12} />
          </button>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={onPlay}
          className="p-2 rounded-full hover:bg-primary/10 text-primary transition-all active:scale-90"
          title="Nghe thử lượt này"
        >
          <PlayCircle size={20} />
        </button>
      </td>
    </tr>
  );
}

function DeviceControls({ logs, addLog }: { key?: any, logs: LogEntry[], addLog: (m: string, t?: LogEntry['type']) => void }) {
  const [ EspStatus, setEspStatus ] = useState(true);

  const simulateButton = (name: string) => {
    addLog(`Nút "${name}" được nhấn - Giả lập tín hiệu GPIO`, 'input');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header>
        <h2 className="text-3xl font-bold font-h2 mb-2">Điều Khiển & Logs</h2>
        <p className="text-on-surface-variant">Quản lý phần cứng ESP32 và theo dõi dữ liệu truyền tải.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Buttons Simulation */}
        <div className="lg:col-span-8 bg-surface-container border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
           <div className="px-6 py-4 bg-surface-container-highest border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Terminal size={18} className="text-tertiary" />
                 <h3 className="font-display font-bold text-xs tracking-widest uppercase">Mô phỏng nút nhấn vật lý</h3>
              </div>
              <div className="text-[10px] font-display font-bold text-on-surface-variant italic">Giả lập GPIO Pins</div>
           </div>
           <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <SimuBtn icon={<ChevronRight strokeWidth={3} className="rotate-180" />} label="Lượt Trước" onClick={() => simulateButton('Lượt Trước')} />
              <SimuBtn icon={<ChevronRight strokeWidth={3} />} label="Lượt Tiếp" onClick={() => simulateButton('Lượt Tiếp')} />
              <SimuBtn icon={<PlayCircle fill="currentColor" />} label="Tạm Dừng" color="amber" onClick={() => simulateButton('Tạm Dừng')} />
              <SimuBtn icon={<RefreshCw />} label="Làm Mới" color="blue" onClick={() => simulateButton('Làm Mới')} />
           </div>
           <div className="px-6 pb-6 pt-0">
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 flex items-start gap-3">
                 <Info size={14} className="text-on-surface-variant mt-0.5 shrink-0" />
                 <p className="text-[10px] text-on-surface-variant leading-relaxed italic">
                    Nhấn vào các nút mô phỏng trên để kiểm tra logic xử lý sự kiện ngắt trên ESP32 mà không cần phần cứng thực tế.
                 </p>
              </div>
           </div>
        </div>

        {/* Device Quick Info */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold">Quản lý nguồn</h3>
                 <div className={`px-2 py-0.5 rounded text-[10px] font-bold font-display ${EspStatus ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    {EspStatus ? 'STABLE' : 'OFFLINE'}
                 </div>
              </div>
              <div className="space-y-4">
                 <button 
                  onClick={() => { setEspStatus(false); setTimeout(() => setEspStatus(true), 2000); addLog('ESP32 Đang khởi động lại...', 'warning'); }}
                  className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-primary-container/20 group"
                 >
                   <RefreshCw size={20} className="group-active:rotate-180 transition-transform duration-500" />
                   KHỞI ĐỘNG LẠI ESP32
                 </button>
                 <div className="grid grid-cols-2 gap-3">
                    <button className="py-2.5 bg-surface-container-high border border-outline-variant rounded-xl text-[10px] font-display font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors">Cài đặt PIN</button>
                    <button className="py-2.5 bg-surface-container-high border border-outline-variant rounded-xl text-[10px] font-display font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors">WIFI Config</button>
                 </div>
              </div>
           </div>

           <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 text-on-surface-variant/5 group-hover:scale-110 transition-transform">
                <Memory size={120} />
              </div>
              <h4 className="text-[10px] font-display font-bold text-on-surface-variant mb-4 uppercase tracking-widest">Thông tin phần cứng</h4>
              <div className="space-y-3 font-mono text-xs relative z-10">
                 <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                   <span className="text-slate-500">Device:</span>
                   <span className="font-bold">ESP32-S3-WROOM</span>
                 </div>
                 <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                   <span className="text-slate-500">MAC Addr:</span>
                   <span className="font-bold">B4:E6:2D:E8:1A:F0</span>
                 </div>
                 <div className="flex justify-between border-b border-outline-variant/10 pb-1">
                   <span className="text-slate-500">RAM Load:</span>
                   <span className="text-primary font-bold">240KB / 512KB</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Real-time Console */}
        <div className="lg:col-span-12">
            <div className="bg-slate-950 border border-outline-variant rounded-2xl overflow-hidden shadow-2xl">
               <div className="bg-slate-900 border-b border-outline-variant/30 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5 mr-4">
                       <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
                       <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/50" />
                       <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
                    </div>
                    <span className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">Serial Console Output</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-700 tracking-widest">Baud: 115200</span>
               </div>
               <div className="p-6 h-[400px] overflow-y-auto font-mono text-sm terminal-scrollbar flex flex-col-reverse">
                  <div>
                    {logs.map((log, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        key={idx} 
                        className={`flex gap-4 py-1 border-l-2 pl-4 mb-2 transition-all ${
                          log.type === 'stream' ? 'bg-primary/5 border-primary' : 
                          log.type === 'success' ? 'bg-secondary/5 border-secondary' : 
                          log.type === 'input' ? 'bg-tertiary/10 border-tertiary shadow-[0_0_15px_-5px] shadow-tertiary/20' : 
                          log.type === 'warning' ? 'bg-red-500/5 border-red-500' :
                          'border-transparent'
                        }`}
                      >
                        <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                        <span className={`block ${
                          log.type === 'success' ? 'text-secondary font-bold' : 
                          log.type === 'stream' ? 'text-primary' : 
                          log.type === 'input' ? 'text-tertiary' : 
                          log.type === 'warning' ? 'text-red-400 font-bold' :
                          'text-slate-400'
                        }`}>
                          <span className="opacity-50 text-[10px] uppercase font-display font-bold mr-2">{log.type}</span>
                          {log.message}
                        </span>
                      </motion.div>
                    ))}
                    <div className="flex items-center gap-2 text-primary animate-pulse ml-4 mt-4">
                      <Terminal size={14} />
                      <span className="w-2 h-4 bg-primary" />
                    </div>
                  </div>
               </div>
            </div>
        </div>

        {/* ESP32 Implementation snippet */}
        <div className="lg:col-span-12 p-8 bg-surface-container border border-outline-variant rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-primary/5 pointer-events-none">
              <Code size={300} />
            </div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
               <div>
                 <div className="p-3 bg-primary-container/20 border border-primary/30 w-fit rounded-2xl text-primary mb-6">
                    <Code size={32} />
                 </div>
                 <h3 className="text-2xl font-bold font-h2 mb-2">Arduino ESP32 DevKit V1</h3>
                 <p className="text-on-surface-variant mb-8 leading-relaxed">Logic xử lý điều khiển nút nhấn vật lý và phát luồng âm thanh thông qua API quản trị VietTTS.</p>
                 
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-display font-bold text-secondary uppercase tracking-[0.2em] mb-2">Sơ đồ chân GPIO (Pinout)</h5>
                    <div className="bg-surface p-4 rounded-2xl border border-outline-variant space-y-3 font-mono text-xs">
                       <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant/10 pb-2">
                          <span>GPIO 13</span>
                          <span className="text-on-surface font-bold uppercase">Prev / Trở lại</span>
                       </div>
                       <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant/10 pb-2">
                          <span>GPIO 14</span>
                          <span className="text-on-surface font-bold uppercase">Next / Tiếp theo</span>
                       </div>
                       <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant/10 pb-2">
                          <span>GPIO 27</span>
                          <span className="text-on-surface font-bold uppercase">Play / Phát</span>
                       </div>
                       <div className="flex justify-between items-center text-on-surface-variant">
                          <span>GPIO 26, 25, 22</span>
                          <span className="text-on-surface font-bold uppercase">I2S (BCLK, LRC, DOUT)</span>
                       </div>
                    </div>
                 </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-slate-950 rounded-2xl border border-outline-variant overflow-hidden">
                     <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-outline-variant/30">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">main_esp32_control.ino</span>
                        <button className="text-[10px] font-display font-bold text-primary flex items-center gap-1 hover:underline">
                          <Copy size={12} /> COPY CODE
                        </button>
                     </div>
                     <pre className="p-4 h-[320px] overflow-y-auto font-mono text-xs text-slate-400 terminal-scrollbar leading-loose bg-black/40">
{`#include "Audio.h"
#include "WiFi.h"

// I2S Pins cho ESP32 DevKit V1
#define I2S_BCLK 26
#define I2S_LRC  25
#define I2S_DOUT 22

// Nút nhấn
#define BTN_PREV 13
#define BTN_NEXT 14
#define BTN_PLAY 27

Audio audio;
int currentBatch = 1;
const char* host = "https://your-app-url.run.app"; // Thay bằng URL app của bạn

void setup() {
  Serial.begin(115200);
  pinMode(BTN_PREV, INPUT_PULLUP);
  pinMode(BTN_NEXT, INPUT_PULLUP);
  pinMode(BTN_PLAY, INPUT_PULLUP);

  WiFi.begin("SSID", "PASSWORD");
  while (WiFi.status() != WL_CONNECTED) delay(500);

  // Khởi tạo I2S
  audio.setPinout(I2S_BCLK, I2S_LRC, I2S_DOUT);
  audio.setVolume(20); // 0...21
}

void loop() {
  audio.loop();
  
  if(digitalRead(BTN_NEXT) == LOW) {
    currentBatch++;
    playBatch(currentBatch);
    delay(500); // Debounce
  }

  if(digitalRead(BTN_PREV) == LOW && currentBatch > 1) {
    currentBatch--;
    playBatch(currentBatch);
    delay(500);
  }
}

void playBatch(int id) {
  // Sử dụng proxy endpoint để phát âm thanh tiếng Việt chuẩn Google
  String url = String(host) + "/api/proxy-audio?url=" + 
               "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=" + 
               "Lượt+" + String(id) + "+chuẩn+bị";
  
  audio.connecttohost(url.c_str());
  Serial.println("Đang phát: " + url);
}`}
                     </pre>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

/* --- UTILITY COMPONENTS --- */

function StatusCard({ title, value, subValue, status, icon }: { key?: any, title: string, value: string, subValue: string, status: 'success' | 'primary' | 'tertiary', icon: any }) {
  const colorClass = status === 'success' ? 'text-secondary' : status === 'tertiary' ? 'text-tertiary' : 'text-primary';
  const bgColorClass = status === 'success' ? 'bg-secondary/10' : status === 'tertiary' ? 'bg-tertiary/10' : 'bg-primary/10';
  
  return (
    <div className="bg-surface-container border border-outline-variant p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-display font-bold text-on-surface-variant tracking-wider uppercase">{title}</span>
        <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 ${bgColorClass} ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h4 className={`text-2xl font-bold font-h2 ${colorClass}`}>{value}</h4>
        <p className="text-[10px] font-mono text-on-surface-variant font-medium">{subValue}</p>
      </div>
    </div>
  );
}

function Section({ children, title, icon, glass, onAction, actionLabel }: { key?: any, children: any, title: string, icon: any, glass?: boolean, onAction?: () => void, actionLabel?: string }) {
  return (
    <div className={`space-y-4 ${glass ? 'backdrop-blur-sm' : ''}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="text-primary">{icon}</div>
          <h3 className="text-xs font-display font-bold uppercase tracking-widest text-on-surface-variant">{title}</h3>
        </div>
        {onAction && (
          <button onClick={onAction} className="text-[10px] font-display font-bold text-primary hover:underline uppercase tracking-widest">{actionLabel}</button>
        )}
      </div>
      {children}
    </div>
  );
}

function StatItem({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-on-surface-variant">{label}:</span>
      <span className={`font-bold ${highlight ? 'text-secondary' : 'text-on-surface'}`}>{value}</span>
    </div>
  );
}

function SimuBtn({ icon, label, color, onClick }: { key?: any, icon: any, label: string, color?: 'amber' | 'blue', onClick: () => void }) {
  const colorMap = {
    amber: 'bg-tertiary/20 text-tertiary border-tertiary/30 hover:bg-tertiary/30',
    blue: 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30',
    default: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-highest'
  };
  const activeColor = color ? colorMap[color] : colorMap.default;

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all active:translate-y-0.5 active:shadow-inner ${activeColor} group`}
    >
      <div className="transition-transform group-hover:scale-110">
        {icon}
      </div>
      <span className="text-[10px] font-display font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
