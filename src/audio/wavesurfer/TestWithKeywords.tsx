import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { KeywordColor } from '../AudioContext';

interface WaveformProps {
  url: string;
  keywords: KeywordColor[];
}

const TestWithKeywords: React.FC<WaveformProps> = ({ url, keywords }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const markersRef = useRef<any>(null);

  useEffect(() => {
    if (waveformRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#ddd',
        progressColor: '#333',
        cursorColor: '#333',
        height: 100,
        barWidth: 2,
        responsive: true,
      });

      waveSurferRef.current.load(url);

      // Добавление кастомного контейнера для маркеров
      if (waveformRef.current && !markersRef.current) {
        markersRef.current = document.createElement('div');
        markersRef.current.style.position = 'absolute';
        markersRef.current.style.top = '0';
        markersRef.current.style.left = '0';
        markersRef.current.style.width = '100%';
        markersRef.current.style.height = '100%';
        waveformRef.current.appendChild(markersRef.current);
      }

      waveSurferRef.current.on('ready', () => {
        addMarkers();
      });

      // Обновление маркеров при зуме или изменении размера
      waveSurferRef.current.on('zoom', addMarkers);
      waveSurferRef.current.on('resize', addMarkers);
    }

    return () => {
      waveSurferRef.current?.destroy();
    };
  }, [url]);

  const addMarkers = () => {
    if (markersRef.current && waveSurferRef.current) {
      markersRef.current.innerHTML = ''; // Очищаем предыдущие маркеры

      keywords.forEach(({ keyword, color }) => {
        const marker = document.createElement('div');
        const label = document.createElement('span');

        // Устанавливаем стиль для маркера
        marker.style.position = 'absolute';
        marker.style.left = `${(keyword.Start / waveSurferRef.current!.getDuration()) * 100}%`;
        marker.style.bottom = '0';
        marker.style.width = '2px';
        marker.style.height = '100%';
        marker.style.backgroundColor = color;

        // Устанавливаем стиль для лейбла
        label.textContent = keyword.Name;
        label.style.position = 'absolute';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.bottom = '100%';
        label.style.backgroundColor = color;
        label.style.color = '#fff';
        label.style.padding = '2px 5px';
        label.style.fontSize = '12px';
        label.style.borderRadius = '3px';

        marker.appendChild(label);
        markersRef.current!.appendChild(marker);
      });
    }
  };

  return <div ref={waveformRef} style={{ position: 'relative', top: 200 }} />;
};

export default TestWithKeywords;