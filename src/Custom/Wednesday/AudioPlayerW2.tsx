import React, { useRef, useEffect, useState } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayerW2: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const loadAudio = async () => {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(decodedBuffer);
    };

    loadAudio();
  }, [audioUrl]);

  useEffect(() => {
    if (audioBuffer && canvasRef.current) {
      drawWaveform();
    }
  }, [audioBuffer, zoom, offset]);

  const drawWaveform = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    const data = audioBuffer!.getChannelData(0);
    const step = Math.ceil(data.length / (width * zoom));
    const amp = height / 2;

    for (let i = 0; i < width; i++) {
      const index = Math.floor(offset * step + i * step);
      if (index >= data.length) break;
      const x = i;
      const y = (1 + data[index]) * amp;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = 'blue';
    ctx.stroke();
  };

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(50, prevZoom * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(1, prevZoom / 1.2));
  };

  const handleScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOffset(Number(e.target.value));
  };

  const maxOffset = audioBuffer ? Math.max(0, audioBuffer.length - (audioBuffer.length / zoom)) : 0;

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={200} />
      <audio ref={audioRef} src={audioUrl} controls />
      <div>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
      </div>
      <input
        type="range"
        min={0}
        max={maxOffset}
        step={1}
        value={offset}
        onChange={handleScroll}
      />
    </div>
  );
};

export default AudioPlayerW2;