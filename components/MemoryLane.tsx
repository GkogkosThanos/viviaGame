"use client";

import { useState } from "react";

interface MemoryLaneProps {
  onNext: () => void;
  onScore: (points: number) => void;
}

const questions = [
  {
    question: "How many years have we been together?",
    options: ["5 years", "6 years", "8 years", "10 years"],
    correct: 2, // index of "8 years"
  },
  {
    question: "What's our favorite thing to do together?",
    options: ["Travel", "Cook", "Watch movies", "Everything!"],
    correct: 3, // "Everything!" is always the right answer 😄
  },
  {
    question: "What makes our love special?",
    options: ["Trust", "Laughter", "Understanding", "All of the above"],
    correct: 3,
  },
];

export default function MemoryLane({ onNext, onScore }: MemoryLaneProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswer = (index: number) => {
    const correct = index === questions[currentQuestion].correct;
    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      onScore(10);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setAnswered(false);
      } else {
        onNext();
      }
    }, 1500);
  };

  return (
    <div className="max-w-2xl w-full bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 animate-float">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-romantic-red mb-2">
          Memory Lane 💭
        </h2>
        <p className="text-romantic-rose">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl text-center mb-6 text-gray-800">
          {questions[currentQuestion].question}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => !answered && handleAnswer(index)}
              disabled={answered}
              className={`p-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105
                ${
                  answered
                    ? index === questions[currentQuestion].correct
                      ? "bg-green-500 text-white"
                      : isCorrect || index !== questions[currentQuestion].correct
                      ? "bg-gray-300"
                      : "bg-red-500 text-white"
                    : "bg-romantic-pink hover:bg-romantic-rose text-white"
                }
                ${answered ? "cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {answered && (
        <div className="text-center">
          <p
            className={`text-2xl font-bold ${
              isCorrect ? "text-green-600" : "text-romantic-rose"
            }`}
          >
            {isCorrect ? "Perfect! 💕" : "Nice try! 💖"}
          </p>
        </div>
      )}
    </div>
  );
}
