//OCR (Optical Character Recognition) hook using Tesseract.js
//image ->text
//Camera/Image → OCR (Tesseract.js) → Extract text → Send to backend → Store history
import { createWorker } from 'tesseract.js';

export const useOCR = () => {
  const readText = async (mediaElement) => { //take input
    // mediaElement can be video, image, or canvas
    const worker = await createWorker('eng'); //start ocr engine,take eng input
    
    const canvas = document.createElement('canvas');
    const width = mediaElement.videoWidth || mediaElement.naturalWidth || mediaElement.width;
    const height = mediaElement.videoHeight || mediaElement.naturalHeight || mediaElement.height;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(mediaElement, 0, 0, width, height); //draw input on canvas

    const { data: { text } } = await worker.recognize(canvas); //return text from canvas
    await worker.terminate();  //free mem
    return text; //send extrated text back
  };

  return { readText };
};