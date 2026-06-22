'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date;
  locale: 'he' | 'en';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ targetDate, locale }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const isRTL = locale === 'he';

  const t = {
    he: {
      days: 'ימים',
      hours: 'שעות',
      minutes: 'דקות',
      seconds: 'שניות',
      startsIn: 'מתחיל בעוד',
    },
    en: {
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      seconds: 'seconds',
      startsIn: 'Starts in',
    },
  }[locale];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - Date.now();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({
    value,
    label,
  }: {
    value: number;
    label: string;
  }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[60px]">
        <span className="text-3xl font-bold text-white tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-white/60 text-xs mt-1">{label}</span>
    </div>
  );

  return (
    <div
      className="text-center"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <p className="text-white/70 text-sm mb-4">{t.startsIn}</p>
      <div className="flex justify-center gap-3">
        {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label={t.days} />}
        <TimeUnit value={timeLeft.hours} label={t.hours} />
        <TimeUnit value={timeLeft.minutes} label={t.minutes} />
        <TimeUnit value={timeLeft.seconds} label={t.seconds} />
      </div>
    </div>
  );
}
