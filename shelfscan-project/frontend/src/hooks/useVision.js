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
  };

  return { isReady, detect };
};