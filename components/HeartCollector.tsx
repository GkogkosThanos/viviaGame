"use client";

import { useState, useEffect } from "react";

interface Heart {
  id: number;
  left: number;
  delay: number;
}

interface HeartCollectorProps {
  onNext: () => void;
  onScore: (points: number) => void;
}

export default function HeartCollector({ onNext, onScore }: HeartCollectorProps) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const target = 10;

  useEffect(() => {
    // Generate random hearts
    const heartInterval = setInterval(() => {
      const newHeart: Heart = {
        id: Date.now(),
        left: Math.random() * 80 + 10, // 10-90% from left
        delay: 0,
      };
      setHearts((prev) => [...prev, newHeart]);
    }, 1000);

    // Countdown timer
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(heartInterval);
          clearInterval(timerInterval);
          setTimeout(() => onNext(), 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(heartInterval);
      clearInterval(timerInterval);
    };
  }, [onNext]);

  const collectHeart = (id: number) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
    setCollected((prev) => prev + 1);
    onScore(5);
  };

  return (
    <div className="max-w-2xl w-full h-[600px] bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 relative overflow-hidden">
      <div className="text-center mb-4 relative z-10">
        <h2 className="text-3xl font-bold text-romantic-red mb-2">
          Catch the Hearts! 💕
        </h2>
        <div className="flex justify-between text-xl">
          <span className="text-romantic-rose">
            Collected: {collected}/{target}
          </span>
          <span className="text-romantic-rose">Time: {timeLeft}s</span>
        </div>
      </div>

      {/* Falling hearts */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute top-0 cursor-pointer z-20 animate-fall"
          style={{
            left: `${heart.left}%`,
            animation: "fall 4s linear forwards",
          }}
          onClick={() => collectHeart(heart.id)}
        >
          <span className="text-5xl heart">💖</span>
        </div>
      ))}

      {/* End message */}
      {timeLeft === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-30">
          <div className="text-center">
            <p className="text-3xl font-bold text-romantic-red mb-2">
              Amazing! 🎉
            </p>
            <p className="text-xl text-romantic-rose">
              You collected {collected} hearts!
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(-50px);
            opacity: 1;
          }
          to {
            transform: translateY(600px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
