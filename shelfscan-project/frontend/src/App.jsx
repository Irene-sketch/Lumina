import React, { useState, useEffect, useRef } from 'react';
import { useVision } from './hooks/useVision';
import { useOCR } from './hooks/useOCR';
import CameraFeed from './components/CameraFeed';
import Home from './components/Home';
import { Camera, Languages, Loader2, Upload, ChevronLeft } from 'lucide-react';

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
      let result = "Analyzing...";
      if (detect) {
        const results = await detect(img);
        if (results.length > 0 && results[0].score > 0.7) {
          result = results[0].class;
          setUploadResult(result);
          speak(result);
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
    } catch (err) {
      speak("Error reading label.");
    } finally {
      setIsReading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100 via-pink-200 to-amber-100 text-amber-950 font-serif flex flex-col items-center p-6 selection:bg-rose-200">
      
      {/* Centered Header */}
      <header className="w-full max-w-lg mt-12 mb-10 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl italic font-light tracking-[0.15em] uppercase drop-shadow-sm">
          LUMINA
        </h1>
        <div className="h-px w-20 bg-amber-600/40 mt-4" />
        <p className="mt-4 text-[15px] uppercase tracking-[0.5em] font-bold text-amber-800/50">
          Your AI Sight Assistant
        </p>
      </header>

      <main className="w-full max-w-xl flex flex-col items-center justify-center flex-grow space-y-8">
        {page === 'home' ? (
          /* Glass Home Card */
          <div className="w-full bg-white/30 backdrop-blur-xl rounded-[3rem] p-12 shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-700 text-center">
            <Home onStart={handleStart} />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            
            <button
              onClick={() => setPage('home')}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-800/60 hover:text-amber-950 transition-colors"
            >
              <ChevronLeft size={14} /> Back to Home
            </button>

            {/* Centered Detection Viewport */}
            {!uploadedSrc ? (
              <div className="w-full aspect-square md:aspect-video relative overflow-hidden rounded-[2.5rem] shadow-2xl border-[6px] border-white bg-white/50 backdrop-blur-md">
                <CameraFeed onVideoReady={(el) => (videoRef.current = el)} />
                {cameraResult && (
                  <div className="absolute top-6 left-6 right-6 flex justify-center animate-in slide-in-from-top-4">
                    <span className="bg-amber-950/90 text-amber-100 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {cameraResult}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Image Upload View */
              <div className="w-full bg-white/50 backdrop-blur-lg rounded-[2.5rem] p-6 border-4 border-white shadow-2xl flex flex-col items-center">
                <img src={uploadedSrc} alt="Preview" className="w-full rounded-2xl shadow-inner mb-4" />
                <p className="text-2xl italic font-bold text-amber-900">{uploadResult || "Identifying..."}</p>
                <button 
                  onClick={() => {setUploadedSrc(null); setUploadResult("");}}
                  className="mt-4 text-[9px] font-bold uppercase tracking-widest text-rose-500 hover:underline"
                >
                  Clear Archive
                </button>
              </div>
            )}

            {/* Tactical Control Buttons */}
            {!uploadedSrc && (
              <div className="w-full grid grid-cols-2 gap-6">
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`flex flex-col items-center justify-center gap-4 py-10 rounded-[2.5rem] transition-all duration-500 border-2 ${
                    isScanning 
                    ? 'bg-amber-950 text-white border-amber-950 shadow-2xl scale-[1.03]' 
                    : 'bg-white/40 text-amber-900 border-white/60 hover:bg-white/60'
                  }`}
                >
                  <Camera size={32} strokeWidth={1} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{isScanning ? 'Live' : 'Scan'}</span>
                </button>

                <button
                  onClick={handleReadText}
                  disabled={isReading}
                  className="flex flex-col items-center justify-center gap-4 py-10 rounded-[2.5rem] bg-white/40 text-amber-900 border-2 border-white/60 hover:bg-white/60 transition-all disabled:opacity-30 active:scale-95 shadow-lg"
                >
                  {isReading ? <Loader2 className="animate-spin" size={32} /> : <Languages size={32} strokeWidth={1} />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{isReading ? 'Reading' : 'Read'}</span>
                </button>
              </div>
            )}

            {/* Minimalist Upload Trigger */}
            {!uploadedSrc && (
              <div className="pt-2">
                <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <label htmlFor="fileInput" className="flex items-center gap-3 cursor-pointer py-3 px-8 rounded-full bg-white/20 border border-white/40 hover:bg-white/40 transition-all text-amber-900/60 font-bold text-[9px] uppercase tracking-widest">
                  <Upload size={14} /> Upload to Brain
                </label>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 mb-6 flex flex-col items-center opacity-40">
        <div className="h-px w-10 bg-amber-900/50 mb-3" />
        <span className="text-[10px] uppercase tracking-[0.6em] font-black">created with love • Irene •2026</span>
      </footer>
    </div>
  );
}

export default App;