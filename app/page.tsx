import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🎮</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              GeoGamer
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6">
            Devinez le jeu vidéo
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              à partir de captures d'écran
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            Testez votre culture gaming ! Identifiez des jeux vidéo célèbres 
            à partir de screenshots, d'environnements et de détails visuels.
          </p>
          
          <Link 
            href="/level/1"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 hover:scale-105 transition-all duration-300"
          >
            Commencer le jeu
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-purple-500/20 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2026 GeoGamer - Créé par Elouan Le Gall
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="hover:text-purple-400 transition-colors">
                À propos
              </Link>
              <Link href="#" className="hover:text-purple-400 transition-colors">
                Contact
              </Link>
              <Link href="#" className="hover:text-purple-400 transition-colors">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
