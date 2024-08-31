import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Word {
  word: string;
  color: string;
  start: number; // Время начала слова в секундах
}

interface WaveformProps {
  audioUrl: string;
  words: Word[];
}

const ZoomTest2: React.FC<WaveformProps> = ({ audioUrl, words }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    const step = width / (audioData.length / zoom);
    const startIndex = Math.floor(scrollPosition / step);
    const endIndex = Math.min(startIndex + Math.ceil(width / step), audioData.length);

    for (let i = startIndex; i < endIndex; i++) {
      const x = (i - startIndex) * step;
      const y = (1 - audioData[i]) * height / 2;
      if (i === startIndex) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // Отрисовка слов
    words.forEach(({ word, color, start }) => {
      const wordX = (start * (audioData.length / zoom)) * step - scrollPosition;

      if (wordX >= 0 && wordX <= width) {
        // Вертикальная линия
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(wordX, 0);
        ctx.lineTo(wordX, height);
        ctx.stroke();

        // Текст над линией
        ctx.fillStyle = color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(word, wordX, 12);
      }
    });
  }, [audioData, zoom, scrollPosition, words]);

  useEffect(() => {
    const fetchAudio = async () => {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const samples = 1000;
      const blockSize = Math.floor(channelData.length / samples);
      const filteredData = [];
      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }
      setAudioData(filteredData);
    };

    fetchAudio();
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const parentWidth = canvas.parentElement?.clientWidth || 0;
    const canvasWidth = parentWidth;
    canvas.width = canvasWidth * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = '300px';

    drawWaveform();
  }, [drawWaveform]);

  const handleZoom = (direction: 'in' | 'out') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const centerPosition = scrollPosition + width / 2;

    setZoom(prevZoom => {
      const newZoom = direction === 'in' ? Math.min(prevZoom * 2, 64) : Math.max(prevZoom / 2, 1);
      const newScrollPosition = centerPosition * (newZoom / prevZoom) - width / 2;
      setScrollPosition(Math.max(0, newScrollPosition));
      return newZoom;
    });
  };

  const handleScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrollPosition(parseFloat(e.target.value));
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '2000px', margin: '0 auto' }}>
        <canvas ref={canvasRef} style={{ border: '1px solid black' }} />
      </div>
      <div>
        <button onClick={() => handleZoom('out')} disabled={zoom === 1}>Zoom Out</button>
        <button onClick={() => handleZoom('in')} disabled={zoom === 64}>Zoom In</button>
      </div>
      {zoom > 1 && (
        <input
          type="range"
          min={0}
          max={canvasRef.current ? (canvasRef.current.width / window.devicePixelRatio) * (zoom - 1) : 0}
          value={scrollPosition}
          onChange={handleScroll}
          style={{ width: '2000px', margin: '10px auto', display: 'block' }}
        />
      )}
    </div>
  );
};

export default ZoomTest2;