import React, { useState } from 'react';
import {
  SingleAttackCombatConfig,
  DEFAULT_SINGLE_ATTACK_CONFIG,
  DEFAULT_ATTACK_STYLE,
} from '../../types/sorcery';
import { AVAILABLE_FONTS } from '../../utils/fontHelper';
import {
  Swords,
  Upload,
  RotateCcw,
  Sliders,
  Type,
  Layers,
  Sparkles,
  Move,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Minus,
  Lock,
  Unlock,
  Shield,
} from 'lucide-react';

interface SingleCombatControlsProps {
  config: SingleAttackCombatConfig;
  isVisible: boolean;
  isLocked?: boolean;
  onUnlock?: () => void;
  onAddDefense?: (defVal: string) => void;
  onUpdate: (updates: Partial<SingleAttackCombatConfig>) => void;
  onToggleVisibility: () => void;
}

export const SingleCombatControls: React.FC<SingleCombatControlsProps> = ({
  config,
  isVisible,
  isLocked = false,
  onUnlock,
  onAddDefense,
  onUpdate,
  onToggleVisibility,
}) => {
  const [subTab, setSubTab] = useState<'dados' | 'posicao' | 'ataque' | 'tipografia'>('dados');
  const [tempDefense, setTempDefense] = useState<string>('');

  const style = config.style || DEFAULT_ATTACK_STYLE;

  // Atualizador tipográfico seguro e independente
  const handleUpdateStyle = (styleUpdates: Partial<typeof style>) => {
    onUpdate({
      style: {
        ...style,
        ...styleUpdates,
      },
    });
  };

  // Helper para manipular valor de ataque (aceita números e '*')
  const handleValueChange = (val: string) => {
    onUpdate({ value: val });
  };

  const handleStepValue = (delta: number) => {
    const raw = config.value;
    if (raw === '*' || raw === 'X') {
      onUpdate({ value: delta > 0 ? '1' : '0' });
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) {
      onUpdate({ value: '1' });
    } else {
      const next = Math.max(0, num + delta);
      onUpdate({ value: String(next) });
    }
  };

  const handleApplyDefense = (def: string) => {
    const clean = def.trim();
    if (clean !== '' && onAddDefense) {
      onAddDefense(clean);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Status do Bloco A */}
      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-600 font-bold shrink-0">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-rose-950">Criatura com Ataque</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-sm bg-rose-200 text-rose-800">
                Modelo Simples
              </span>
            </div>
            <span className="text-[10px] text-rose-700">
              Valor atual: <strong className="font-mono text-rose-900">{config.value || 'Vazio'}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleVisibility}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
            isVisible
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title={isVisible ? 'Ocultar símbolo na carta' : 'Exibir símbolo na carta'}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isVisible ? 'Visível' : 'Oculto'}</span>
        </button>
      </div>

      {/* Sub-abas de configuração do Bloco A */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
        <button
          type="button"
          onClick={() => setSubTab('dados')}
          className={`py-1 px-1 rounded text-[10px] font-semibold text-center transition-colors ${
            subTab === 'dados' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Valores
        </button>
        <button
          type="button"
          onClick={() => setSubTab('posicao')}
          className={`py-1 px-1 rounded text-[10px] font-semibold text-center transition-colors flex items-center justify-center gap-1 ${
            subTab === 'posicao' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Carta (X/Y)</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('ataque')}
          className={`py-1 px-1 rounded text-[10px] font-semibold text-center transition-colors flex items-center justify-center gap-1 ${
            subTab === 'ataque' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Ataque (X/Y)</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('tipografia')}
          className={`py-1 px-1 rounded text-[10px] font-semibold text-center transition-colors flex items-center justify-center gap-1 ${
            subTab === 'tipografia' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Tipografia</span>
        </button>
      </div>

      {/* ========================================================
          SUB-ABA 1: VALORES E IMAGENS
         ======================================================== */}
      {subTab === 'dados' && (
        <div className="space-y-4">
          {/* Valor de Ataque */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2.5">
            <label className="text-xs font-bold text-slate-800 block">
              Valor de Ataque (Número ou *)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleStepValue(-1)}
                className="w-8 h-8 rounded border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0"
                title="Diminuir ataque"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                value={config.value}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder="Ex: 4 ou *"
                maxLength={4}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-center text-sm font-bold font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
              />
              <button
                type="button"
                onClick={() => handleStepValue(1)}
                className="w-8 h-8 rounded border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0"
                title="Aumentar ataque"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleValueChange('*')}
                className="px-2.5 py-1.5 rounded border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold font-mono shrink-0"
                title="Definir ataque como *"
              >
                *
              </button>
            </div>

            {/* Atalhos Rápidos */}
            <div className="flex flex-wrap gap-1 pt-1">
              {['0', '1', '2', '3', '4', '5', '6', '7', '8', 'X'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleValueChange(v)}
                  className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border transition-colors ${
                    config.value === v
                      ? 'bg-rose-600 text-white border-rose-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Campo para Adicionar Defesa (Alterna automaticamente para Modo Duplo) */}
          {onAddDefense && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sky-600" />
                <label className="text-xs font-bold text-slate-800">
                  Adicionar Defesa (Ativar Modo ATK/DEF)
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                Ao preencher um valor de Defesa, a carta alternará automaticamente para o modo duplo (attack_defense.png).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Ex: 5 ou *"
                  value={tempDefense}
                  onChange={(e) => setTempDefense(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyDefense(tempDefense || '5');
                    }
                  }}
                  className="w-24 px-3 py-1.5 border border-slate-300 rounded text-center text-sm font-bold font-mono bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => handleApplyDefense(tempDefense || '5')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-bold transition-colors shadow-2xs"
                >
                  Ativar Defesa
                </button>
              </div>
            </div>
          )}

          {/* Imagem de Fundo (Exibida livremente quando desbloqueado, protegida quando bloqueado) */}
          {isLocked ? (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Imagem: <code className="text-slate-800 font-mono text-[11px]">{config.imageUrl || '/assets/sorcery/attack_single.png'}</code></span>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Protegida
              </span>
            </div>
          ) : (
            <>
              {/* Imagem de Fundo Específica do Modelo de Ataque */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Imagem de Fundo (Ataque Simples)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Modelo exclusivo para criaturas com apenas ataque
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdate({ imageUrl: DEFAULT_SINGLE_ATTACK_CONFIG.imageUrl })}
                    className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                    title="Restaurar imagem padrão attack_single.png"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar</span>
                  </button>
                </div>

                {/* Preview da Imagem */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-md border border-slate-300 bg-slate-900 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-inner">
                    {config.imageUrl ? (
                      <img
                        src={config.imageUrl}
                        alt="Preview Fundo Ataque"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={config.imageUrl}
                      onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                      placeholder="/assets/sorcery/attack_single.png"
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-mono bg-white focus:ring-1 focus:ring-rose-500"
                    />
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-rose-600" />
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
                                onUpdate({ imageUrl: ev.target.result as string });
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

              {/* Imagem / Ícone Opcional Associado ao Ataque */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Ícone / Elemento Adicional de Ataque
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Opcional — sobreposto à imagem de fundo
                    </span>
                  </div>
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

                <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md border border-slate-300 bg-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                {config.attackImageUrl ? (
                  <img
                    src={config.attackImageUrl}
                    alt="Ícone Ataque"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Swords className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={config.attackImageUrl || ''}
                  onChange={(e) => onUpdate({ attackImageUrl: e.target.value })}
                  placeholder="URL opcional do ícone de ataque"
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-mono bg-white"
                />
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-rose-600" />
                  <span>Enviar Ícone Local</span>
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
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-ABA 2: POSICIONAMENTO E DIMENSÕES NA CARTA
         ======================================================== */}
      {!isLocked && subTab === 'posicao' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Coordenadas da Imagem na Carta
                </span>
                <span className="text-[10px] text-slate-500">
                  Posição X e Y diretas da imagem simples
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    xPercent: DEFAULT_SINGLE_ATTACK_CONFIG.xPercent,
                    yPercent: DEFAULT_SINGLE_ATTACK_CONFIG.yPercent,
                    widthPercent: DEFAULT_SINGLE_ATTACK_CONFIG.widthPercent,
                    heightPercent: DEFAULT_SINGLE_ATTACK_CONFIG.heightPercent,
                    scale: DEFAULT_SINGLE_ATTACK_CONFIG.scale,
                  })
                }
                className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                title="Restaurar posição padrão"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            </div>

            {/* Posição X */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Posição X (Horizontal):</span>
                <span className="font-semibold text-rose-700">{config.xPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="0.1"
                  value={config.xPercent}
                  onChange={(e) => onUpdate({ xPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-rose-600"
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
                <span>Posição Y (Vertical):</span>
                <span className="font-semibold text-rose-700">{config.yPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="0.1"
                  value={config.yPercent}
                  onChange={(e) => onUpdate({ yPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-rose-600"
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

            {/* Largura */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Largura na Carta:</span>
                <span className="font-semibold text-slate-800">{config.widthPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="4"
                  max="30"
                  step="0.5"
                  value={config.widthPercent}
                  onChange={(e) => onUpdate({ widthPercent: parseFloat(e.target.value) })}
                  className="flex-1 accent-rose-600"
                />
                <input
                  type="number"
                  min="4"
                  max="30"
                  step="0.5"
                  value={config.widthPercent}
                  onChange={(e) => onUpdate({ widthPercent: parseFloat(e.target.value) || 4 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Altura */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Altura na Carta:</span>
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
                  className="flex-1 accent-rose-600"
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
                className="w-full accent-rose-600"
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
                className="w-full accent-rose-600"
              />
            </div>

            {/* Opções de proporção e camada */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.keepAspectRatio}
                  onChange={(e) => onUpdate({ keepAspectRatio: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
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
          SUB-ABA 3: COORDENADAS DO ELEMENTO/NÚMERO DE ATAQUE
         ======================================================== */}
      {!isLocked && subTab === 'ataque' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Posicionamento Direto do Ataque (X e Y)
                </span>
                <span className="text-[10px] text-slate-500">
                  Controla exatamente onde o número/ícone fica sobre a imagem
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    attackXPercent: 50.0,
                    attackYPercent: 50.0,
                    style: { ...style, offsetX: 0, offsetY: 0 },
                  })
                }
                className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                title="Centralizar elemento no meio da imagem"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Centralizar</span>
              </button>
            </div>

            {/* Posição X Interna */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Coordenada X Interna:</span>
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

            {/* Posição Y Interna */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Coordenada Y Interna:</span>
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

            {/* Deslocamento Fino em Pixels */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                Deslocamento Fino em Pixels (Ajuste Milimétrico)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                    <span>Offset X:</span>
                    <span>{style.offsetX || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="1"
                    value={style.offsetX || 0}
                    onChange={(e) => handleUpdateStyle({ offsetX: parseInt(e.target.value, 10) })}
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                    <span>Offset Y:</span>
                    <span>{style.offsetY || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="1"
                    value={style.offsetY || 0}
                    onChange={(e) => handleUpdateStyle({ offsetY: parseInt(e.target.value, 10) })}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-ABA 4: TIPOGRAFIA COMPLETA DO NÚMERO DE ATAQUE
         ======================================================== */}
      {!isLocked && subTab === 'tipografia' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Tipografia do Ataque</span>
              <button
                type="button"
                onClick={() => onUpdate({ style: { ...DEFAULT_ATTACK_STYLE } })}
                className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                title="Restaurar tipografia padrão"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            </div>

            {/* Família da Fonte */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Família da Fonte
              </label>
              <select
                value={style.fontFamily}
                onChange={(e) => handleUpdateStyle({ fontFamily: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-rose-500"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tamanho da Fonte */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                <span>Tamanho da Fonte:</span>
                <span className="font-semibold">{style.fontSizePx}px</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="12"
                  max="48"
                  step="1"
                  value={style.fontSizePx}
                  onChange={(e) => handleUpdateStyle({ fontSizePx: parseInt(e.target.value, 10) })}
                  className="flex-1 accent-rose-600"
                />
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={style.fontSizePx}
                  onChange={(e) => handleUpdateStyle({ fontSizePx: parseInt(e.target.value, 10) || 20 })}
                  className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-mono bg-white"
                />
              </div>
            </div>

            {/* Cor do Texto */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Cor do Número
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.fontColor || '#ffffff'}
                  onChange={(e) => handleUpdateStyle({ fontColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={style.fontColor || '#ffffff'}
                  onChange={(e) => handleUpdateStyle({ fontColor: e.target.value })}
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded text-xs font-mono bg-white uppercase"
                />
              </div>
            </div>

            {/* Peso e Estilo */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                  Peso da Fonte
                </label>
                <select
                  value={style.fontWeight}
                  onChange={(e) => handleUpdateStyle({ fontWeight: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="normal">Normal (400)</option>
                  <option value="medium">Médio (500)</option>
                  <option value="semibold">Semibold (600)</option>
                  <option value="bold">Negrito (700)</option>
                  <option value="black">Preto (900)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                  Estilo
                </label>
                <select
                  value={style.fontStyle}
                  onChange={(e) => handleUpdateStyle({ fontStyle: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Itálico</option>
                </select>
              </div>
            </div>

            {/* Contorno (Stroke) */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                Contorno Opcional (Borda do Número)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={style.strokeWidthPx || 0}
                  onChange={(e) => handleUpdateStyle({ strokeWidthPx: parseInt(e.target.value, 10) })}
                  className="flex-1 accent-rose-600"
                />
                <span className="text-xs font-mono w-8 text-right">{style.strokeWidthPx || 0}px</span>
                <input
                  type="color"
                  value={style.strokeColor || '#000000'}
                  onChange={(e) => handleUpdateStyle({ strokeColor: e.target.value })}
                  className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0.5"
                  title="Cor do contorno"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
