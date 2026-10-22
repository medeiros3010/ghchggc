import React, { useState } from 'react';
import {
  FontFamilyType,
} from '../types/card';
import {
  CreatureCombatType,
  DEFAULT_ATTACK_STYLE,
  DEFAULT_DEFENSE_STYLE,
  DEFAULT_DUAL_COMBAT_CONFIG,
  DEFAULT_SINGLE_ATTACK_CONFIG,
  DualCombatConfig,
  SingleAttackCombatConfig,
  SorceryCombatConfig,
} from '../types/sorcery';
import { AVAILABLE_FONTS } from '../utils/fontHelper';
import {
  Swords,
  Shield,
  Upload,
  RotateCcw,
  Sliders,
  Type,
  ImageIcon,
} from 'lucide-react';

interface CombatControlsProps {
  combat: SorceryCombatConfig;
  onUpdateSorceryCombat: (updates: Partial<SorceryCombatConfig>) => void;
}

export const CombatControls: React.FC<CombatControlsProps> = ({
  combat,
  onUpdateSorceryCombat,
}) => {
  const selectedType: CreatureCombatType = combat.selectedType || 'attack-only';
  const single: SingleAttackCombatConfig = combat.single || DEFAULT_SINGLE_ATTACK_CONFIG;
  const dual: DualCombatConfig = combat.dual || DEFAULT_DUAL_COMBAT_CONFIG;

  const [singleSubTab, setSingleSubTab] = useState<'values' | 'position' | 'element'>('values');
  const [dualSubTab, setDualSubTab] = useState<'values' | 'position' | 'attack' | 'defense'>('values');

  // Atualizador isolado para o Bloco A (Criatura com ataque)
  const updateSingle = (updates: Partial<SingleAttackCombatConfig>) => {
    onUpdateSorceryCombat({
      single: {
        ...single,
        ...updates,
      },
    });
  };

  // Atualizador isolado para o Bloco B (Criatura com ataque e defesa)
  const updateDual = (updates: Partial<DualCombatConfig>) => {
    onUpdateSorceryCombat({
      dual: {
        ...dual,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Seção */}
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Ataque e Defesa (ATK/DEF)
            </h3>
            <p className="text-[11px] text-slate-500">
              Gerencie modelos e atributos de combate
            </p>
          </div>
        </div>

        {/* Alternância de Visibilidade Geral */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-slate-500">
            {combat.isVisible ? 'Visível' : 'Oculto'}
          </span>
          <button
            type="button"
            onClick={() => onUpdateSorceryCombat({ isVisible: !combat.isVisible })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              combat.isVisible ? 'bg-rose-600' : 'bg-slate-300'
            }`}
            title={combat.isVisible ? 'Ocultar na carta' : 'Exibir na carta'}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                combat.isVisible ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 1. SELEÇÃO DO TIPO DE CRIATURA (MUTUAMENTE EXCLUSIVOS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            1. Seleção do Tipo de Criatura
          </label>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {selectedType === 'attack-only' ? 'Somente Ataque' : 'Ataque & Defesa'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Opção 1: Criatura com ataque */}
          <button
            type="button"
            onClick={() => onUpdateSorceryCombat({ selectedType: 'attack-only' })}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              selectedType === 'attack-only'
                ? 'bg-rose-50 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedType === 'attack-only'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Swords className="w-4 h-4" />
              </div>
              {selectedType === 'attack-only' && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-4 ring-rose-100" />
              )}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 leading-snug">
                Criatura com ataque
              </div>
              <div className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
                Possui apenas o valor de ataque
              </div>
            </div>
          </button>

          {/* Opção 2: Criatura com ataque e defesa */}
          <button
            type="button"
            onClick={() => onUpdateSorceryCombat({ selectedType: 'attack-defense' })}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              selectedType === 'attack-defense'
                ? 'bg-indigo-50 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedType === 'attack-defense'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Shield className="w-4 h-4" />
              </div>
              {selectedType === 'attack-defense' && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
              )}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 leading-snug">
                Criatura com ataque e defesa
              </div>
              <div className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
                Possui os valores de ataque e defesa
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. ESTRUTURA EXCLUSIVA DO TIPO ESCOLHIDO */}
      {selectedType === 'attack-only' ? (
        /* ========================================================
           BLOCO A — CRIATURA COM ATAQUE (100% INDEPENDENTE)
           ======================================================== */
        <div className="space-y-3.5 pt-1">
          {/* Badge Informativo do Bloco A */}
          <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                Bloco A — Criatura com Ataque
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-200/80 text-rose-900">
              Valor: {single.value || '—'}
            </span>
          </div>

          {/* Sub-Navegação interna do Bloco A */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
            <button
              type="button"
              onClick={() => setSingleSubTab('values')}
              className={`py-1 px-1 rounded text-[11px] font-semibold text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                singleSubTab === 'values'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Valor & Fundo</span>
            </button>
            <button
              type="button"
              onClick={() => setSingleSubTab('position')}
              className={`py-1 px-1 rounded text-[11px] font-semibold text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                singleSubTab === 'position'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Posição (X/Y)</span>
            </button>
            <button
              type="button"
              onClick={() => setSingleSubTab('element')}
              className={`py-1 px-1 rounded text-[11px] font-semibold text-center transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                singleSubTab === 'element'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3 h-3" />
              <span>Elemento & Estilo</span>
            </button>
          </div>

          {/* SUB-ABA 1: VALOR E IMAGEM DO BLOCO A */}
          {singleSubTab === 'values' && (
            <div className="space-y-3.5">
              {/* Valor de Ataque (Suporte a Números e '*') */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-rose-600" />
                    Valor do Ataque
                  </label>
                  <span className="text-[10px] text-slate-500">Aceita números e o caractere *</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseInt(single.value, 10);
                      if (!isNaN(num)) {
                        updateSingle({ value: String(Math.max(0, num - 1)) });
                      } else {
                        updateSingle({ value: '0' });
                      }
                    }}
                    className="w-9 h-9 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
                    title="Diminuir"
                  >
                    -
                  </button>

                  <input
                    type="text"
                    value={single.value}
                    placeholder="Ex: 4 ou *"
                    onChange={(e) => updateSingle({ value: e.target.value })}
                    className="flex-1 text-center font-mono font-bold text-lg p-1.5 bg-slate-50 border border-slate-300 rounded-md focus:border-rose-500 focus:bg-white focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const num = parseInt(single.value, 10);
                      if (!isNaN(num)) {
                        updateSingle({ value: String(num + 1) });
                      } else {
                        updateSingle({ value: '1' });
                      }
                    }}
                    className="w-9 h-9 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
                    title="Aumentar"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSingle({ value: '*' })}
                    className={`px-3 h-9 rounded-md border font-mono font-bold flex items-center justify-center shrink-0 cursor-pointer text-lg ${
                      single.value === '*'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                    }`}
                    title="Definir símbolo *"
                  >
                    *
                  </button>
                </div>
              </div>

              {/* Imagem de Fundo Específica do Modelo de Ataque */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Imagem de Fundo (Ataque)
                    </span>
                    <span className="text-[10.5px] text-slate-500">
                      Exclusiva deste modelo simples
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSingle({ imageUrl: '/assets/sorcery/attack_single.png' })
                    }
                    className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    title="Restaurar attack_single.png"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Padrão</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={single.imageUrl || '/assets/sorcery/attack_single.png'}
                      alt="Fundo de Ataque"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Substituir Imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (typeof ev.target?.result === 'string') {
                                updateSingle({ imageUrl: ev.target.result });
                              }
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[9.5px] text-slate-400 font-mono">
                      PNG transparente recomendado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-ABA 2: POSIÇÃO DA IMAGEM NA CARTA DO BLOCO A */}
          {singleSubTab === 'position' && (
            <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Posição X e Y da Imagem na Carta
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Controle de coordenadas diretas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateSingle({
                      xPercent: 84.5,
                      yPercent: 4.8,
                      widthPercent: 10.5,
                      heightPercent: 7.2,
                      scale: 1.0,
                    })
                  }
                  className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                  title="Restaurar coordenadas padrão (canto superior direito)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar</span>
                </button>
              </div>

              {/* Coordenada X da Imagem */}
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-700 mb-1">
                  <span className="font-semibold">Posição X da Imagem (%):</span>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      type="number"
                      min="0"
                      max="95"
                      step="0.1"
                      value={Number(single.xPercent.toFixed(1))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateSingle({ xPercent: Math.max(0, Math.min(95, val)) });
                        }
                      }}
                      className="w-14 px-1 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateSingle({
                        xPercent: Math.max(0, Math.round((single.xPercent - 0.5) * 10) / 10),
                      })
                    }
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    title="Recuar 0.5%"
                  >
                    -0.5%
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="0.1"
                    value={single.xPercent}
                    onChange={(e) => updateSingle({ xPercent: parseFloat(e.target.value) })}
                    className="flex-1 accent-rose-600"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateSingle({
                        xPercent: Math.min(95, Math.round((single.xPercent + 0.5) * 10) / 10),
                      })
                    }
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    title="Avançar 0.5%"
                  >
                    +0.5%
                  </button>
                </div>
              </div>

              {/* Coordenada Y da Imagem */}
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-700 mb-1">
                  <span className="font-semibold">Posição Y da Imagem (%):</span>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      type="number"
                      min="0"
                      max="95"
                      step="0.1"
                      value={Number(single.yPercent.toFixed(1))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateSingle({ yPercent: Math.max(0, Math.min(95, val)) });
                        }
                      }}
                      className="w-14 px-1 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateSingle({
                        yPercent: Math.max(0, Math.round((single.yPercent - 0.5) * 10) / 10),
                      })
                    }
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    title="Subir 0.5%"
                  >
                    -0.5%
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="0.1"
                    value={single.yPercent}
                    onChange={(e) => updateSingle({ yPercent: parseFloat(e.target.value) })}
                    className="flex-1 accent-rose-600"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateSingle({
                        yPercent: Math.min(95, Math.round((single.yPercent + 0.5) * 10) / 10),
                      })
                    }
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    title="Descer 0.5%"
                  >
                    +0.5%
                  </button>
                </div>
              </div>

              {/* Largura e Altura */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                    <span>Largura:</span>
                    <span className="font-semibold">{single.widthPercent.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="0.5"
                    value={single.widthPercent}
                    onChange={(e) =>
                      updateSingle({ widthPercent: parseFloat(e.target.value) })
                    }
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                    <span>Altura:</span>
                    <span className="font-semibold">{single.heightPercent.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    step="0.5"
                    value={single.heightPercent}
                    onChange={(e) =>
                      updateSingle({ heightPercent: parseFloat(e.target.value) })
                    }
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>

              {/* Escala e Opacidade */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                    <span>Escala:</span>
                    <span className="font-semibold">{(single.scale || 1.0).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.05"
                    value={single.scale || 1.0}
                    onChange={(e) => updateSingle({ scale: parseFloat(e.target.value) })}
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                    <span>Opacidade:</span>
                    <span className="font-semibold">{Math.round((single.opacity ?? 1.0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={single.opacity ?? 1.0}
                    onChange={(e) => updateSingle({ opacity: parseFloat(e.target.value) })}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>

              {/* Manter Proporção */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-600 font-medium">
                  Manter Proporção (Aspect Ratio):
                </span>
                <input
                  type="checkbox"
                  checked={single.keepAspectRatio ?? true}
                  onChange={(e) => updateSingle({ keepAspectRatio: e.target.checked })}
                  className="rounded text-rose-600 accent-rose-600 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* SUB-ABA 3: ELEMENTO E TIPOGRAFIA DO BLOCO A */}
          {singleSubTab === 'element' && (
            <div className="space-y-3.5">
              {/* Coordenadas X e Y do elemento na imagem */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5 shadow-2xs">
                <span className="text-xs font-bold text-slate-800 block">
                  Posição do Elemento de Ataque (dentro da imagem)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-mono">
                      <span>Eixo X (%):</span>
                      <span>{(single.attackXPercent ?? 50).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={single.attackXPercent ?? 50}
                      onChange={(e) =>
                        updateSingle({ attackXPercent: parseFloat(e.target.value) })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-mono">
                      <span>Eixo Y (%):</span>
                      <span>{(single.attackYPercent ?? 50).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={single.attackYPercent ?? 50}
                      onChange={(e) =>
                        updateSingle({ attackYPercent: parseFloat(e.target.value) })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>
                </div>

                {/* Deslocamento fino em pixels */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-mono">
                      <span>Offset X (px):</span>
                      <span>{single.style.offsetX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={single.style.offsetX || 0}
                      onChange={(e) =>
                        updateSingle({
                          style: {
                            ...single.style,
                            offsetX: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-mono">
                      <span>Offset Y (px):</span>
                      <span>{single.style.offsetY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={single.style.offsetY || 0}
                      onChange={(e) =>
                        updateSingle({
                          style: {
                            ...single.style,
                            offsetY: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Tipografia de Ataque */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                <span className="text-xs font-bold text-slate-800 block">
                  Tipografia do Valor de Ataque
                </span>

                <div>
                  <label className="text-[10.5px] text-slate-600 font-medium block mb-1">
                    Fonte:
                  </label>
                  <select
                    value={single.style.fontFamily}
                    onChange={(e) =>
                      updateSingle({
                        style: {
                          ...single.style,
                          fontFamily: e.target.value as FontFamilyType,
                        },
                      })
                    }
                    className="w-full p-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
                  >
                    {AVAILABLE_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                      <span>Tamanho:</span>
                      <span className="font-semibold">{single.style.fontSizePx || 22}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      step="1"
                      value={single.style.fontSizePx || 22}
                      onChange={(e) =>
                        updateSingle({
                          style: {
                            ...single.style,
                            fontSizePx: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] text-slate-600 font-medium block mb-1">
                      Cor do Texto:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={single.style.fontColor || '#ffffff'}
                        onChange={(e) =>
                          updateSingle({
                            style: {
                              ...single.style,
                              fontColor: e.target.value,
                            },
                          })
                        }
                        className="w-7 h-7 p-0.5 rounded border border-slate-300 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={single.style.fontColor || '#ffffff'}
                        onChange={(e) =>
                          updateSingle({
                            style: {
                              ...single.style,
                              fontColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-1.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-800 uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Contorno */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                      <span>Contorno:</span>
                      <span className="font-semibold">{single.style.strokeWidthPx || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="0.5"
                      value={single.style.strokeWidthPx || 0}
                      onChange={(e) =>
                        updateSingle({
                          style: {
                            ...single.style,
                            strokeWidthPx: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] text-slate-600 font-medium block mb-1">
                      Cor Contorno:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={single.style.strokeColor || '#000000'}
                        onChange={(e) =>
                          updateSingle({
                            style: {
                              ...single.style,
                              strokeColor: e.target.value,
                            },
                          })
                        }
                        className="w-7 h-7 p-0.5 rounded border border-slate-300 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={single.style.strokeColor || '#000000'}
                        onChange={(e) =>
                          updateSingle({
                            style: {
                              ...single.style,
                              strokeColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-1.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-800 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
           BLOCO B — CRIATURA COM ATAQUE E DEFESA (100% INDEPENDENTE)
           ======================================================== */
        <div className="space-y-3.5 pt-1">
          {/* Badge Informativo do Bloco B */}
          <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                Bloco B — Criatura com Ataque e Defesa
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-200/80 text-indigo-900">
              Atk: {dual.attackValue || '—'} | Def: {dual.defenseValue || '—'}
            </span>
          </div>

          {/* Sub-Navegação interna do Bloco B */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
            <button
              type="button"
              onClick={() => setDualSubTab('values')}
              className={`py-1 px-1 rounded text-[10.5px] font-semibold text-center transition-colors cursor-pointer ${
                dualSubTab === 'values'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Valores & Fundo
            </button>
            <button
              type="button"
              onClick={() => setDualSubTab('position')}
              className={`py-1 px-1 rounded text-[10.5px] font-semibold text-center transition-colors cursor-pointer ${
                dualSubTab === 'position'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Posição Geral
            </button>
            <button
              type="button"
              onClick={() => setDualSubTab('attack')}
              className={`py-1 px-1 rounded text-[10.5px] font-semibold text-center transition-colors cursor-pointer ${
                dualSubTab === 'attack'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ataque (X/Y)
            </button>
            <button
              type="button"
              onClick={() => setDualSubTab('defense')}
              className={`py-1 px-1 rounded text-[10.5px] font-semibold text-center transition-colors cursor-pointer ${
                dualSubTab === 'defense'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Defesa (X/Y)
            </button>
          </div>

          {/* SUB-ABA 1: VALORES E FUNDO DO BLOCO B */}
          {dualSubTab === 'values' && (
            <div className="space-y-3.5">
              {/* Valor de Ataque (Bloco B) */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-rose-600" />
                    Valor do Ataque
                  </label>
                  <span className="text-[10px] text-slate-500">Aceita números e *</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseInt(dual.attackValue, 10);
                      if (!isNaN(num)) {
                        updateDual({ attackValue: String(Math.max(0, num - 1)) });
                      } else {
                        updateDual({ attackValue: '0' });
                      }
                    }}
                    className="w-8 h-8 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    -
                  </button>

                  <input
                    type="text"
                    value={dual.attackValue}
                    placeholder="Ex: 4 ou *"
                    onChange={(e) => updateDual({ attackValue: e.target.value })}
                    className="flex-1 text-center font-mono font-bold text-base p-1.5 bg-slate-50 border border-slate-300 rounded-md focus:border-rose-500 focus:bg-white focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const num = parseInt(dual.attackValue, 10);
                      if (!isNaN(num)) {
                        updateDual({ attackValue: String(num + 1) });
                      } else {
                        updateDual({ attackValue: '1' });
                      }
                    }}
                    className="w-8 h-8 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDual({ attackValue: '*' })}
                    className={`px-2.5 h-8 rounded-md border font-mono font-bold flex items-center justify-center shrink-0 cursor-pointer text-base ${
                      dual.attackValue === '*'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                    }`}
                    title="Definir como *"
                  >
                    *
                  </button>
                </div>
              </div>

              {/* Valor de Defesa (Bloco B) */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-600" />
                    Valor da Defesa
                  </label>
                  <span className="text-[10px] text-slate-500">Aceita números e *</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseInt(dual.defenseValue, 10);
                      if (!isNaN(num)) {
                        updateDual({ defenseValue: String(Math.max(0, num - 1)) });
                      } else {
                        updateDual({ defenseValue: '0' });
                      }
                    }}
                    className="w-8 h-8 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    -
                  </button>

                  <input
                    type="text"
                    value={dual.defenseValue}
                    placeholder="Ex: 5 ou *"
                    onChange={(e) => updateDual({ defenseValue: e.target.value })}
                    className="flex-1 text-center font-mono font-bold text-base p-1.5 bg-slate-50 border border-slate-300 rounded-md focus:border-sky-500 focus:bg-white focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const num = parseInt(dual.defenseValue, 10);
                      if (!isNaN(num)) {
                        updateDual({ defenseValue: String(num + 1) });
                      } else {
                        updateDual({ defenseValue: '1' });
                      }
                    }}
                    className="w-8 h-8 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDual({ defenseValue: '*' })}
                    className={`px-2.5 h-8 rounded-md border font-mono font-bold flex items-center justify-center shrink-0 cursor-pointer text-base ${
                      dual.defenseValue === '*'
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100'
                    }`}
                    title="Definir como *"
                  >
                    *
                  </button>
                </div>
              </div>

              {/* Imagem de Fundo Específica do Modelo Ataque + Defesa */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Imagem de Fundo (Ataque + Defesa)
                    </span>
                    <span className="text-[10.5px] text-slate-500">
                      Exclusiva deste modelo duplo
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateDual({
                        backgroundImageUrl: '/assets/sorcery/attack_defense.png',
                      })
                    }
                    className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    title="Restaurar attack_defense.png"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Padrão</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-20 h-10 rounded-lg bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={dual.backgroundImageUrl || '/assets/sorcery/attack_defense.png'}
                      alt="Fundo Ataque e Defesa"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Substituir Imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (typeof ev.target?.result === 'string') {
                                updateDual({
                                  backgroundImageUrl: ev.target.result,
                                });
                              }
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[9.5px] text-slate-400 font-mono">
                      PNG proporção 2:1 recomendada
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-ABA 2: POSIÇÃO GERAL DO BLOCO B NA CARTA */}
          {dualSubTab === 'position' && (
            <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Posição Geral do Bloco Duplo
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Coordenadas reais do container na carta
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateDual({
                      xPercent: 74.0,
                      yPercent: 4.8,
                      widthPercent: 21.0,
                      heightPercent: 7.2,
                      scale: 1.0,
                    })
                  }
                  className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                  title="Restaurar coordenadas padrão do modelo duplo"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar</span>
                </button>
              </div>

              {/* Coordenada X Geral */}
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-700 mb-1">
                  <span className="font-semibold">Posição X (% horizontal):</span>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      type="number"
                      min="0"
                      max="95"
                      step="0.1"
                      value={Number(dual.xPercent.toFixed(1))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateDual({ xPercent: Math.max(0, Math.min(95, val)) });
                        }
                      }}
                      className="w-14 px-1 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateDual({
                        xPercent: Math.max(0, Math.round((dual.xPercent - 0.5) * 10) / 10),
                      })
                    }
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    title="Recuar 0.5%"
                  >
                    -0.5%
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="0.1"
                    value={dual.xPercent}
                    onChange={(e) => updateDual({ xPercent: parseFloat(e.target.value) })}
                    className="flex-1 accent-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateDual({
                        xPercent: Math.min(95, Math.round((dual.xPercent + 0.5) * 10) / 10),
                      })
                    }
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    title="Avançar 0.5%"
                  >
                    +0.5%
                  </button>
                </div>
              </div>

              {/* Coordenada Y Geral */}
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-700 mb-1">
                  <span className="font-semibold">Posição Y (% vertical):</span>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      type="number"
                      min="0"
                      max="95"
                      step="0.1"
                      value={Number(dual.yPercent.toFixed(1))}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateDual({ yPercent: Math.max(0, Math.min(95, val)) });
                        }
                      }}
                      className="w-14 px-1 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateDual({
                        yPercent: Math.max(0, Math.round((dual.yPercent - 0.5) * 10) / 10),
                      })
                    }
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    title="Subir 0.5%"
                  >
                    -0.5%
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="0.1"
                    value={dual.yPercent}
                    onChange={(e) => updateDual({ yPercent: parseFloat(e.target.value) })}
                    className="flex-1 accent-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateDual({
                        yPercent: Math.min(95, Math.round((dual.yPercent + 0.5) * 10) / 10),
                      })
                    }
                    className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    title="Descer 0.5%"
                  >
                    +0.5%
                  </button>
                </div>
              </div>

              {/* Largura e Altura */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                    <span>Largura:</span>
                    <span className="font-semibold">{dual.widthPercent.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="0.5"
                    value={dual.widthPercent}
                    onChange={(e) =>
                      updateDual({ widthPercent: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                    <span>Altura:</span>
                    <span className="font-semibold">{dual.heightPercent.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    step="0.5"
                    value={dual.heightPercent}
                    onChange={(e) =>
                      updateDual({ heightPercent: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Escala e Opacidade */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                    <span>Escala:</span>
                    <span className="font-semibold">{(dual.scale || 1.0).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.05"
                    value={dual.scale || 1.0}
                    onChange={(e) => updateDual({ scale: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                    <span>Opacidade:</span>
                    <span className="font-semibold">{Math.round((dual.opacity ?? 1.0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={dual.opacity ?? 1.0}
                    onChange={(e) => updateDual({ opacity: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Manter Proporção */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-600 font-medium">
                  Manter Proporção (Aspect Ratio):
                </span>
                <input
                  type="checkbox"
                  checked={dual.keepAspectRatio ?? true}
                  onChange={(e) => updateDual({ keepAspectRatio: e.target.checked })}
                  className="rounded text-indigo-600 accent-indigo-600 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* SUB-ABA 3: ELEMENTO DE ATAQUE (INDEPENDENTE DA DEFESA) */}
          {dualSubTab === 'attack' && (
            <div className="space-y-3.5">
              {/* Banner de Independência */}
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
                <Swords className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="text-[11px]">
                  As coordenadas e estilo do Ataque são <strong>100% independentes</strong> e não afetam a Defesa.
                </span>
              </div>

              {/* Coordenadas X e Y do Ataque no Bloco */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Posição X e Y do Ataque (no Bloco)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateDual({
                        attackXPercent: 25.0,
                        attackYPercent: 50.0,
                        attackStyle: {
                          ...dual.attackStyle,
                          offsetX: 0,
                          offsetY: 0,
                        },
                      })
                    }
                    className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    title="Restaurar posição padrão do ataque (25%)"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Padrão (25%)</span>
                  </button>
                </div>

                {/* Ataque X */}
                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">Posição X no Bloco (%):</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={Number((dual.attackXPercent ?? 25).toFixed(1))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            updateDual({ attackXPercent: Math.max(0, Math.min(100, val)) });
                          }
                        }}
                        className="w-14 px-1 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateDual({
                          attackXPercent: Math.max(0, Math.round(((dual.attackXPercent ?? 25) - 0.5) * 10) / 10),
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    >
                      -0.5%
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={dual.attackXPercent ?? 25}
                      onChange={(e) => updateDual({ attackXPercent: parseFloat(e.target.value) })}
                      className="flex-1 accent-rose-600"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateDual({
                          attackXPercent: Math.min(100, Math.round(((dual.attackXPercent ?? 25) + 0.5) * 10) / 10),
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    >
                      +0.5%
                    </button>
                  </div>
                </div>

                {/* Ataque Y */}
                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">Posição Y no Bloco (%):</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={Number((dual.attackYPercent ?? 50).toFixed(1))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            updateDual({ attackYPercent: Math.max(0, Math.min(100, val)) });
                          }
                        }}
                        className="w-14 px-1 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateDual({
                          attackYPercent: Math.max(0, Math.round(((dual.attackYPercent ?? 50) - 0.5) * 10) / 10),
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    >
                      -0.5%
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={dual.attackYPercent ?? 50}
                      onChange={(e) => updateDual({ attackYPercent: parseFloat(e.target.value) })}
                      className="flex-1 accent-rose-600"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateDual({
                          attackYPercent: Math.min(100, Math.round(((dual.attackYPercent ?? 50) + 0.5) * 10) / 10),
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    >
                      +0.5%
                    </button>
                  </div>
                </div>

                {/* Deslocamento fino em pixels */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-mono">
                      <span>Offset X (px):</span>
                      <span>{dual.attackStyle.offsetX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={dual.attackStyle.offsetX || 0}
                      onChange={(e) =>
                        updateDual({
                          attackStyle: {
                            ...dual.attackStyle,
                            offsetX: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-mono">
                      <span>Offset Y (px):</span>
                      <span>{dual.attackStyle.offsetY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={dual.attackStyle.offsetY || 0}
                      onChange={(e) =>
                        updateDual({
                          attackStyle: {
                            ...dual.attackStyle,
                            offsetY: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Tipografia de Ataque (Bloco B) */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                <span className="text-xs font-bold text-slate-800 block">
                  Tipografia do Ataque
                </span>

                <div>
                  <label className="text-[10.5px] text-slate-600 font-medium block mb-1">
                    Fonte:
                  </label>
                  <select
                    value={dual.attackStyle.fontFamily}
                    onChange={(e) =>
                      updateDual({
                        attackStyle: {
                          ...dual.attackStyle,
                          fontFamily: e.target.value as FontFamilyType,
                        },
                      })
                    }
                    className="w-full p-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
                  >
                    {AVAILABLE_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                      <span>Tamanho:</span>
                      <span className="font-semibold">{dual.attackStyle.fontSizePx || 22}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      step="1"
                      value={dual.attackStyle.fontSizePx || 22}
                      onChange={(e) =>
                        updateDual({
                          attackStyle: {
                            ...dual.attackStyle,
                            fontSizePx: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] text-slate-600 font-medium block mb-1">
                      Cor:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={dual.attackStyle.fontColor || '#ffffff'}
                        onChange={(e) =>
                          updateDual({
                            attackStyle: {
                              ...dual.attackStyle,
                              fontColor: e.target.value,
                            },
                          })
                        }
                        className="w-7 h-7 p-0.5 rounded border border-slate-300 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={dual.attackStyle.fontColor || '#ffffff'}
                        onChange={(e) =>
                          updateDual({
                            attackStyle: {
                              ...dual.attackStyle,
                              fontColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-1.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-800 uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Contorno */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                      <span>Contorno:</span>
                      <span className="font-semibold">{dual.attackStyle.strokeWidthPx || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="0.5"
                      value={dual.attackStyle.strokeWidthPx || 0}
                      onChange={(e) =>
                        updateDual({
                          attackStyle: {
                            ...dual.attackStyle,
                            strokeWidthPx: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] text-slate-600 font-medium block mb-1">
                      Cor Contorno:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={dual.attackStyle.strokeColor || '#000000'}
                        onChange={(e) =>
                          updateDual({
                            attackStyle: {
                              ...dual.attackStyle,
                              strokeColor: e.target.value,
                            },
                          })
                        }
                        className="w-7 h-7 p-0.5 rounded border border-slate-300 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={dual.attackStyle.strokeColor || '#000000'}
                        onChange={(e) =>
                          updateDual({
                            attackStyle: {
                              ...dual.attackStyle,
                              strokeColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-1.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-800 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-ABA 4: ELEMENTO DE DEFESA (INDEPENDENTE DO ATAQUE) */}
          {dualSubTab === 'defense' && (
            <div className="space-y-3.5">
              {/* Banner de Independência */}
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-[11px]">
                  As coordenadas e estilo da Defesa são <strong>100% independentes</strong> e não afetam o Ataque.
                </span>
              </div>

              {/* Coordenadas X e Y da Defesa no Bloco */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Posição X e Y da Defesa (no Bloco)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateDual({
                        defenseXPercent: 72.0,
                        defenseYPercent: 50.0,
                        defenseStyle: {
                          ...dual.defenseStyle,
                          offsetX: 0,
                          offsetY: 0,
                        },
                      })
                    }
                    className="text-[10px] text-slate-500 hover:text-sky-600 flex items-center gap-1 cursor-pointer"
                    title="Restaurar posição padrão da defesa (72%)"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Padrão (72%)</span>
                  </button>
                </div>

                {/* Defesa X */}
                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">Posição X no Bloco (%):</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={Number((dual.defenseXPercent ?? 72).toFixed(1))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            updateDual({ defenseXPercent: Math.max(0, Math.min(100, val)) });
                          }
                        }}
                        className="w-14 px-1 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateDual({
                          defenseXPercent: Math.max(0, Math.round(((dual.defenseXPercent ?? 72) - 0.5) * 10) / 10),
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    >
                      -0.5%
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={dual.defenseXPercent ?? 72}
                      onChange={(e) => updateDual({ defenseXPercent: parseFloat(e.target.value) })}
                      className="flex-1 accent-sky-600"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateDual({
                          defenseXPercent: Math.min(100, Math.round(((dual.defenseXPercent ?? 72) + 0.5) * 10) / 10),
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    >
                      +0.5%
                    </button>
                  </div>
                </div>

                {/* Defesa Y */}
                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">Posição Y no Bloco (%):</span>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={Number((dual.defenseYPercent ?? 50).toFixed(1))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            updateDual({ defenseYPercent: Math.max(0, Math.min(100, val)) });
                          }
                        }}
                        className="w-14 px-1 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateDual({
                          defenseYPercent: Math.max(0, Math.round(((dual.defenseYPercent ?? 50) - 0.5) * 10) / 10),
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    >
                      -0.5%
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      value={dual.defenseYPercent ?? 50}
                      onChange={(e) => updateDual({ defenseYPercent: parseFloat(e.target.value) })}
                      className="flex-1 accent-sky-600"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateDual({
                          defenseYPercent: Math.min(100, Math.round(((dual.defenseYPercent ?? 50) + 0.5) * 10) / 10),
                        })
                      }
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-mono cursor-pointer shrink-0"
                    >
                      +0.5%
                    </button>
                  </div>
                </div>

                {/* Deslocamento fino em pixels */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-mono">
                      <span>Offset X (px):</span>
                      <span>{dual.defenseStyle.offsetX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={dual.defenseStyle.offsetX || 0}
                      onChange={(e) =>
                        updateDual({
                          defenseStyle: {
                            ...dual.defenseStyle,
                            offsetX: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-sky-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-600 mb-0.5 font-mono">
                      <span>Offset Y (px):</span>
                      <span>{dual.defenseStyle.offsetY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={dual.defenseStyle.offsetY || 0}
                      onChange={(e) =>
                        updateDual({
                          defenseStyle: {
                            ...dual.defenseStyle,
                            offsetY: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-sky-600"
                    />
                  </div>
                </div>
              </div>

              {/* Tipografia de Defesa (Bloco B) */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3 shadow-2xs">
                <span className="text-xs font-bold text-slate-800 block">
                  Tipografia da Defesa
                </span>

                <div>
                  <label className="text-[10.5px] text-slate-600 font-medium block mb-1">
                    Fonte:
                  </label>
                  <select
                    value={dual.defenseStyle.fontFamily}
                    onChange={(e) =>
                      updateDual({
                        defenseStyle: {
                          ...dual.defenseStyle,
                          fontFamily: e.target.value as FontFamilyType,
                        },
                      })
                    }
                    className="w-full p-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
                  >
                    {AVAILABLE_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                      <span>Tamanho:</span>
                      <span className="font-semibold">{dual.defenseStyle.fontSizePx || 22}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      step="1"
                      value={dual.defenseStyle.fontSizePx || 22}
                      onChange={(e) =>
                        updateDual({
                          defenseStyle: {
                            ...dual.defenseStyle,
                            fontSizePx: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-sky-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] text-slate-600 font-medium block mb-1">
                      Cor:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={dual.defenseStyle.fontColor || '#ffffff'}
                        onChange={(e) =>
                          updateDual({
                            defenseStyle: {
                              ...dual.defenseStyle,
                              fontColor: e.target.value,
                            },
                          })
                        }
                        className="w-7 h-7 p-0.5 rounded border border-slate-300 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={dual.defenseStyle.fontColor || '#ffffff'}
                        onChange={(e) =>
                          updateDual({
                            defenseStyle: {
                              ...dual.defenseStyle,
                              fontColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-1.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-800 uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Contorno */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-[10.5px] text-slate-600 mb-1 font-mono">
                      <span>Contorno:</span>
                      <span className="font-semibold">{dual.defenseStyle.strokeWidthPx || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="0.5"
                      value={dual.defenseStyle.strokeWidthPx || 0}
                      onChange={(e) =>
                        updateDual({
                          defenseStyle: {
                            ...dual.defenseStyle,
                            strokeWidthPx: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-sky-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] text-slate-600 font-medium block mb-1">
                      Cor Contorno:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={dual.defenseStyle.strokeColor || '#000000'}
                        onChange={(e) =>
                          updateDual({
                            defenseStyle: {
                              ...dual.defenseStyle,
                              strokeColor: e.target.value,
                            },
                          })
                        }
                        className="w-7 h-7 p-0.5 rounded border border-slate-300 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={dual.defenseStyle.strokeColor || '#000000'}
                        onChange={(e) =>
                          updateDual({
                            defenseStyle: {
                              ...dual.defenseStyle,
                              strokeColor: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-1.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-800 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
