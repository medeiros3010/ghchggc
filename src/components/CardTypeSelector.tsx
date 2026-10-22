/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CardTypeSelector - Tela Inicial de Seleção do Tipo de Carta
 * =========================================================================
 * Redesign Visual: Sorcery Arcane Atelier
 * Estética escura, minimalista e refinada inspirada em Sorcery: Contested Realm.
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

// Descrições muito curtas e refinadas para cada classe do reino
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

  // Mapeamento visual de ícones discretos e consistentes
  const renderTypeIcon = (typeId: CardTypeId, className = 'w-5 h-5') => {
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
      {/* Barra Superior / Minimal Topbar */}
      <header className="px-6 py-4 border-b border-[#453B2D] bg-[#24221E]/95 backdrop-blur-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#65543C] bg-[#302D27] text-[#C5A675] flex items-center justify-center font-arcane font-bold text-xs tracking-wider">
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
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] rounded border border-[#65543C] hover:border-[#C5A675] transition-all cursor-pointer"
            title="Retomar a edição anterior em andamento"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C5A675]" />
            <span>Retomar edição ({getCardTypeName(currentActiveType)})</span>
          </button>
        )}
      </header>

      {/* Conteúdo Central: Título Minimalista e Grade dos 6 Cards */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 sm:py-16 flex flex-col justify-center items-center">
        {/* Título e Subtítulo Conforme Requisito Exato */}
        <div className="text-center max-w-xl mb-12 space-y-2">
          <h1 className="font-arcane text-3xl sm:text-4xl font-semibold text-[#E8DECA] tracking-tight">
            Escolha sua criação
          </h1>
          <p className="font-editorial text-base sm:text-lg text-[#B5A995]">
            Selecione um tipo de carta para começar.
          </p>
        </div>

        {/* Grade Limpa e Consistente com os Seis Tipos de Carta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {CARD_TYPES.map((cardType) => {
            const hasDraft = isSessionActive && currentActiveType === cardType.id;

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
                className="group relative h-44 rounded-lg p-6 bg-[#302D27] hover:bg-[#34352D] border border-[#65543C] hover:border-[#C5A675] transition-all duration-200 flex flex-col justify-between text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A675]"
              >
                {/* Linha Superior: Ícone Discreto e Indicador de Interação */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded bg-[#24221E] border border-[#65543C] group-hover:border-[#C5A675] text-[#C5A675] flex items-center justify-center transition-colors">
                    {renderTypeIcon(cardType.id, 'w-4 h-4')}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasDraft && (
                      <span className="text-[11px] font-editorial text-[#C5A675] tracking-wide">
                        Em edição
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#B5A995] group-hover:text-[#C5A675] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Bloco de Texto: Nome do Tipo e Descrição Curta */}
                <div className="space-y-1.5">
                  <h2 className="font-arcane text-xl font-bold text-[#E8DECA] group-hover:text-[#FAF5E9] tracking-wide transition-colors">
                    {cardType.name}
                  </h2>
                  <p className="font-editorial text-sm text-[#B5A995] line-clamp-2 leading-relaxed">
                    {SHORT_DESCRIPTIONS[cardType.id] || cardType.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Rodapé Minimalista */}
      <footer className="px-6 py-4 border-t border-[#453B2D] text-center text-xs text-[#8F8270] flex flex-col sm:flex-row items-center justify-between max-w-5xl w-full mx-auto">
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
