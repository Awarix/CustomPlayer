import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
}

const Begunok2: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
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
    setZoomLevel(1); // Сбросить зум, когда сворачиваем
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
    const padding = 5;
  
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (isExpanded ? 300 : 80) * dpr;
  
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const barWidth = (width / waveformData.current.length) * zoomLevel;
    const visibleBars = Math.floor(width / barWidth);
    const startIndex = Math.floor((currentTime / duration) * (waveformData.current.length - visibleBars));
    
    ctx.fillStyle = '#b7e1dd';
    ctx.strokeStyle = '#b7e1dd';
  
    for (let i = 0; i < visibleBars; i++) {
      const dataIndex = startIndex + i;
      if (dataIndex >= waveformData.current.length) break;
  
      const x = i * barWidth;
      const barHeight = waveformData.current[dataIndex] * (height - padding * 2);
  
      ctx.beginPath();
      ctx.lineTo(x + barWidth / 2, height / 2 + padding - barHeight / 2);
      ctx.lineTo(x + barWidth / 2, height / 2 + padding + barHeight / 2);
      ctx.stroke();
    }
  
    // Draw progress
    const progressWidth = (currentTime / duration) * width;
    ctx.fillStyle = '#357F78';
    ctx.strokeStyle = '#357F78';
  
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
      ctx.lineTo(x + barWidth / 2, height / 2 + padding - barHeight / 2);
      ctx.lineTo(x + barWidth / 2, height / 2 + padding + barHeight / 2);
      ctx.stroke();
    }
  
    ctx.restore();
  
    // Draw playhead (vertical line)
    ctx.beginPath();
    ctx.strokeStyle = '#357F78';
    ctx.lineWidth = 1;
    ctx.moveTo(progressWidth, 0);
    ctx.lineTo(progressWidth, height);
    ctx.stroke();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = x / rect.width;

    audioRef.current.currentTime = clickProgress * duration;
    setCurrentTime(clickProgress * duration);
  };

  const smoothZoom = (targetZoom: number, duration: number = 300) => {
    const startZoom = zoomLevel;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad

      const newZoom = startZoom + (targetZoom - startZoom) * easeProgress;
      setZoomLevel(newZoom);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel * 2, 64);
    smoothZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel / 2, 1);
    smoothZoom(newZoom);
  };

  return (
    <div className="audio-player">
      <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button onClick={toggleExpand}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      <div style={{display: 'flex', justifyContent: 'center', width: '98%'}}>
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
      </div>
      
      <div>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
      {isExpanded && (
        <div>
          <button onClick={zoomIn}>Zoom In</button>
          <button onClick={zoomOut}>Zoom Out</button>
          <span>Zoom: {zoomLevel.toFixed(2)}x</span>
        </div>
      )}
    </div>
  );
};

export default Begunok2;