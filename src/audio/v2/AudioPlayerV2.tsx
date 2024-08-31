import React, { useState, useRef, useEffect } from 'react';
// import { WaveSurfer, Regions } from 'wavesurfer.js';
import WaveSurfer from 'wavesurfer.js';
import { useAudio } from '../AudioContext';

interface AudioPlayerProps {
  audioUrl?: string;
}

const AudioPlayerV2: React.FC<AudioPlayerProps> = () => {
  const { audioUrl } = useAudio()
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#D0D0D0',
      progressColor: '#3073EF',
      height: 100, // Высота трека
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    // Загрузка аудио
    if (audioUrl) {
      wavesurfer.load(audioUrl);
    }

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    wavesurferRef.current?.playPause();
    setIsPlaying(!isPlaying);
  };

  const handleZoomIn = () => {
    setZoomLevel(zoomLevel + 0.1);
    wavesurferRef.current?.zoom(zoomLevel);
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.1, 1));
    wavesurferRef.current?.zoom(zoomLevel);
  };

  return (
    <div>
      <div ref={waveformRef} />
      <div >
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
        <span>{currentTime.toFixed(2)} / {duration.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default AudioPlayerV2;