import React, { useRef } from 'react';

interface AudioPlayerProps {
  src: string;
}

const TestChannelPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initializeAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      const context = new AudioContext();
      audioContextRef.current = context;
      sourceRef.current = context.createMediaElementSource(audioRef.current);
    }
  };

  const playChannel = (leftGainValue: number, rightGainValue: number) => {
    initializeAudioContext();

    const audio = audioRef.current;
    const context = audioContextRef.current;
    if (audio && context && sourceRef.current) {
      audio.pause();
      audio.currentTime = 0;

      const splitter = context.createChannelSplitter(2);
      const merger = context.createChannelMerger(2);

      const leftGain = context.createGain();
      const rightGain = context.createGain();

      leftGain.gain.value = leftGainValue;
      rightGain.gain.value = rightGainValue;

      sourceRef.current.connect(splitter);
      splitter.connect(leftGain, 0);
      splitter.connect(rightGain, 1);

      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);

      merger.connect(context.destination);

      audio.play();
    }
  };

  const playLeftChannel = () => {
    playChannel(1, 0);
  };

  const playRightChannel = () => {
    playChannel(0, 1);
  };

  return (
    <div>
      <audio ref={audioRef} src={src} controls />
      <div>
        <button onClick={playLeftChannel}>Play Left Channel</button>
        <button onClick={playRightChannel}>Play Right Channel</button>
      </div>
    </div>
  );
};

export default TestChannelPlayer;