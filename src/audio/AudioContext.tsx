// AudioContext.tsx
import React, { createContext, useState, useContext, FC } from 'react';

export interface PlayerProps {
  audioSrc: string;
  segments: SegmentModel[];
  keywords: KeywordColor[];
}

export interface SegmentModel {
  id?: number;
  Start: number;
  End: number;
  ChannelNumber: number;
  Words?: { NormalForm: string }[];
}

export interface KeywordColor {
  keyword: {
    Start: number;
    End: number;
    Name: string;
    ChannelNumber: number;
    Confidence: number;
  };
  color: string;
}

interface AudioContextType {
  currentAudioUrl: string;
  setCurrentAudioUrl: (url: string) => void;
  audioUrl: string;
  setAudioUrl: (url: string) => void;
  segments: SegmentModel[];
  setSegments: (segments: SegmentModel[]) => void;
  keywords: KeywordColor[];
  setKeywords: (keywords: KeywordColor[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: FC = ({ children }) => {
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [segments, setSegments] = useState<SegmentModel[]>([]);
  const [keywords, setKeywords] = useState<KeywordColor[]>([]);

  return (
    <AudioContext.Provider value={{ currentAudioUrl, setCurrentAudioUrl, audioUrl, setAudioUrl, segments, setSegments, 
      keywords, setKeywords  }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};