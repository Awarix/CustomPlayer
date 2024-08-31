import React, { useRef, useEffect, useState, useCallback } from 'react';

interface WaveformProps {
  audioUrl: string;
}

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const WaveformZoomPlayTest: React.FC<WaveformProps> = ({ audioUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

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
      const amplitude = audioData[i] * height / 2;
      ctx.moveTo(x, height / 2 - amplitude);
      ctx.lineTo(x, height / 2 + amplitude);
    }

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw playhead
    if (audioRef.current && isPlaying) {
      const playheadPosition = (audioRef.current.currentTime / duration) * width * zoom - scrollPosition;
      ctx.beginPath();
      ctx.moveTo(playheadPosition, 0);
      ctx.lineTo(playheadPosition, height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
     // Отрисовка временных меток (опционально)
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial';
      const timeStep = 5; // шаг в секундах
      for (let i = 0; i < duration; i += timeStep) {
        const x = (i / duration) * width;
        if (x >= 0 && x <= width) {
          ctx.fillText(formatTime(i), x, height - 15);
        }
      }
  }, [audioData, zoom, scrollPosition, isPlaying, duration]);

  useEffect(() => {
    const fetchAudio = async () => {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const samples = 1000 // Увеличили количество сэмплов
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
      setDuration(audioBuffer.duration);
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

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          const canvasWidth = canvasRef.current!.width / window.devicePixelRatio;
          const totalWidth = canvasWidth * zoom;
          const newScrollPosition = (currentTime / duration) * totalWidth - canvasWidth / 2;
          setScrollPosition(Math.max(0, Math.min(newScrollPosition, totalWidth - canvasWidth)));
        }
        drawWaveform();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, zoom, duration, drawWaveform]);

  const handleZoom = (direction: 'in' | 'out') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    let centerPosition: any;

    if (isPlaying && audioRef.current) {
      centerPosition = (audioRef.current.currentTime / duration) * width * zoom;
    } else {
      centerPosition = scrollPosition + width / 2;
    }

    setZoom(prevZoom => {
      const newZoom = direction === 'in' ? Math.min(prevZoom * 2, 64) : Math.max(prevZoom / 2, 1);
      const newScrollPosition = centerPosition * (newZoom / prevZoom) - width / 2;
      setScrollPosition(Math.max(0, newScrollPosition));
      return newZoom;
    });
  };

  const handleScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying) {
      setScrollPosition(Number(e.target.value));
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '2000px', margin: '0 auto' }}>
        <canvas ref={canvasRef} style={{ border: '1px solid black' }} />
      </div>
      <div>
        <button onClick={() => handleZoom('out')} disabled={zoom === 1}>Zoom Out</button>
        <button onClick={() => handleZoom('in')} disabled={zoom === 64}>Zoom In</button>
        <button onClick={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
      </div>
      <input
        type="range"
        min={0}
        max={canvasRef.current ? (canvasRef.current.width / window.devicePixelRatio) * (zoom - 1) : 0}
        value={scrollPosition}
        onChange={handleScroll}
        disabled={isPlaying}
        style={{ width: '2000px', margin: '10px auto', display: 'block' }}
      />
      <audio ref={audioRef} src={audioUrl} />
    </div>
  );
};
    
export default WaveformZoomPlayTest;