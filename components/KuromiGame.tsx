"use client";

import { useState, useEffect, useRef } from "react";

interface Vector2 {
  x: number;
  y: number;
}

interface Target {
  id: number;
  position: Vector2;
  hit: boolean;
  isFinal: boolean;
  emoji: string;
  photoUrl?: string;
}

interface Arrow {
  position: Vector2;
  velocity: Vector2;
  active: boolean;
}

const KUROMI_X = 60;
const GRAVITY = 0.2;
const MAX_POWER = 20;
const WORLD_WIDTH = 5000; // Total world width (increased for landscape)

export default function KuromiGame() {
  const [stage, setStage] = useState<"start" | "intro1" | "intro2" | "game">("start");
  const [dragStart, setDragStart] = useState<Vector2 | null>(null);
  const [screenDimensions, setScreenDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 360,
    height: typeof window !== 'undefined' ? window.innerHeight : 640,
  });

  // Update screen dimensions on resize/orientation change
  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const kuromiY = screenDimensions.height - 130; // Position Kuromi near bottom

  // Initial target reveal animation
  useEffect(() => {
    if (stage === "game") {
      setShowingTarget(true);
      // Start focused on target
      const targetX = 1200; // Same as target position
      setCameraX(Math.max(0, targetX - screenDimensions.width / 2));
      setCameraY(0);

      // After 2.5 seconds, slide back to start
      const timer = setTimeout(() => {
        setCameraX(0);
        setCameraY(0);
        setTimeout(() => setShowingTarget(false), 500); // Hide text after transition
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [stage, screenDimensions.width]);
  const [dragCurrent, setDragCurrent] = useState<Vector2 | null>(null);
  const [arrow, setArrow] = useState<Arrow | null>(null);
  const [cameraX, setCameraX] = useState(0); // Camera offset X
  const [cameraY, setCameraY] = useState(0); // Camera offset Y

  // Single target - letter emoji (useMemo to prevent recreating on every render)
  const targets = [
    { id: 1, position: { x: 1200, y: kuromiY - 250 }, hit: false, isFinal: true, emoji: "✉️" },
  ];

  const [targetsHit, setTargetsHit] = useState<number[]>([]);
  const [activeTarget, setActiveTarget] = useState<Target | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Miss counter and miss image display
  const [missCount, setMissCount] = useState(0);
  const [showMissImage, setShowMissImage] = useState<string | null>(null);
  const [showNoButton, setShowNoButton] = useState(true);
  const [showMiddleFinger, setShowMiddleFinger] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const missCountedRef = useRef(false);
  const [showingTarget, setShowingTarget] = useState(false);
  const [showBigEnvelope, setShowBigEnvelope] = useState(false);

  // Physics update loop
  useEffect(() => {
    if (!arrow || !arrow.active) return;

    const interval = setInterval(() => {
      setArrow((prev) => {
        if (!prev || !prev.active) return prev;

        // Update velocity (gravity)
        const newVelocity = {
          x: prev.velocity.x,
          y: prev.velocity.y + GRAVITY,
        };

        // Update position
        const newPosition = {
          x: prev.position.x + newVelocity.x,
          y: prev.position.y + newVelocity.y,
        };

        // Check if arrow hit ground or went too far
        const groundLevel = screenDimensions.height - 100;
        if (newPosition.y > groundLevel || newPosition.x > WORLD_WIDTH || newPosition.x < 0) {
          // Arrow missed - increment miss counter only once
          if (!missCountedRef.current) {
            missCountedRef.current = true;
            setMissCount((prevMiss) => {
              const newMissCount = prevMiss + 1;

              // Show appropriate image based on miss count
              if (newMissCount === 4) {
                setShowMissImage('/VIVI.jpeg');
                setTimeout(() => setShowMissImage(null), 800);
              } else if (newMissCount === 6) {
                setShowMissImage('/xoum.jpeg');
                setTimeout(() => setShowMissImage(null), 800);
              } else if (newMissCount === 9) {
                setShowMissImage('/sortloth.png');
                setTimeout(() => setShowMissImage(null), 800);
              } else if (newMissCount === 15) {
                setShowMissImage('/elGato.jpeg');
                setTimeout(() => setShowMissImage(null), 800);
              }

              return newMissCount;
            });
          }
          return { ...prev, active: false };
        }

        // Check collision with targets
        const hitTarget = targets.find(
          (t) =>
            !targetsHit.includes(t.id) &&
            Math.abs(t.position.x - newPosition.x) < 40 &&
            Math.abs(t.position.y - newPosition.y) < 40
        );

        if (hitTarget) {
          setTargetsHit((prev) => [...prev, hitTarget.id]);
          setActiveTarget(hitTarget);
          setShowBigEnvelope(true);
          return { ...prev, active: false };
        }

        return {
          position: newPosition,
          velocity: newVelocity,
          active: true,
        };
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [arrow?.active, targetsHit, screenDimensions.height, kuromiY]);

  // Camera follows arrow
  useEffect(() => {
    if (arrow && arrow.active) {
      // Follow X axis
      const targetCameraX = Math.max(0, Math.min(arrow.position.x - screenDimensions.width / 2, WORLD_WIDTH - screenDimensions.width));
      setCameraX(targetCameraX);

      // Follow Y axis - keep arrow in view
      const targetCameraY = Math.max(0, Math.min(arrow.position.y - screenDimensions.height / 2, 0));
      setCameraY(targetCameraY);
    } else if (!arrow) {
      // Reset camera when no arrow
      setCameraX(0);
      setCameraY(0);
    }
  }, [arrow?.position.x, arrow?.position.y, screenDimensions.width, screenDimensions.height]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (showPopup) return;

    // Don't start drag if arrow exists
    if (arrow) return;

    // Start drag for new arrow
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    setDragCurrent({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    // Don't update drag if arrow exists, popup showing, or no drag started
    if (!dragStart || showPopup || arrow) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragCurrent({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const handleTouchEnd = () => {
    // IMPORTANT: Don't launch if arrow exists (even if not active) or if popup is showing
    if (!dragStart || !dragCurrent || showPopup || arrow) {
      // Clear drag state
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    // Calculate launch velocity based on drag
    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(distance / 20, MAX_POWER) * 1.8; // Increased speed multiplier

    const angle = Math.atan2(dy, dx);
    const velocityX = Math.cos(angle) * power;
    const velocityY = Math.sin(angle) * power;

    // Reset miss counter flag for new arrow
    missCountedRef.current = false;

    // Launch arrow from Kuromi's position
    setArrow({
      position: { x: KUROMI_X + 30, y: kuromiY },
      velocity: { x: velocityX, y: velocityY },
      active: true,
    });

    setDragStart(null);
    setDragCurrent(null);
  };

  const handleYesClick = () => {
    setShowPopup(false);
    setShowFinalModal(true);
  };

  const handleNoClick = () => {
    setShowMiddleFinger(true);
    setTimeout(() => {
      setShowMiddleFinger(false);
      setShowNoButton(false);
    }, 1000);
  };

  // Calculate aim line
  const getAimLine = () => {
    if (!dragStart || !dragCurrent) return null;

    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 150);
    const angle = Math.atan2(dy, dx);

    return {
      x1: KUROMI_X + 30 - cameraX,
      y1: kuromiY - cameraY,
      x2: KUROMI_X + 30 - cameraX + Math.cos(angle) * distance,
      y2: kuromiY - cameraY + Math.sin(angle) * distance,
      power: Math.min(distance / 150, 1),
    };
  };

  const aimLine = getAimLine();

  // Start Screen
  if (stage === "start") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900">
        <div className="text-center">
          <button
            onClick={() => setStage("intro1")}
            className="px-12 py-4 bg-purple-600 hover:bg-purple-700 text-white text-2xl font-bold rounded-xl transition-all hover:scale-110 shadow-2xl"
          >
            START
          </button>
        </div>
      </div>
    );
  }

  // First Intro Message
  if (stage === "intro1") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 p-4">
        <div className="max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💌</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Καλημέρα Βιβία. Πλύνε το πρόσωπο, τα δόντια σου και πιάσε το τόξο σου και λίγα βέλη (δεν θα χρειαστείς πολλά αφού πλέον είσαι gamer με το nintendo σου).
          </p>
          <button
            onClick={() => setStage("intro2")}
            className="px-10 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-xl transition-all hover:scale-110 shadow-lg"
          >
            READY!
          </button>
        </div>
      </div>
    );
  }

  // Second Intro Message
  if (stage === "intro2") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 p-4">
        <div className="max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🤨</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Όχι όντως μη κάθεσαι όρθια μπροστά στον καθρέφτη με την τσίμπλα, πλύσου κάτσε κλπ.
          </p>
          <button
            onClick={() => setStage("game")}
            className="px-10 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-xl transition-all hover:scale-110 shadow-lg"
          >
            ΟΝΤΩΣ READY!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 p-2 sm:p-4">
      {/* Golden Ornate Frame */}
      <div
        className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{
          boxShadow: `
            inset 0 0 0 2px #D4AF37,
            inset 0 0 0 4px #8B7500,
            inset 0 0 0 8px #FFD700,
            inset 0 0 0 10px #DAA520,
            inset 0 0 20px rgba(212, 175, 55, 0.5),
            0 0 40px rgba(255, 215, 0, 0.3),
            0 8px 32px rgba(0, 0, 0, 0.5)
          `,
          background: 'linear-gradient(135deg, #8B7500 0%, #FFD700 25%, #D4AF37 50%, #FFD700 75%, #8B7500 100%)',
          padding: '8px',
          maxWidth: '100vw',
          maxHeight: '100vh',
        }}
      >
        {/* Inner Frame */}
        <div
          className="w-full h-full rounded-2xl overflow-hidden"
          style={{
            boxShadow: `
              inset 0 0 0 1px #D4AF37,
              inset 0 2px 8px rgba(0, 0, 0, 0.3)
            `,
          }}
        >
          {/* Game Canvas */}
          <div
            className="relative bg-gradient-to-b from-sky-300 via-blue-200 to-green-200 overflow-hidden cursor-crosshair w-full h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
          {/* Sky background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-blue-100" />

          {/* Ground */}
          <div
            className="absolute bottom-0 w-full h-32 bg-gradient-to-b from-green-300 to-green-400"
            style={{
              transform: `translate(${-cameraX}px, ${-cameraY}px)`,
              width: WORLD_WIDTH,
              transition: showingTarget ? 'transform 1s ease-in-out' : 'none'
            }}
          />

          {/* Ground decorations */}
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={`grass-${i}`}
              className="absolute text-2xl"
              style={{
                left: i * 50 - cameraX,
                bottom: (i % 3) * 15 + 10 - cameraY,
                transition: showingTarget ? 'all 1s ease-in-out' : 'none'
              }}
            >
              🌿
            </div>
          ))}

          {/* Targets */}
          {targets.map((target) => {
            const isHit = targetsHit.includes(target.id);
            return (
              <div
                key={target.id}
                className="absolute"
                style={{
                  left: target.position.x - cameraX - 30,
                  top: target.position.y - cameraY - 30,
                  opacity: isHit ? 0.3 : 1,
                  transition: showingTarget ? 'all 1s ease-in-out' : 'opacity 0.3s'
                }}
              >
                <div className={`text-6xl ${!isHit ? 'animate-pulse' : ''}`}>
                  {isHit ? "✅" : target.emoji}
                </div>
              </div>
            );
          })}

          {/* Kuromi (archer) */}
          <div
            className="absolute z-20"
            style={{
              left: KUROMI_X - cameraX - 30,
              top: kuromiY - cameraY - 60,
              width: 60,
              height: 60,
              transition: showingTarget ? 'all 1s ease-in-out' : 'none'
            }}
          >
            <img
              src="/kuromi.png"
              alt="Kuromi"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML = '<div class="text-6xl">💜</div>';
                }
              }}
            />
            {/* Bow indicator */}
            <div className="absolute -right-2 top-1/2 text-3xl">🏹</div>
          </div>

          {/* Aim line */}
          {aimLine && (
            <>
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                style={{ overflow: 'visible' }}
              >
                <line
                  x1={aimLine.x1}
                  y1={aimLine.y1}
                  x2={aimLine.x2}
                  y2={aimLine.y2}
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  opacity={aimLine.power}
                />
              </svg>
            </>
          )}

          {/* Arrow in flight */}
          {arrow && arrow.active && (
            <div
              className="absolute z-30 transition-transform"
              style={{
                left: arrow.position.x - cameraX - 15,
                top: arrow.position.y - cameraY - 5,
                transform: `rotate(${Math.atan2(arrow.velocity.y, arrow.velocity.x)}rad)`,
              }}
            >
              <div className="text-2xl">➤</div>
            </div>
          )}

          {/* HUD Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 px-6 py-3 rounded-lg z-30">
            <div className="text-sm font-bold text-white">
              Misses: {missCount}
            </div>
          </div>

          <div className="absolute top-4 left-4 bg-black/60 px-4 py-2 rounded-lg z-30">
            <div className="text-xs text-white">
              {arrow?.active ? "🏹 Arrow flying..." : "👆 Drag to aim and release!"}
            </div>
          </div>

          {/* Power indicator */}
          {aimLine && (
            <div className="absolute top-4 right-4 bg-black/60 px-3 py-2 rounded-lg z-30">
              <div className="text-xs font-bold text-white">
                POWER: {Math.round(aimLine.power * 100)}%
              </div>
              <div className="w-24 h-2 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${aimLine.power * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Target Intro Text */}
          {showingTarget && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none">
              <div className="text-center animate-pulse">
                <h2 className="text-4xl font-bold text-white bg-black/60 px-8 py-4 rounded-2xl">
                  Aim for the envelope cookie
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Reset Overlay - when arrow has landed */}
      {arrow && !arrow.active && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-40">
          <button
            onClick={() => {
              setArrow(null);
              setCameraX(0);
              setCameraY(0);
            }}
            className="text-4xl font-bold text-white hover:scale-110 transition-transform"
          >
            Tap to Retry
          </button>
        </div>
      )}

      {/* Miss Image Popup */}
      {showMissImage && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <h1 className="text-6xl font-bold text-white mb-6">Bruh</h1>
          <img
            src={showMissImage}
            alt="Miss"
            className="max-w-[90%] max-h-[70%] object-contain rounded-2xl"
          />
        </div>
      )}

      {/* Middle Finger Popup */}
      {showMiddleFinger && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
          <div className="text-[40vh] animate-pulse">🖕</div>
        </div>
      )}

      {/* Big Envelope Popup - Click to reveal */}
      {showBigEnvelope && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
          <button
            onClick={() => {
              setShowBigEnvelope(false);
              setShowPopup(true);
            }}
            className="text-[40vh] animate-pulse hover:scale-110 transition-transform"
          >
            ✉️
          </button>
        </div>
      )}

      {/* Success Modal - Will you be my valentine? */}
      {showPopup && activeTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl p-6 max-w-sm w-full mx-4 border-2 border-purple-500">
            <div className="text-center">
              <img
                src="/cute.jpeg"
                alt="Will you be my valentine?"
                className="w-full h-64 object-cover rounded-2xl mb-4"
              />
              <h2 className="text-3xl font-bold text-white mb-6">
                Will you be my valentine? ❤️
              </h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleYesClick}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-2xl transition-all hover:scale-110"
                >
                  YES
                </button>
                {showNoButton && (
                  <button
                    onClick={handleNoClick}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-2xl transition-all hover:scale-110"
                  >
                    NO
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Modal - See you on 14/02 */}
      {showFinalModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl p-6 max-w-sm w-full mx-4 border-2 border-purple-500">
            <div className="text-center">
              <img
                src="/ceeu.jpeg"
                alt="See you on 14/02"
                className="w-full h-64 object-cover rounded-2xl mb-4"
              />
              <h2 className="text-3xl font-bold text-white">
                See you on 14/02 bee &lt;3
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
