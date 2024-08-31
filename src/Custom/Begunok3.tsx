import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface Word {
  word: string;
  color: string;
  start: number;
}

interface AudioPlayerProps {
  audioUrl: string;
  words: Word[];
}



const Begunok3: React.FC<AudioPlayerProps> = ({ audioUrl, words }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // const [zoom, setZoom] = useState(1);
  // const [scrollPosition, setScrollPosition] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformData = useRef<number[]>([]);
  const animationRef = useRef<number>();

  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [audioDuration, setAudioDuration] = useState(0);

  const scaledWords = useMemo(() => {
    return words.map(word => ({
      ...word,
      scaledStart: (word.start / audioDuration) * audioData.length,
    }));
  }, [words, audioData, audioDuration]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    const samplesPerPixel = (audioData.length / zoom) / width;
    const startSample = Math.floor(scrollPosition * samplesPerPixel);
    const endSample = Math.min(startSample + Math.ceil(width * samplesPerPixel), audioData.length);

    for (let i = startSample; i < endSample; i++) {
      const x = (i - startSample) / samplesPerPixel;
      const y = (1 - audioData[i]) * height / 2;
      if (i === startSample) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // Draw words
    scaledWords.forEach(word => {
      const x = (word.scaledStart - startSample) / samplesPerPixel;
      if (x >= 0 && x <= width) {
        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = word.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw word label
        ctx.fillStyle = word.color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(word.word, x, 15);
      }
    });

  }, [audioData, zoom, scrollPosition, scaledWords, ]);

  useEffect(() => {
    const fetchAudio = async () => {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      
      // Use the full audio data instead of downsampling
      const filteredData = Array.from(channelData);
      
      setAudioData(filteredData);
      setAudioDuration(audioBuffer.duration);
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


  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollPosition;
    const clickProgress = x / (rect.width * zoom);

    audioRef.current.currentTime = clickProgress * duration;
    setCurrentTime(clickProgress * duration);
  };

  const smoothZoom = (targetZoom: number, duration: number = 300) => {
    const startZoom = zoom;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad

      const newZoom = startZoom + (targetZoom - startZoom) * easeProgress;
      setZoom(newZoom);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

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
    setZoom(1);
    setScrollPosition(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button onClick={toggleExpand}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      <div style={{ display: 'flex', justifyContent: 'center', width: '98%' }}>
        <audio ref={audioRef} src={audioUrl} />
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          // onWheel={handleScroll}
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
          <button onClick={() => handleZoom('in')}>Zoom In</button>
          <button onClick={() => handleZoom('out')}>Zoom Out</button>
          <span>Zoom: {zoom.toFixed(2)}x</span>
        </div>
      )}
    </div>
  );
};

export default Begunok3;