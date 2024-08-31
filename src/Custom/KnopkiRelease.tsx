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

import React, { useState, useRef, useEffect, useCallback, FC, MouseEvent } from 'react';

interface Marker {
  word: string;
  start: number;
  color: string;
}

interface AudioPlayerProps {
  audioUrl: string;
  channelNumber: number;
  markers: Marker[];
  fileName: string;
}

const KnopkiRelease: FC<AudioPlayerProps> = ({ audioUrl, channelNumber, markers, fileName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformData = useRef<any[]>([]);

  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const [activeChannels, setActiveChannels] = useState({ left: true, right: true });
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isLooping, setIsLooping] = useState(false);

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
    if (!audioRef.current ) return;
  
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
    const samples = 10000;
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
    if (!canvasRef.current || waveformData.current.length === 0 ) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const padding = 5;
  
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (isExpanded ? 300 : 80) * dpr;
  
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const timelineHeight = 20;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const barWidth = (width / waveformData.current[0].length) * zoomLevel;
    const visibleBars = Math.floor(width / barWidth);
    const startIndex = Math.floor((currentTime / duration) * (waveformData.current[0].length - visibleBars));

     // Функция для отрисовки timeline
    const drawTimeline = (yPosition: number) => {
      const visibleDuration = (visibleBars / waveformData.current[0].length) * duration;
      const startTime = (startIndex / waveformData.current[0].length) * duration;
      const endTime = startTime + visibleDuration;
      const timeStep = Math.pow(10, Math.floor(Math.log10(visibleDuration / 10)));

      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';

      for (let time = Math.ceil(startTime / timeStep) * timeStep; time <= endTime; time += timeStep) {
        const x = ((time - startTime) / visibleDuration) * width;
        ctx.beginPath();
        ctx.moveTo(x, yPosition);
        ctx.lineTo(x, yPosition + 5);
        ctx.stroke();
        ctx.fillText(time.toFixed(1), x, yPosition + 15);
      }
    };

      // Функция для отрисовки маркеров ключевых слов
        //Нужно добавить будет логику, когда ключевые слова находятся рядом, чтобы они нормально отображались.
    const drawMarkers = () => {
      markers.forEach(marker => {
        if (marker.start < 0 || marker.start > duration) return;

        const markerPosition = ((marker.start - (startIndex / waveformData.current[0].length) * duration) / ((visibleBars / waveformData.current[0].length) * duration)) * width;

        if (markerPosition >= 0 && markerPosition <= width) {
          // Отрисовка линии маркера
          ctx.beginPath();
          ctx.strokeStyle = marker.color;
          ctx.lineWidth = 2;
          ctx.moveTo(markerPosition, 0);
          ctx.lineTo(markerPosition, height);
          ctx.stroke();

          // Отрисовка слова-лейбла
          ctx.fillStyle = marker.color;
          ctx.font = '12px Arial';
          ctx.textAlign = 'start';
          ctx.fillText(marker.word, markerPosition + 5, 15);
        }
      });
    };
  
    if (isExpanded && channelNumber === 2) {
      // Отрисовка двух каналов
      for (let channel = 0; channel < 2; channel++) {
        const channelHeight = (height - timelineHeight) / 2;
        const yOffset = channel * channelHeight + timelineHeight;
  
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
  
        // Прогресс для каждого канала
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

        // Вертикальный бегунок
        ctx.beginPath();
        ctx.strokeStyle = '#357F78';
        ctx.lineWidth = 1;
        ctx.moveTo(progressWidth, 0);
        ctx.lineTo(progressWidth, height);
        ctx.stroke();
        
        // Отрисовка timeline для каждого канала
        drawTimeline(channelHeight * 2 + 5);
      }
    } else {
      // Отрисовка общей дорожки (для компактного вида)
      ctx.fillStyle = '#b7e1dd';
      ctx.strokeStyle = '#b7e1dd';
      const waveformHeight = height - timelineHeight;
  
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
  
      // Прогресс
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
      
    // Вертикальный бегунок
    ctx.beginPath();
    ctx.strokeStyle = '#357F78';
    ctx.lineWidth = 1;
    ctx.moveTo(progressWidth, 0);
    ctx.lineTo(progressWidth, height);
    ctx.stroke();

    // Отрисовка timeline
    drawTimeline(waveformHeight);
    }

    // Отрисовка маркера
    drawMarkers();
  
    
  }, [isExpanded, currentTime, zoomLevel, duration, channelNumber]);

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    //Надо оптимизировать для зума. При приближении неправильно перескакивает, так что пока лочу если зум >1.
    if (!canvas || !audioRef.current || zoomLevel > 1) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = x / rect.width;

    audioRef.current.currentTime = clickProgress * duration;
    setCurrentTime(clickProgress * duration);
  };


  //анимация для зума
  const smoothZoom = (targetZoom: number, duration: number = 300) => {
    const startZoom = zoomLevel;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); 

      const newZoom = startZoom + (targetZoom - startZoom) * easeProgress;
      setZoomLevel(newZoom);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  //плей, пауза
  const togglePlay = () => {
    if (audioRef.current?.paused) {
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

  //+3 сек, -3 сек
  const seekBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 3, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      drawWaveform();
    }
  };

  const seekForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.currentTime + 3, duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      drawWaveform();
    }
  };

  //левый и правый каналы

  const initializeAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      const context = new AudioContext();
      audioContextRef.current = context;
      sourceRef.current = context.createMediaElementSource(audioRef.current);
    }
  };

  const updateChannels = () => {
    initializeAudioContext();

    const audio = audioRef.current;
    const context = audioContextRef.current;
    if (audio && context && sourceRef.current) {
      const splitter = context.createChannelSplitter(2);
      const merger = context.createChannelMerger(2);

      const leftGain = context.createGain();
      const rightGain = context.createGain();

      leftGain.gain.value = activeChannels.left ? 1 : 0;
      rightGain.gain.value = activeChannels.right ? 1 : 0;

      sourceRef.current.disconnect();
      sourceRef.current.connect(splitter);
      splitter.connect(leftGain, 0);
      splitter.connect(rightGain, 1);

      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);

      merger.connect(context.destination);
    }
  };

  const toggleChannel = (channel: 'left' | 'right') => {
    setActiveChannels(prev => {
      const newState = { ...prev, [channel]: !prev[channel] };
      
      // Если оба канала неактивны, активируем оба
      if (!newState.left && !newState.right) {
        return { left: true, right: true };
      }
      
      return newState;
    });
  };

  //зацикленное воспроизведение
  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  //Скачать файл
    const download = useCallback(() => {
      fetch(audioUrl).then((res) => {
        res.blob().then((blob) => {
          //TODO: FileName переменная из пропса
          let name = fileName;
          if (!name.endsWith(".wav")) {
            name += ".wav";
          }
  
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = name;
          a.click();
          a.remove();
        });
      });
    }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  useEffect(() => {
    updateChannels();
  }, [activeChannels]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current!.duration);
        setIsAudioLoaded(true);
      });
  
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current!.currentTime);
      });
    }
  }, []);

  useEffect(() => {
    if (isAudioLoaded) {
      generateWaveformData();
    }
  }, [isAudioLoaded]);

  useEffect(() => {
    if (isAudioLoaded && waveformData.current.length > 0) {
      drawWaveform();
    }
  }, [isAudioLoaded, isExpanded, currentTime, zoomLevel, channelNumber, drawWaveform]);

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
              <div style={{display: "flex", gap: 3, marginLeft: 5, alignItems: 'center', marginTop: 5}}>
              <div title="Левый канал" onClick={() => toggleChannel('left')}>
                <img 
                  src="/img/left-headset.png" 
                  alt="left headset" 
                  style={{
                    marginLeft: 2,
                    width: 16,
                    height: 30,
                    cursor: "pointer",
                    borderRadius: "100% 0px 0px 100% / 50% 0px 0px 50%",
                    backgroundColor: activeChannels.left ? '#4db6ac' : '#ccc',
                  }}
                />
              </div>
              <div title="Правый канал" onClick={() => toggleChannel('right')}>
                <img 
                  src="/img/right-headset.png" 
                  alt="right headset" 
                  style={{
                    width: 16,
                    height: 30,
                    backgroundColor: activeChannels.right ? '#4db6ac' : '#ccc',
                    borderRadius: "0px 100% 100% 0px / 0px 50% 50% 0px",
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
                    onClick={seekBackward}
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
                    onClick={seekForward}
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
                title='Зацикленное воспроизведение'
                disableRipple
                color={isLooping ? "primary" : "default"}
                onClick={toggleLoop}
              >
                <AllInclusiveIcon />
              </IconButton>
            )}
            {/* Скачать декодированный файл */}
            <IconButton
                disableRipple
                color="primary"
                title="Скачать декодированный файл"
                onClick={download}
            >
            <GetAppIcon />
            </IconButton>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', width: '90%'}}>
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

export default KnopkiRelease;