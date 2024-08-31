import { FC, useMemo, useRef, useState, useEffect, useCallback } from "react";
import IconButton from "@material-ui/core/IconButton";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Paper from "@material-ui/core/Paper";
// import { WaveSurfer, WaveForm } from "wavesurfer-react";
import WaveSurferClass from "wavesurfer.js";
import ExpandedPlayer from "./ExpandedPlayer";
import CompactPlayer from "./CompactPlayer";

const TimelinePlugin = require("wavesurfer.js/dist/plugin/wavesurfer.timeline.min");

interface Props {
    url: string;
}

const WaveBottomExtend3: FC<Props> = ({ url }) => {
    const [isPlay, setIsPlay] = useState<boolean>(false);
    const [zoom, setZoom] = useState<number>(10);
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
    }, [ url]);
  
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
  
    const togglePlay = useCallback(() => {
      setIsPlay((prev) => !prev);
    }, []);
  
    return (
      <Paper
        elevation={3}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "10px",
          boxSizing: "border-box",
          transition: "height 0.3s ease",
          height: isExpanded ? "400px" : "80px",
          overflow: isExpanded ? "auto" : "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {isExpanded ? (
            <ExpandedPlayer
              url={url}
              isPlay={isPlay}
              togglePlay={togglePlay}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              zoom={zoom}
              setZoom={setZoom}
            />
          ) : (
            <CompactPlayer
              url={url}
              isPlay={isPlay}
              togglePlay={togglePlay}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
            />
          )}
          <IconButton color="primary" size="medium" onClick={() => setIsExpanded((prev) => !prev)}>
            {isExpanded ? <ExpandMoreIcon fontSize="large" /> : <ExpandLessIcon fontSize="large" />}
          </IconButton>
        </div>
      </Paper>
    );
  };
  
  export default WaveBottomExtend3;