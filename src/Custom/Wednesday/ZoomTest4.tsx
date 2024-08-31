import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

//material
import { IconButton } from '@material-ui/core';
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";



interface Word {
  word: string;
  color: string;
  start: number;
}

interface WaveformProps {
  audioUrl: string;
  words: Word[];
}

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

const ZoomTest3: React.FC<WaveformProps> = ({ audioUrl, words }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [audioData, setAudioData] = useState<any[]>([]);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const scaledWords = useMemo(() => {
    return words.map(word => ({
      ...word,
      //тут можно попробовать добавить зависимость от каналов
      scaledStart: (word.start / audioDuration) * (audioData[0]?.length || 0),
    }));
  }, [words, audioData, audioDuration]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr / 2;  // Разделение высоты на два канала
  
    ctx.clearRect(0, 0, width, height * 2);
    ctx.beginPath();

    console.log(audioData.length )

    audioData.forEach((channel, index) => {
      const y_offset = index * height;
      const samplesPerPixel = (channel.length / zoom) / width;
      const startSample = Math.floor(scrollPosition * samplesPerPixel);
      const endSample = Math.min(startSample + Math.ceil(width * samplesPerPixel), channel.length);
  
      for (let i = startSample; i < endSample; i++) {
        const x = (i - startSample) / samplesPerPixel;
        const y = y_offset + (1 - channel[i]) * height / 2;
        if (i === startSample) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
  
      ctx.strokeStyle = index === 1 ?  '#e1b7dd': '#b7e1dd';  // Цвета для разных каналов
      ctx.fillStyle = index === 1 ?   '#e1b7dd' : '#b7e1dd';
      ctx.stroke();
      
        // Draw words
      scaledWords.forEach(word => {
        const x = (word.scaledStart - startSample) / samplesPerPixel;
        if (x >= 0 && x <= width) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.strokeStyle = word.color;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = word.color;
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(word.word, x, 15);
        }
      });
    });
  }, [audioData, zoom, scrollPosition, scaledWords]);

  const togglePlay = () => {
    if (audioRef.current?.paused && isReady) {
      audioRef.current.play();
    } else {
      audioRef.current?.pause();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const fetchAudio = async () => {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log(audioBuffer)
      // Получение данных для каждого канала
      if (audioBuffer.numberOfChannels > 1) {
         const channelDataLeft = audioBuffer.getChannelData(0);
         const channelDataRight = audioBuffer.getChannelData(1);
      
         setAudioData([Array.from(channelDataLeft), Array.from(channelDataRight)]);
         setAudioDuration(audioBuffer.duration);
      } else {
        const channelDataLeft = audioBuffer.getChannelData(0);
     
        setAudioData([Array.from(channelDataLeft)]);
        setAudioDuration(audioBuffer.duration);
      }
     
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

  const handleZoom = (direction: 'in' | 'out') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const centerSample = scrollPosition + (width * (audioData.length / zoom) / width) / 2;

    setZoom(prevZoom => {
      const newZoom = direction === 'in' ? Math.min(prevZoom * 2, 64) : Math.max(prevZoom / 2, 1);
      const newScrollPosition = centerSample - (width * (audioData.length / newZoom) / width) / 2;
      setScrollPosition(Math.max(0, newScrollPosition));
      return newZoom;
    });
  };

  const handleScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrollPosition(parseFloat(e.target.value));
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setIsReady(true);
        setAudioDuration(audioRef.current!.duration);
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

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '2000px', margin: '0 auto' }}>
        <canvas ref={canvasRef} style={{ border: '1px solid black' }} />
        <audio ref={audioRef} src={audioUrl} />
      </div>
      <div>
      <IconButton
                color="primary"
                size="medium"
                onClick={togglePlay}
                >
                {isPlaying ? <PauseCircleFilledIcon fontSize="large" /> : <PlayCircleFilledIcon fontSize="large" />}
      </IconButton>
        <button onClick={() => handleZoom('out')} disabled={zoom === 1}>Zoom Out</button>
        <button onClick={() => handleZoom('in')} disabled={zoom === 64}>Zoom In</button>
        <div style={{display: 'flex', alignItems: 'center', width: '100px', justifyContent: 'center'}}>
            {formatTime(currentTime)} / {formatTime(audioDuration)}
        </div>
      </div>
      {zoom > 1 && (
        <input
          type="range"
          min={0}
          max={canvasRef.current ? (canvasRef.current.width / window.devicePixelRatio) * (zoom - 1) : 0}
          value={scrollPosition}
          onChange={handleScroll}
          style={{ width: '2000px', margin: '10px auto', display: 'block' }}
        />
      )}
    </div>
  );
};

export default ZoomTest3;