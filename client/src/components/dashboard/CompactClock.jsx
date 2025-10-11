import React, { useState, useEffect } from 'react';
import { MdOutlineAccessTime } from 'react-icons/md';

const CompactClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = new Intl.DateTimeFormat('es-ES', { 
      hour: '2-digit', minute: '2-digit', hour12: false 
  }).format(time);

  return (
    // --- CORRECCIÓN: Usamos texto blanco para el contraste ---
    <div className="flex items-center gap-2 text-white/90">
      <MdOutlineAccessTime size={20} />
      <span className="font-bold text-sm">{formattedTime}</span>
    </div>
  );
};

export default CompactClock;