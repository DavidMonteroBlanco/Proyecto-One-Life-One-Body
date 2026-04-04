// src/pages/Dashboard/Dashboard.tsx

import { useAuth } from '../context/Authcontext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Título */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          ¡Hola de nuevo, {user?.name?.split(' ')[0] || 'Usuario'}!
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
              <p className="text-zinc-400 text-sm font-medium tracking-widest">PESO ACTUAL</p>
              <p className="text-6xl font-bold text-white mt-4 tracking-tighter">
                82.4 <span className="text-3xl font-normal text-zinc-500">kg</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110">
              ⚖️
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-medium">
            ↓ -1.2 kg <span className="text-zinc-500 font-normal">esta semana</span>
          </div>
        </div>

        {/* Tarjeta 2: Entrenamientos este mes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-sm font-medium tracking-widest">ENTRENAMIENTOS</p>
              <p className="text-6xl font-bold text-white mt-4 tracking-tighter">12</p>
              <p className="text-zinc-400 text-sm mt-1">este mes</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110">
              💪
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-10">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-[65%] bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all" />
            </div>
            <p className="text-xs text-zinc-500 mt-2 text-right">65% del objetivo mensual</p>
          </div>
        </div>

        {/* Tarjeta 3: Entrenamiento de hoy */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 group flex flex-col">
          <p className="text-zinc-400 text-sm font-medium tracking-widest">HOY</p>
          
          <div className="mt-6 flex-1">
            <h3 className="text-2xl font-semibold text-white">Pecho + Tríceps</h3>
            <p className="text-zinc-400 mt-3">4 ejercicios • 45 minutos</p>
          </div>

          <button 
            className="mt-auto w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] 
                       transition-all duration-200 text-white font-semibold py-4 rounded-2xl 
                       text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            Empezar entrenamiento ahora
          </button>
        </div>
      </div>

      {/* Entrenamientos recientes */}
      <div className="mt-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Entrenamientos recientes</h2>
          <a 
            href="/workouts" 
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            Ver todos <span className="text-lg leading-none">→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workout 1 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7 hover:border-zinc-700 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">Espalda y Bíceps</p>
                <p className="text-sm text-zinc-500 mt-1">Hace 2 días • 55 minutos</p>
              </div>
              <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded-full">
                COMPLETO
              </div>
            </div>
          </div>

          {/* Workout 2 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7 hover:border-zinc-700 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">Piernas</p>
                <p className="text-sm text-zinc-500 mt-1">Hace 5 días • 60 minutos</p>
              </div>
              <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded-full">
                COMPLETO
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}