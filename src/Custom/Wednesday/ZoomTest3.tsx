import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

interface Word {
  word: string;
  color: string;
  start: number;
}

interface WaveformProps {
  audioUrl: string;
  words: Word[];
  onWordClick?: (word: Word) => void;
}

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

const ZoomTest3: React.FC<WaveformProps> = ({ audioUrl, words, onWordClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [hoveredWord, setHoveredWord] = useState<Word | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);

  const scaledWords = useMemo(() => {
    return words.map(word => ({
      ...word,
      scaledStart: (word.start / audioDuration) * audioData.length,
    }));
  }, [words, audioData, audioDuration]);

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

    const samplesPerPixel = (audioData.length / zoom) / width;
    const startSample = Math.floor(scrollPosition * samplesPerPixel);
    const endSample = Math.min(startSample + Math.ceil(width * samplesPerPixel), audioData.length);

    for (let i = startSample; i < endSample; i++) {
      const x = (i - startSample) / samplesPerPixel;
      const y = (1 - audioData[i]) * height / 2;
      if (i === startSample) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // Draw words
    scaledWords.forEach(word => {
      const x = (word.scaledStart - startSample) / samplesPerPixel;
      if (x >= 0 && x <= width) {
        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = word.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw word label
        ctx.fillStyle = word === hoveredWord ? 'black' : word.color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(word.word, x, 15);
      }
    });

  }, [audioData, zoom, scrollPosition, scaledWords, hoveredWord]);

  useEffect(() => {
    const fetchAudio = async () => {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      
      // Use the full audio data instead of downsampling
      const filteredData = Array.from(channelData);
      
      setAudioData(filteredData);
      setAudioDuration(audioBuffer.duration);
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
    const centerSample = scrollPosition + (width * (audioData.length / zoom) / width) / 2;

    setZoom(prevZoom => {
      const newZoom = direction === 'in' ? Math.min(prevZoom * 2, 64) : Math.max(prevZoom / 2, 1);
      const newScrollPosition = centerSample - (width * (audioData.length / newZoom) / width) / 2;
      setScrollPosition(Math.max(0, newScrollPosition));
      return newZoom;
    });
  };

  const handleScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrollPosition(parseFloat(e.target.value));
  };

//   const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const samplesPerPixel = (audioData.length / zoom) / canvas.width;
//     const hoveredSample = Math.floor(scrollPosition * samplesPerPixel + x * samplesPerPixel);

//     const hovered = scaledWords.find(word => 
//       Math.abs(word.scaledStart - hoveredSample) < samplesPerPixel * 10
//     );

//     setHoveredWord(hovered || null);
//   }, [audioData, zoom, scrollPosition, scaledWords]);

//   const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
//     if (hoveredWord && onWordClick) {
//       onWordClick(hoveredWord);
//     }
//   }, [hoveredWord, onWordClick]);


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

export default ZoomTest3;