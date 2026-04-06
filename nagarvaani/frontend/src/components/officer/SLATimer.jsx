import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { differenceInSeconds, isPast } from 'date-fns';

export default function SLATimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isBreached, setIsBreached] = useState(false);

  useEffect(() => {
    if (!deadline) return;

    const calculate = () => {
      const diff = differenceInSeconds(new Date(deadline), new Date());
      setTimeLeft(diff);
      setIsBreached(isPast(new Date(deadline)));
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTimerStyles = () => {
    if (isBreached) return "text-crimson bg-crimson-light border-crimson animate-pulse";
    if (timeLeft < 3600) return "text-crimson bg-crimson-light border-crimson"; // < 1 hour
    if (timeLeft < 7200) return "text-amber bg-amber-light border-amber"; // < 2 hours
    return "text-status-primary bg-gray-50 border-border";
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${getTimerStyles()}`}>
      {isBreached ? <AlertTriangle size={14} /> : <Clock size={14} />}
      <span>{isBreached ? "BREACHED" : formatTime(timeLeft)}</span>
    </div>
  );
}
