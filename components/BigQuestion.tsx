"use client";

import { useState } from "react";

interface BigQuestionProps {
  onYes: () => void;
}

export default function BigQuestion({ onYes }: BigQuestionProps) {
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [noButtonStyle, setNoButtonStyle] = useState({ top: "50%", left: "60%" });

  const handleNoClick = () => {
    // Make the NO button run away! 😄
    const randomTop = Math.random() * 60 + 20;
    const randomLeft = Math.random() * 60 + 20;
    setNoButtonStyle({ top: `${randomTop}%`, left: `${randomLeft}%` });
    setShowWrongAnswer(true);
    setTimeout(() => setShowWrongAnswer(false), 1500);
  };

  return (
    <div className="max-w-2xl w-full bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden">
      {/* Floating hearts background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            💕
          </div>
        ))}
      </div>

      <div className="relative z-10">
        <div className="text-8xl mb-6 animate-pulse-slow">💖</div>

        <h2 className="text-5xl font-bold text-romantic-red mb-4 animate-float">
          Will You
        </h2>
        <h2 className="text-6xl font-bold text-romantic-rose mb-8">
          Be My Valentine?
        </h2>

        <p className="text-xl text-gray-600 mb-12">
          After 8 amazing years together...
        </p>

        <div className="relative h-32">
          {/* YES button - stays in place */}
          <button
            onClick={onYes}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 -ml-32
              px-12 py-6 bg-romantic-rose hover:bg-romantic-red text-white text-3xl font-bold
              rounded-2xl transition-all hover:scale-110 shadow-lg"
          >
            YES! 💕
          </button>

          {/* NO button - runs away! */}
          <button
            onClick={handleNoClick}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
              px-12 py-6 bg-gray-400 hover:bg-gray-500 text-white text-3xl font-bold
              rounded-2xl shadow-lg"
            style={{
              top: noButtonStyle.top,
              left: noButtonStyle.left,
            }}
          >
            NO
          </button>
        </div>

        {showWrongAnswer && (
          <p className="mt-8 text-2xl text-romantic-rose animate-pulse font-bold">
            Wrong answer! Try again! 😄
          </p>
        )}
      </div>
    </div>
  );
}
