import React, { FC, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { IconButton, Paper } from "@mui/material";
import WaveSurfer from "wavesurfer.js";
// import TimelinePlugin from "wavesurfer.js/dist/plugin/timeline";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const TimelinePlugin = require("wavesurfer.js/dist/plugin/wavesurfer.timeline.min");

const ExpandedPlayer: FC<{
    url: string;
    isPlay: boolean;
    togglePlay: () => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
  }> = ({ url, isPlay, togglePlay, currentTime, setCurrentTime, zoom, setZoom }) => {
    const wavesurferRef = useRef<WaveSurfer | null>(null);
  
    useEffect(() => {
      if (!wavesurferRef.current) {
        wavesurferRef.current = WaveSurfer.create({
          container: "#waveform",
          waveColor: "#b7e1dd",
          progressColor: "#4Db6AC",
          cursorColor: "#357F78",
          responsive: true,
        });
  
        wavesurferRef.current.on("ready", () => {
            wavesurferRef.current?.setCurrentTime(currentTime);
            wavesurferRef.current?.zoom(zoom);
            if (isPlay) {
              wavesurferRef.current?.play();
            }
          });
    
          wavesurferRef.current.on("audioprocess", () => {
            if (wavesurferRef.current) {
              setCurrentTime(wavesurferRef.current.getCurrentTime());
            }
          });
        }
    
        return () => {
          wavesurferRef.current?.destroy();
        };
      }, [url, currentTime, zoom, isPlay, setCurrentTime]);
    
      useEffect(() => {
        if (wavesurferRef.current && wavesurferRef.current.isReady) {
          wavesurferRef.current.seekTo(currentTime / wavesurferRef.current.getDuration());
        }
      }, [currentTime]);
    
      useEffect(() => {
        if (wavesurferRef.current) {
          wavesurferRef.current.zoom(zoom);
        }
      }, [zoom]);
    
      return (
        <div>
          <div>
            <IconButton color="primary" size="medium" onClick={togglePlay}>
              {isPlay ? <PauseCircleFilledIcon fontSize="large" /> : <PlayCircleFilledIcon fontSize="large" />}
            </IconButton>
            <IconButton color="primary" size="medium" onClick={() => setZoom(zoom * 2)}>
              <ZoomInIcon fontSize="large" />
            </IconButton>
            <IconButton color="primary" size="medium" onClick={() => setZoom(zoom / 2)}>
              <ZoomOutIcon fontSize="large" />
            </IconButton>
          </div>
          <div id="waveform" style={{ width: "100%", height: "300px" }} />
        </div>
      );
    };

export default ExpandedPlayer;
  