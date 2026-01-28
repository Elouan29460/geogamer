"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

  if (!level) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Palier introuvable</div>
      </div>
    );
  }

  const handleStart = () => {
    router.push(`/game?level=${levelId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      {/* Main Content */}
      <div className="max-w-2xl w-full">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-12 text-center">
            {/* Badge de difficulté */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-purple-500/20 border border-purple-500/40">
              <span className={`w-3 h-3 rounded-full ${
                level.difficulty === 'Facile' ? 'bg-green-500' :
                level.difficulty === 'Moyen' ? 'bg-yellow-500' :
                level.difficulty === 'Difficile' ? 'bg-orange-500' :
                'bg-red-500'
              }`}></span>
              <span className="text-purple-300 font-semibold">{level.difficulty}</span>
            </div>

            {/* Titre */}
            <h2 className="text-6xl font-extrabold text-white mb-6">
              {level.name}
            </h2>

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
              className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-purple-500/50 mb-6"
            >
              Commencer
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
