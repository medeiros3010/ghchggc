/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Componente TextSymbolsMenu
 * =========================================================================
 * Menu popover para inserção de símbolos de Threshold (Air, Earth, Fire, Water)
 * e outros caracteres (seta →) diretamente nas caixas de texto do editor.
 * Inspirado no menu "Symbols" do Sorcerer's Spellbook.
 */

import React, { useState, useRef, useEffect } from 'react';
import { TEXT_SYMBOLS, TextSymbolItem } from '../utils/textSymbols';
import { Sparkles, ChevronDown, X } from 'lucide-react';

interface TextSymbolsMenuProps {
  onInsertSymbol: (code: string) => void;
  buttonLabel?: string;
  size?: 'sm' | 'xs';
  variant?: 'toolbar' | 'compact';
  className?: string;
  menuPlacement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const TextSymbolsMenu: React.FC<TextSymbolsMenuProps> = ({
  onInsertSymbol,
  buttonLabel = 'Símbolos',
  size = 'xs',
  variant = 'toolbar',
  className = '',
  menuPlacement = 'bottom-left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora dele
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const originalThresholds = TEXT_SYMBOLS.filter(
    (s) => s.category === 'threshold' && s.subcategory === 'original'
  );
  const customThresholds = TEXT_SYMBOLS.filter(
    (s) => s.category === 'threshold' && s.subcategory === 'custom'
  );
  const otherSymbols = TEXT_SYMBOLS.filter((s) => s.category === 'other');

  const handleSymbolClick = (item: TextSymbolItem) => {
    onInsertSymbol(item.code);
  };

  // Posicionamento do popover
  const placementClasses = {
    'bottom-left': 'top-full left-0 mt-1',
    'bottom-right': 'top-full right-0 mt-1',
    'top-left': 'bottom-full left-0 mb-1',
    'top-right': 'bottom-full right-0 mb-1',
  }[menuPlacement];

  const isXs = size === 'xs';

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Botão Gatilho na Barra de Ferramentas */}
      <button
        type="button"
        onMouseDown={(e) => {
          // Previne perda de foco e seleção do input/textarea ao clicar no botão
          e.preventDefault();
        }}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        title="Inserir símbolos nas Regras/Descrição (Thresholds e seta)"
        className={`inline-flex items-center gap-1.5 font-semibold rounded transition-all cursor-pointer select-none ${
          isXs ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
        } ${
          isOpen
            ? 'bg-[#C5A675] text-[#1C1A17] shadow-sm font-bold border border-[#C5A675]'
            : variant === 'compact'
            ? 'bg-[#24221E] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] border border-[#453B2D]'
            : 'bg-[#1E1D19] hover:bg-[#2C2923] text-[#E8DECA] hover:text-[#FAF5E9] border border-[#453B2D] hover:border-[#65543C]'
        }`}
      >
        {/* Ícone de símbolo estilo esfera branca do Sorcerer's Spellbook */}
        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-white via-slate-200 to-slate-400 shadow-xs ring-1 ring-black/40 shrink-0" />
        <span>{buttonLabel}</span>
        <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Popover Flutuante */}
      {isOpen && (
        <div
          onMouseDown={(e) => {
            // Garante que cliques no interior do menu não roubem o foco do textarea
            e.preventDefault();
          }}
          className={`absolute ${placementClasses} z-50 w-72 bg-[#1C1A17] border border-[#524434] rounded-lg shadow-2xl p-2.5 text-[#E8DECA] font-ui backdrop-blur-md animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Cabeçalho do Popover */}
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#38332A]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A675] font-arcane flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Símbolos de Texto</span>
            </span>
            <span className="text-[9px] text-[#A69986] font-mono">10 disponíveis</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIsOpen(false)}
              className="text-[#8F8270] hover:text-[#FAF5E9] p-0.5 rounded cursor-pointer transition-colors"
              title="Fechar menu"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Categoria 1: Thresholds Originais */}
          <div className="mb-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C5A675] mb-1 flex items-center justify-between">
              <span>Thresholds Originais</span>
              <span className="text-[9px] text-[#786D5F] font-normal lowercase">(4 elementos)</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {originalThresholds.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSymbolClick(item)}
                  title={`${item.label} (${item.code}) - ${item.description}`}
                  className="group flex flex-col items-center justify-center p-1.5 bg-[#26231E] hover:bg-[#343028] border border-[#453B2D] hover:border-[#C5A675] rounded transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <img
                    src={item.iconUrl}
                    alt={item.label}
                    className="w-5 h-5 object-contain filter drop-shadow group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[9px] mt-1 font-medium text-[#C5BBAA] group-hover:text-[#FAF5E9]">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Categoria 2: Thresholds Personalizados */}
          <div className="mb-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C5A675] mb-1 flex items-center justify-between">
              <span>Thresholds Personalizados</span>
              <span className="text-[9px] text-[#786D5F] font-normal lowercase">(5 elementos)</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {customThresholds.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSymbolClick(item)}
                  title={`${item.label} (${item.code}) - ${item.description}`}
                  className="group flex flex-col items-center justify-center p-1 bg-[#26231E] hover:bg-[#343028] border border-[#453B2D] hover:border-[#C5A675] rounded transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <img
                    src={item.iconUrl}
                    alt={item.label}
                    className="w-5 h-5 object-contain filter drop-shadow group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[8px] mt-1 font-medium text-[#C5BBAA] group-hover:text-[#FAF5E9] truncate max-w-full">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Categoria 3: Outros */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C5A675] mb-1 flex items-center justify-between">
              <span>Outros</span>
              <span className="text-[9px] text-[#786D5F] font-normal lowercase">(seta)</span>
            </div>
            <div className="flex gap-1.5">
              {otherSymbols.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSymbolClick(item)}
                  title={`${item.description} (${item.code})`}
                  className="flex items-center gap-2 px-3 py-1 bg-[#26231E] hover:bg-[#343028] border border-[#453B2D] hover:border-[#C5A675] rounded text-xs font-medium text-[#E8DECA] hover:text-[#FAF5E9] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-base font-bold font-mono text-[#C5A675] leading-none">
                    {item.textChar || item.code}
                  </span>
                  <span className="text-[11px]">{item.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dica de uso */}
          <div className="mt-2 pt-1.5 border-t border-[#2F2B23] text-[9px] text-[#7A6F60] leading-tight">
            Insere na posição do cursor. Permite apagar com Backspace.
          </div>
        </div>
      )}
    </div>
  );
};
