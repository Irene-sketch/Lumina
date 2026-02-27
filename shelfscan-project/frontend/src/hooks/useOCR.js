import { createWorker } from 'tesseract.js';

export const useOCR = () => {
  const readText = async (mediaElement) => {
    // mediaElement can be video, image, or canvas
    const worker = await createWorker('eng');
    
    const canvas = document.createElement('canvas');
    const width = mediaElement.videoWidth || mediaElement.naturalWidth || mediaElement.width;
    const height = mediaElement.videoHeight || mediaElement.naturalHeight || mediaElement.height;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(mediaElement, 0, 0, width, height);

    const { data: { text } } = await worker.recognize(canvas);
    await worker.terminate();
    return text;
  };

  return { readText };
};