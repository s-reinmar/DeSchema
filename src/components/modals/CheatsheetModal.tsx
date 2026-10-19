/**
 * @file CheatsheetModal.tsx
 * @description Comprehensive engineering cheatsheet for electrical laws (Ohm, Kirchhoff, Diodes, Transistor Gain).
 * @author s-reinmar
 * @license MIT
 */

import React, { useState } from 'react';
import { X, BookOpen, Zap, Layers, Activity, TrendingUp, Cpu } from 'lucide-react';
import { formatSchematicLabel } from '../../utils/label-formatter.tsx';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const CheatsheetModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ohm_kirchhoff' | 'diodes' | 'transistor_gain'>('ohm_kirchhoff');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ściągawka Praw i Zależności Fizycznych
            </h2>
            <p className="text-sm text-slate-400">
              Prawo Ohma, prawa Kirchhoffa, fizyka diody oraz wzmocnienie tranzystora
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('ohm_kirchhoff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'ohm_kirchhoff'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Prawo Ohma i Prawa Kirchhoffa
          </button>

          <button
            onClick={() => setActiveTab('diodes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'diodes'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            Diody (Krzemowa &amp; Zenera)
          </button>

          <button
            onClick={() => setActiveTab('transistor_gain')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'transistor_gain'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Wzmocnienie i Tranzystor BJT
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'ohm_kirchhoff' && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Prawo Ohma */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Prawo Ohma i Bilans Mocy</span>
                <span className="font-mono text-xs px-2.5 py-1 bg-slate-950 rounded-lg text-amber-300 border border-slate-800">
                  U = I · R
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Różnica potencjałów elektrycznych (spadek napięcia) na przewodniku o stałej rezystancji jest
                wprost proporcjonalna do natężenia prądu przepływającego przez ten element.
              </p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-amber-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div>• Prąd: I = U / R</div>
                <div>• Rezystancja: R = U / I</div>
                <div>• Moc rozpraszana: P = U · I = I² · R = U² / R</div>
                <div>• Ciepło Joule&apos;a: Q = I² · R · t</div>
              </div>
            </div>

            {/* I Prawo Kirchhoffa */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">I Prawo Kirchhoffa (Prądowe - KCL)</span>
                <span className="font-mono text-xs px-2.5 py-1 bg-slate-950 rounded-lg text-indigo-300 border border-slate-800">
                  {formatSchematicLabel('∑ I_{węzeł} = 0')}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Suma natężeń prądów wpływających do węzła obwodu jest równa sumie prądów wypływających.
                Prawo to jest bezpośrednią konsekwencją zasady zachowania ładunku elektrycznego.
              </p>
              <div className="mt-2.5 font-mono text-xs text-indigo-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                {formatSchematicLabel('Węzeł diody Zenera: I_{Rs} = I_z + I_L')} → {formatSchematicLabel('I_z = I_{Rs} - I_L')}
              </div>
            </div>

            {/* II Prawo Kirchhoffa */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">II Prawo Kirchhoffa (Napięciowe - KVL)</span>
                <span className="font-mono text-xs px-2.5 py-1 bg-slate-950 rounded-lg text-indigo-300 border border-slate-800">
                  {formatSchematicLabel('∑ U_{oczko} = 0')}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Suma algebraiczna napięć źródłowych w zamkniętym oczku jest równa sumie spadków napięć na wszystkich odbiornikach.
              </p>
              <div className="mt-2.5 font-mono text-xs text-indigo-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                {formatSchematicLabel('Oczko tranzystora: U_{CC} - I_C · R_c - U_{CE} - I_E · R_e = 0')}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diodes' && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Dioda Krzemowa */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Dioda Prostownicza Krzemowa (Złącze P-N)</span>
                <span className="font-mono text-xs px-2.5 py-1 bg-slate-950 rounded-lg text-cyan-300 border border-slate-800">
                  {formatSchematicLabel('U_D ≈ 0.65 - 0.7V')}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                W kierunku przewodzenia (anoda do plusa) prąd gwałtownie rośnie po przekroczeniu bariery potencjału (~0.7V).
                W kierunku zaporowym płynie znikomy prąd wsteczny nasycenia.
              </p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-cyan-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div>• Równanie Shockleya: {formatSchematicLabel('I_D = I_S · (e^(U_D / (n·U_T)) - 1)')}</div>
                <div>• Napięcie zaporowe: {formatSchematicLabel('PIV \\ge 2 · U_m')}</div>
                <div>• Rezystancja dynamiczna: {formatSchematicLabel('r_d = dU_D / dI_D \\approx U_T / I_D')}</div>
                <div>• Napięcie termiczne: {formatSchematicLabel('U_T \\approx 26mV')} (przy 300K)</div>
              </div>
            </div>

            {/* Dioda Zenera */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Dioda Zenera (Stabilizacja Napięcia)</span>
                <span className="font-mono text-xs px-2.5 py-1 bg-slate-950 rounded-lg text-emerald-300 border border-slate-800">
                  {formatSchematicLabel('U_{wy} = U_z = const')}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Pracuje w obszarze kontrolowanego przebicia zaporowego. Charakteryzuje się stromą pionową charakterystyką I(U),
                dzięki czemu wahania prądu wywołują minimalne zmiany napięcia wyjściowego.
              </p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-emerald-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div>• Rezystor balastowy: {formatSchematicLabel('R_s = (U_{in} - U_z) / I_s')}</div>
                <div>• Rezystancja dynamiczna: {formatSchematicLabel('r_z = \\Delta U_z / \\Delta I_z')} (5–20Ω)</div>
                <div>• Warunek stabilizacji: {formatSchematicLabel('I_{z,min} \\le I_z \\le I_{z,max}')}</div>
                <div>• Maksymalna moc: {formatSchematicLabel('P_{z,max} = U_z · I_{z,max}')}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transistor_gain' && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Wzmocnienie tranzystora BJT */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Wzmocnienie i Tranzystor NPN w Układzie OE</span>
                <span className="font-mono text-xs px-2.5 py-1 bg-slate-950 rounded-lg text-emerald-300 border border-slate-800">
                  {formatSchematicLabel('I_C = \\beta · I_B')}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Układ ze wspólnym emiterem (OE) zapewnia zarówno wzmocnienie prądowe, jak i wysokie napięciowe.
                Sygnał wejściowy podawany jest na bazę, a wzmocniony sygnał wyjściowy odbierany z kolektora z
                odwróceniem fazy o 180°.
              </p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-emerald-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div>• Wzmocnienie: {formatSchematicLabel('k_u \\approx - (R_c \\parallel R_L) / (r_e + R_e)')}</div>
                <div>• Z bocznikowaniem C_e: {formatSchematicLabel('k_u \\approx - (R_c \\parallel R_L) / r_e')}</div>
                <div>• Opór wewnętrzny: {formatSchematicLabel('r_e \\approx 26mV / I_E')}</div>
                <div>• Napięcie kolektora: {formatSchematicLabel('U_C = U_{CC} - I_C · R_c')}</div>
                <div>• Dzielnik bazy: {formatSchematicLabel('U_B \\approx U_{CC} · R_{b2} / (R_{b1} + R_{b2})')}</div>
                <div>• Napięcie emitera: {formatSchematicLabel('U_E = U_B - 0.7V')}</div>
              </div>
            </div>

            {/* Warunki nasycenia i odcięcia */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Obszary Pracy Tranzystora Bipolarnego</span>
                <span className="font-mono text-xs px-2.5 py-1 bg-slate-950 rounded-lg text-cyan-300 border border-slate-800">
                  Aktywny / Nasycenie / Odcięcie
                </span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>
                  <strong className="text-white">Obszar aktywny (liniowy):</strong> Złącze B-E przewodzi ({formatSchematicLabel('U_{BE} \\approx 0.7V')}), złącze B-C zaporowo ({formatSchematicLabel('U_{CE} > 0.3V')}).
                </li>
                <li>
                  <strong className="text-white">Nasycenie (Saturation):</strong> Oba złącza przewodzą, {formatSchematicLabel('U_{CE,sat} \\approx 0.1-0.2V')}.
                </li>
                <li>
                  <strong className="text-white">Odcięcie (Cut-off):</strong> {formatSchematicLabel('U_{BE} < 0.5V')}, brak przepływu prądu ({formatSchematicLabel('I_C \\approx 0, U_C = U_{CC}')}).
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-600/30 text-xs sm:text-sm cursor-pointer"
          >
            Zamknij ściągawkę
          </button>
        </div>
      </div>
    </div>
  );
};
