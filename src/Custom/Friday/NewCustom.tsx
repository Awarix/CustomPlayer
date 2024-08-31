import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
}

const NewCustom: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const waveformData = useRef<number[]>([]);

  const generateWaveformData = async () => {
    if (!audioRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0);
    const samples = 10000;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }

    const multiplier = Math.pow(Math.max(...filteredData), -1);
    waveformData.current = filteredData.map(n => n * multiplier);

    drawWaveform();
  };

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || waveformData.current.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const padding = 20;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 80 * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / waveformData.current.length) * zoomLevel;
    const visibleBars = Math.floor(canvas.width / barWidth);
    const startIndex = Math.floor(scrollPosition * (waveformData.current.length - visibleBars));

    ctx.fillStyle = '#D1D6DA';

    for (let i = 0; i < visibleBars; i++) {
        const dataIndex = startIndex + i;
        if (dataIndex >= waveformData.current.length) break;

        const x = i * barWidth;
        const barHeight = waveformData.current[dataIndex] * (canvas.height - padding * 2);

        ctx.beginPath();
        ctx.moveTo(x, canvas.height / 2 + padding);
        ctx.lineTo(x, canvas.height / 2 + padding - barHeight / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, canvas.height / 2 + padding);
        ctx.lineTo(x, canvas.height / 2 + padding + barHeight / 2);
        ctx.stroke();
    }

    // Отрисовка прогресса
    const progressWidth = ((currentTime / duration) - scrollPosition) * canvas.width * zoomLevel;
    ctx.fillStyle = '#1976D2';

    ctx.fillRect(0, 0, progressWidth, canvas.height);
  }, [currentTime, duration, zoomLevel, scrollPosition]);

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
    setZoomLevel(prevZoom => Math.min(prevZoom * 2, 64));
  };

  const zoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom / 2, 1));
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current!.duration);
        generateWaveformData();
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current!.currentTime);

        if (isPlaying && containerRef.current) {
          const containerWidth = containerRef.current.offsetWidth;
          const progress = audioRef.current!.currentTime / duration;
          const newScrollPosition = Math.max(
            0,
            Math.min((progress * duration - containerWidth / (2 * zoomLevel)) / duration, 1)
          );
          setScrollPosition(newScrollPosition);
        }
      });
    }
  }, [isPlaying, duration, zoomLevel]);

  const animationFrameRef = useRef<number>();

  const updateProgressBar = useCallback(() => {
    if (progressRef.current && containerRef.current && audioRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const progress = ((audioRef.current.currentTime / duration) - scrollPosition) * zoomLevel;
      const position = Math.max(0, Math.min(progress * containerWidth, containerWidth));
      progressRef.current.style.transform = `translateX(${position}px)`;
    }
    animationFrameRef.current = requestAnimationFrame(updateProgressBar);
  }, [duration, scrollPosition, zoomLevel]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateProgressBar);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateProgressBar]);

  useEffect(() => {
    const handleResize = () => {
      drawWaveform();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateProgressBar);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWaveform, updateProgressBar]);

  useEffect(() => {
    drawWaveform();
    updateProgressBar();
  }, [currentTime, zoomLevel, scrollPosition]);

  return (
    <div className="audio-player">
      <button 
        onClick={() => {
          if (audioRef.current?.paused) {
            audioRef.current.play();
            setIsPlaying(true);
          } else {
            audioRef.current?.pause();
            setIsPlaying(false);
          }
        }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      <audio ref={audioRef} src={audioUrl} />
      <div 
        ref={containerRef}
        className="waveform-container" 
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          style={{ 
            width: '100%', 
            height: isExpanded ? '300px' : '80px',
            cursor: 'pointer'
          }} 
        />
        <div 
          className="progress-bar" 
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <div 
            ref={progressRef}
            className="progress-handle"
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '2px',
              height: '100%',
              backgroundColor: 'red',
              cursor: 'ew-resize',
              pointerEvents: 'auto',
              transform: 'translateX(0)',
              transition: 'transform 0.1s linear'
            }}
            // onMouseDown={handleProgressBarDrag}
          />
        </div>
      </div>
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
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

export default NewCustom;