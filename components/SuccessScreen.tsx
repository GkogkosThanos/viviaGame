"use client";

import { useEffect, useState } from "react";

interface SuccessScreenProps {
  score: number;
}

export default function SuccessScreen({ score }: SuccessScreenProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    // Generate confetti
    const colors = ["#8B5CF6", "#6366F1", "#3B82F6", "#06B6D4", "#A78BFA"];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(newConfetti);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900">
      <div className="max-w-2xl w-full bg-slate-800/90 backdrop-blur rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden border-2 border-purple-500">
        {/* Confetti */}
        {confetti.map((conf) => (
          <div
            key={conf.id}
            className="confetti"
            style={{
              left: `${conf.left}%`,
              backgroundColor: conf.color,
              animationDelay: `${conf.delay}s`,
            }}
          />
        ))}

        <div className="relative z-10">
          <div className="text-9xl mb-6 animate-pulse">💎</div>

          <h1 className="text-6xl font-bold text-white mb-6">
            YESSS! 🎉
          </h1>

          <p className="text-3xl text-purple-300 mb-8 font-semibold">
            You made me the happiest person! 💕
          </p>

          <div className="bg-purple-900/30 rounded-2xl p-6 mb-8">
            <p className="text-2xl text-gray-200 mb-4">
              After 8 wonderful years together,
            </p>
            <p className="text-2xl text-gray-200 mb-4">
              countless memories, endless laughter,
            </p>
            <p className="text-2xl text-gray-200">
              and infinite love...
            </p>
          </div>

          <div className="text-8xl mb-6">❤️</div>

          <p className="text-4xl font-bold text-white mb-4">
            Happy Valentine's Day!
          </p>

          <div className="flex gap-4 justify-center text-5xl mt-8 animate-pulse">
            <span>💕</span>
            <span>💖</span>
            <span>💗</span>
            <span>💓</span>
            <span>💝</span>
          </div>

          <p className="text-2xl text-purple-300 mt-8 italic">
            I love you more than words can say! 💕
          </p>
        </div>
      </div>
    </div>
  );
}
