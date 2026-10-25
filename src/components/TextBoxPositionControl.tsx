/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TextBoxPositionControl
 * =========================================================================
 * Controles discretos, compactos e não invasivos de posicionamento X/Y
 * para caixas de texto de todos os tipos de carta (Site, Avatar, Minion, Magic, Aura, Artifact).
 * 
 * Reutiliza os mesmos controles numéricos e estilo dos Thresholds de Site:
 * - Ajuste fino independente de X e Y
 * - Campo numérico com digitação direta (passo 0.1)
 * - Slider com movimentação suave (accent bronze-gold #C5A675)
 * - Botões compactos de passo (- / +)
 * - Botão de restauração rápida para as coordenadas padrão originais
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TextBoxConfig } from '../types/card';
import { CardTypeId } from '../types/cardType';
import { getDefaultTextBoxesForType } from '../utils/cardDefaults';
import { Move, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface TextBoxPositionControlProps {
  box: TextBoxConfig;
  cardType?: CardTypeId | null;
  onUpdateTextBox: (id: string, updates: Partial<TextBoxConfig>) => void;
  label?: string;
  sublabel?: string;
  defaultOpen?: boolean;
}

export const TextBoxPositionControl: React.FC<TextBoxPositionControlProps> = ({
  box,
  cardType,
  onUpdateTextBox,
  label = 'Posicionamento (X / Y)',
  sublabel,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Coordenadas padrão originais para este tipo e caixa de texto
  const defaultCoords = useMemo(() => {
    const defaults = getDefaultTextBoxesForType(cardType);
    const found = defaults.find((b) => (box.role && b.role === box.role) || b.id === box.id);
    return {
      x: found?.xPercent ?? box.xPercent,
      y: found?.yPercent ?? box.yPercent,
    };
  }, [cardType, box.id, box.role]);

  const isCustom =
    Math.abs(box.xPercent - defaultCoords.x) > 0.05 ||
    Math.abs(box.yPercent - defaultCoords.y) > 0.05;

  // Estado local para permitir digitação livre sem conflito com o render
  const [inputX, setInputX] = useState<string>(() => box.xPercent.toFixed(1));
  const [inputY, setInputY] = useState<string>(() => box.yPercent.toFixed(1));

  useEffect(() => {
    setInputX(box.xPercent.toFixed(1));
  }, [box.xPercent]);

  useEffect(() => {
    setInputY(box.yPercent.toFixed(1));
  }, [box.yPercent]);

  const handleStep = (coord: 'x' | 'y', delta: number) => {
    if (coord === 'x') {
      const next = Math.max(0, Math.min(99, Math.round((box.xPercent + delta) * 10) / 10));
      onUpdateTextBox(box.id, { xPercent: next });
    } else {
      const next = Math.max(0, Math.min(99, Math.round((box.yPercent + delta) * 10) / 10));
      onUpdateTextBox(box.id, { yPercent: next });
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateTextBox(box.id, {
      xPercent: defaultCoords.x,
      yPercent: defaultCoords.y,
    });
  };

  return (
    <div className="pt-1.5 border-t border-[#453B2D]/40">
      {/* Botão de alternância compacto e discreto */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[11px] text-[#B5A995] hover:text-[#E8DECA] cursor-pointer transition-colors py-0.5 select-none"
      >
        <span className="flex items-center gap-1.5 font-medium">
          <Move className="w-3 h-3 text-[#C5A675]" />
          <span>{label}</span>
          {sublabel && (
            <span className="text-[10px] text-[#8F8270] font-normal hidden sm:inline">
              ({sublabel})
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#8F8270]">
          <span>
            X: {box.xPercent.toFixed(1)}% · Y: {box.yPercent.toFixed(1)}%
          </span>
          {isCustom && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#C5A675] shrink-0"
              title="Posição personalizada em relação ao padrão original"
            />
          )}
          {isOpen ? (
            <ChevronUp className="w-3 h-3 text-[#C5A675]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[#B5A995]" />
          )}
        </div>
      </button>

      {/* Painel expandido de controles finos X/Y */}
      {isOpen && (
        <div className="mt-2 p-2.5 bg-[#24221E] border border-[#453B2D] rounded space-y-2.5">
          {/* Cabeçalho informativo com botão Restaurar Padrão */}
          <div className="flex items-center justify-between text-[10px] text-[#8F8270]">
            <span>Ajuste fino em % da carta</span>
            {isCustom && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[#B5A995] hover:text-[#E8DECA] flex items-center gap-1 cursor-pointer transition-colors"
                title={`Restaurar coordenadas padrão originais (${defaultCoords.x.toFixed(1)}%, ${defaultCoords.y.toFixed(1)}%)`}
              >
                <RotateCcw className="w-2.5 h-2.5 text-[#C5A675]" />
                <span>Padrão</span>
              </button>
            )}
          </div>

          {/* Eixo X (Horizontal) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#B5A995]">Posição X (Horizontal):</span>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="0.1"
                  value={inputX}
                  onChange={(e) => {
                    const str = e.target.value;
                    setInputX(str);
                    const val = parseFloat(str);
                    if (!isNaN(val) && val >= 0 && val <= 99) {
                      onUpdateTextBox(box.id, { xPercent: Math.round(val * 10) / 10 });
                    }
                  }}
                  onBlur={() => {
                    setInputX(box.xPercent.toFixed(1));
                  }}
                  className="w-13 px-1 py-0.5 text-right bg-[#302D27] border border-[#453B2D] focus:border-[#C5A675] rounded text-[11px] text-[#E8DECA] font-mono focus:outline-none"
                />
                <span className="text-[#8F8270] text-[10px]">%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStep('x', -0.5)}
                className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer transition-colors"
                title="Recuar 0.5% (Horizontal)"
              >
                -
              </button>
              <input
                type="range"
                min="0"
                max="98"
                step="0.1"
                value={box.xPercent}
                onChange={(e) =>
                  onUpdateTextBox(box.id, { xPercent: parseFloat(e.target.value) })
                }
                className="flex-1 accent-[#C5A675] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleStep('x', 0.5)}
                className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer transition-colors"
                title="Avançar 0.5% (Horizontal)"
              >
                +
              </button>
            </div>
          </div>

          {/* Eixo Y (Vertical) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#B5A995]">Posição Y (Vertical):</span>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="0.1"
                  value={inputY}
                  onChange={(e) => {
                    const str = e.target.value;
                    setInputY(str);
                    const val = parseFloat(str);
                    if (!isNaN(val) && val >= 0 && val <= 99) {
                      onUpdateTextBox(box.id, { yPercent: Math.round(val * 10) / 10 });
                    }
                  }}
                  onBlur={() => {
                    setInputY(box.yPercent.toFixed(1));
                  }}
                  className="w-13 px-1 py-0.5 text-right bg-[#302D27] border border-[#453B2D] focus:border-[#C5A675] rounded text-[11px] text-[#E8DECA] font-mono focus:outline-none"
                />
                <span className="text-[#8F8270] text-[10px]">%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStep('y', -0.5)}
                className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer transition-colors"
                title="Recuar 0.5% (Vertical)"
              >
                -
              </button>
              <input
                type="range"
                min="0"
                max="98"
                step="0.1"
                value={box.yPercent}
                onChange={(e) =>
                  onUpdateTextBox(box.id, { yPercent: parseFloat(e.target.value) })
                }
                className="flex-1 accent-[#C5A675] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleStep('y', 0.5)}
                className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer transition-colors"
                title="Avançar 0.5% (Vertical)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
