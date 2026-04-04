// src/pages/user/Dashboard.tsx
import { useAuth } from '../context/Authcontext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Título */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          ¡Hola de nuevo, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">
          Aquí tienes un resumen de tu progreso esta semana
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: Peso Actual */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-sm font-medium">PESO ACTUAL</p>
              <p className="text-6xl font-bold text-white mt-4 tracking-tighter">82.4 <span className="text-3xl font-normal text-zinc-500">kg</span></p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              ⚖️
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm">
            <span className="font-medium">-1.2 kg</span>
            <span className="text-zinc-500">esta semana</span>
          </div>
        </div>

        {/* Tarjeta 2: Entrenamientos este mes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-sm font-medium">ENTRENAMIENTOS</p>
              <p className="text-6xl font-bold text-white mt-4 tracking-tighter">12</p>
              <p className="text-zinc-400 text-sm mt-1">este mes</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-2xl">
              💪
            </div>
          </div>
          <div className="mt-8 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-[65%] bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
          </div>
        </div>

        {/* Tarjeta 3: Próximo entrenamiento */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 group lg:col-span-1">
          <p className="text-zinc-400 text-sm font-medium">HOY</p>
          
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-white">Pecho + Tríceps</h3>
            <p className="text-zinc-400 mt-2">4 ejercicios • 45 minutos</p>
          </div>

          <button 
            className="mt-10 w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.985] 
                       transition-all duration-200 text-white font-semibold py-4 rounded-2xl text-base shadow-lg shadow-emerald-500/20"
          >
            Empezar entrenamiento ahora
          </button>
        </div>
      </div>

      {/* Sección de entrenamientos recientes */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Entrenamientos recientes</h2>
          <a href="/workouts" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-2">
            Ver todos →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ejemplo de tarjeta de workout reciente */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Espalda y Bíceps</p>
                <p className="text-sm text-zinc-500 mt-1">Hace 2 días • 55 minutos</p>
              </div>
              <div className="text-emerald-400 text-xs font-mono bg-zinc-800 px-3 py-1 rounded-full self-start">
                COMPLETO
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Piernas</p>
                <p className="text-sm text-zinc-500 mt-1">Hace 5 días • 60 minutos</p>
              </div>
              <div className="text-emerald-400 text-xs font-mono bg-zinc-800 px-3 py-1 rounded-full self-start">
                COMPLETO
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}