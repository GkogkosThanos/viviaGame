"use client";

import { useEffect, useState } from "react";

interface IntroScreenProps {
  onNext: () => void;
}

export default function IntroScreen({ onNext }: IntroScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    const timeout = setTimeout(() => {
      onNext();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onNext]);

  return (
    <div className="text-center animate-pulse">
      <div className="text-6xl mb-8 animate-float">💕</div>
      <h1 className="text-4xl font-bold text-romantic-red mb-4">
        QR Scan Complete!
      </h1>
      <p className="text-2xl text-romantic-rose">
        Starting your journey{dots}
      </p>
    </div>
  );
}
