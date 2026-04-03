//pretrained model coco-ssd for object detection
//uses tensorflow.js for running ML in browser and backend needed for storing scan history
import { useState, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export const useVision = () => {
  const [model, setModel] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function load() {
      const m = await cocoSsd.load();
      setModel(m);
      setIsReady(true);
    }
    load();
  }, []);

  const detect = async (video) => {
    if (!model || !video) return [];
    return await model.detect(video);
  };  //take video input, return detected objects with confidence scores and bounding boxes
/* [
  { "class": "book", "score": 0.92 },
  { "class": "bottle", "score": 0.88 }
]*/
//Camera → Object Detection (COCO-SSD) → Identify object → OCR (Tesseract) → Extract text → Backend → Store history
  return { isReady, detect };
};