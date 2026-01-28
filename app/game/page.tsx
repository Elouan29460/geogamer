"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import gamesData from "@/data/games.json";

const PanoramaViewer = dynamic(() => import("@/components/PanoramaViewer"), {
  ssr: false,
});

type GamePhase = "guessing" | "locating" | "result";

interface Game {
  id: string;
  correctName: string;
  alternativeNames: string[];
  imageFile: string;
  mapFile: string;
  coverFile?: string;
  mapLocation: { x: number; y: number };
}

export default function GamePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const levelId = parseInt(searchParams.get("level") || "1");
  
  const [phase, setPhase] = useState<GamePhase>("guessing");
  const [timer, setTimer] = useState(60);
  const [attempts, setAttempts] = useState(3);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [gameFound, setGameFound] = useState(false);
  const [message, setMessage] = useState("");
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gamesCompleted, setGamesCompleted] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showPoints, setShowPoints] = useState<number | null>(null);
  const [pointsFading, setPointsFading] = useState(false);
  const [locationScore, setLocationScore] = useState(0);
  const [animatedLocationScore, setAnimatedLocationScore] = useState(0);
  const [roundsFound, setRoundsFound] = useState<boolean[]>(Array(15).fill(false));
  
  // Récupérer les jeux du palier actuel
  const currentLevel = gamesData.levels.find(l => l.id === levelId);
  const games: Game[] = currentLevel?.games || [];
  const currentGame = games[currentGameIndex];
  
  const correctGame = currentGame?.correctName || "The Witcher 3";
  const correctLocation = currentGame?.mapLocation || { x: 50, y: 50 };
  const alternativeNames = currentGame?.alternativeNames || [];
  
  // Animation du score de localisation
  useEffect(() => {
    if (phase === "result" && locationScore > 0) {
      setAnimatedLocationScore(0);
      const duration = 1000; // 1 seconde
      const steps = 60;
      const increment = locationScore / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setAnimatedLocationScore(locationScore);
          clearInterval(timer);
        } else {
          setAnimatedLocationScore(Math.round(increment * currentStep));
        }
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [phase, locationScore]);
  
  // Timer
  useEffect(() => {
    if (timer > 0 && phase !== "result") {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && phase !== "result") {
      handleTimeOut();
    }
  }, [timer, phase]);
  
  const handleTimeOut = () => {
    setPhase("result");
    setMessage("⏱️ Temps écoulé ! Le jeu était : " + correctGame);
  };
  
  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userGuess = guess.toLowerCase().trim();
    const isCorrect = alternativeNames.some(name => name.toLowerCase() === userGuess);
    
    if (isCorrect) {
      // Jeu trouvé ! 100 points pour le palier 1
      const points = 100;
      setRoundScore(points);
      setScore(score + points);
      setGameFound(true);
      // Marquer ce round comme trouvé
      const newRoundsFound = [...roundsFound];
      newRoundsFound[currentGameIndex] = true;
      setRoundsFound(newRoundsFound);
      setPhase("locating");
      
      // Afficher les points pendant 1 seconde
      setShowPoints(points);
      setPointsFading(false);
      setTimeout(() => {
        setPointsFading(true);
        setTimeout(() => {
          setShowPoints(null);
          setPointsFading(false);
        }, 300);
      }, 700);
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      
      // Animation de mauvaise réponse
      setWrongAnswer(true);
      setTimeout(() => setWrongAnswer(false), 600);
      
      if (newAttempts === 0) {
        setPhase("result");
        setMessage(`❌ Perdu ! Le jeu était : ${correctGame}`);
      }
    }
    
    setGuess("");
  };
  
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return; // Ne pas placer de marqueur pendant le drag
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Placer le marqueur
    setMarkerPosition({ x, y });
  };

  const handleMapWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMapZoom(prev => Math.max(1, Math.min(3, prev + delta)));
  };

  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mapZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - mapPan.x, y: e.clientY - mapPan.y });
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && mapZoom > 1) {
      setMapPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMapMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleValidateLocation = () => {
    if (!markerPosition) return;
    
    // Calculer la distance
    const distance = Math.sqrt(
      Math.pow(markerPosition.x - correctLocation.x, 2) + Math.pow(markerPosition.y - correctLocation.y, 2)
    );
    
    // Points selon la distance (0-100 points)
    // Distance max considérée: 100% (diagonale de l'écran = ~141)
    // Formule: plus on est proche, plus on a de points
    const maxDistance = 100; // Distance à partir de laquelle on a 0 points
    let locationPoints = Math.max(0, Math.min(100, Math.round(100 - (distance / maxDistance) * 100)));
    
    setLocationScore(locationPoints);
    setScore(score + locationPoints);
    setPhase("result");
    setMessage(`📍 Distance: ${distance.toFixed(1)}% - +${locationPoints} points !`);
  };
  
  const handleNextRound = () => {
    const nextIndex = currentGameIndex + 1;
    
    // Si on a fini les 10 jeux du palier
    if (nextIndex >= games.length) {
      // Passer au palier suivant
      const nextLevel = levelId + 1;
      if (nextLevel <= 4) {
        router.push(`/level/${nextLevel}`);
      } else {
        // Tous les paliers terminés
        router.push(`/`);
      }
      return;
    }
    
    // Sinon, passer au jeu suivant
    setCurrentGameIndex(nextIndex);
    setGamesCompleted(gamesCompleted + 1);
    setPhase("guessing");
    setTimer(60);
    setAttempts(3);
    setGameFound(false);
    setMessage("");
    setRoundScore(0);
    setMarkerPosition(null);
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Informations en haut à droite */}
      <div className="fixed top-8 right-8 z-40 bg-black/70 backdrop-blur-md border border-purple-500/30 rounded-lg px-6 py-3">
        <div className="space-y-1">
          <div className="text-purple-400 text-sm font-semibold">
            Palier {levelId}
          </div>
          <div className="text-white text-lg font-bold">
            Jeu {currentGameIndex + 1}/15
          </div>
          <div className="text-gray-300 text-sm">
            Score: <span className="text-white font-semibold">{score}</span>
          </div>
        </div>
      </div>

      {/* Screenshot du jeu - PLEIN ÉCRAN */}
      <div className="fixed inset-0 bg-gray-800">
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {currentGame?.imageFile ? (
            <PanoramaViewer 
              imageUrl={`/images/games/${currentGame.imageFile}`} 
              autoRotate={phase === "result"}
            />
          ) : (
            <div className="text-gray-500 text-2xl">
              [Aucune image disponible]
            </div>
          )}
        </div>
      </div>

      {/* OVERLAYS */}
      
      {/* Timer - En haut au milieu */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40">
        <div className="relative w-32 h-32">
          {/* SVG pour les bordures */}
          <svg className="absolute inset-0 w-full h-full -rotate-45" viewBox="0 0 100 100">
            {/* Bordure blanche de base */}
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              fill="none"
              stroke="white"
              strokeWidth="4"
            />
            {/* Bordure rouge qui progresse */}
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              fill="none"
              stroke="rgb(220, 38, 38)"
              strokeWidth="4"
              strokeDasharray="384"
              strokeDashoffset="384"
              style={{
                animation: phase !== "result" ? 'timer-progress 60s linear forwards' : 'none',
                animationPlayState: phase !== "result" ? 'running' : 'paused'
              }}
            />
          </svg>
          
          {/* Losange transparent avec le timer */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 flex items-center justify-center">
              <div className={`text-6xl font-bold transition-all duration-300 ${
                timer <= 10 
                  ? 'text-red-400 animate-pulse drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]' 
                  : 'text-white'
              }`}>
                {timer}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des points - Centre de l'écran */}
      {showPoints !== null && (
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-opacity duration-300 ${
          pointsFading ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="text-6xl font-bold text-white animate-pulse">
            + {showPoints}
          </div>
        </div>
      )}

      {/* Message de feedback - En haut (seulement pour résultat final) */}
      {message && phase !== "guessing" && !showPoints && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-40">
          <div className={`px-6 py-3 rounded-lg backdrop-blur-md ${
            message.includes('Bravo') || message.includes('points') 
              ? 'bg-green-500/90 border border-green-400 text-white'
              : 'bg-red-500/90 border border-red-400 text-white'
          }`}>
            <p className="font-semibold">{message}</p>
          </div>
        </div>
      )}

      {/* Phase 1: Deviner le jeu - Champ en bas au milieu */}
      {phase === "guessing" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
          {/* Indicateur d'essais - 3 ronds */}
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i <= attempts 
                    ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' 
                    : 'bg-gray-600/30'
                }`}
              />
            ))}
          </div>
          
          <form onSubmit={handleGuessSubmit}>
            <div className="relative">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Entrez le nom du jeu..."
                className={`w-full px-6 py-4 pr-16 bg-black/70 backdrop-blur-md border rounded-full text-white placeholder-gray-400 focus:outline-none text-xl font-sans tracking-wide text-center transition-all duration-300 ${
                  wrongAnswer 
                    ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-[shake_0.3s_ease-in-out]' 
                    : 'border-purple-500/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                }`}
                autoFocus
              />
              {guess.trim() && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-full hover:scale-110 transition-transform shadow-lg"
                >
                  &gt;
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Phase 2: Carte de localisation - En bas à droite */}
      {phase === "locating" && (
        <div className="fixed bottom-8 right-8 z-40 w-full max-w-xs group">
          <div className="transition-all duration-300 opacity-60 scale-90 group-hover:opacity-100 group-hover:scale-150 group-hover:origin-bottom-right">
            <div 
              onClick={handleMapClick}
              onWheel={handleMapWheel}
              onMouseDown={handleMapMouseDown}
              onMouseMove={handleMapMouseMove}
              onMouseUp={handleMapMouseUp}
              onMouseLeave={handleMapMouseUp}
              className={`relative aspect-video bg-gray-700 rounded-xl border-2 border-purple-500/50 transition-colors overflow-hidden ${
                mapZoom > 1 ? 'cursor-move' : 'cursor-crosshair hover:border-purple-400'
              }`}
            >
              {currentGame?.mapFile ? (
                <>
                  <img 
                    src={`/images/maps/${currentGame.mapFile}`}
                    alt="Carte du jeu"
                    className="w-full h-full object-cover pointer-events-none select-none"
                    style={{
                      transform: `scale(${mapZoom}) translate(${mapPan.x / mapZoom}px, ${mapPan.y / mapZoom}px)`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                    }}
                  />
                  {/* Marqueur */}
                  {markerPosition && (
                    <div 
                      className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 animate-pulse"
                      style={{ 
                        left: `${markerPosition.x}%`, 
                        top: `${markerPosition.y}%` 
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-300 text-center px-4">
                    <p className="font-semibold">Carte du jeu</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bouton Valider */}
            <button
              onClick={handleValidateLocation}
              disabled={!markerPosition}
              className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              Valider
            </button>
          </div>
        </div>
      )}

      {/* Phase 3: Résultat - Centre de l'écran */}
      {phase === "result" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg">
          <div className="p-8 text-center max-w-2xl mx-4">
            {/* Indicateur de rounds en haut */}
            <div className="flex items-center justify-center gap-2 mb-12 -mt-12">
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-all ${
                    i === currentGameIndex 
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(37,99,235,1)]' 
                      : roundsFound[i]
                        ? 'bg-white text-black' 
                        : 'text-white'
                  }`}>
                    {i + 1}
                  </div>
                  {i < 14 && <div className="h-10 w-0.5 bg-white/40"></div>}
                </div>
              ))}
            </div>
            
            {/* Afficher l'image du jeu si perdu */}
            {!gameFound && currentGame?.coverFile && (
              <div className="mb-6">
                <div className="relative w-96 aspect-square mx-auto overflow-hidden border-4 border-white bg-gray-800">
                  <img 
                    src={`/images/covers/${currentGame.coverFile}`}
                    alt={correctGame}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Afficher la carte avec les points si une localisation a été tentée */}
            {markerPosition && currentGame?.mapFile && (
              <div className="mb-6">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-purple-500/30">
                  <img 
                    src={`/images/maps/${currentGame.mapFile}`}
                    alt="Carte du jeu"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Ligne pointillée entre les deux points */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                      x1={`${markerPosition.x}%`}
                      y1={`${markerPosition.y}%`}
                      x2={`${correctLocation.x}%`}
                      y2={`${correctLocation.y}%`}
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray="8,6"
                      opacity="1"
                    />
                  </svg>
                  
                  {/* Point du joueur (bleu) */}
                  <div 
                    className="absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: `${markerPosition.x}%`, 
                      top: `${markerPosition.y}%` 
                    }}
                  />
                  
                  {/* Vrai point (vert) */}
                  <div 
                    className="absolute w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 animate-pulse"
                    style={{ 
                      left: `${correctLocation.x}%`, 
                      top: `${correctLocation.y}%` 
                    }}
                  />
                </div>
                
                {/* Total des points et barre de score pour la localisation */}
                <div className="mt-4">
                  <div className="text-white font-bold text-3xl mb-2">+{roundScore + animatedLocationScore} points</div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">0</span>
                    <div className="flex-1 h-3 bg-gray-700/50 rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-100 ease-out"
                        style={{ width: `${animatedLocationScore}%` }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm">{levelId * 100}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Afficher la barre même si pas de carte mais jeu perdu */}
            {!markerPosition && !gameFound && (
              <div className="mb-6">
                {/* Total des points et barre de score pour la localisation */}
                <div className="mt-4">
                  <div className="text-white font-bold text-3xl mb-2">+0 points</div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">0</span>
                    <div className="flex-1 h-3 bg-gray-700/50 rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-100 ease-out"
                        style={{ width: '0%' }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm">{levelId * 100}</span>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleNextRound}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              Round suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
