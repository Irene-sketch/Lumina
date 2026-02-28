const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import React, { useState, useEffect, useRef } from 'react';
import { useVision } from './hooks/useVision';
import { useOCR } from './hooks/useOCR';
import CameraFeed from './components/CameraFeed';
import Home from './components/Home';
import { Camera, Languages, Loader2, Upload, ChevronLeft } from 'lucide-react';

// Define the Backend URL (Update this when you deploy to Render!)


function App() {
  const { isReady, detect } = useVision();
  const { readText } = useOCR();
  const [cameraResult, setCameraResult] = useState("");
  const [uploadResult, setUploadResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [page, setPage] = useState('home'); 
  const [uploadedSrc, setUploadedSrc] = useState(null);
  const [prevSpoken, setPrevSpoken] = useState("");
  const videoRef = useRef(null);

  const speak = (text) => {
    if (text === prevSpoken) return;
    setPrevSpoken(text);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // NEW: Function to send data to your Backend (Port 5000)
  const saveToHistory = async (itemName) => {
    try {
      await fetch(`${API_URL}/api/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemName }),
      });
    } catch (err) {
      console.error("Backend unreachable", err);
    }
  };

  const handleStart = () => {
    setPrevSpoken("");
    speak("Camera active. Ready to scan.");
    setPage('camera');
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setIsScanning(false);
    setCameraResult("");
    setUploadedSrc(url);
  };

  // Upload Analysis Logic
  useEffect(() => {
    if (!uploadedSrc) return;
    setPrevSpoken("");
    const img = new Image();
    img.src = uploadedSrc;
    img.onload = async () => {
      if (detect) {
        const results = await detect(img);
        if (results.length > 0 && results[0].score > 0.7) {
          const result = results[0].class;
          setUploadResult(result);
          speak(result);
          saveToHistory(result); // Sync to Backend
        }
      }
    };
  }, [uploadedSrc, detect]);

  // Live Camera Loop
  useEffect(() => {
    let interval;
    if (isReady && isScanning && videoRef.current && !isReading && !uploadedSrc) {
      interval = setInterval(async () => {
        const results = await detect(videoRef.current);
        if (results.length > 0 && results[0].score > 0.70) {
          const itemName = results[0].class;
          if (itemName !== cameraResult) {
            setCameraResult(itemName);
            speak(itemName);
            saveToHistory(itemName); // Sync to Backend
          }
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isReady, isScanning, isReading, detect, cameraResult, uploadedSrc]);

  const handleReadText = async () => {
    if (!videoRef.current) return;
    setUploadedSrc(null);
    setUploadResult("");
    setIsReading(true);
    setIsScanning(false);
    speak("Scanning text.");

    try {
      const text = await readText(videoRef.current);
      const cleanText = text.trim().split('\n')[0];
      speak(cleanText || "No text found.");
      setCameraResult(cleanText ? `Text: ${cleanText}` : "No text found");
      if (cleanText) saveToHistory(`Text: ${cleanText}`); // Sync to Backend
    } catch (err) {
      speak("Error reading label.");
    } finally {
      setIsReading(false);
    }
  };

  return (
    // Changed font-serif to font-sans for better Dyslexia readability
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100 via-pink-200 to-amber-100 text-amber-950 font-sans flex flex-col items-center p-6">
      
      <header className="w-full max-w-lg mt-12 mb-10 text-center flex flex-col items-center">
        {/* Font-black and tracking-tight makes it much easier to read for low vision */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase drop-shadow-md">
          LUMINA
        </h1>
        <div className="h-2 w-24 bg-amber-600/60 mt-4 rounded-full" />
        <p className="mt-4 text-lg uppercase tracking-[0.2em] font-black text-amber-900/70">
          AI Sight Assistant
        </p>
      </header>

      <main className="w-full max-w-xl flex flex-col items-center justify-center flex-grow space-y-8">
        {page === 'home' ? (
          <div className="w-full bg-white/40 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border-4 border-white/60 text-center">
            <Home onStart={handleStart} />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-8">
            
            <button
              onClick={() => setPage('home')}
              className="flex items-center gap-2 px-6 py-3 bg-white/50 rounded-full text-xs font-black uppercase tracking-widest text-amber-900 shadow-sm"
            >
              <ChevronLeft size={16} strokeWidth={3} /> Back to Home
            </button>

            {!uploadedSrc ? (
              <div className="w-full aspect-square relative overflow-hidden rounded-[3rem] shadow-2xl border-[8px] border-white bg-black">
                <CameraFeed onVideoReady={(el) => (videoRef.current = el)} />
                {cameraResult && (
                  <div className="absolute bottom-10 left-6 right-6 flex justify-center">
                    <span className="bg-amber-500 text-black px-8 py-4 rounded-2xl text-2xl font-black uppercase shadow-2xl border-4 border-white">
                      {cameraResult}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-white/50 backdrop-blur-lg rounded-[3rem] p-8 border-4 border-white shadow-2xl flex flex-col items-center">
                <img src={uploadedSrc} alt="Preview" className="w-full rounded-2xl mb-6 shadow-lg" />
                <p className="text-4xl font-black text-amber-950 uppercase">{uploadResult || "..."}</p>
                <button 
                  onClick={() => {setUploadedSrc(null); setUploadResult("");}}
                  className="mt-8 text-sm font-black uppercase tracking-widest text-rose-600"
                >
                  Delete Image
                </button>
              </div>
            )}

            {!uploadedSrc && (
              <div className="w-full grid grid-cols-2 gap-8">
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`flex flex-col items-center justify-center gap-4 py-12 rounded-[3rem] border-4 transition-all ${
                    isScanning 
                    ? 'bg-amber-500 text-black border-white shadow-2xl scale-105' 
                    : 'bg-white/60 text-amber-950 border-white'
                  }`}
                >
                  <Camera size={48} strokeWidth={3} />
                  <span className="text-sm font-black uppercase tracking-tighter">{isScanning ? 'Live Now' : 'Start Scan'}</span>
                </button>

                <button
                  onClick={handleReadText}
                  disabled={isReading}
                  className="flex flex-col items-center justify-center gap-4 py-12 rounded-[3rem] bg-white/60 text-amber-950 border-4 border-white shadow-lg active:scale-95"
                >
                  {isReading ? <Loader2 className="animate-spin" size={48} /> : <Languages size={48} strokeWidth={3} />}
                  <span className="text-sm font-black uppercase tracking-tighter">Read Label</span>
                </button>
              </div>
            )}

            {!uploadedSrc && (
              <div className="pt-4">
                <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <label htmlFor="fileInput" className="flex items-center gap-4 cursor-pointer py-4 px-10 rounded-full bg-amber-950 text-white font-black text-xs uppercase tracking-widest shadow-xl">
                  <Upload size={18} /> Upload Photo
                </label>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 mb-6 flex flex-col items-center opacity-60">
        <span className="text-xs font-black uppercase tracking-widest">LUMINA • 2026</span>
      </footer>
    </div>
  );
}

export default App;