import React, { useEffect, useRef, useState } from 'react';
import styles from './MusicVisualizer.module.css';

const BAR_COUNT = 14;
const MIN_HEIGHT = 4; 
const MusicVisualizer = ({ analyserNode }) => {
  const [bars, setBars] = useState(() => Array(BAR_COUNT).fill(MIN_HEIGHT));
  const rafRef = useRef(null);

  useEffect(() => {
    if (!analyserNode) {
      setBars(Array(BAR_COUNT).fill(MIN_HEIGHT));
      return;
    }

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    const chunkSize = Math.max(1, Math.floor(dataArray.length / BAR_COUNT));

    const update = () => {
      analyserNode.getByteFrequencyData(dataArray);

      const nextBars = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0;
        for (let j = 0; j < chunkSize; j++) {
          sum += dataArray[i * chunkSize + j] || 0;
        }
        const avg = sum / chunkSize;
        nextBars.push(Math.max(MIN_HEIGHT, Math.round((avg / 255) * 100)));
      }

      setBars(nextBars);
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserNode]);

  return (
    <div className={styles.visualizer} aria-hidden="true">
      {bars.map((height, i) => (
        <div key={i} className={styles.bar} style={{ height: `${height}%` }} />
      ))}
    </div>
  );
};

export default MusicVisualizer;