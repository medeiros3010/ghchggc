/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CardTypeSelector - Tela Inicial de Seleção do Tipo de Carta
 * =========================================================================
 * Galeria Elegante de Cartas Sorcery Arcane Atelier
 * Apresenta os 6 tipos de carta em uma grade 3x2 com cartas completas e sem cortes
 * (object-fit: contain), tipografia refinada e interações sutis de fantasia medieval.
 */

import React from 'react';
import { CardTypeId, CARD_TYPES, getCardTypeName } from '../types/cardType';
import {
  Swords,
  MapPin,
  Crown,
  Wand2,
  Sparkles,
  ShieldAlert,
  Layers,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface CardTypeSelectorProps {
  onSelectType: (typeId: CardTypeId) => void;
  onResumeCard?: (typeId: CardTypeId) => void;
  hasActiveSession?: boolean;
  activeCardType?: CardTypeId | null;
  onStartFreshCard?: (typeId: CardTypeId) => void;
  hasActiveMinionSession?: boolean;
  onStartFreshMinion?: () => void;
}

// Imagens permanentes das 6 cartas de referência fornecidas
const CARD_TYPE_IMAGES: Record<CardTypeId, string> = {
  site: '/assets/card-types/site.png',
  avatar: '/assets/card-types/avatar.png',
  magic: '/assets/card-types/magic.png',
  aura: '/assets/card-types/aura.png',
  artifact: '/assets/card-types/artifact.png',
  minion: '/assets/card-types/minion.png',
};

// Descrições curtas e discretas para cada classe de carta
const SHORT_DESCRIPTIONS: Record<CardTypeId, string> = {
  site: 'Locais e terrenos estratégicos que formam o Atlas do reino.',
  avatar: 'O conjurador primordial que personifica o jogador em campo.',
  magic: 'Feitiços e conjurações arcanas de efeito imediato.',
  aura: 'Encantamentos contínuos vinculados a unidades ou regiões.',
  artifact: 'Relíquias, armas e construtos ancestrais permanentes.',
  minion: 'Criaturas e combatentes invocados para a contenda.',
};

export const CardTypeSelector: React.FC<CardTypeSelectorProps> = ({
  onSelectType,
  onResumeCard,
  hasActiveSession,
  activeCardType,
  hasActiveMinionSession,
}) => {
  const isSessionActive = hasActiveSession ?? hasActiveMinionSession ?? false;
  const currentActiveType = activeCardType || (isSessionActive ? 'minion' : null);

  // Mapeamento visual de ícones discretos e temáticos
  const renderTypeIcon = (typeId: CardTypeId, className = 'w-4 h-4') => {
    switch (typeId) {
      case 'minion':
        return <Swords className={className} />;
      case 'site':
        return <MapPin className={className} />;
      case 'avatar':
        return <Crown className={className} />;
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
      {/* Barra Superior Minimalista */}
      <header className="px-6 py-4 border-b border-[#453B2D] bg-[#24221E]/95 backdrop-blur-xs flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#65543C] bg-[#302D27] text-[#C5A675] flex items-center justify-center font-arcane font-bold text-xs tracking-wider shadow-xs">
            CF
          </div>
          <div className="flex items-center gap-2">
            <span className="font-arcane font-bold text-base tracking-wide text-[#E8DECA]">
              CardForge
            </span>
            <span className="text-[#65543C]">/</span>
            <span className="font-editorial text-xs text-[#B5A995] italic">
              Sorcery: Contested Realm
            </span>
          </div>
        </div>

        {isSessionActive && currentActiveType && (
          <button
            onClick={() => (onResumeCard || onSelectType)(currentActiveType)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] rounded-lg border border-[#65543C] hover:border-[#C5A675] transition-all cursor-pointer shadow-xs"
            title="Retomar a edição anterior em andamento"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C5A675]" />
            <span>Retomar edição ({getCardTypeName(currentActiveType)})</span>
          </button>
        )}
      </header>

      {/* Conteúdo Central: Título Minimalista e Grade dos 6 Cards */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col justify-center items-center">
        {/* Título e Subtítulo */}
        <div className="text-center max-w-xl mb-10 sm:mb-12 space-y-2">
          <h1 className="font-arcane text-3xl sm:text-4xl font-semibold text-[#E8DECA] tracking-wide">
            Escolha sua criação
          </h1>
          <p className="font-editorial text-base sm:text-lg text-[#B5A995]">
            Selecione um tipo de carta para começar a forjar no atelier.
          </p>
        </div>

        {/* Grade de 3 colunas e 2 linhas em telas grandes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {CARD_TYPES.map((cardType) => {
            const hasDraft = isSessionActive && currentActiveType === cardType.id;
            const imageUrl = CARD_TYPE_IMAGES[cardType.id];

            return (
              <div
                key={cardType.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectType(cardType.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectType(cardType.id);
                  }
                }}
                className="group relative rounded-xl overflow-hidden bg-[#24221E] border border-[#4E4133] hover:border-[#C5A675] shadow-lg shadow-black/40 hover:shadow-2xl hover:shadow-[#C5A675]/10 hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A675]"
              >
                {/* Palco de Exibição da Carta Inteira (Sem cortes - object-contain) */}
                <div className="relative w-full h-[390px] sm:h-[430px] p-2.5 sm:p-3 bg-[#181613] flex items-center justify-center overflow-hidden">
                  {/* Se for Site (horizontal), preenchimento ambiente com desfoque suave da própria arte */}
                  {cardType.id === 'site' && (
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 scale-110 pointer-events-none"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                  )}

                  {/* A carta completa, centralizada e 100% íntegra (título, arte, caixas de efeito e bordas) */}
                  <img
                    src={imageUrl}
                    alt={cardType.name}
                    className="relative z-10 max-h-full max-w-full object-contain rounded-[4px] shadow-md transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                    loading="lazy"
                  />
                </div>

                {/* Faixa Separada de Informações na Parte Inferior (Abaixo da Imagem) */}
                <div className="relative px-5 py-3.5 bg-[#24221E] border-t border-[#453B2D]/70 flex flex-col gap-1.5 z-10 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#1E1C18] border border-[#65543C] group-hover:border-[#C5A675] text-[#C5A675] flex items-center justify-center transition-colors shadow-xs">
                        {renderTypeIcon(cardType.id, 'w-3.5 h-3.5')}
                      </div>
                      <h2 className="font-arcane text-base sm:text-lg font-bold tracking-wider text-[#E8DECA] group-hover:text-[#FAF5E9] uppercase transition-colors">
                        {cardType.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasDraft && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1E1C18] border border-[#C5A675]/70 text-[#C5A675] text-xs font-editorial tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A675] animate-pulse" />
                          Em edição
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-[#8F8270] group-hover:text-[#C5A675] font-editorial tracking-wider transition-all duration-200">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Criar</span>
                        <ChevronRight className="w-4 h-4 text-[#8F8270] group-hover:text-[#C5A675] group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  </div>

                  <p className="font-editorial text-xs sm:text-sm text-[#B5A995] leading-relaxed line-clamp-2">
                    {SHORT_DESCRIPTIONS[cardType.id] || cardType.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Rodapé Minimalista */}
      <footer className="px-6 py-4 border-t border-[#453B2D] text-center text-xs text-[#8F8270] flex flex-col sm:flex-row items-center justify-between max-w-6xl w-full mx-auto">
        <span className="font-editorial text-xs text-[#8F8270]">
          Sorcery: Contested Realm™ • Criação não oficial para fãs e colecionadores.
        </span>
        <span className="font-arcane text-[11px] text-[#B5A995] tracking-widest uppercase mt-1 sm:mt-0">
          CardForge Atelier
        </span>
      </footer>
    </div>
  );
};

