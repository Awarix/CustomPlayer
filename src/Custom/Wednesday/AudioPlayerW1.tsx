import React, { useRef, useEffect, useState } from "react";

const AudioPlayerW1: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [zoom, setZoom] = useState(1); // Масштабирование
    const [scrollX, setScrollX] = useState(0); // Прокрутка
  
    useEffect(() => {
      // Загрузка и декодирование аудио файла
      const loadAudio = async () => {
        const response = await fetch("/audio/rus.wav");
        const arrayBuffer = await response.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedData = await audioCtx.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedData);
      };
  
      loadAudio();
    }, []);
  
    useEffect(() => {
      if (!canvasRef.current || !audioBuffer) return;
  
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
  
      const { width, height } = canvasRef.current;
      const data = audioBuffer.getChannelData(0); // Получаем данные для одного канала
  
      const step = Math.ceil(data.length / (width * zoom)); // Шаг для выборки данных из аудио
      const amp = height / 2; // Амплитуда, используемая для масштабирования волны
  
      // Прокрутка
      const start = Math.floor(scrollX * step);
      const end = Math.min(start + width * step, data.length);
  
      ctx.clearRect(0, 0, width, height); // Очистка канваса
  
      ctx.beginPath();
      for (let i = 0; i < width; i++) {
        const sliceStart = start + i * step;
        const sliceEnd = Math.min(sliceStart + step, data.length);
  
        if (sliceStart >= data.length) break;
  
        let min = 1.0;
        let max = -1.0;
  
        for (let j = sliceStart; j < sliceEnd; j++) {
          const value = data[j];
          if (value < min) min = value;
          if (value > max) max = value;
        }
  
        ctx.lineTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
      }
      ctx.stroke();
    }, [audioBuffer, zoom, scrollX]);
  
    return (
      <div>
        <canvas ref={canvasRef} width={800} height={200} />
        <div>
          <button onClick={() => setZoom(zoom * 2)}>Приблизить</button>
          <button onClick={() => setZoom(zoom / 2)}>Отдалить</button>
          <input
            type="range"
            min="0"
            max={audioBuffer ? Math.max(0, audioBuffer.length / (zoom * 100)) : 100}
            value={scrollX}
            onChange={(e) => setScrollX(Number(e.target.value))}
          />
        </div>
      </div>
    );
  };
  

export default AudioPlayerW1;