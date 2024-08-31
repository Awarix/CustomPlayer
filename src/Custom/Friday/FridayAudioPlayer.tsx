import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  audioUrl: string;
}

const FridayAudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWaveform, setShowWaveform] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (showWaveform && waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        cursorColor: 'navy',
        barWidth: 3,
        barRadius: 3,
        responsive: true,
        height: 150,
      });

      wavesurfer.current.on('ready', () => {
        setDuration(wavesurfer.current!.getDuration());
      });

      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current!.getCurrentTime());
      });

      wavesurfer.current.load(audioUrl);

      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, [showWaveform, audioUrl]);

  const togglePlay = () => {
    if (showWaveform) {
      wavesurfer.current?.playPause();
    } else {
      if (audioRef.current?.paused) {
        audioRef.current.play();
      } else {
        audioRef.current?.pause();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleWaveform = () => {
    const currentTime = showWaveform
      ? wavesurfer.current?.getCurrentTime() || 0
      : audioRef.current?.currentTime || 0;

    setShowWaveform(!showWaveform);

    setTimeout(() => {
      if (!showWaveform) {
        wavesurfer.current?.seekTo(currentTime / duration);
        if (isPlaying) wavesurfer.current?.play();
      } else {
        if (audioRef.current) {
          audioRef.current.currentTime = currentTime;
          if (isPlaying) audioRef.current.play();
        }
      }
    }, 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button onClick={toggleWaveform}>
        {showWaveform ? 'Hide Waveform' : 'Show Waveform'}
      </button>
      {showWaveform ? (
        <div ref={waveformRef} style={{ width: '100%' }} />
      ) : (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        />
      )}
      <div>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
      {!showWaveform && (
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => {
            const time = parseFloat(e.target.value);
            setCurrentTime(time);
            if (audioRef.current) {
              audioRef.current.currentTime = time;
            }
          }}
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
};

export default FridayAudioPlayer;