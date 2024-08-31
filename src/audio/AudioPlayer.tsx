import React, { useRef, useEffect, useState } from 'react';
import { useAudio } from './AudioContext';
import styled from 'styled-components';
import AudioWaveform from './AudioWaveform';

const PlayerContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const PlayButton = styled.button<{ disabled?: boolean }>`
  background-color: #ff5500;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff7700;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 85, 0, 0.5);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ZoomControlsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
`;

const ZoomButton = styled.button`
  background-color: #ff5500;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff7700;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 85, 0, 0.5);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ZoomDisplay = styled.div`
  font-size: 16px;
  color: #333;
`;

const TimeDisplay = styled.div`
  font-size: 14px;
  color: #333;
`;

const AudioInfo = styled.div`
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const AudioPlayer: React.FC = () => {
  const { currentAudioUrl, segments, keywords } = useAudio();
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [numChannels, setNumChannels] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (currentAudioUrl && audioRef.current) {
      audioRef.current.src = currentAudioUrl;
      audioRef.current.load();
    }
  }, [currentAudioUrl]);

  useEffect(() => {
    if (!audioContextRef.current && audioRef.current) {
      const context = new AudioContext();
      audioContextRef.current = context;
      sourceRef.current = context.createMediaElementSource(audioRef.current);

      // Определяем количество каналов после загрузки метаданных
      audioRef.current.onloadedmetadata = () => {
        if (sourceRef.current && context) {
          const analyser = context.createAnalyser();
          sourceRef.current.connect(analyser);
          setNumChannels(analyser.channelCount); // получаем количество каналов
        }
      };
    }
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playChannel = (leftGainValue: number, rightGainValue: number) => {
    const audio = audioRef.current;
    const context = audioContextRef.current;

    if (audio && context && sourceRef.current) {
      audio.pause();
      audio.currentTime = 0;

      const splitter = context.createChannelSplitter(2);
      const merger = context.createChannelMerger(2);

      const leftGain = context.createGain();
      const rightGain = context.createGain();

      leftGain.gain.value = leftGainValue;
      rightGain.gain.value = rightGainValue;

      sourceRef.current.disconnect();
      sourceRef.current.connect(splitter);
      splitter.connect(leftGain, 0);
      splitter.connect(rightGain, 1);

      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);

      merger.connect(context.destination);

      audio.play();
      setIsPlaying(true);
    }
  };

  const playLeftChannel = () => {
    playChannel(1, 0);
  };

  const playRightChannel = () => {
    playChannel(0, 1);
  };

  const increaseZoom = () => {
    if (zoomLevel < 128) {
      setZoomLevel(zoomLevel * 2);
    }
  };

  const decreaseZoom = () => {
    if (zoomLevel > 1) {
      setZoomLevel(zoomLevel / 2);
    }
  };

  return (
    <PlayerContainer>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <AudioInfo>
        {currentAudioUrl ? currentAudioUrl.split('/').pop() : 'No audio selected'}
      </AudioInfo>
      <ControlsContainer>
        <PlayButton onClick={togglePlayPause}>
          {isPlaying ? '❚❚' : '▶'}
        </PlayButton>
        <PlayButton onClick={playLeftChannel} disabled={numChannels < 2}>
          L
        </PlayButton>
        <PlayButton onClick={playRightChannel} disabled={numChannels < 2}>
          R
        </PlayButton>
        <ZoomControlsContainer>
        <ZoomButton onClick={decreaseZoom} disabled={zoomLevel <= 1}>
          -
        </ZoomButton>
        <ZoomDisplay>{zoomLevel}x</ZoomDisplay>
        <ZoomButton onClick={increaseZoom} disabled={zoomLevel >= 128}>
          +
        </ZoomButton>
      </ZoomControlsContainer>
        <TimeDisplay>
          {formatTime(currentTime)} / {formatTime(duration)}
        </TimeDisplay>
      </ControlsContainer>
      <AudioWaveform
        audioUrl={currentAudioUrl}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onSeek={handleSeek}
        onPlayPause={togglePlayPause}
        segments={segments}
        keywords={keywords}
        zoomLevel={zoomLevel}
      />
    </PlayerContainer>
  );
};

export default AudioPlayer;