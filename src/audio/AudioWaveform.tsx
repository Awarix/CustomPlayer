import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import styled from 'styled-components';
import { KeywordColor, SegmentModel } from './AudioContext';

const WaveformContainer = styled.div`
  width: 100%;
  height: 100px;
  position: relative;
  background-color: #f1f3f4;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  padding: 30px 0px;
`;

const WaveformCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  background-color: #f4h2a1;
`;

const ProgressOverlay = styled.div<{ progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.progress}%;
  background-color: rgba(77, 182, 172, 0.2);
  pointer-events: none;
`;

interface AudioWaveformProps {
  audioUrl: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
  segments: SegmentModel[];
  keywords: KeywordColor[];
  zoomLevel: number;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioUrl,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onPlayPause,
  segments,
  keywords,
  zoomLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [hoveredKeyword, setHoveredKeyword] = useState<KeywordColor | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (audioUrl) {
      fetchAudioAndComputeWaveform(audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    drawWaveform();
  }, [waveformData, currentTime, zoomLevel]);

  const fetchAudioAndComputeWaveform = async (url: string) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const waveform = computeWaveform(audioBuffer);
      setWaveformData(waveform);
    } catch (error) {
      console.error('Error fetching audio:', error);
    }
  };

  const computeWaveform = (audioBuffer: AudioBuffer) => {
    const channelData = audioBuffer.getChannelData(0);
    const samples = 500 * zoomLevel; // увеличиваем количество выборок в зависимости от уровня зума
    const blockSize = Math.floor(channelData.length / samples);
    const waveform = [];

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = start + blockSize;
      let max = 0;
      for (let j = start; j < end; j++) {
        const amplitude = Math.abs(channelData[j]);
        if (amplitude > max) {
          max = amplitude;
        }
      }
      waveform.push(max);
    }

    return waveform;
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height;

      ctx.fillStyle = currentTime / duration > index / waveformData.length ? '#357F78' : '#999';
      ctx.fillRect(x, (height - barHeight) / 2, barWidth - 1, barHeight);
    });

    segments.forEach((segment) => {
      const startX = (segment.Start / duration) * width;
      const endX = (segment.End / duration) * width;
      ctx.fillStyle = segment.Words && segment.Words[0].NormalForm === "[music]"
        ? "rgba(181, 201, 255, 0.5)"
        : "rgba(0, 123, 255, 0.5)";
      ctx.fillRect(startX, 0, endX - startX, height);
    });

    // Отрисовка ключевых слов
    keywords.forEach((kw) => {
      const startX = (kw.keyword.Start / duration) * width;
      ctx.fillStyle = kw.color;
      ctx.fillRect(startX, 0.5, 1, height / 2);
    });
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / rect.width) * duration;
    onSeek(seekTime);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
  
    const hoveredKw = keywords.find(kw => 
      time >= kw.keyword.Start && time <= kw.keyword.End
    );
  
    if (hoveredKw) {
      setHoveredKeyword(hoveredKw);
      setPopoverPosition({ top: e.clientY - rect.top, left: x });
      setAnchorEl(containerRef.current);
    } else {
      setHoveredKeyword(null);
      setAnchorEl(null);
    }
  };


 
  return (
    <WaveformContainer 
      ref={containerRef} 
      onClick={handleClick} 
      onMouseMove={handleMouseMove}
    >
      <WaveformCanvas ref={canvasRef} width={1000} height={200} />
      <ProgressOverlay progress={(currentTime / duration) * 100} />
      {hoveredKeyword && anchorEl && (
  <div
    style={{
      position: 'absolute',
      top: popoverPosition.top + 15, 
      left: popoverPosition.left,
      transform: 'translateX(-50%)', 
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
    }}
  >
    <div style={{ marginBottom: '10px' }}>
      {`${hoveredKeyword.keyword.Name} ( ${(hoveredKeyword.keyword.Confidence * 100).toFixed(0)}% )`}
    </div>
    <div>
      {formatTime(hoveredKeyword.keyword.Start)} - {formatTime(hoveredKeyword.keyword.End)}
    </div>
  </div>
)}
    </WaveformContainer>
  );
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};


export default AudioWaveform;