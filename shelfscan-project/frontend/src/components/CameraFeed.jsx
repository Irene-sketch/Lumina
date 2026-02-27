import React, { useRef, useEffect } from 'react';

const CameraFeed = ({ onVideoReady }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => onVideoReady(videoRef.current);
        }
      });
  }, [onVideoReady]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 border-slate-700">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_green] animate-pulse" />
    </div>
  );
};

export default CameraFeed;