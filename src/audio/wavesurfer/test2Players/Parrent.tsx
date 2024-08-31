import { FC, useMemo, useRef, useState, useEffect, useCallback } from "react";
import IconButton from "@material-ui/core/IconButton";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import { WaveSurfer, WaveForm } from "wavesurfer-react";
import { currTimeSubscriber } from "../../../subscribers/PlayerSubscriber";
import { SegmentModel as Segment } from "../../AudioContext";
import WaveSurferDisplay from "./Player1";

const TimelinePlugin = require("wavesurfer.js/dist/plugin/wavesurfer.timeline.min");

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



const Test2Players: FC<Props> = ({ file, activeSegmentProp, url, keywords, channelCount }) => {
    const [isPlay, setIsPlay] = useState<boolean>(false);
    const [autoCenter, setAutoCenter] = useState<boolean>(true);
    const [zoom, setZoom] = useState<number>(10);
    const [activeSegment, setActiveSegment] = useState<Segment | null>(activeSegmentProp);
    const [isWavesurferReady, setIsWavesurferReady] = useState<boolean>(false);
  
    const plugins = useMemo(() => [
      {
        plugin: TimelinePlugin,
        options: { container: "#timeline" },
      },
    ], []);
  
    const wavesurferRef = useRef<any>(null);

    let time = 31;

    useEffect(() => {
        wavesurferRef.current.seekTo(0.5);
    },[wavesurferRef])
  
    const handleWSMount = useCallback((waveSurfer) => {
        wavesurferRef.current = waveSurfer;
        wavesurferRef.current.load(url);
      
        wavesurferRef.current.on("ready", () => {
          console.log("WaveSurfer is ready");
          setIsWavesurferReady(true);
        });
  
      let lastTime = 0;
      wavesurferRef.current.on("audioprocess", (currentTime: number) => {
        const diff = Math.abs(currentTime - lastTime);
        if (diff > 0.1) {
          lastTime = currentTime;
          currTimeSubscriber.next(currentTime);
        }
      });
    }, [url]);
  
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

    //   if ((key === "w" || key === "s") && isEx) {
    //     event.preventDefault();
    //     event.stopPropagation();
    //   }

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
      <div style={{ width: "100%", position: "relative" }}>
        <WaveSurferDisplay
          onMount={handleWSMount}
          plugins={plugins}
          zoom={zoom}
          autoCenter={autoCenter}
          isWavesurferReady={isWavesurferReady}
          keywords={keywords}
          channelCount={channelCount}
          wavesurferRef={wavesurferRef}
        />
        
        {/* <WaveSurferDisplay
          onMount={handleWSMount}
          plugins={plugins}
          zoom={zoom}
          autoCenter={autoCenter}
          isWavesurferReady={isWavesurferReady}
          keywords={keywords}
          channelCount={channelCount}
          wavesurferRef={wavesurferRef}
        /> */}
  
        <div style={{ height: "80px" }}>
                <IconButton
                color="primary"
                size="medium"
                onClick={(e: any) => {
                    (document.activeElement as HTMLElement).blur();
                    setIsPlay((prev) => !prev);
                }}
                >
                {isPlay ? <PauseCircleFilledIcon fontSize="large" /> : <PlayCircleFilledIcon fontSize="large" />}
                </IconButton>
                <IconButton
                color="primary"
                size="medium"
                title="Увеличить масштаб"
                onClick={(e: any) => {
                    (document.activeElement as HTMLElement).blur();
                    setZoomClick(zoom * 2);
                }}
                >
                <ZoomInIcon fontSize="large" />
                </IconButton>
                <IconButton
                color="primary"
                size="medium"
                title="Уменьшить масштаб"
                onClick={(e: any) => {
                    (document.activeElement as HTMLElement).blur();
                    setZoomClick(zoom / 2);
                }}
                >
                <ZoomOutIcon fontSize="large" />
                </IconButton>
            </div>
      </div>
    );
  };

  export default Test2Players;