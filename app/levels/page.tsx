"use client";

import Link from "next/link";
import { useState } from "react";

const levels = [
  { id: 1, name: "Palier 1", difficulty: "Facile", unlocked: true, completed: false },
  { id: 2, name: "Palier 2", difficulty: "Moyen", unlocked: false, completed: false },
  { id: 3, name: "Palier 3", difficulty: "Difficile", unlocked: false, completed: false },
  { id: 4, name: "Palier 4", difficulty: "Expert", unlocked: false, completed: false },
];

export default function LevelsPage() {
  const [levelStates] = useState(levels);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🎮</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              GeoGamer
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-extrabold text-white mb-4">
            Choisissez votre palier
          </h2>
          <p className="text-xl text-gray-300">
            Devinez 10 jeux par palier pour débloquer le suivant
          </p>
        </div>

        {/* Grille de paliers */}
        <div className="grid md:grid-cols-2 gap-6">
          {levelStates.map((level) => (
            <div
              key={level.id}
              className={`relative bg-gray-800/50 backdrop-blur-sm border rounded-2xl p-8 transition-all ${
                level.unlocked
                  ? 'border-purple-500/40 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20'
                  : 'border-gray-700/50 opacity-60'
              }`}
            >
              {/* Badge de difficulté */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
                level.difficulty === 'Facile' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                level.difficulty === 'Moyen' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                level.difficulty === 'Difficile' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {level.difficulty}
              </div>

              {/* Badge complété */}
              {level.completed && (
                <div className="absolute top-4 left-4">
                  <span className="text-3xl">✓</span>
                </div>
              )}

              {/* Verrou si non débloqué */}
              {!level.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl opacity-30">🔒</span>
                </div>
              )}

              <div className={level.unlocked ? '' : 'blur-sm'}>
                <h3 className="text-3xl font-bold text-white mb-3">
                  {level.name}
                </h3>
                <p className="text-gray-400 mb-6">
                  10 jeux à deviner
                </p>

                {level.unlocked ? (
                  <Link
                    href={`/level/${level.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:scale-105 transition-transform shadow-lg"
                  >
                    <span>▶</span>
                    Jouer
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-6 py-3 bg-gray-700 text-gray-500 font-semibold rounded-full cursor-not-allowed"
                  >
                    Verrouillé
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Retour */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-purple-400 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
