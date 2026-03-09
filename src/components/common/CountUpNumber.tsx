import React, { useEffect, useState, useRef } from 'react';

interface Props {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export default function CountUpNumber({ 
  target, 
  duration = 2000, 
  prefix = "", 
  suffix = "", 
  className = "",
  decimals = 0
}: Props) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startRef = useRef<number | null>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          requestAnimationFrame(updateCounter);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [target, duration]);

  const updateCounter = (timestamp: number) => {
    if (!startRef.current) startRef.current = timestamp;
    const progress = Math.min((timestamp - startRef.current) / duration, 1);
    
    // easeOutCubic
    const eased = 1 - Math.pow(1 - progress, 3);
    
    const currentVal = target * eased;
    setValue(currentVal);
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      setValue(target);
    }
  };

  const formattedValue = decimals > 0 
    ? value.toFixed(decimals) 
    : Math.floor(value).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
