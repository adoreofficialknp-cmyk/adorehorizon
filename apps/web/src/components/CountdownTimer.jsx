
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-3 text-sm font-medium">
      <div className="flex flex-col items-center"><span className="text-lg font-bold">{timeLeft.days}</span><span className="text-[10px] uppercase tracking-wider">Days</span></div>
      <span>:</span>
      <div className="flex flex-col items-center"><span className="text-lg font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span><span className="text-[10px] uppercase tracking-wider">Hrs</span></div>
      <span>:</span>
      <div className="flex flex-col items-center"><span className="text-lg font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span><span className="text-[10px] uppercase tracking-wider">Min</span></div>
      <span>:</span>
      <div className="flex flex-col items-center"><span className="text-lg font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span><span className="text-[10px] uppercase tracking-wider">Sec</span></div>
    </div>
  );
};

export default CountdownTimer;
