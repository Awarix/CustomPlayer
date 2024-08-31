import React, { useEffect, useRef } from 'react';
import { Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { KeywordColor } from '../audio/AudioContext';

interface WordMarkerProps {
    keyword: KeywordColor['keyword'];
    color: string;
    duration: number;
    currentTime: number;
    zoomLevel: number;
    canvasWidth: number;
    canvasHeight: number;
    isExpanded: boolean;
    channelNumber: number;
    onMarkerClick: (time: number) => void;
  }
  
  const KeywordMarker: React.FC<WordMarkerProps> = ({
    keyword,
    color,
    duration,
    currentTime,
    zoomLevel,
    canvasWidth,
    canvasHeight,
    isExpanded,
    channelNumber,
    onMarkerClick,
  }) => {
    const markerRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      if (markerRef.current) {
        const visibleDuration = duration / zoomLevel;
        const startTime = Math.max(0, currentTime - visibleDuration / 2);
        const endTime = Math.min(duration, startTime + visibleDuration);
  
        const markerPosition = ((keyword.Start - startTime) / visibleDuration) * canvasWidth;
        const markerHeight = isExpanded && channelNumber === 2 ? canvasHeight / 2 : canvasHeight;
        const markerTop = isExpanded && channelNumber === 2 && keyword.ChannelNumber === 2 ? canvasHeight / 2 : 0;
  
        markerRef.current.style.left = `${markerPosition}px`;
        markerRef.current.style.height = `${markerHeight}px`;
        markerRef.current.style.top = `${markerTop}px`;
        markerRef.current.style.display = keyword.Start >= startTime && keyword.Start <= endTime ? 'block' : 'none';
      }
    }, [keyword, currentTime, zoomLevel, canvasWidth, canvasHeight, isExpanded, channelNumber, duration]);
  
    const handleClick = () => {
      onMarkerClick(keyword.Start);
    };
  
    return (
    //   <Tooltip title={`${keyword.Name} (${keyword.Confidence.toFixed(2)})`} placement="top">
        <Tooltip title={`${keyword.Name} (${keyword.Start})`} placement="top">
        <div
          ref={markerRef}
          onClick={handleClick}
          style={{
            position: 'absolute',
            width: '2px',
            backgroundColor: color,
            cursor: 'pointer',
          }}
        />
      </Tooltip>
    );
  };

export default KeywordMarker;