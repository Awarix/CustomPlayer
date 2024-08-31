import React, { useEffect, useRef, useState } from 'react';

interface Props {
  audioUrl: string;
}

const AudioPlayerW3: React.FC<Props> = ({ audioUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const fetchAudio = async () => {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      drawWaveform();
    };

    fetchAudio();

    return () => {
      audioContext.close();
    };
  }, [audioUrl]);

  const drawWaveform = () => {
    if (!canvasRef.current || !audioBufferRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const data = audioBufferRef.current.getChannelData(0);
    const step = Math.ceil(data.length / (width * zoomLevel));
    const amp = height / 2;

    ctx.fillStyle = 'black';
    for (let i = 0; i < width; i++) {
      let min = 1;
      let max = -1;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step * zoomLevel) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }

    // Draw current time indicator
    const currentX = (currentTime / audioBufferRef.current.duration) * width;
    ctx.fillStyle = 'red';
    ctx.fillRect(currentX, 0, 2, height);
  };

  const handleZoomIn = () => {
    setZoomLevel(zoomLevel * 2);
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(1, zoomLevel / 2));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioBufferRef.current) return;
    setCurrentTime(parseFloat(e.target.value) * audioBufferRef.current.duration);
  };

  useEffect(() => {
    drawWaveform();
  }, [zoomLevel, currentTime]);

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={100} />
      <button onClick={handleZoomIn}>Zoom In</button>
      <button onClick={handleZoomOut}>Zoom Out</button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={currentTime / (audioBufferRef.current?.duration || 1)}
        onChange={handleTimeChange}
      />
    </div>
  );
};

export default AudioPlayerW3;