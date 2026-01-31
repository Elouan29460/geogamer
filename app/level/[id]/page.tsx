"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import VantaBackground from "@/components/VantaBackground";
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['900'] });

const levelData = [
  { id: 1, name: "Palier 1", difficulty: "Facile", description: "Jeux iconiques pour commencer en douceur" },
  { id: 2, name: "Palier 2", difficulty: "Moyen", description: "Des jeux plus subtils à identifier" },
  { id: 3, name: "Palier 3", difficulty: "Difficile", description: "Pour les vrais connaisseurs" },
  { id: 4, name: "Palier 4", difficulty: "Expert", description: "Le défi ultime pour les experts" },
];

export default function LevelIntroPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = parseInt(params.id as string);
  const level = levelData.find(l => l.id === levelId);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Déclencher l'animation après le montage
    setAnimate(true);
  }, []);

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <VantaBackground />
        <div className="text-white text-2xl relative z-10">Palier introuvable</div>
      </div>
    );
  }

  const handleStart = () => {
    router.push(`/game?level=${levelId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <VantaBackground />
      
      {/* Brouillard bleu et rouge */}
      <div className="absolute inset-[-50%] animate-[fog-move_16s_ease-in-out_infinite]" style={{
        background: `
          radial-gradient(circle at 35% 40%, rgba(220, 38, 38, 0.3) 0%, rgba(220, 38, 38, 0.1) 30%, transparent 60%)
        `
      }} />
      <div className="absolute inset-[-50%] animate-[fog-move-reverse_24s_ease-in-out_infinite]" style={{
        background: `
          radial-gradient(circle at 65% 60%, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 30%, transparent 60%)
        `
      }} />
      <div className="absolute inset-[-50%] animate-[fog-move-slow_30s_ease-in-out_infinite]" style={{
        background: `
          radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.08) 35%, transparent 70%)
        `
      }} />
      
      {/* Main Content */}
      <div className="max-w-2xl w-full relative z-10">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-12 text-center">
            {/* Titre */}
            <div className="relative inline-block mb-6">
              <h2 className={`text-6xl font-extrabold text-white tracking-wider ${orbitron.className}`}
                  style={{
                    animation: animate ? 'cyberpunk-glitch 3s infinite' : 'none'
                  }}>
                {level.name}
              </h2>
              <h2 className={`text-6xl font-extrabold text-white tracking-wider absolute top-0 left-0 ${orbitron.className}`}
                  style={{
                    animation: animate ? 'glitch-clip 9s infinite linear alternate-reverse' : 'none',
                    textShadow: '-2px 0 #ff00c1'
                  }}
                  aria-hidden="true">
                {level.name}
              </h2>
              <h2 className={`text-6xl font-extrabold text-white tracking-wider absolute top-0 left-0 ${orbitron.className}`}
                  style={{
                    animation: animate ? 'glitch-clip 6s infinite linear alternate-reverse' : 'none',
                    textShadow: '2px 0 #00fff9'
                  }}
                  aria-hidden="true">
                {level.name}
              </h2>
            </div>

            {/* Description */}
            <p className="text-2xl text-gray-300 mb-8">
              {level.description}
            </p>

            {/* Informations */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-gray-400 text-sm mb-1">Objectif</div>
                <div className="text-white font-bold">10 jeux</div>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-gray-400 text-sm mb-1">Temps</div>
                <div className="text-white font-bold">60s/jeu</div>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                <div className="text-3xl mb-2">🔄</div>
                <div className="text-gray-400 text-sm mb-1">Essais</div>
                <div className="text-white font-bold">3 max</div>
              </div>
            </div>

            {/* Bouton Commencer */}
            <button
              onClick={handleStart}
              className="corner-border-btn corner-border-btn-animated px-12 py-5 text-white text-2xl font-semibold hover:scale-105 transition-transform relative mb-6"
            >
              <span className="red-shine"></span>
              <span className="relative z-20">Commencer</span>
            </button>

            {/* Retour */}
            <div>
              <Link
                href="/"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
    </div>
  );
}
