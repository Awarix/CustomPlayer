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
import { currTimeSubscriber } from "../../../subscribers/PlayerSubscriber";
import { SegmentModel as Segment } from "../../AudioContext";
import WaveSurferClass from "wavesurfer.js";

const CompactPlayer: FC<{ url: string; isPlay: boolean; setIsPlay: (play: boolean) => void; currentTime: number; setCurrentTime: (time: number) => void;
    }> = ({ url, isPlay, setIsPlay, currentTime, setCurrentTime }) => {
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

      wavesurferRef.current.on('error', (error: any) => {
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

export default CompactPlayer