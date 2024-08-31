// import React, { useState, useRef, useEffect } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import { IconButton, Slider } from '@material-ui/core';
// import { PlayArrow, Pause } from '@material-ui/icons';

// interface PlayerProps {
//   audioSrc: string;
//   segments: SegmentModel[];
//   keywords: KeywordColor[];
// }

// interface SegmentModel {
//   Start: number;
//   End: number;
//   ChannelNumber: number;
//   Words?: { NormalForm: string }[];
// }

// interface KeywordColor {
//   keyword: {
//     Start: number;
//     End: number;
//     Name: string;
//     ChannelNumber: number;
//     Confidence: number;
//   };
//   color: string;
// }

// const useStyles = makeStyles({
//   root: {
//     width: '100%',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   controls: {
//     display: 'flex',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 20,
//     marginTop: 100,
//   },
//   canvas: {
//     width: '100%',
//     height: 100,
//     border: '1px solid black', // Added for visibility
//   },
// });

// const Player: React.FC<PlayerProps> = ({ audioSrc, segments, keywords }) => {
//   const classes = useStyles();
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
  
//   const audioRef = useRef<HTMLAudioElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (audioRef.current) {
//       audioRef.current.addEventListener('loadedmetadata', () => {
//         setDuration(audioRef.current!.duration);
//       });
//       audioRef.current.addEventListener('timeupdate', () => {
//         setCurrentTime(audioRef.current!.currentTime);
//       });
//     }
//   }, []);

//   useEffect(() => {
//     drawWaveform();
//   }, [segments, keywords, duration]);

//   const togglePlay = () => {
//     if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.pause();
//       } else {
//         audioRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   const handleSliderChange = (event: any, newValue: number | number[]) => {
//     if (audioRef.current && typeof newValue === 'number') {
//       audioRef.current.currentTime = newValue;
//       setCurrentTime(newValue);
//     }
//   };

//   const drawWaveform = () => {
//     if (canvasRef.current && duration > 0) {
//       const ctx = canvasRef.current.getContext('2d');
//       if (ctx) {
//         const canvasWidth = canvasRef.current.width;
//         const canvasHeight = canvasRef.current.height;

//         ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
//         console.log(`Drawing ${segments.length} segments and ${keywords.length} keywords`);
        
//         // Draw segments
//         segments.forEach((segment, index) => {
//             const startX = (segment.Start / duration) * canvasWidth;
//             const endX = (segment.End / duration) * canvasWidth;
//             ctx.fillStyle = segment.Words && segment.Words[0].NormalForm === "[music]"
//               ? "rgba(181, 201, 255, 0.5)"
//               : "rgba(0, 123, 255, 0.5)";
//             ctx.fillRect(startX, 0, endX - startX, canvasHeight);
//             console.log(`Drawing segment ${index}: start=${startX}, end=${endX}, color=${ctx.fillStyle}`);
//           });
  
//           // Draw keywords
//           keywords.forEach((kw, index) => {
//             const startX = (kw.keyword.Start / duration) * canvasWidth;
//             const width = ((kw.keyword.End - kw.keyword.Start) / duration) * canvasWidth;
//             ctx.fillStyle = kw.color;
//             ctx.fillRect(startX, 0, width, canvasHeight / 4);
//             console.log(`Drawing keyword ${index}: start=${startX}, width=${width}, color=${kw.color}`);
//           });
  
//           // Draw current time indicator
//           const currentTimeX = (currentTime / duration) * canvasWidth;
//           ctx.strokeStyle = 'red';
//           ctx.lineWidth = 2;
//           ctx.beginPath();
//           ctx.moveTo(currentTimeX, 0);
//           ctx.lineTo(currentTimeX, canvasHeight);
//           ctx.stroke();
//         }
//       } else {
//         console.log('Canvas not ready or duration is 0');
//       }
//     };
  
//     const formatTime = (time: number) => {
//       const minutes = Math.floor(time / 60);
//       const seconds = Math.floor(time % 60);
//       return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//     };
  
//     return (
//       <div className={classes.root}>
//         <audio ref={audioRef} src={audioSrc} />
//         <div className={classes.controls}>
//           <IconButton onClick={togglePlay}>
//             {isPlaying ? <Pause /> : <PlayArrow />}
//           </IconButton>
//           <Slider
//             value={currentTime}
//             onChange={handleSliderChange}
//             min={0}
//             max={duration}
//             step={0.1}
//           />
//           <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
//         </div>
//         <canvas 
//           ref={canvasRef} 
//           className={classes.canvas}
//           width={1000}
//           height={100}
//           onClick={(e) => {
//             const rect = canvasRef.current!.getBoundingClientRect();
//             const x = e.clientX - rect.left;
//             const clickTime = (x / canvasRef.current!.width) * duration;
//             if (audioRef.current) {
//               audioRef.current.currentTime = clickTime;
//             }
//           }}
//         />
//         <div>
//           <p>Segments: {segments.length}</p>
//           <p>Keywords: {keywords.length}</p>
//           <p>Duration: {duration}</p>
//         </div>
//       </div>
//     );
//   };
  
//   export default Player;


import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Slider, Tooltip } from '@material-ui/core';
import { PlayArrow, Pause } from '@material-ui/icons';

