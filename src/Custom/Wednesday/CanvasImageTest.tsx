import React, { useRef, useEffect, useState } from 'react';

const CanvasImageTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Рисуем простую картинку (в данном случае, смайлик)
    const drawSmiley = (x: number, y: number, radius: number) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = 'yellow';
      ctx.fill();
      ctx.stroke();

      // Глаза
      ctx.beginPath();
      ctx.arc(x - radius / 3, y - radius / 3, radius / 10, 0, Math.PI * 2, true);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + radius / 3, y - radius / 3, radius / 10, 0, Math.PI * 2, true);
      ctx.fill();

      // Улыбка
      ctx.beginPath();
      ctx.arc(x, y, radius / 2, 0, Math.PI, false);
      ctx.stroke();
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-scrollPosition, 0);
    drawSmiley(canvas.width / (2 * zoom), canvas.height / (2 * zoom), 50);
    ctx.restore();
  }, [zoom, scrollPosition]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 2, 64));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 2, 1));
  };

  const handleScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrollPosition(Number(e.target.value));
  };

  return (
    <div>
      <canvas ref={canvasRef} width={300} height={300} style={{ border: '1px solid black' }} />
      <div>
        <button onClick={handleZoomOut} disabled={zoom === 1}>Zoom Out</button>
        <button onClick={handleZoomIn} disabled={zoom === 64}>Zoom In</button>
      </div>
      {zoom > 1 && (
        <input
          type="range"
          min={0}
          max={300 * (1 - 1/zoom)}
          value={scrollPosition}
          onChange={handleScroll}
        />
      )}
    </div>
  );
};

export default CanvasImageTest;