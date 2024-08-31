import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
}

const CustomAudioZoomPolzunok: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformData = useRef<number[]>([]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current!.duration);
        generateWaveformData();
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current!.currentTime);
      });
    }
  }, []);

  useEffect(() => {
    drawWaveform();
  }, [isExpanded, currentTime, zoomLevel, scrollPosition]);

  const generateWaveformData = async () => {
    if (!audioRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0);
    const samples = 10000; // Увеличиваем количество сэмплов для большей детализации
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum = sum + Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }

    const multiplier = Math.pow(Math.max(...filteredData), -1);
    waveformData.current = filteredData.map(n => n * multiplier);

    drawWaveform();
  };

  const drawWaveform = () => {
    if (!canvasRef.current || waveformData.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (isExpanded ? 300 : 80) * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const barWidth = (width / waveformData.current.length) * zoomLevel;
    const visibleBars = Math.floor(width / barWidth);
    const startIndex = Math.floor(scrollPosition * (waveformData.current.length - visibleBars));

    ctx.fillStyle = '#1976D2';
    ctx.strokeStyle = '#1976D2';

    for (let i = 0; i < visibleBars; i++) {
      const dataIndex = startIndex + i;
      if (dataIndex >= waveformData.current.length) break;

      const x = i * barWidth;
      const barHeight = waveformData.current[dataIndex] * (height - padding * 2);

      ctx.beginPath();
      ctx.moveTo(x, height / 2 + padding);
      ctx.lineTo(x, height / 2 + padding - barHeight / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, height / 2 + padding);
      ctx.lineTo(x, height / 2 + padding + barHeight / 2);
      ctx.stroke();
    }

    // Draw progress
    const progressWidth = ((currentTime / duration) - scrollPosition) * width * zoomLevel;
    ctx.fillStyle = '#1976D2';
    ctx.strokeStyle = '#1976D2';

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, progressWidth, height);
    ctx.clip();

    for (let i = 0; i < visibleBars; i++) {
      const dataIndex = startIndex + i;
      if (dataIndex >= waveformData.current.length) break;

      const x = i * barWidth;
      const barHeight = waveformData.current[dataIndex] * (height - padding * 2);

      ctx.beginPath();
      ctx.moveTo(x, height / 2 + padding);
      ctx.lineTo(x, height / 2 + padding - barHeight / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, height / 2 + padding);
      ctx.lineTo(x, height / 2 + padding + barHeight / 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = (scrollPosition + (x / rect.width) / zoomLevel) * duration;

    audioRef.current.currentTime = clickProgress;
    setCurrentTime(clickProgress);
  };

  const handleScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrollPosition(parseFloat(e.target.value));
  };

  const zoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom * 1.5, 50));
  };

  const zoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom / 1.5, 1));
  };

  return (
    <div className="audio-player">
      <button onClick={() => {
        if (audioRef.current?.paused) {
          audioRef.current.play();
          setIsPlaying(true);
        } else {
          audioRef.current?.pause();
          setIsPlaying(false);
        }
      }}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      <audio ref={audioRef} src={audioUrl} />
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        style={{ 
          width: '100%', 
          height: isExpanded ? '300px' : '80px',
          cursor: 'pointer'
        }} 
      />
      <div>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
      {isExpanded && (
        <div>
          <button onClick={zoomIn}>Zoom In</button>
          <button onClick={zoomOut}>Zoom Out</button>
          <span>Zoom: {zoomLevel.toFixed(1)}x</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scrollPosition}
            onChange={handleScroll}
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default CustomAudioZoomPolzunok;