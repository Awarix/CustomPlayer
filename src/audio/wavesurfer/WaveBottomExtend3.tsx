import { FC, useMemo, useRef, useState, useEffect, useCallback } from "react";
import IconButton from "@material-ui/core/IconButton";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Paper from "@material-ui/core/Paper";
import { WaveSurfer, WaveForm } from "wavesurfer-react";
import { currTimeSubscriber } from "../../subscribers/PlayerSubscriber";
import { SegmentModel as Segment } from "../AudioContext";
import WaveSurferClass from "wavesurfer.js";

interface KeywordColor {
  keyword: {
    Start: number;
    Name: string;
    ChannelNumber: number;
    Confidence: number;
  };
  color: string;
}

interface Props {
  file: File | null;
  activeSegmentProp: Segment | null;
  url: string;
  keywords: KeywordColor[];
  channelCount: number;
}

const TimelinePlugin = require("wavesurfer.js/dist/plugin/wavesurfer.timeline.min");

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

const CompactPlayer: FC<{ url: string; isPlay: boolean; setIsPlay: (play: boolean) => void; currentTime: number; setCurrentTime: (time: number) => void }> = 
({ url, isPlay, setIsPlay, currentTime, setCurrentTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurferClass | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (containerRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurferClass.create({
        container: containerRef.current,
        waveColor: "#b7e1dd",
        progressColor: "#4Db6AC",
        cursorColor: "#357F78",
        responsive: true,
        height: 40,
        barWidth: 2,
        barGap: 1,
      });

      wavesurferRef.current.on('ready', () => {
        setIsReady(true);
        wavesurferRef.current?.setCurrentTime(currentTime);
      });

      wavesurferRef.current.on('error', (error) => {
        console.error('WaveSurfer error:', error);
      });

      wavesurferRef.current.on('audioprocess', () => {
        if (wavesurferRef.current && isReady) {
          setCurrentTime(wavesurferRef.current.getCurrentTime());
        }
      });

      wavesurferRef.current.load(url);
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [url, currentTime, setCurrentTime]);

  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      if (isPlay) {
        wavesurferRef.current.play();
      } else {
        wavesurferRef.current.pause();
      }
    }
  }, [isPlay, isReady]);

  const handlePlayPause = () => {
    if (isReady) {
      setIsPlay(!isPlay);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <IconButton
        color="primary"
        size="medium"
        onClick={handlePlayPause}
        disabled={!isReady}
      >
        {isPlay ? <PauseCircleFilledIcon fontSize="large" /> : <PlayCircleFilledIcon fontSize="large" />}
      </IconButton>
      <div ref={containerRef} style={{ flex: 1, marginLeft: 10 }} />
    </div>
  );
};



