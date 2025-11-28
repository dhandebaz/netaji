
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "BREAKING: Counting begins in 543 constituencies.",
  "UPDATE: High voter turnout recorded in West Bengal (78%).",
  "TREND: Urban constituencies showing swing towards opposition.",
  "RESULT: First win declared in Sikkim - SKM retains power.",
  "ALERT: Close contest in Mumbai North Central, margin < 500 votes."
];

const LiveTicker: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-800 text-white border-b border-slate-700 overflow-hidden whitespace-nowrap py-2 px-4 flex items-center gap-4 sticky top-14 lg:top-16 z-40 shadow-md">
        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 animate-pulse">Live Feed</span>
        <div className="inline-block text-xs font-medium font-mono animate-in slide-in-from-bottom-2 duration-500 key={index}">
            {MESSAGES[index]}
        </div>
    </div>
  );
};

export default LiveTicker;
