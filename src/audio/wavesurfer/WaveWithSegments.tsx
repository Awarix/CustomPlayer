import { FC, useMemo, useRef, useState, useEffect, useCallback } from "react";
import IconButton from "@material-ui/core/IconButton";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import { WaveSurfer, WaveForm, Region } from "wavesurfer-react";
import { currTimeSubscriber, changeSegmentPositionSubscriber } from "../../subscribers/PlayerSubscriber";
import { SegmentModel as Segment } from "../AudioContext";

interface Props {
  file: File | null;
  segments: Segment[];
  activeSegmentProp: Segment | null;
  url: string;
}

const RegionsPlugin = require("wavesurfer.js/dist/plugin/wavesurfer.regions.min");
const TimelinePlugin = require("wavesurfer.js/dist/plugin/wavesurfer.timeline.min");

const WavePlayer: FC<Props> = ({ file, segments, activeSegmentProp, url }) => {
  const [isPlay, setIsPlay] = useState<boolean>(false);
  const [autoCenter, setAutoCenter] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(10);
  const [regions, setRegions] = useState<any[]>([]);
  const [activeSegment, setActiveSegment] = useState<Segment | null>(activeSegmentProp);

  const plugins = useMemo(() => [
    {
      plugin: RegionsPlugin,
      options: { dragSelection: false, showTooltip: false },
    },
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
      console.log("WaveSurfer is ready");
    });

    wavesurferRef.current.on("region-update-end", (region: any) => {
      changeSegmentPositionSubscriber.next({
        segment: region.data,
        start: region.start,
        end: region.end,
      });
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
    const mappedRegions = segments.map(s => ({
      id: s.id,
      start: s.Start,
      end: s.End,
      color: "rgba(212, 215, 247, 0.4)",
      drag: false,
      resize: false,
      channelIdx: s.ChannelNumber, // Привязываем регион к соответствующему каналу
      handleStyle: {
        left: { backgroundColor: "transparent", width: "5px" },
        right: { backgroundColor: "transparent", width: "5px" },
      },
      data: s,
    }));
    setRegions(mappedRegions);
  }, [segments]);

  useEffect(() => {
    if (!wavesurferRef.current) return;

    setZoom(10);

    if (url === "") return;

    wavesurferRef.current.load(url);
  }, [file, url]);

  useEffect(() => {
    if (!wavesurferRef.current) return;

    if (wavesurferRef.current.params.minPxPerSec !== zoom) {
      wavesurferRef.current.zoom(zoom);
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

    regions.forEach(region => {
      if (region.color !== "rgba(212, 215, 247, 0.4)") {
        region.color = "rgba(212, 215, 247, 0.4)";
      }

      if (activeSegmentProp?.id === region.id) {
        region.color = "rgba(212, 215, 247, 0.4)";
      }
    });

    const subscription = currTimeSubscriber.subscribe(currentTime => {
      if (wavesurferRef.current && activeSegmentProp && currentTime >= activeSegmentProp.End) {
        wavesurferRef.current.setCurrentTime(activeSegmentProp.Start);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activeSegmentProp, regions]);

  return (
    <div style={{ width: "100%" }}>
      <WaveSurfer onMount={handleWSMount} plugins={plugins} >
        <WaveForm
          id="waveform"
          waveColor="#b7e1dd"
          progressColor="#4Db6AC"
          cursorColor="#357F78"
          autoCenter={autoCenter}
          splitChannels={true}
        >
          {regions.map(regionProps => (
            <Region
              key={regionProps.id}
              {...regionProps}
            />
          ))}
        </WaveForm>
        <div style={{ height: "20px" }} id="timeline" />
      </WaveSurfer>

      <div style={{ height: "40px" }}>
        <IconButton
          color="primary"
          onClick={(e: any) => {
            (document.activeElement as HTMLElement).blur();
            setIsPlay((prev) => !prev);
          }}
        >
          {isPlay ? <PauseCircleFilledIcon fontSize="medium" /> : <PlayCircleFilledIcon fontSize="medium" />}
        </IconButton>
        <IconButton
          color="primary"
          title="Увеличить масштаб"
          onClick={(e: any) => {
            (document.activeElement as HTMLElement).blur();
            setZoomClick(zoom * 2);
          }}
        >
          <ZoomInIcon fontSize="medium" />
        </IconButton>
        <IconButton
          color="primary"
          title="Уменьшить масштаб"
          onClick={(e: any) => {
            (document.activeElement as HTMLElement).blur();
            setZoomClick(zoom / 2);
          }}
        >
          <ZoomOutIcon fontSize="medium" />
        </IconButton>
      </div>
    </div>
  );
};

export default WavePlayer;