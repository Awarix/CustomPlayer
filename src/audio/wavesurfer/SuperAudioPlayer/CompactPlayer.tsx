import React, { FC, useEffect, useRef } from "react";
import { IconButton } from "@mui/material";
import WaveSurfer from "wavesurfer.js";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";

const CompactPlayer: FC<{
  url: string;
  isPlay: boolean;
  togglePlay: () => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
}> = ({ url, isPlay, togglePlay, currentTime, setCurrentTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (containerRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#b7e1dd",
        progressColor: "#4Db6AC",
        cursorColor: "#357F78",
        responsive: true,
        height: 40,
        barWidth: 2,
        barGap: 1,
      });

      wavesurferRef.current.on("ready", () => {
        wavesurferRef.current?.setCurrentTime(currentTime);
      });

      wavesurferRef.current.on("audioprocess", () => {
        if (wavesurferRef.current) {
          setCurrentTime(wavesurferRef.current.getCurrentTime());
        }
      });

      wavesurferRef.current.load(url);
    }

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [url, currentTime, setCurrentTime]);

  useEffect(() => {
    if (wavesurferRef.current) {
      if (isPlay) {
        wavesurferRef.current.play();
      } else {
        wavesurferRef.current.pause();
      }
    }
  }, [isPlay]);

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <IconButton color="primary" size="medium" onClick={togglePlay}>
        {isPlay ? <PauseCircleFilledIcon fontSize="large" /> : <PlayCircleFilledIcon fontSize="large" />}
      </IconButton>
      <div ref={containerRef} style={{ flex: 1, marginLeft: 10 }} />
    </div>
  );
};

export default CompactPlayer;