interface PlayerProps {
  audioSrc: string;
  segments: SegmentModel[];
  keywords: KeywordColor[];
}

interface SegmentModel {
  Start: number;
  End: number;
  ChannelNumber: number;
  Words?: { NormalForm: string }[];
}

interface KeywordColor {
  keyword: {
    Start: number;
    End: number;
    Name: string;
    ChannelNumber: number;
    Confidence: number;
  };
  color: string;
}

const useStyles = makeStyles({
  root: {
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    margin: '20px 0',
  },
  canvasContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  canvas: {
    width: '90%',
    height: 50,
    marginBottom: 10,
  },
  tooltipAnchor: {
    position: 'absolute',
    width: 1,
    height: 1,
  },
});

const Player: React.FC<PlayerProps> = ({ audioSrc, segments, keywords }) => {
    const classes = useStyles();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hoveredKeyword, setHoveredKeyword] = useState<KeywordColor | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef1 = useRef<HTMLCanvasElement>(null);
    const canvasRef2 = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current!.duration);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current!.currentTime);
      });
    }
  }, []);

  useEffect(() => {
    drawWaveform();
  }, [segments, keywords, duration]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (event: any, newValue: number | number[]) => {
    if (audioRef.current && typeof newValue === 'number') {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const drawWaveform = () => {
    if (canvasRef1.current && canvasRef2.current && duration > 0) {
      const drawChannel = (ctx: CanvasRenderingContext2D, channelSegments: SegmentModel[], channelKeywords: KeywordColor[]) => {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw segments
        channelSegments.forEach((segment) => {
          const startX = (segment.Start / duration) * canvasWidth;
          const endX = (segment.End / duration) * canvasWidth;
          ctx.fillStyle = segment.Words && segment.Words[0].NormalForm === "[music]"
            ? "rgba(181, 201, 255, 0.5)"
            : "rgba(0, 123, 255, 0.5)";
          ctx.fillRect(startX, 0, endX - startX, canvasHeight);
        });

        // Draw keywords
        channelKeywords.forEach((kw) => {
          const startX = (kw.keyword.Start / duration) * canvasWidth;
          const width = 2;
          ctx.fillStyle = kw.color;
          ctx.fillRect(startX, 0, width, canvasHeight);
        });
        console.log(`Channel ${channelSegments[0]?.ChannelNumber}: ${channelSegments.length} segments, ${channelKeywords.length} keywords`);
        console.log('Keywords:', channelKeywords);
      };

      const ctx1 = canvasRef1.current.getContext('2d');
      const ctx2 = canvasRef2.current.getContext('2d');

      if (ctx1 && ctx2) {
        const channel1Segments = segments.filter(s => s.ChannelNumber === 1);
        const channel2Segments = segments.filter(s => s.ChannelNumber === 2);
        const channel1Keywords = keywords.filter(k => k.keyword.ChannelNumber === 1);
        const channel2Keywords = keywords.filter(k => k.keyword.ChannelNumber === 2);

        console.log('All keywords:', keywords);
        console.log('Channel 1 keywords:', channel1Keywords);
        console.log('Channel 2 keywords:', channel2Keywords);

        drawChannel(ctx1, channel1Segments, channel1Keywords);
        drawChannel(ctx2, channel2Segments, channel2Keywords);

        // Draw current time indicator
        const currentTimeX = (currentTime / duration) * ctx1.canvas.width;
        [ctx1, ctx2].forEach(ctx => {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(currentTimeX, 0);
          ctx.lineTo(currentTimeX, ctx.canvas.height);
          ctx.stroke();
        });
      }
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>, channelKeywords: KeywordColor[]) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const time = (x / canvas.width) * duration;

    const hoveredKw = channelKeywords.find(kw => 
      time >= kw.keyword.Start && time <= kw.keyword.End
    );

    setHoveredKeyword(hoveredKw || null);
    setTooltipPosition({ top: event.clientY, left: event.clientX });
  };

  const handleCanvasMouseLeave = () => {
    setHoveredKeyword(null);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={classes.root}>
      <audio ref={audioRef} src={audioSrc} />
      <div className={classes.canvasContainer}>
        <canvas 
          ref={canvasRef1} 
          className={classes.canvas}
          width={1000}
          height={50}
          onMouseMove={(e) => handleCanvasMouseMove(e, keywords.filter(k => k.keyword.ChannelNumber === 1))}
          onMouseLeave={handleCanvasMouseLeave}
        />
        <div className={classes.controls}>
          <IconButton onClick={togglePlay}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <Slider
            value={currentTime}
            onChange={handleSliderChange}
            min={0}
            max={duration}
            step={0.1}
          />
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <canvas 
          ref={canvasRef2} 
          className={classes.canvas}
          width={1000}
          height={50}
          onMouseMove={(e) => handleCanvasMouseMove(e, keywords.filter(k => k.keyword.ChannelNumber === 2))}
          onMouseLeave={handleCanvasMouseLeave}
        />
      </div>
      {hoveredKeyword && (
        <Tooltip
          title={`${hoveredKeyword.keyword.Name} (${formatTime(hoveredKeyword.keyword.Start)} - ${formatTime(hoveredKeyword.keyword.End)})`}
          open={true}
          placement="top"
        >
          <div 
            className={classes.tooltipAnchor}
            style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default Player;