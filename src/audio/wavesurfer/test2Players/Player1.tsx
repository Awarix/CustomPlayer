import { FC, useRef,} from "react";
import { WaveSurfer, WaveForm } from "wavesurfer-react";
import WordMarker from "../SuperZhestkyiPlayer/WordMarker";


const WaveSurferDisplay: FC<{
    onMount: (waveSurfer: any) => void;
    plugins: any[];
    zoom: number;
    autoCenter: boolean;
    isWavesurferReady: boolean;
    keywords: any[];
    channelCount: number;
    wavesurferRef: any;
  }> = ({ onMount, plugins, zoom, autoCenter, isWavesurferReady, keywords, channelCount, wavesurferRef }) => {
  
    return (
      <>
        <WaveSurfer onMount={(ws) => {
          wavesurferRef.current = ws;
          onMount(ws);
        }} plugins={plugins}>

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
      </>
    );
  };

  export default WaveSurferDisplay