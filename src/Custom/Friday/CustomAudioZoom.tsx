import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
}

const CustomAudioZoom: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

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
  }, [isExpanded, currentTime, zoomLevel]);

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
    } else {
      audioRef.current?.pause();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setZoomLevel(1); // Reset zoom level when collapsing
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const generateWaveformData = async () => {
    if (!audioRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0);
    const samples = 1500;
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
    const startIndex = Math.floor((currentTime / duration) * (waveformData.current.length - visibleBars));
    // cursorColor="#357F78"
    ctx.fillStyle = '#b7e1dd';
    ctx.strokeStyle = '#b7e1dd';

    for (let i = 0; i < visibleBars; i++) {
      const dataIndex = startIndex + i;
      if (dataIndex >= waveformData.current.length) break;

      const x = i * barWidth;
      const barHeight = waveformData.current[dataIndex] * (height - padding * 2);

      ctx.beginPath();
      // ctx.moveTo(x + barWidth / 2, height / 2 + padding);
      ctx.lineTo(x + barWidth / 2, height / 2 + padding - barHeight / 2);
      ctx.lineTo(x + barWidth / 2, height / 2 + padding + barHeight / 2);
      ctx.stroke();
    }

    // Draw progress
    const progressWidth = (currentTime / duration) * width;
    ctx.fillStyle = '#4Db6AC';
    ctx.strokeStyle = '#4Db6AC';

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
    //   ctx.moveTo(x + barWidth / 2, height / 2 + padding);
      ctx.lineTo(x + barWidth / 2, height / 2 + padding - barHeight / 2);
      ctx.lineTo(x + barWidth / 2, height / 2 + padding + barHeight / 2);
      ctx.stroke();
      
    }

    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Учитываем текущий уровень зума
    const scaledX = x / zoomLevel;

    const clickProgress = scaledX / rect.width;

    audioRef.current.currentTime = clickProgress * duration;
    setCurrentTime(clickProgress * duration);
};

  const zoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom * 2, 64));
  };

  const zoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom / 2, 1));
  };

  return (
    <div className="audio-player">
      <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button onClick={toggleExpand}>
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
          <span>Zoom: {zoomLevel}x</span>
        </div>
      )}
    </div>
  );
};

export default CustomAudioZoom;