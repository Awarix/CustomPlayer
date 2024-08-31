import { FC, useRef, useEffect } from "react";
import { KeywordColor } from "../../AudioContext";



const WordMarker: FC<{keyword: KeywordColor['keyword'], color: string, wavesurfer: any, zoom: number, isReady: boolean, channelCount: number}> = ({ keyword, color, wavesurfer, zoom, isReady, channelCount }) => {
    const markerRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
        if (!isReady) return;
      const updatePosition = () => {
        if (markerRef.current && wavesurfer) {
          const duration = wavesurfer.getDuration();
          const containerWidth = wavesurfer.drawer.width;
          const scrollLeft = wavesurfer.drawer.getScrollX();
  
          const markerPosition = (keyword.Start / duration) * containerWidth;
          const adjustedPosition = markerPosition - scrollLeft;
  
          markerRef.current.style.left = `${adjustedPosition}px`;
          markerRef.current.style.display = adjustedPosition >= 0 && adjustedPosition <= containerWidth ? 'block' : 'none';
        }
      };
  
      updatePosition();
      wavesurfer.on('scroll', updatePosition);
      wavesurfer.on('zoom', updatePosition);
  
      return () => {
        wavesurfer.un('scroll', updatePosition);
        wavesurfer.un('zoom', updatePosition);
      };
    }, [keyword, wavesurfer, zoom, isReady]);

  const handleClick = () => {
    wavesurfer.setCurrentTime(keyword.Start);
  };

  const markerHeight = channelCount === 1 ? '34%' : '100%';
  

  return (
    <div
      ref={markerRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: 0,
        height: markerHeight,
        width: '2px',
        backgroundColor: color,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: color,
          padding: '2px 5px',
          borderRadius: '3px',
          color: 'white',
          fontSize: '12px',
        }}
      >
        {keyword.Name}
      </div>
    </div>
  );
};

export default WordMarker