const WaveBottomExtend3: FC<Props> = ({ file, activeSegmentProp, url, keywords, channelCount }) => {
    const [isPlay, setIsPlay] = useState<boolean>(false);
    const [autoCenter, setAutoCenter] = useState<boolean>(true);
    const [zoom, setZoom] = useState<number>(10);
    const [activeSegment, setActiveSegment] = useState<Segment | null>(activeSegmentProp);
    const [isWavesurferReady, setIsWavesurferReady] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
  
    const plugins = useMemo(() => [
      {
        plugin: TimelinePlugin,
        options: { container: "#timeline" },
      },
    ], []);
  
    const wavesurferRef = useRef<any>(null);
  
    const handleWSMount = useCallback((waveSurfer) => {
      wavesurferRef.current = waveSurfer;
      wavesurferRef.current.load(url);
      
      wavesurferRef.current.on("ready", () => {
        wavesurferRef.current?.setCurrentTime(currentTime);
        if (isPlay) {
          wavesurferRef.current?.play();
        }
      });
  
      wavesurferRef.current.on("audioprocess", () => {
        if (wavesurferRef.current) {
          setCurrentTime(wavesurferRef.current.getCurrentTime());
        }
      });
    }, [url, currentTime, isPlay]);

    useEffect(() => {
      if (wavesurferRef.current) {
        wavesurferRef.current.seekTo(currentTime / wavesurferRef.current.getDuration());
      }
    }, [currentTime]);
  
    const setZoomClick = (zoom: number) => {
      if (zoom < 5) zoom = 5;
      if (zoom > 1000) zoom = 1000;
      setZoom(zoom);
    };
  
    useEffect(() => {
      if (!wavesurferRef.current) return;
  
      setZoom(10);
  
      if (url === "") return;
  
      wavesurferRef.current.load(url);
    }, [file, url]);
  
    useEffect(() => {
        if (wavesurferRef.current) {
        wavesurferRef.current.zoom(zoom);
        wavesurferRef.current.fireEvent('zoom', zoom);
        }
    }, [zoom]);
  
    useEffect(() => {
      if (!wavesurferRef.current) return;
  
      if (isPlay) {
        wavesurferRef.current.play();
      } else {
        wavesurferRef.current.pause();
      }
    }, [isPlay]);
  
    useEffect(() => {
      if (!wavesurferRef.current) return;
  
      setActiveSegment(activeSegmentProp);
  
      if (activeSegmentProp) {
        let zoomFactor = 500;
        const width = wavesurferRef.current.drawer.wrapper.clientWidth;
        const segmentDuration = activeSegmentProp.End - activeSegmentProp.Start;
  
        for (let i = 0; i < 10; i++) {
          if (segmentDuration * zoomFactor < width) break;
          zoomFactor /= 2;
        }
        if (zoomFactor < 5) zoomFactor = 5;
  
        setZoomClick(zoomFactor);
        setAutoCenter(false);
        setIsPlay(true);
  
        const total = wavesurferRef.current.getDuration();
        if (total > 0) {
          const centerTime = activeSegmentProp.Start + (segmentDuration) / 2;
          const t1 = centerTime / total;
  
          wavesurferRef.current.zoom(zoomFactor);
          wavesurferRef.current.seekAndCenter(t1);
          wavesurferRef.current.setCurrentTime(activeSegmentProp.Start);
          wavesurferRef.current.play();
        }
      }
  
      const subscription = currTimeSubscriber.subscribe(currentTime => {
        if (wavesurferRef.current && activeSegmentProp && currentTime >= activeSegmentProp.End) {
          wavesurferRef.current.setCurrentTime(activeSegmentProp.Start);
        }
      });
  
      return () => {
        subscription.unsubscribe();
      };
    }, [activeSegmentProp]);

    // обработчик нажатия клавиш
    const handleKeyDown = useCallback(
        (event) => {
          if (!wavesurferRef.current) {
            return;
          }
    
          const { key, ctrlKey } = event;
          let isNeedExKey = document.activeElement?.tagName === "TEXTAREA";
          isNeedExKey = isNeedExKey || document.activeElement?.tagName === "INPUT";
          let isEx = true;
          if (isNeedExKey) {
            isEx = ctrlKey;
          }
    
          if (key === " " && isEx) {
            setIsPlay((prev) => !prev);
          }
    
          if ((key === "a" || key === "d" || key === "ф" || key === "в") && isEx) {
            let diff = 5;
            if (activeSegment !== null) diff = 1;
            if (key === "a" || key === "ф") diff *= -1;
    
            const total = wavesurferRef.current.getDuration();
            let need = wavesurferRef.current.getCurrentTime() + diff;
            if (need < 0) need = 0;
            if (need > total) need = total;
    
            wavesurferRef.current.setCurrentTime(need);
            setIsPlay(true);

            event.preventDefault();
            event.stopPropagation();
          }
        },
        [activeSegment]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
      <Paper
      elevation={3}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        padding: "10px",
        boxSizing: "border-box",
        transition: "height 0.3s ease",
        height: isExpanded ? "400px" : "80px",
        overflow: isExpanded ? "auto" : "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isExpanded ? (
          <div>
            <IconButton
              color="primary"
              size="medium"
              onClick={() => setIsPlay((prev) => !prev)}
            >
              {isPlay ? <PauseCircleFilledIcon fontSize="large" /> : <PlayCircleFilledIcon fontSize="large" />}
            </IconButton>
            <IconButton
              color="primary"
              size="medium"
              title="Увеличить масштаб"
              onClick={() => setZoomClick(zoom * 2)}
            >
              <ZoomInIcon fontSize="large" />
            </IconButton>
            <IconButton
              color="primary"
              size="medium"
              title="Уменьшить масштаб"
              onClick={() => setZoomClick(zoom / 2)}
            >
              <ZoomOutIcon fontSize="large" />
            </IconButton>
          </div>
        ) : (
          <CompactPlayer url={url} isPlay={isPlay} setIsPlay={setIsPlay} currentTime={currentTime} setCurrentTime={setCurrentTime}/>
        )}
        <IconButton
          color="primary"
          size="medium"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? <ExpandMoreIcon fontSize="large" /> : <ExpandLessIcon fontSize="large" />}
        </IconButton>
      </div>
      {isExpanded && (
        <div style={{ width: "100%", position: "relative", marginTop: "10px" }}>
          <WaveSurfer onMount={handleWSMount} plugins={plugins}>
            <WaveForm
              id="waveform"
              waveColor="#b7e1dd"
              progressColor="#4Db6AC"
              cursorColor="#357F78"
              autoCenter={autoCenter}
              splitChannels={true}
            />
            <div style={{ height: "20px" }} id="timeline" />
          </WaveSurfer>

          {isWavesurferReady && wavesurferRef.current && keywords.map((kw, index) => (
            <WordMarker
              key={index}
              keyword={kw.keyword}
              color={kw.color}
              wavesurfer={wavesurferRef.current}
              zoom={zoom}
              isReady={isWavesurferReady}
              channelCount={channelCount}
            />
          ))}
        </div>
      )}
    </Paper>
    );
};

export default WaveBottomExtend3;