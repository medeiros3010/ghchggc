import React, { useState } from 'react';
import {
  DualCombatConfig,
  DEFAULT_DUAL_COMBAT_CONFIG,
  DEFAULT_ATTACK_STYLE,
  DEFAULT_DEFENSE_STYLE,
} from '../../types/sorcery';
import { AVAILABLE_FONTS } from '../../utils/fontHelper';
import {
  Swords,
  Shield,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Minus,
  Lock,
  Unlock,
} from 'lucide-react';

interface DualCombatControlsProps {
  config: DualCombatConfig;
  isVisible: boolean;
  isLocked?: boolean;
  onUnlock?: () => void;
  onClearDefense?: () => void;
  onUpdate: (updates: Partial<DualCombatConfig>) => void;
  onToggleVisibility: () => void;
}

export const DualCombatControls: React.FC<DualCombatControlsProps> = ({
  config,
  isVisible,
  isLocked = true,
  onUnlock,
  onClearDefense,
  onUpdate,
  onToggleVisibility,
}) => {
  const [subTab, setSubTab] = useState<'dados' | 'posicao' | 'ataque' | 'defesa'>('dados');

  const attackStyle = config.attackStyle || DEFAULT_ATTACK_STYLE;
  const defenseStyle = config.defenseStyle || DEFAULT_DEFENSE_STYLE;

  // Atualizador tipográfico seguro e independente para Ataque
  const handleUpdateAttackStyle = (styleUpdates: Partial<typeof attackStyle>) => {
    if (isLocked) return;
    onUpdate({
      attackStyle: {
        ...attackStyle,
        ...styleUpdates,
      },
    });
  };

  // Atualizador tipográfico seguro e independente para Defesa
  const handleUpdateDefenseStyle = (styleUpdates: Partial<typeof defenseStyle>) => {
    if (isLocked) return;
    onUpdate({
      defenseStyle: {
        ...defenseStyle,
        ...styleUpdates,
      },
    });
  };

  // Step para Ataque
  const handleStepAttack = (delta: number) => {
    const raw = config.attackValue;
    if (raw === '*' || raw === 'X') {
      onUpdate({ attackValue: delta > 0 ? '1' : '0' });
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) {
      onUpdate({ attackValue: '1' });
    } else {
      const next = Math.max(0, num + delta);
      onUpdate({ attackValue: String(next) });
    }
  };

  // Step para Defesa
  const handleStepDefense = (delta: number) => {
    const raw = config.defenseValue;
    if (raw === '*' || raw === 'X') {
      onUpdate({ defenseValue: delta > 0 ? '1' : '0' });
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) {
      onUpdate({ defenseValue: '1' });
    } else {
      const next = Math.max(0, num + delta);
      onUpdate({ defenseValue: String(next) });
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Status do Bloco B */}
      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-indigo-950">Criatura com Ataque e Defesa</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-sm bg-indigo-200 text-indigo-800">
                Modelo Duplo
              </span>
            </div>
            <span className="text-[10px] text-indigo-700">
              Atk: <strong className="font-mono text-indigo-950">{config.attackValue}</strong> | Def:{' '}
              <strong className="font-mono text-indigo-950">{config.defenseValue}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleVisibility}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
            isVisible
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title={isVisible ? 'Ocultar símbolo na carta' : 'Exibir símbolo na carta'}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isVisible ? 'Visível' : 'Oculto'}</span>
        </button>
      </div>

      {/* Sub-abas de navegação do Bloco B */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
        <button
          type="button"
          onClick={() => setSubTab('dados')}
          className={`py-1 px-1 rounded text-[10px] font-semibold text-center transition-colors ${
            subTab === 'dados' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Valores
        </button>
        <button
          type="button"
          onClick={() => setSubTab('posicao')}
          className={`py-1 px-1 rounded text-[10px] font-semibold text-center transition-colors flex items-center justify-center gap-1 ${
            subTab === 'posicao' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isLocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          <span>Carta (X/Y)</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('ataque')}
          className={`py-1 px-1 rounded text-[10px] font-semibold text-center transition-colors flex items-center justify-center gap-1 ${
            subTab === 'ataque' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isLocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          <span>Ataque</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('defesa')}
          className={`py-1 px-1 rounded text-[10px] font-semibold text-center transition-colors flex items-center justify-center gap-1 ${
            subTab === 'defesa' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isLocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          <span>Defesa</span>
        </button>
      </div>

      {/* Aviso de bloqueio quando aba avançada for clicada com cadeado fechado */}
      {isLocked && subTab !== 'dados' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-amber-900">Configurações Avançadas Bloqueadas</h4>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            As coordenadas X/Y gerais e independentes de Ataque e Defesa, fontes, cores e escalas estão protegidas pelo cadeado para manter seu padrão visual.
          </p>
          {onUnlock && (
            <button
              type="button"
              onClick={onUnlock}
              className="mt-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Desbloquear Configurações Avançadas</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-ABA 1: VALORES E IMAGENS
         ======================================================== */}
      {subTab === 'dados' && (
        <div className="space-y-4">
          {/* Grade de Valores: Ataque e Defesa */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Valor de Ataque */}
            <div className="bg-rose-50/50 border border-rose-200 p-2.5 rounded-lg space-y-2">
              <label className="text-[11px] font-bold text-rose-900 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-rose-600" />
                <span>Ataque (Atk)</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStepAttack(-1)}
                  className="w-7 h-7 rounded border border-rose-300 bg-white hover:bg-rose-100 flex items-center justify-center text-rose-800 font-bold shrink-0 text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="text"
                  value={config.attackValue}
                  onChange={(e) => onUpdate({ attackValue: e.target.value })}
                  placeholder="4"
                  maxLength={4}
                  className="flex-1 px-2 py-1 border border-rose-300 rounded text-center text-xs font-bold font-mono bg-white focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => handleStepAttack(1)}
                  className="w-7 h-7 rounded border border-rose-300 bg-white hover:bg-rose-100 flex items-center justify-center text-rose-800 font-bold shrink-0 text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ attackValue: '*' })}
                  className="px-2 py-1 rounded border border-rose-300 bg-rose-100 text-rose-800 text-xs font-bold font-mono"
                  title="Definir ataque *"
                >
                  *
                </button>
              </div>
            </div>

            {/* Valor de Defesa */}
            <div className="bg-sky-50/50 border border-sky-200 p-2.5 rounded-lg space-y-2">
              <label className="text-[11px] font-bold text-sky-900 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                <span>Defesa (Def)</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStepDefense(-1)}
                  className="w-7 h-7 rounded border border-sky-300 bg-white hover:bg-sky-100 flex items-center justify-center text-sky-800 font-bold shrink-0 text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="text"
                  value={config.defenseValue}
                  onChange={(e) => onUpdate({ defenseValue: e.target.value })}
                  placeholder="5"
                  maxLength={4}
                  className="flex-1 px-2 py-1 border border-sky-300 rounded text-center text-xs font-bold font-mono bg-white focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => handleStepDefense(1)}
                  className="w-7 h-7 rounded border border-sky-300 bg-white hover:bg-sky-100 flex items-center justify-center text-sky-800 font-bold shrink-0 text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ defenseValue: '*' })}
                  className="px-2 py-1 rounded border border-sky-300 bg-sky-100 text-sky-800 text-xs font-bold font-mono"
                  title="Definir defesa *"
                >
                  *
                </button>
              </div>
            </div>
          </div>

          {/* Ação rápida para voltar para somente Ataque (Modo Simples) */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Deseja apenas Ataque?</span>
              <span className="text-[10px] text-slate-500">Volta automaticamente para o modo simples (attack_single.png)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onClearDefense) {
                  onClearDefense();
                } else {
                  onUpdate({ defenseValue: '' });
                }
              }}
              className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-md transition-colors shadow-2xs"
            >
              Somente Ataque
            </button>
          </div>

          {/* Imagem de Fundo (Exibida livremente quando desbloqueado, protegida quando bloqueado) */}
          {isLocked ? (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Imagem: <code className="text-slate-800 font-mono text-[11px]">{config.backgroundImageUrl || '/assets/sorcery/attack_defense.png'}</code></span>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Protegida
              </span>
            </div>
          ) : (
            <>
              {/* Imagem de Fundo Específica do Modelo Duplo */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Imagem de Fundo (Ataque + Defesa)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Modelo exclusivo para criaturas com ataque e defesa
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdate({ backgroundImageUrl: DEFAULT_DUAL_COMBAT_CONFIG.backgroundImageUrl })}
                    className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                    title="Restaurar imagem padrão attack_defense.png"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar</span>
                  </button>
                </div>

                {/* Preview da Imagem Dupla */}
                <div className="flex items-center gap-3">
                  <div className="w-18 h-12 rounded-md border border-slate-300 bg-slate-900 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-inner">
                    {config.backgroundImageUrl ? (
                      <img
                        src={config.backgroundImageUrl}
                        alt="Preview Fundo Duplo"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={config.backgroundImageUrl}
                      onChange={(e) => onUpdate({ backgroundImageUrl: e.target.value })}
                      placeholder="/assets/sorcery/attack_defense.png"
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-mono bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Enviar Imagem Local</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                onUpdate({ backgroundImageUrl: ev.target.result as string });
                              }
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

          {/* Ícones Opcionais de Ataque e Defesa */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Ícone Opcional de Ataque */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800">Ícone de Ataque</span>
                {config.attackImageUrl && (
                  <button
                    type="button"
                    onClick={() => onUpdate({ attackImageUrl: '' })}
                    className="text-[10px] text-rose-600 hover:underline"
                  >
                    Remover
                  </button>
                )}
              </div>
              <input
                type="text"
                value={config.attackImageUrl || ''}
                onChange={(e) => onUpdate({ attackImageUrl: e.target.value })}
                placeholder="URL opcional"
                className="w-full px-2 py-0.5 text-xs border border-slate-300 rounded font-mono bg-white"
              />
              <label className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer w-full justify-center">
                <Upload className="w-3 h-3 text-rose-600" />
                <span>Upload Ícone Atk</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          onUpdate({ attackImageUrl: ev.target.result as string });
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {/* Ícone Opcional de Defesa */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800">Ícone de Defesa</span>
                {config.defenseImageUrl && (
                  <button
                    type="button"
                    onClick={() => onUpdate({ defenseImageUrl: '' })}
                    className="text-[10px] text-sky-600 hover:underline"
                  >
                    Remover
                  </button>
                )}
              </div>
              <input
                type="text"
                value={config.defenseImageUrl || ''}
                onChange={(e) => onUpdate({ defenseImageUrl: e.target.value })}
                placeholder="URL opcional"
                className="w-full px-2 py-0.5 text-xs border border-slate-300 rounded font-mono bg-white"
              />
              <label className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer w-full justify-center">
                <Upload className="w-3 h-3 text-sky-600" />
                <span>Upload Ícone Def</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          onUpdate({ defenseImageUrl: ev.target.result as string });
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-ABA 2: POSICIONAMENTO GERAL NA CARTA
         ======================================================== */}
      {!isLocked && subTab === 'posicao' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Coordenadas do Bloco Duplo na Carta
                </span>
                <span className="text-[10px] text-slate-500">
                  Posição X e Y gerais da imagem dupla
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    xPercent: DEFAULT_DUAL_COMBAT_CONFIG.xPercent,
                    yPercent: DEFAULT_DUAL_COMBAT_CONFIG.yPercent,
                    widthPercent: DEFAULT_DUAL_COMBAT_CONFIG.widthPercent,
                    heightPercent: DEFAULT_DUAL_COMBAT_CONFIG.heightPercent,
                    scale: DEFAULT_DUAL_COMBAT_CONFIG.scale,
                  })
                }
                className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                title="Restaurar posição padrão"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            </div>

            {/* Posição X */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Posição X Geral:</span>
                <span className="font-semibold text-indigo-700">{config.xPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="0.1"
                  value={config.xPercent}
                  onChange={(e) => onUpdate({ xPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-indigo-600"
                />
                <input
                  type="number"
                  min="0"
                  max="95"
                  step="0.5"
                  value={config.xPercent}
                  onChange={(e) => onUpdate({ xPercent: parseFloat(e.target.value) || 0 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Posição Y */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Posição Y Geral:</span>
                <span className="font-semibold text-indigo-700">{config.yPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="0.1"
                  value={config.yPercent}
                  onChange={(e) => onUpdate({ yPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-indigo-600"
                />
                <input
                  type="number"
                  min="0"
                  max="95"
                  step="0.5"
                  value={config.yPercent}
                  onChange={(e) => onUpdate({ yPercent: parseFloat(e.target.value) || 0 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Largura Geral */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Largura Geral (Dupla):</span>
                <span className="font-semibold text-slate-800">{config.widthPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="0.5"
                  value={config.widthPercent}
                  onChange={(e) => onUpdate({ widthPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-indigo-600"
                />
                <input
                  type="number"
                  min="10"
                  max="45"
                  step="0.5"
                  value={config.widthPercent}
                  onChange={(e) => onUpdate({ widthPercent: parseFloat(e.target.value) || 10 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Altura Geral */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Altura Geral:</span>
                <span className="font-semibold text-slate-800">{config.heightPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="3"
                  max="25"
                  step="0.5"
                  value={config.heightPercent}
                  onChange={(e) => onUpdate({ heightPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-indigo-600"
                />
                <input
                  type="number"
                  min="3"
                  max="25"
                  step="0.5"
                  value={config.heightPercent}
                  onChange={(e) => onUpdate({ heightPercent: parseFloat(e.target.value) || 3 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Escala */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Escala Proporcional:</span>
                <span className="font-semibold text-slate-800">{(config.scale || 1.0).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.05"
                value={config.scale || 1.0}
                onChange={(e) => onUpdate({ scale: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Opacidade */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Opacidade:</span>
                <span className="font-semibold text-slate-800">{Math.round((config.opacity ?? 1.0) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={config.opacity ?? 1.0}
                onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Proporção e Z-Index */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.keepAspectRatio}
                  onChange={(e) => onUpdate({ keepAspectRatio: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Preservar proporção</span>
              </label>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Z-Index:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.zIndex || 60}
                  onChange={(e) => onUpdate({ zIndex: parseInt(e.target.value, 10) || 60 })}
                  className="w-12 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-ABA 3: ELEMENTO E TIPOGRAFIA DE ATAQUE (INDEPENDENTE)
         ======================================================== */}
      {!isLocked && subTab === 'ataque' && (
        <div className="space-y-4">
          {/* Posicionamento Independente do Ataque */}
          <div className="bg-rose-50/40 border border-rose-200 p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-900 block">
                  Posicionamento X e Y do Ataque
                </span>
                <span className="text-[10px] text-rose-700">
                  Totalmente independente do elemento de defesa
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    attackXPercent: DEFAULT_DUAL_COMBAT_CONFIG.attackXPercent,
                    attackYPercent: DEFAULT_DUAL_COMBAT_CONFIG.attackYPercent,
                    attackStyle: { ...attackStyle, offsetX: 0, offsetY: 0 },
                  })
                }
                className="text-[10px] text-rose-600 hover:underline flex items-center gap-1"
                title="Restaurar posição padrão do ataque"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Padrão (25%)</span>
              </button>
            </div>

            {/* Posição X do Ataque */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Posição X do Ataque:</span>
                <span className="font-semibold text-rose-700">{config.attackXPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.attackXPercent}
                  onChange={(e) => onUpdate({ attackXPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-rose-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.attackXPercent}
                  onChange={(e) => onUpdate({ attackXPercent: parseFloat(e.target.value) || 0 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Posição Y do Ataque */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Posição Y do Ataque:</span>
                <span className="font-semibold text-rose-700">{config.attackYPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.attackYPercent}
                  onChange={(e) => onUpdate({ attackYPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-rose-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.attackYPercent}
                  onChange={(e) => onUpdate({ attackYPercent: parseFloat(e.target.value) || 0 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Deslocamento Fino (Offset X e Y) */}
            <div className="pt-2 border-t border-rose-200 space-y-2">
              <span className="text-[11px] font-bold text-rose-900 block">
                Ajuste Milimétrico (Offset em Pixels)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                    <span>Offset X:</span>
                    <span>{attackStyle.offsetX || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={attackStyle.offsetX || 0}
                    onChange={(e) => handleUpdateAttackStyle({ offsetX: parseInt(e.target.value, 10) })}
                    className="w-full accent-rose-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                    <span>Offset Y:</span>
                    <span>{attackStyle.offsetY || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={attackStyle.offsetY || 0}
                    onChange={(e) => handleUpdateAttackStyle({ offsetY: parseInt(e.target.value, 10) })}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tipografia Exclusiva do Ataque */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Tipografia do Ataque</span>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Fonte</label>
              <select
                value={attackStyle.fontFamily}
                onChange={(e) => handleUpdateAttackStyle({ fontFamily: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Tamanho da Fonte:</span>
                <span className="font-semibold">{attackStyle.fontSizePx}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="48"
                step="1"
                value={attackStyle.fontSizePx}
                onChange={(e) => handleUpdateAttackStyle({ fontSizePx: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Cor</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={attackStyle.fontColor || '#ffffff'}
                  onChange={(e) => handleUpdateAttackStyle({ fontColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={attackStyle.fontColor || '#ffffff'}
                  onChange={(e) => handleUpdateAttackStyle({ fontColor: e.target.value })}
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded text-xs font-mono bg-white uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Peso</label>
                <select
                  value={attackStyle.fontWeight}
                  onChange={(e) => handleUpdateAttackStyle({ fontWeight: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Médio</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Negrito</option>
                  <option value="black">Preto</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Estilo</label>
                <select
                  value={attackStyle.fontStyle}
                  onChange={(e) => handleUpdateAttackStyle({ fontStyle: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Itálico</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Contorno</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={attackStyle.strokeWidthPx || 0}
                  onChange={(e) => handleUpdateAttackStyle({ strokeWidthPx: parseInt(e.target.value, 10) })}
                  className="flex-1 accent-rose-600"
                />
                <span className="text-xs font-mono w-8 text-right">{attackStyle.strokeWidthPx || 0}px</span>
                <input
                  type="color"
                  value={attackStyle.strokeColor || '#000000'}
                  onChange={(e) => handleUpdateAttackStyle({ strokeColor: e.target.value })}
                  className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0.5"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-ABA 4: ELEMENTO E TIPOGRAFIA DE DEFESA (INDEPENDENTE)
         ======================================================== */}
      {!isLocked && subTab === 'defesa' && (
        <div className="space-y-4">
          {/* Posicionamento Independente da Defesa */}
          <div className="bg-sky-50/40 border border-sky-200 p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-900 block">
                  Posicionamento X e Y da Defesa
                </span>
                <span className="text-[10px] text-sky-700">
                  Totalmente independente do elemento de ataque
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    defenseXPercent: DEFAULT_DUAL_COMBAT_CONFIG.defenseXPercent,
                    defenseYPercent: DEFAULT_DUAL_COMBAT_CONFIG.defenseYPercent,
                    defenseStyle: { ...defenseStyle, offsetX: 0, offsetY: 0 },
                  })
                }
                className="text-[10px] text-sky-600 hover:underline flex items-center gap-1"
                title="Restaurar posição padrão da defesa"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Padrão (72%)</span>
              </button>
            </div>

            {/* Posição X da Defesa */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Posição X da Defesa:</span>
                <span className="font-semibold text-sky-700">{config.defenseXPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.defenseXPercent}
                  onChange={(e) => onUpdate({ defenseXPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-sky-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.defenseXPercent}
                  onChange={(e) => onUpdate({ defenseXPercent: parseFloat(e.target.value) || 0 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Posição Y da Defesa */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Posição Y da Defesa:</span>
                <span className="font-semibold text-sky-700">{config.defenseYPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.defenseYPercent}
                  onChange={(e) => onUpdate({ defenseYPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-sky-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.defenseYPercent}
                  onChange={(e) => onUpdate({ defenseYPercent: parseFloat(e.target.value) || 0 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Deslocamento Fino (Offset X e Y) */}
            <div className="pt-2 border-t border-sky-200 space-y-2">
              <span className="text-[11px] font-bold text-sky-900 block">
                Ajuste Milimétrico (Offset em Pixels)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                    <span>Offset X:</span>
                    <span>{defenseStyle.offsetX || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={defenseStyle.offsetX || 0}
                    onChange={(e) => handleUpdateDefenseStyle({ offsetX: parseInt(e.target.value, 10) })}
                    className="w-full accent-sky-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                    <span>Offset Y:</span>
                    <span>{defenseStyle.offsetY || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={defenseStyle.offsetY || 0}
                    onChange={(e) => handleUpdateDefenseStyle({ offsetY: parseInt(e.target.value, 10) })}
                    className="w-full accent-sky-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tipografia Exclusiva da Defesa */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Tipografia da Defesa</span>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Fonte</label>
              <select
                value={defenseStyle.fontFamily}
                onChange={(e) => handleUpdateDefenseStyle({ fontFamily: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Tamanho da Fonte:</span>
                <span className="font-semibold">{defenseStyle.fontSizePx}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="48"
                step="1"
                value={defenseStyle.fontSizePx}
                onChange={(e) => handleUpdateDefenseStyle({ fontSizePx: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Cor</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={defenseStyle.fontColor || '#ffffff'}
                  onChange={(e) => handleUpdateDefenseStyle({ fontColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={defenseStyle.fontColor || '#ffffff'}
                  onChange={(e) => handleUpdateDefenseStyle({ fontColor: e.target.value })}
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded text-xs font-mono bg-white uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Peso</label>
                <select
                  value={defenseStyle.fontWeight}
                  onChange={(e) => handleUpdateDefenseStyle({ fontWeight: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Médio</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Negrito</option>
                  <option value="black">Preto</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">Estilo</label>
                <select
                  value={defenseStyle.fontStyle}
                  onChange={(e) => handleUpdateDefenseStyle({ fontStyle: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Itálico</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Contorno</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={defenseStyle.strokeWidthPx || 0}
                  onChange={(e) => handleUpdateDefenseStyle({ strokeWidthPx: parseInt(e.target.value, 10) })}
                  className="flex-1 accent-sky-600"
                />
                <span className="text-xs font-mono w-8 text-right">{defenseStyle.strokeWidthPx || 0}px</span>
                <input
                  type="color"
                  value={defenseStyle.strokeColor || '#000000'}
                  onChange={(e) => handleUpdateDefenseStyle({ strokeColor: e.target.value })}
                  className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0.5"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
