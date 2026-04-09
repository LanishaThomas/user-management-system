import { useEffect, useState } from 'react';

const CursorGlow = () => {
  const [position, setPosition] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-30 h-72 w-72 rounded-full bg-violet-400/20 mix-blend-screen blur-3xl transition-transform duration-150"
      style={{ transform: `translate(${position.x - 140}px, ${position.y - 140}px)` }}
      aria-hidden="true"
    />
  );
};

export default CursorGlow;
