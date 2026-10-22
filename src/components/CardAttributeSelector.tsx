/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CardAttributeSelector - Segunda Etapa: Escolha de Atributo e Moldura Ancestral
 * =========================================================================
 * Redesign Visual: Sorcery Arcane Atelier
 * Apresentada após a escolha dos tipos que utilizam molduras elementais.
 */

import React from 'react';
import { CardTypeId, getCardTypeName } from '../types/cardType';
import {
  CARD_ATTRIBUTES,
  CardAttributeDefinition,
  CardAttributeId,
} from '../types/cardAttribute';
import {
  ChevronLeft,
  Check,
  Swords,
  Wand2,
  Sparkles,
  ShieldAlert,
  Layers,
} from 'lucide-react';

interface CardAttributeSelectorProps {
  cardType: CardTypeId;
  currentAttribute?: CardAttributeId | null;
  onSelectAttribute: (attributeId: CardAttributeId) => void;
  onBack: () => void;
}

export const CardAttributeSelector: React.FC<CardAttributeSelectorProps> = ({
  cardType,
  currentAttribute,
  onSelectAttribute,
  onBack,
}) => {
  const cardTypeName = getCardTypeName(cardType);

  const renderTypeIcon = (typeId: CardTypeId, className = 'w-4 h-4') => {
    switch (typeId) {
      case 'minion':
        return <Swords className={className} />;
      case 'magic':
        return <Wand2 className={className} />;
      case 'aura':
        return <Sparkles className={className} />;
      case 'artifact':
        return <ShieldAlert className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#24221E] text-[#E8DECA] flex flex-col justify-between overflow-y-auto font-ui selection:bg-[#65543C] selection:text-[#E8DECA]">
      {/* Barra Superior / Minimal Topbar */}
      <header className="px-6 py-4 border-b border-[#453B2D] bg-[#24221E]/95 backdrop-blur-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] rounded border border-[#65543C] hover:border-[#C5A675] transition-all cursor-pointer group"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#B5A995] group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar</span>
          </button>

          <div className="h-4 w-px bg-[#453B2D]" />

          <div className="flex items-center gap-2">
            <span className="font-arcane font-bold text-base tracking-wide text-[#E8DECA]">
              CardForge
            </span>
            <span className="text-[#65543C]">/</span>
            <div className="flex items-center gap-1.5 text-xs text-[#C5A675] font-arcane">
              {renderTypeIcon(cardType)}
              <span>{cardTypeName}</span>
            </div>
          </div>
        </div>

        <span className="font-editorial text-xs text-[#8F8270] hidden sm:inline">
          Etapa 2 • Sintonização Elemental
        </span>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 sm:py-14 flex flex-col justify-center items-center">
        {/* Título e Subtítulo Editorial */}
        <div className="text-center max-w-xl mb-10 space-y-2">
          <h1 className="font-arcane text-2xl sm:text-3xl font-semibold text-[#E8DECA] tracking-tight">
            Escolha o atributo da carta
          </h1>
          <p className="font-editorial text-base text-[#B5A995]">
            Selecione a essência elemental e a moldura de sua criação de {cardTypeName}.
          </p>
        </div>

        {/* Grade dos 6 Atributos com Miniatura Proporcional da Moldura */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
          {CARD_ATTRIBUTES.map((attr: CardAttributeDefinition) => {
            const isSelected = currentAttribute === attr.id;

            return (
              <div
                key={attr.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectAttribute(attr.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectAttribute(attr.id);
                  }
                }}
                className={`group relative rounded-lg p-3.5 transition-all duration-200 flex flex-col justify-between text-left cursor-pointer border focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A675] ${
                  isSelected
                    ? 'bg-[#34352D] border-[#C5A675] ring-1 ring-[#C5A675]/40 shadow-sm'
                    : 'bg-[#302D27] hover:bg-[#34352D] border-[#65543C] hover:border-[#C5A675]'
                }`}
              >
                {/* Miniatura Proporcional da Moldura (Aspecto 63/88) */}
                <div className="w-full aspect-[63/88] rounded overflow-hidden bg-[#24221E] border border-[#453B2D] group-hover:border-[#65543C] mb-3 relative flex items-center justify-center p-1 transition-all">
                  <img
                    src={attr.framePath}
                    alt={`Moldura ${attr.name}`}
                    className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-200 group-hover:scale-105"
                    loading="eager"
                  />

                  {/* Indicador de Seleção Ativa */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-[#C5A675] text-[#24221E] flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Nome do Atributo e Elemento */}
                <div className="space-y-0.5 text-center">
                  <h3 className="font-arcane text-sm font-bold text-[#E8DECA] group-hover:text-[#FAF5E9] transition-colors">
                    {attr.name}
                  </h3>
                  <p className="font-editorial text-xs text-[#B5A995]">
                    {attr.elementName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Rodapé Minimalista */}
      <footer className="px-6 py-4 border-t border-[#453B2D] text-center text-xs text-[#8F8270] flex flex-col sm:flex-row items-center justify-between max-w-5xl w-full mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[#B5A995] hover:text-[#E8DECA] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Voltar para tipos de carta</span>
        </button>
        <span className="font-arcane text-[11px] text-[#8F8270] tracking-widest uppercase mt-1 sm:mt-0">
          CardForge Atelier
        </span>
      </footer>
    </div>
  );
};
