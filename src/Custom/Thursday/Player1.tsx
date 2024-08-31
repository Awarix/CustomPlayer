import React, { useState, useRef, useEffect } from 'react';

interface Word {
  id: number;
  recordId: number;
  channelNumber: number;
  lang: string;
  word: string;
  confidence: number;
  start: number;
  end: number;
  color: string;
  bgColor: string;
  type: string;
}

interface AudioPlayerProps {
  audioUrl: string;
  words: Word[];
}

const Player1: React.FC<AudioPlayerProps> = ({ audioUrl, words }) => {
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
  }, [isExpanded, currentTime, zoomLevel, words]);

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
  
    // Отрисовка волны
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
  
    // Отрисовка прогресса
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
  
    // Отрисовка указателя воспроизведения (вертикальная линия)
    ctx.beginPath();
    ctx.strokeStyle = '#357F78';
    ctx.lineWidth = 1;
    ctx.moveTo(progressWidth, 0);
    ctx.lineTo(progressWidth, height);
    ctx.stroke();
  
    // Отрисовка слов
    ctx.textBaseline = 'top';
    words.forEach(word => {
      const wordStartX = ((word.start / duration) * width - startIndex * barWidth) / zoomLevel;
      const wordEndX = ((word.end / duration) * width - startIndex * barWidth) / zoomLevel;
      const wordWidth = wordEndX - wordStartX;
  
      if (wordStartX < width && wordEndX > 0) {
        // Отрисовка фона слова
        ctx.fillStyle = word.bgColor;
        ctx.fillRect(wordStartX, 0, wordWidth, height);
  
        // Отрисовка текста слова
      ctx.fillStyle = word.color;
      ctx.font = '12px Arial';
      
      // Проверяем, достаточно ли места для отображения текста
      if (wordWidth > 20) {  // Минимальная ширина для отображения текста
        // Обрезаем текст, если он не помещается
        let displayText = word.word;
        while (ctx.measureText(displayText).width > wordWidth - 4 && displayText.length > 0) {
          displayText = displayText.slice(0, -1);
        }
        if (displayText.length < word.word.length) {
          displayText += '...';
        }
        
        // Центрируем текст в пределах слова
        const textWidth = ctx.measureText(displayText).width;
        const textX = wordStartX + (wordWidth - textWidth) / 2;
        
        ctx.fillText(displayText, textX, 5);
      } else {
        // Если места недостаточно, рисуем только маркер
        ctx.fillRect(wordStartX, 0, 2, height);
      }
    }
  });

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
};

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;
  
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = x / rect.width;
  
    const newTime = clickProgress * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  
    // Проверяем, было ли нажатие на слово
    const clickedWord = words.find(word => {
      const wordStartX = (word.start / duration) * rect.width;
      const wordEndX = (word.end / duration) * rect.width;
      return x >= wordStartX && x <= wordEndX;
    });
  
    if (clickedWord) {
      console.log('Clicked word:', clickedWord.word);
      // Здесь вы можете добавить дополнительную логику для обработки клика по слову
      // Например, выделение слова или отображение дополнительной информации
    }
  };

  const [zoomCenter, setZoomCenter] = useState(0);
  
  const smoothZoom = (targetZoom: number, duration: number = 300) => {
  const startZoom = zoomLevel;
  const startTime = performance.now();
  const centerTime = currentTime;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = progress * (2 - progress); // easeOutQuad

    const newZoom = startZoom + (targetZoom - startZoom) * easeProgress;
    setZoomLevel(newZoom);
    setZoomCenter(centerTime);

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
      <button onClick={toggleExpand}>{isExpanded ? 'Collapse' : 'Expand'}</button>
      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
      <div style={{position: 'relative', width: '100%', height: isExpanded ? '300px' : '80px'}}>
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          style={{ 
            width: '100%', 
            height: '100%',
            cursor: 'pointer'
          }} 
        />
      </div>
      <audio ref={audioRef} src={audioUrl} />
      <div>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};

export default Player1;