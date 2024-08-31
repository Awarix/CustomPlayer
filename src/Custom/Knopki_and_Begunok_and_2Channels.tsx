//material
import { IconButton, Paper } from '@material-ui/core';
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import SettingsIcon from "@material-ui/icons/Settings";
import GetAppIcon from "@material-ui/icons/GetApp";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import RotateRightIcon from "@material-ui/icons/RotateRight";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KeywordColor } from '../audio/AudioContext';
import KeywordMarker from './KeywordMarker';

interface AudioPlayerProps {
  audioUrl: string;
  channelNumber: number;
  keywords: KeywordColor[];
}

const Begunok5: React.FC<AudioPlayerProps> = ({ audioUrl, channelNumber, keywords }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isReady, setIsReady] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformData = useRef<any[]>([]);

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
    if (!audioRef.current && !isReady) return;
  
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
    const samples = 1500;
    waveformData.current = [];
  
    for (let channel = 0; channel < channelNumber; channel++) {
      const rawData = audioBuffer.getChannelData(channel);
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
      waveformData.current.push(filteredData.map(n => n * multiplier));
    }
  
    drawWaveform();
  };

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || waveformData.current.length === 0 || !isReady) return;
  
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
    const barWidth = (width / waveformData.current[0].length) * zoomLevel;
    const visibleBars = Math.floor(width / barWidth);
    const startIndex = Math.floor((currentTime / duration) * (waveformData.current[0].length - visibleBars));
  
    if (isExpanded && channelNumber === 2) {
      // Отрисовка двух каналов
      for (let channel = 0; channel < 2; channel++) {
        const channelHeight = height / 2;
        const yOffset = channel * channelHeight;
  
        ctx.fillStyle = channel === 0 ? '#b7e1dd' : '#e1b7dd';
        ctx.strokeStyle = channel === 0 ? '#b7e1dd' : '#e1b7dd';
  
        for (let i = 0; i < visibleBars; i++) {
          const dataIndex = startIndex + i;
          if (dataIndex >= waveformData.current[channel].length) break;
  
          const x = i * barWidth;
          const barHeight = waveformData.current[channel][dataIndex] * (channelHeight - padding * 2);
  
          ctx.beginPath();
          ctx.lineTo(x + barWidth / 2, yOffset + channelHeight / 2 + padding - barHeight / 2);
          ctx.lineTo(x + barWidth / 2, yOffset + channelHeight / 2 + padding + barHeight / 2);
          ctx.stroke();
        }
  
        // Draw progress for each channel
        const progressWidth = (currentTime / duration) * width;
        ctx.fillStyle = channel === 0 ? '#357F78' : '#7F3578';
        ctx.strokeStyle = channel === 0 ? '#357F78' : '#7F3578';
  
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, yOffset, progressWidth, channelHeight);
        ctx.clip();
  
        for (let i = 0; i < visibleBars; i++) {
          const dataIndex = startIndex + i;
          if (dataIndex >= waveformData.current[channel].length) break;
  
          const x = i * barWidth;
          const barHeight = waveformData.current[channel][dataIndex] * (channelHeight - padding * 2);
  
          ctx.beginPath();
          ctx.lineTo(x + barWidth / 2, yOffset + channelHeight / 2 + padding - barHeight / 2);
          ctx.lineTo(x + barWidth / 2, yOffset + channelHeight / 2 + padding + barHeight / 2);
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
      }
    } else {
      // Отрисовка общей дорожки (как было раньше)
      ctx.fillStyle = '#b7e1dd';
      ctx.strokeStyle = '#b7e1dd';
  
      for (let i = 0; i < visibleBars; i++) {
        const dataIndex = startIndex + i;
        if (dataIndex >= waveformData.current[0].length) break;
  
        const x = i * barWidth;
        const barHeight = waveformData.current[0][dataIndex] * (height - padding * 2);
  
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
        if (dataIndex >= waveformData.current[0].length) break;
  
        const x = i * barWidth;
        const barHeight = waveformData.current[0][dataIndex] * (height - padding * 2);
  
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
    }
  
    
  }, [isExpanded, currentTime, zoomLevel, duration, channelNumber, keywords]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current || zoomLevel > 1) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Учитываем текущий уровень зума
    const scaledX = x / zoomLevel;

    const clickProgress = scaledX / rect.width;

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

  const togglePlay = () => {
    if (audioRef.current?.paused && isReady) {
      audioRef.current.play();
    } else {
      audioRef.current?.pause();
    }
    setIsPlaying(!isPlaying);
  };

  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel * 2, 64);
    smoothZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel / 2, 1);
    smoothZoom(newZoom);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setIsReady(true);
        setDuration(audioRef.current!.duration);
        generateWaveformData();
      });
  
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current!.currentTime);
      });
  
      return () => {
        audioRef.current?.removeEventListener('loadedmetadata', () => {});
        audioRef.current?.removeEventListener('timeupdate', () => {});
      };
    }
  }, []);

  useEffect(() => {
    drawWaveform();
  }, [isExpanded, currentTime, zoomLevel, keywords]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = isExpanded ? 300 : 80;
        drawWaveform();
      }
    };
  
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawWaveform, isExpanded]);

  const handleMarkerClick = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <Paper
      elevation={3}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        padding: "10px",
        boxSizing: "border-box",
        transition: "height 0.3s ease",
        // height: isExpanded ? "400px" : "80px",
        overflow: isExpanded ? "auto" : "hidden",
      }}
    >

    <div style={{display: 'flex', alignItems: 'center'}}>
        <div id='первая часть кнопок' style={{display: 'flex', }}>
            {/* Настройки */}
           <IconButton
             title="Настройки"
             disableRipple
             color="primary"
             size="medium"
            >
             <SettingsIcon fontSize="large"/>
           </IconButton>
           {/* Наушники по условию */}
           {isExpanded && (
           <div style={{display: "flex", gap: 1, marginLeft: 5, alignItems: 'center'}}>
                <div title="Левый канал">
                    <img src="/img/left-headset.png" alt="left headset" 
                    style={{
                    marginLeft: 2,
                        width: 16,
                        height: 27,
                        cursor: "pointer",
                        // borderRadius: "0px 100% 100% 0px / 0px 50% 50% 0px",
                        backgroundColor: 'blue',
                    }}
                    />
                </div>
                <div title="Правый канал">
                    <img src="/img/right-headset.png" alt="right headset" 
                    style={{
                        width: 16,
                        height: 27,
                        backgroundColor: 'blue',
                        // borderRadius: "100% 0px 0px 100% / 50% 0px 0px 50%",
                        cursor: "pointer",
                    }}
                    />
                </div>
            </div>
            )}
            {/* -3секунды, плей, +3 секунды или просто плей */}
            {isExpanded ? (
                <>
                <IconButton
                    disableRipple
                    color="primary"
                    title="Текущая позиция - 3 сек."
                    >
                    <RotateLeftIcon />
                </IconButton>
                <IconButton
                color="primary"
                size="medium"
                onClick={togglePlay}
                >
                {isPlaying ? <PauseCircleFilledIcon fontSize="large" /> : <PlayCircleFilledIcon fontSize="large" />}
                </IconButton>
                <IconButton
                    disableRipple
                    color="primary"
                    title="Текущая позиция + 3 сек."
                    >
                    <RotateRightIcon />
                </IconButton>
                </>
            ):(
                <IconButton
                color="primary"
                size="medium"
                onClick={togglePlay}
                >
                {isPlaying ? <PauseCircleFilledIcon fontSize="large" /> : <PlayCircleFilledIcon fontSize="large" />}
                </IconButton>
            )}
            {/* Зум по условию */}
            {isExpanded && (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <IconButton
                    color="primary"
                    size="medium"
                    title="Увеличить масштаб"
                    onClick={zoomIn}
                    >
                    <ZoomInIcon fontSize="large" />
                    </IconButton>
                    <span>{zoomLevel.toFixed(2)}x</span>
                    <IconButton
                    color="primary"
                    size="medium"
                    title="Уменьшить масштаб"
                    onClick={zoomOut}
                    >
                    <ZoomOutIcon fontSize="large" />
                    </IconButton>
                </div>
            )}
            {/* зациклено по условию */}
            {isExpanded && (
            <IconButton
                title="Воспроизведение зациклено"
                disableRipple
                color="primary"
                >
                <AllInclusiveIcon />
            </IconButton>
            )}
            {/* Скачать декодированный файл */}
            <IconButton
                disableRipple
                color="primary"
                title="Скачать декодированный файл"
            >
            <GetAppIcon />
            </IconButton>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', width: isExpanded ? '85%' : '90%', position: 'relative'}}>
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
            {keywords.map((kw, index) => (
              <KeywordMarker
                key={index}
                keyword={kw.keyword}
                color={kw.color}
                duration={duration}
                currentTime={currentTime}
                zoomLevel={zoomLevel}
                canvasWidth={canvasRef.current?.width || 0}
                canvasHeight={canvasRef.current?.height || 0}
                isExpanded={isExpanded}
                channelNumber={channelNumber}
                onMarkerClick={handleMarkerClick}
              />
            ))}
        </div>
        <div id='время и коллапс' style={{display: 'flex', }}>
        {/* Время */}
            <div style={{display: 'flex', alignItems: 'center', width: '100px', justifyContent: 'center'}}>
            {formatTime(currentTime)} / {formatTime(duration)}
            </div>
        {/* Свернуть/Развернуть */}
            <IconButton
                color="primary"
                size="medium"
                onClick={toggleExpand}
                >
            {isExpanded ? <ExpandMoreIcon fontSize="large" /> : <ExpandLessIcon fontSize="large" />}
            </IconButton>
        </div>
    </div>
    </Paper>
  );
};



export default Begunok5;