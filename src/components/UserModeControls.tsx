/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * UserModeControls - Modo Usuário (Criação Simplificada)
 * =========================================================================
 * Redesign Visual: Sorcery Arcane Atelier
 * Estética escura, sóbria, minimalista e clássica de fantasia.
 * 
 * Organizada em 4 seções lógicas:
 * 1. Dados da carta (Nome, Tipo/Subtipo, Regras/Descrição, Rodapé/Numeração)
 * 2. Atributos (Mana, Thresholds elementais, Escolha entre ATK e ATK/DEF)
 * 3. Aparência (Upload de ilustração, enquadramento e moldura ancestral)
 * 4. Finalizar (Resumo, Exportar PNG e Salvar)
 */

import React, { useState, useRef } from 'react';
import {
  CardArtConfig,
  CardFrameConfig,
  TextBoxConfig,
  TextBoxRole,
  findBoxByRole,
} from '../types/card';
import {
  SorceryIndicatorsConfig,
  SorceryManaConfig,
  SorceryThresholdConfig,
  SorceryCombatConfig,
  CreatureCombatType,
  SorceryElement,
  getThresholdElementImagePath,
} from '../types/sorcery';
import { hasCombatAttributes, getCardTypeName } from '../types/cardType';
import {
  CARD_ATTRIBUTES,
  CardAttributeId,
  getAllowedThresholdElements,
  findAttributeByFrameUrl,
  getAttributesForType,
} from '../types/cardAttribute';
import {
  FileText,
  Flame,
  Image as ImageIcon,
  CheckCircle2,
  Download,
  Upload,
  Trash2,
  Swords,
  Shield,
  ArrowRight,
  ArrowLeft,
  FilePlus2,
  Code2,
  Info,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  RotateCcw,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Move,
} from 'lucide-react';
import { TextSymbolsMenu } from './TextSymbolsMenu';
import { insertSymbolIntoInputElement } from '../utils/textSymbols';

interface UserModeControlsProps {
  cardType?: import('../types/cardType').CardTypeId | null;
  textBoxes: TextBoxConfig[];
  onUpdateTextBoxContent: (role: TextBoxRole, content: string) => void;
  onUpdateTextBox?: (id: string, updates: Partial<TextBoxConfig>) => void;
  sorceryConfig: SorceryIndicatorsConfig;
  onUpdateSorceryMana: (updates: Partial<SorceryManaConfig>) => void;
  onUpdateSorceryThreshold: (updates: Partial<SorceryThresholdConfig>) => void;
  onUpdateSorceryCombat: (updates: Partial<SorceryCombatConfig>) => void;
  artConfig: CardArtConfig;
  onUpdateArtConfig: (updates: Partial<CardArtConfig>) => void;
  onUploadImage: (file: File) => void;
  onClearImage: () => void;
  frameConfig?: CardFrameConfig;
  onUpdateFrameConfig?: (updates: Partial<CardFrameConfig>) => void;
  selectedAttribute?: CardAttributeId;
  onSelectAttribute?: (attrId: CardAttributeId) => void;
  onExportPng: () => void;
  onOpenConfigModal: () => void;
  onRequestNewCard: () => void;
}

type UserSection = 'data' | 'attributes' | 'appearance' | 'finish';

export const UserModeControls: React.FC<UserModeControlsProps> = ({
  cardType: activeCardType,
  textBoxes,
  onUpdateTextBoxContent,
  onUpdateTextBox,
  sorceryConfig,
  onUpdateSorceryMana,
  onUpdateSorceryThreshold,
  onUpdateSorceryCombat,
  artConfig,
  onUpdateArtConfig,
  onUploadImage,
  onClearImage,
  frameConfig,
  onUpdateFrameConfig,
  selectedAttribute,
  onSelectAttribute,
  onExportPng,
  onOpenConfigModal,
  onRequestNewCard,
}) => {
  const [activeSection, setActiveSection] = useState<UserSection>('data');
  const [isSiteTypographyOpen, setIsSiteTypographyOpen] = useState(false);
  const [siteTypoTab, setSiteTypoTab] = useState<'name' | 'type'>('name');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const typeInputRef = useRef<HTMLInputElement>(null);
  const rulesInputRef = useRef<HTMLTextAreaElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  // Acessores estáveis para os 4 campos principais da carta
  const titleBox = findBoxByRole(textBoxes, 'title');
  const typeBox = findBoxByRole(textBoxes, 'type');
  const rulesBox = findBoxByRole(textBoxes, 'rules');
  const footerBox = findBoxByRole(textBoxes, 'footer');

  const cardName = titleBox?.content ?? '';
  const cardType = typeBox?.content ?? '';
  const cardRules = rulesBox?.content ?? '';
  const cardFooter = footerBox?.content ?? '';

  const hasCombat = hasCombatAttributes(activeCardType);

  const effectiveAttribute =
    selectedAttribute ||
    (frameConfig?.imageUrl ? findAttributeByFrameUrl(frameConfig.imageUrl, activeCardType)?.id : undefined);
  const allowedThresholdElements = getAllowedThresholdElements(effectiveAttribute, activeCardType);

  // Helpers de Mana / Vida
  const isAvatar = activeCardType === 'avatar';
  const currentManaOrVida = isAvatar
    ? (sorceryConfig.vida?.quantity ?? sorceryConfig.mana.quantity ?? 20)
    : (sorceryConfig.mana.quantity || 0);

  const handleStepMana = (delta: number) => {
    const next = Math.max(0, Math.min(999, currentManaOrVida + delta));
    onUpdateSorceryMana({ quantity: next });
  };

  // Helpers de Threshold
  const handleStepThreshold = (elem: SorceryElement, delta: number) => {
    if (!allowedThresholdElements.includes(elem)) return;
    const current = sorceryConfig.threshold[elem] || 0;
    const next = Math.max(0, current + delta);
    onUpdateSorceryThreshold({ [elem]: next });
  };

  // Helpers de Combate
  const combat = sorceryConfig.combat;
  const isDual = combat.selectedType === 'attack-defense';
  const atkValue = isDual
    ? (combat.dual?.attackValue ?? '4')
    : (combat.single?.value ?? '4');
  const defValue = combat.dual?.defenseValue ?? '5';

  // Opção de combate exclusiva para Site (3 opções)
  const siteCombatOpt =
    combat.siteCombatOption ||
    (combat.isVisible === false ? 'none' : combat.selectedType || 'attack-only');

  const handleSelectSiteCombat = (opt: 'attack-only' | 'attack-defense' | 'none') => {
    if (opt === 'none') {
      onUpdateSorceryCombat({
        siteCombatOption: 'none',
        isVisible: false,
      });
    } else if (opt === 'attack-only') {
      onUpdateSorceryCombat({
        siteCombatOption: 'attack-only',
        selectedType: 'attack-only',
        isVisible: true,
        single: {
          ...(combat.single || {}),
          value: atkValue || '4',
          isVisible: true,
        } as any,
        dual: {
          ...(combat.dual || {}),
          isVisible: false,
        } as any,
      });
    } else {
      onUpdateSorceryCombat({
        siteCombatOption: 'attack-defense',
        selectedType: 'attack-defense',
        isVisible: true,
        dual: {
          ...(combat.dual || {}),
          attackValue: atkValue || '4',
          defenseValue: defValue || '5',
          isVisible: true,
        } as any,
        single: {
          ...(combat.single || {}),
          isVisible: false,
        } as any,
      });
    }
  };

  // Posicionamento livre dos thresholds do Site
  const siteThresholdX = typeof sorceryConfig.threshold.xPercent === 'number' ? sorceryConfig.threshold.xPercent : 82.9;
  const siteThresholdY = typeof sorceryConfig.threshold.yPercent === 'number' ? sorceryConfig.threshold.yPercent : 84.0;
  const siteGapX = typeof sorceryConfig.threshold.gapXPercent === 'number' ? sorceryConfig.threshold.gapXPercent : 12.0;

  const handleStepSiteThresholdPos = (coord: 'x' | 'y', delta: number) => {
    if (coord === 'x') {
      const next = Math.max(0, Math.min(98, parseFloat((siteThresholdX + delta).toFixed(1))));
      onUpdateSorceryThreshold({ xPercent: next });
    } else {
      const next = Math.max(0, Math.min(98, parseFloat((siteThresholdY + delta).toFixed(1))));
      onUpdateSorceryThreshold({ yPercent: next });
    }
  };

  const handleResetSiteThresholdPos = () => {
    onUpdateSorceryThreshold({
      xPercent: 82.9,
      yPercent: 84.0,
      gapXPercent: 12.0,
    });
  };

  // Tipografia e Alinhamento exclusivos para Site
  const handleUpdateTitleTypography = (updates: Partial<TextBoxConfig>) => {
    if (titleBox && onUpdateTextBox) {
      onUpdateTextBox(titleBox.id, updates);
    }
  };

  const handleUpdateTypeTypography = (updates: Partial<TextBoxConfig>) => {
    if (typeBox && onUpdateTextBox) {
      onUpdateTextBox(typeBox.id, updates);
    }
  };

  const handleSetTitleAlign = (align: 'left' | 'center' | 'right') => {
    if (titleBox && onUpdateTextBox) {
      onUpdateTextBox(titleBox.id, { textAlign: align });
    }
    if (typeBox && onUpdateTextBox) {
      onUpdateTextBox(typeBox.id, { textAlign: align });
    }
  };

  const handleSetRulesAlign = (align: 'left' | 'center' | 'right') => {
    if (rulesBox && onUpdateTextBox) {
      onUpdateTextBox(rulesBox.id, {
        textAlign: align,
        paragraphAlignments: undefined,
      });
    }
  };

  const handleSelectCombatMode = (mode: CreatureCombatType) => {
    if (mode === 'attack-only') {
      onUpdateSorceryCombat({
        selectedType: 'attack-only',
        attack: atkValue || '4',
        defense: null,
        single: {
          ...(combat.single || {}),
          value: atkValue || '4',
          isVisible: true,
        } as any,
        dual: {
          ...(combat.dual || {}),
          isVisible: false,
        } as any,
      });
    } else {
      onUpdateSorceryCombat({
        selectedType: 'attack-defense',
        attack: atkValue || '4',
        defense: defValue || '5',
        dual: {
          ...(combat.dual || {}),
          attackValue: atkValue || '4',
          defenseValue: defValue || '5',
          isVisible: true,
        } as any,
        single: {
          ...(combat.single || {}),
          isVisible: false,
        } as any,
      });
    }
  };

  const handleStepCombatValue = (field: 'attack' | 'defense', delta: number) => {
    const currentStr = field === 'attack' ? atkValue : defValue;
    if (currentStr === '*' || currentStr === 'X') {
      const next = delta > 0 ? '1' : '0';
      if (field === 'attack') {
        if (isDual) {
          onUpdateSorceryCombat({
            dual: { ...combat.dual, attackValue: next } as any,
            attack: next,
          });
        } else {
          onUpdateSorceryCombat({
            single: { ...combat.single, value: next } as any,
            attack: next,
          });
        }
      } else {
        onUpdateSorceryCombat({
          dual: { ...combat.dual, defenseValue: next } as any,
          defense: next,
        });
      }
      return;
    }

    const num = parseInt(currentStr, 10);
    const next = isNaN(num) ? (delta > 0 ? '1' : '0') : String(Math.max(0, num + delta));

    if (field === 'attack') {
      if (isDual) {
        onUpdateSorceryCombat({
          dual: { ...combat.dual, attackValue: next } as any,
          attack: next,
        });
      } else {
        onUpdateSorceryCombat({
          single: { ...combat.single, value: next } as any,
          attack: next,
        });
      }
    } else {
      onUpdateSorceryCombat({
        dual: { ...combat.dual, defenseValue: next } as any,
        defense: next,
      });
    }
  };

  const handleCustomCombatValue = (field: 'attack' | 'defense', val: string) => {
    const trimmed = val.trim();
    if (field === 'attack') {
      if (isDual) {
        onUpdateSorceryCombat({
          dual: { ...combat.dual, attackValue: trimmed } as any,
          attack: trimmed || null,
        });
      } else {
        onUpdateSorceryCombat({
          single: { ...combat.single, value: trimmed } as any,
          attack: trimmed || null,
        });
      }
    } else {
      onUpdateSorceryCombat({
        dual: { ...combat.dual, defenseValue: trimmed } as any,
        defense: trimmed || null,
      });
    }
  };

  return (
    <aside className="w-80 sm:w-96 bg-[#24221E] border-l border-[#453B2D] flex flex-col h-full overflow-hidden font-ui text-[#E8DECA] shrink-0">
      {/* 4 Seções de Edição Simplificada */}
      <div className="flex border-b border-[#453B2D] bg-[#1E1D19] p-1.5 shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setActiveSection('data')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-semibold rounded transition-all cursor-pointer ${
            activeSection === 'data'
              ? 'bg-[#302D27] text-[#E8DECA] border border-[#65543C] shadow-xs'
              : 'text-[#B5A995] hover:text-[#E8DECA]'
          }`}
        >
          <FileText className={`w-3.5 h-3.5 mb-1 ${activeSection === 'data' ? 'text-[#C5A675]' : 'text-[#8F8270]'}`} />
          <span>1. Dados</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('attributes')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-semibold rounded transition-all cursor-pointer ${
            activeSection === 'attributes'
              ? 'bg-[#302D27] text-[#E8DECA] border border-[#65543C] shadow-xs'
              : 'text-[#B5A995] hover:text-[#E8DECA]'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 mb-1 ${activeSection === 'attributes' ? 'text-[#C5A675]' : 'text-[#8F8270]'}`} />
          <span>2. Atributos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('appearance')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-semibold rounded transition-all cursor-pointer ${
            activeSection === 'appearance'
              ? 'bg-[#302D27] text-[#E8DECA] border border-[#65543C] shadow-xs'
              : 'text-[#B5A995] hover:text-[#E8DECA]'
          }`}
        >
          <ImageIcon className={`w-3.5 h-3.5 mb-1 ${activeSection === 'appearance' ? 'text-[#C5A675]' : 'text-[#8F8270]'}`} />
          <span>3. Aparência</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('finish')}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-semibold rounded transition-all cursor-pointer ${
            activeSection === 'finish'
              ? 'bg-[#302D27] text-[#E8DECA] border border-[#65543C] shadow-xs'
              : 'text-[#B5A995] hover:text-[#E8DECA]'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 mb-1 ${activeSection === 'finish' ? 'text-[#C5A675]' : 'text-[#8F8270]'}`} />
          <span>4. Finalizar</span>
        </button>
      </div>

      {/* Conteúdo da Seção Ativa */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ========================================================
            SEÇÃO 1: DADOS DA CARTA
           ======================================================== */}
        {activeSection === 'data' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8DECA] font-arcane flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C5A675]" />
                <span>Dados da Carta</span>
              </h3>
              <p className="text-[11px] text-[#B5A995] mt-0.5">
                {activeCardType === 'site'
                  ? 'Preencha o Nome e Tipo/Subtipo que formam o título contínuo do Site.'
                  : 'Preencha os textos da carta. As alterações aparecem imediatamente na prévia.'}
              </p>
            </div>

            {/* Visualização e Alinhamento do Título Composto para Site */}
            {activeCardType === 'site' && (
              <div className="bg-[#1E1D19] p-3 rounded-lg border border-[#453B2D] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase font-bold text-[#C5A675] tracking-wider">
                    Título Composto (Linha Única)
                  </div>
                  {/* Controles de Alinhamento Unificado do Título */}
                  <div className="flex items-center gap-1 bg-[#24221E] p-1 rounded border border-[#453B2D]">
                    <button
                      type="button"
                      title="Alinhar Título à Esquerda"
                      onClick={() => handleSetTitleAlign('left')}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        (titleBox?.textAlign || 'left') === 'left'
                          ? 'bg-[#302D27] text-[#C5A675] border border-[#65543C]'
                          : 'text-[#8F8270] hover:text-[#E8DECA]'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Centralizar Título"
                      onClick={() => handleSetTitleAlign('center')}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        titleBox?.textAlign === 'center'
                          ? 'bg-[#302D27] text-[#C5A675] border border-[#65543C]'
                          : 'text-[#8F8270] hover:text-[#E8DECA]'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Alinhar Título à Direita"
                      onClick={() => handleSetTitleAlign('right')}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        titleBox?.textAlign === 'right'
                          ? 'bg-[#302D27] text-[#C5A675] border border-[#65543C]'
                          : 'text-[#8F8270] hover:text-[#E8DECA]'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-[#24221E] rounded border border-[#34352D] text-xs text-[#E8DECA] truncate font-serif">
                  <span className="font-semibold text-[#FAF5E9]">{cardName || '(Nome da Carta)'}</span>
                  {cardName && cardType && <span className="text-[#C5A675]"> - </span>}
                  <span className="italic text-[#B5A995]">{cardType || '(Tipo/Subtipo)'}</span>
                </div>
              </div>
            )}

            {/* 1. Nome da Carta */}
            <div className="space-y-1.5 bg-[#302D27] p-3.5 rounded-lg border border-[#65543C]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#E8DECA]">
                  Nome da Carta:
                </label>
                <span className="text-[10px] font-normal text-[#B5A995] hidden sm:inline">
                  {activeCardType === 'site' ? 'Primeiro segmento' : 'Título principal'}
                </span>
              </div>
              <input
                ref={nameInputRef}
                type="text"
                value={cardName}
                onChange={(e) => onUpdateTextBoxContent('title', e.target.value)}
                placeholder={activeCardType === 'site' ? 'Ex: Ancient Ruins' : 'Ex: Guardião do Vazio'}
                className="w-full px-3 py-2 text-sm bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded text-[#E8DECA] placeholder-[#8F8270] focus:outline-none transition-all font-serif"
              />
            </div>

            {/* 2. Tipo / Subtipo */}
            <div className="space-y-1.5 bg-[#302D27] p-3.5 rounded-lg border border-[#65543C]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#E8DECA]">
                  Tipo / Subtipo:
                </label>
                <span className="text-[10px] font-normal text-[#B5A995] hidden sm:inline">
                  {activeCardType === 'site' ? 'Segundo segmento' : 'Linhagem'}
                </span>
              </div>
              <input
                ref={typeInputRef}
                type="text"
                value={cardType}
                onChange={(e) => onUpdateTextBoxContent('type', e.target.value)}
                placeholder={
                  activeCardType === 'site'
                    ? 'Ex: Site • Atlas Realm'
                    : activeCardType === 'magic'
                    ? 'Ex: Ordinary Magic'
                    : activeCardType === 'aura'
                    ? 'Ex: Continuous Aura'
                    : activeCardType === 'artifact'
                    ? 'Ex: Ancient Relic'
                    : 'Ex: An Elite Dragon of breathtaking majesty'
                }
                className="w-full px-3 py-2 text-sm bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded text-[#E8DECA] placeholder-[#8F8270] focus:outline-none transition-all font-serif"
              />
            </div>

            {/* Controles de Tipografia Independente para Site */}
            {activeCardType === 'site' && (
              <div className="bg-[#302D27] rounded-lg border border-[#65543C] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsSiteTypographyOpen(!isSiteTypographyOpen)}
                  className="w-full p-3 bg-[#24221E] hover:bg-[#2c2822] text-[#E8DECA] text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#C5A675]" />
                    <span>Personalizar Tipografia do Título Composto</span>
                  </span>
                  {isSiteTypographyOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#C5A675]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#B5A995]" />
                  )}
                </button>

                {isSiteTypographyOpen && (
                  <div className="p-3.5 space-y-3 border-t border-[#453B2D]">
                    {/* Seletor de Aba: Nome vs Tipo/Subtipo */}
                    <div className="flex bg-[#24221E] p-1 rounded border border-[#453B2D] gap-1">
                      <button
                        type="button"
                        onClick={() => setSiteTypoTab('name')}
                        className={`flex-1 py-1 px-2 text-xs font-medium rounded transition-colors cursor-pointer ${
                          siteTypoTab === 'name'
                            ? 'bg-[#302D27] text-[#C5A675] border border-[#65543C]'
                            : 'text-[#B5A995] hover:text-[#E8DECA]'
                        }`}
                      >
                        Tipografia do Nome
                      </button>
                      <button
                        type="button"
                        onClick={() => setSiteTypoTab('type')}
                        className={`flex-1 py-1 px-2 text-xs font-medium rounded transition-colors cursor-pointer ${
                          siteTypoTab === 'type'
                            ? 'bg-[#302D27] text-[#C5A675] border border-[#65543C]'
                            : 'text-[#B5A995] hover:text-[#E8DECA]'
                        }`}
                      >
                        Tipografia do Tipo
                      </button>
                    </div>

                    {/* Controles para o Nome */}
                    {siteTypoTab === 'name' && titleBox && (
                      <div className="space-y-2.5 text-xs">
                        {/* Família Tipográfica */}
                        <div>
                          <label className="text-[11px] text-[#B5A995] block mb-1">Família Tipográfica:</label>
                          <select
                            value={titleBox.fontFamily || 'fantaisie-artistique'}
                            onChange={(e) => handleUpdateTitleTypography({ fontFamily: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA] focus:outline-none focus:border-[#C5A675] cursor-pointer"
                          >
                            <option value="morpheus">Morpheus (Gótica Clássica)</option>
                            <option value="fantaisie-artistique">Fantaisie artistique</option>
                            <option value="palatino">Palatino</option>
                            <option value="palatino-italic">Palatino Italic</option>
                            <option value="book-antiqua">Book Antiqua</option>
                            <option value="book-antiqua-italic">Book Antiqua Italic</option>
                            <option value="serif">Serif Clássica</option>
                            <option value="sans">Sans-serif</option>
                          </select>
                        </div>

                        {/* Tamanho e Peso */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-[#B5A995] block mb-1">Tamanho (px):</label>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateTitleTypography({ fontSizePx: Math.max(8, (titleBox.fontSizePx || 22) - 1) })}
                                className="w-6 h-6 flex items-center justify-center bg-[#24221E] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={8}
                                max={60}
                                value={titleBox.fontSizePx || 22}
                                onChange={(e) => handleUpdateTitleTypography({ fontSizePx: parseInt(e.target.value, 10) || 22 })}
                                className="w-full h-6 text-center text-xs bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA]"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateTitleTypography({ fontSizePx: Math.min(60, (titleBox.fontSizePx || 22) + 1) })}
                                className="w-6 h-6 flex items-center justify-center bg-[#24221E] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-[#B5A995] block mb-1">Peso (Weight):</label>
                            <select
                              value={titleBox.fontWeight || 'bold'}
                              onChange={(e) => handleUpdateTitleTypography({ fontWeight: e.target.value as any })}
                              className="w-full px-2 py-1 bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA] focus:outline-none"
                            >
                              <option value="normal">Normal</option>
                              <option value="medium">Médio</option>
                              <option value="semibold">Semibold</option>
                              <option value="bold">Negrito (Bold)</option>
                              <option value="black">Black</option>
                            </select>
                          </div>
                        </div>

                        {/* Cor e Espaçamento entre Letras */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-[#B5A995] block mb-1">Cor do Texto:</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={titleBox.textColor && titleBox.textColor.startsWith('#') ? titleBox.textColor : '#1c1b18'}
                                onChange={(e) => handleUpdateTitleTypography({ textColor: e.target.value })}
                                className="w-7 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                              />
                              <input
                                type="text"
                                value={titleBox.textColor || '#1c1b18'}
                                onChange={(e) => handleUpdateTitleTypography({ textColor: e.target.value })}
                                className="w-full h-6 px-1.5 text-[11px] font-mono bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-[#B5A995] block mb-1">
                              Espaço Letras: <span className="font-mono text-[#E8DECA]">{titleBox.letterSpacingPx ?? 0}px</span>
                            </label>
                            <input
                              type="range"
                              min="-2"
                              max="10"
                              step="0.5"
                              value={titleBox.letterSpacingPx ?? 0}
                              onChange={(e) => handleUpdateTitleTypography({ letterSpacingPx: parseFloat(e.target.value) })}
                              className="w-full accent-[#C5A675] cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Contorno (Stroke) */}
                        <div className="pt-2 border-t border-[#34352D] flex items-center justify-between">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!titleBox.textStrokeEnabled}
                              onChange={(e) => handleUpdateTitleTypography({ textStrokeEnabled: e.target.checked })}
                              className="accent-[#C5A675]"
                            />
                            <span className="text-[11px] text-[#B5A995]">Contorno das Letras</span>
                          </label>

                          {titleBox.textStrokeEnabled && (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={titleBox.textStrokeColor || '#000000'}
                                onChange={(e) => handleUpdateTitleTypography({ textStrokeColor: e.target.value })}
                                className="w-6 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                              />
                              <input
                                type="number"
                                min={0.5}
                                max={8}
                                step={0.5}
                                value={titleBox.textStrokeWidthPx || 1}
                                onChange={(e) => handleUpdateTitleTypography({ textStrokeWidthPx: parseFloat(e.target.value) || 1 })}
                                className="w-12 h-5 text-center text-[11px] bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA]"
                              />
                              <span className="text-[10px] text-[#8F8270]">px</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Controles para o Tipo / Subtipo */}
                    {siteTypoTab === 'type' && typeBox && (
                      <div className="space-y-2.5 text-xs">
                        <p className="text-[10px] text-[#C5A675] italic">
                          * O separador &quot; - &quot; herda automaticamente a tipografia definida aqui.
                        </p>

                        {/* Família Tipográfica */}
                        <div>
                          <label className="text-[11px] text-[#B5A995] block mb-1">Família Tipográfica:</label>
                          <select
                            value={typeBox.fontFamily || 'fantaisie-artistique'}
                            onChange={(e) => handleUpdateTypeTypography({ fontFamily: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA] focus:outline-none focus:border-[#C5A675] cursor-pointer"
                          >
                            <option value="palatino-italic">Palatino Italic</option>
                            <option value="palatino">Palatino</option>
                            <option value="fantaisie-artistique">Fantaisie artistique</option>
                            <option value="book-antiqua-italic">Book Antiqua Italic</option>
                            <option value="book-antiqua">Book Antiqua</option>
                            <option value="morpheus">Morpheus (Gótica Clássica)</option>
                            <option value="serif">Serif Clássica</option>
                            <option value="sans">Sans-serif</option>
                          </select>
                        </div>

                        {/* Tamanho e Peso */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-[#B5A995] block mb-1">Tamanho (px):</label>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateTypeTypography({ fontSizePx: Math.max(8, (typeBox.fontSizePx || 17) - 1) })}
                                className="w-6 h-6 flex items-center justify-center bg-[#24221E] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={8}
                                max={60}
                                value={typeBox.fontSizePx || 17}
                                onChange={(e) => handleUpdateTypeTypography({ fontSizePx: parseInt(e.target.value, 10) || 17 })}
                                className="w-full h-6 text-center text-xs bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA]"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateTypeTypography({ fontSizePx: Math.min(60, (typeBox.fontSizePx || 17) + 1) })}
                                className="w-6 h-6 flex items-center justify-center bg-[#24221E] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-[#B5A995] block mb-1">Peso (Weight):</label>
                            <select
                              value={typeBox.fontWeight || 'normal'}
                              onChange={(e) => handleUpdateTypeTypography({ fontWeight: e.target.value as any })}
                              className="w-full px-2 py-1 bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA] focus:outline-none"
                            >
                              <option value="normal">Normal</option>
                              <option value="medium">Médio</option>
                              <option value="semibold">Semibold</option>
                              <option value="bold">Negrito (Bold)</option>
                            </select>
                          </div>
                        </div>

                        {/* Cor e Espaçamento entre Letras */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-[#B5A995] block mb-1">Cor do Texto:</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={typeBox.textColor && typeBox.textColor.startsWith('#') ? typeBox.textColor : '#1c1b18'}
                                onChange={(e) => handleUpdateTypeTypography({ textColor: e.target.value })}
                                className="w-7 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                              />
                              <input
                                type="text"
                                value={typeBox.textColor || '#1c1b18'}
                                onChange={(e) => handleUpdateTypeTypography({ textColor: e.target.value })}
                                className="w-full h-6 px-1.5 text-[11px] font-mono bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-[#B5A995] block mb-1">
                              Espaço Letras: <span className="font-mono text-[#E8DECA]">{typeBox.letterSpacingPx ?? 0}px</span>
                            </label>
                            <input
                              type="range"
                              min="-2"
                              max="10"
                              step="0.5"
                              value={typeBox.letterSpacingPx ?? 0}
                              onChange={(e) => handleUpdateTypeTypography({ letterSpacingPx: parseFloat(e.target.value) })}
                              className="w-full accent-[#C5A675] cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Contorno (Stroke) */}
                        <div className="pt-2 border-t border-[#34352D] flex items-center justify-between">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!typeBox.textStrokeEnabled}
                              onChange={(e) => handleUpdateTypeTypography({ textStrokeEnabled: e.target.checked })}
                              className="accent-[#C5A675]"
                            />
                            <span className="text-[11px] text-[#B5A995]">Contorno das Letras</span>
                          </label>

                          {typeBox.textStrokeEnabled && (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={typeBox.textStrokeColor || '#000000'}
                                onChange={(e) => handleUpdateTypeTypography({ textStrokeColor: e.target.value })}
                                className="w-6 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                              />
                              <input
                                type="number"
                                min={0.5}
                                max={8}
                                step={0.5}
                                value={typeBox.textStrokeWidthPx || 1}
                                onChange={(e) => handleUpdateTypeTypography({ textStrokeWidthPx: parseFloat(e.target.value) || 1 })}
                                className="w-12 h-5 text-center text-[11px] bg-[#24221E] border border-[#453B2D] rounded text-[#E8DECA]"
                              />
                              <span className="text-[10px] text-[#8F8270]">px</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Regras / Descrição */}
            <div className="space-y-1.5 bg-[#302D27] p-3.5 rounded-lg border border-[#65543C]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#E8DECA]">
                  <span>Regras / Descrição:</span>
                </label>

                {/* Toolbar de Formatação e Símbolos (inspirada no Sorcerer's Spellbook) */}
                <div className="flex items-center gap-1.5">
                  <TextSymbolsMenu
                    onInsertSymbol={(code) => {
                      insertSymbolIntoInputElement(
                        rulesInputRef.current,
                        code,
                        cardRules,
                        (val) => onUpdateTextBoxContent('rules', val)
                      );
                    }}
                    size="xs"
                    buttonLabel="Símbolos"
                  />

                  {/* Controles de Alinhamento */}
                  <div className="flex items-center gap-1 bg-[#24221E] p-1 rounded border border-[#453B2D]">
                    <button
                      type="button"
                      title="Alinhar Regras à Esquerda"
                      onClick={() => handleSetRulesAlign('left')}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        (rulesBox?.textAlign || 'left') === 'left'
                          ? 'bg-[#302D27] text-[#C5A675] border border-[#65543C]'
                          : 'text-[#8F8270] hover:text-[#E8DECA]'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Centralizar Regras"
                      onClick={() => handleSetRulesAlign('center')}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        rulesBox?.textAlign === 'center'
                          ? 'bg-[#302D27] text-[#C5A675] border border-[#65543C]'
                          : 'text-[#8F8270] hover:text-[#E8DECA]'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Alinhar Regras à Direita"
                      onClick={() => handleSetRulesAlign('right')}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        rulesBox?.textAlign === 'right'
                          ? 'bg-[#302D27] text-[#C5A675] border border-[#65543C]'
                          : 'text-[#8F8270] hover:text-[#E8DECA]'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <textarea
                ref={rulesInputRef}
                rows={5}
                value={cardRules}
                onChange={(e) => onUpdateTextBoxContent('rules', e.target.value)}
                placeholder={
                  activeCardType === 'site'
                    ? 'Digite os efeitos, regras e texto narrativo do Site...'
                    : hasCombat
                    ? 'Digite as habilidades, regras e texto narrativo da criatura...'
                    : 'Digite as habilidades, regras e efeito da carta...'
                }
                className="w-full px-3 py-2 text-xs leading-relaxed bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded text-[#E8DECA] placeholder-[#8F8270] focus:outline-none transition-all resize-y font-serif"
              />
            </div>

            {/* 4. Rodapé / Numeração */}
            <div className="space-y-1.5 bg-[#302D27] p-3.5 rounded-lg border border-[#65543C]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#E8DECA]">
                  Rodapé / Numeração:
                </label>
                <span className="text-[10px] font-normal text-[#B5A995] hidden sm:inline">Créditos de arte</span>
              </div>
              <input
                ref={footerInputRef}
                type="text"
                value={cardFooter}
                onChange={(e) => onUpdateTextBoxContent('footer', e.target.value)}
                placeholder="Ex: art @ Vicent Pompetti • 001/100"
                className="w-full px-3 py-2 text-xs bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded text-[#E8DECA] placeholder-[#8F8270] focus:outline-none transition-all italic font-serif"
              />
            </div>

            {/* Botão de Avanço Rápido */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveSection('attributes')}
                className="w-full py-2.5 px-4 bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] text-xs font-medium rounded border border-[#65543C] hover:border-[#C5A675] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Avançar para Atributos</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A675]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            SEÇÃO 2: ATRIBUTOS (MANA, THRESHOLD, COMBATE)
           ======================================================== */}
        {activeSection === 'attributes' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8DECA] font-arcane flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#C5A675]" />
                <span>Atributos de Sorcery</span>
              </h3>
              <p className="text-[11px] text-[#B5A995] mt-0.5">
                {activeCardType === 'site'
                  ? 'Configure os Thresholds elementais, seu posicionamento livre e poder de combate.'
                  : isAvatar
                  ? 'Configure a Vida e o poder de combate.'
                  : 'Configure os custos de Mana, Thresholds elementais e poder de combate.'}
              </p>
            </div>

            {/* 1. Custo de Mana (Oculto em cartas Site, substituído por Vida no Avatar) */}
            {activeCardType !== 'site' && (
              <div className="bg-[#302D27] p-3.5 rounded-lg border border-[#65543C] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full relative flex items-center justify-center shrink-0">
                      <img
                        src={
                          isAvatar
                            ? (sorceryConfig.vida?.imageUrl || '/assets/sorcery/vida(1).png')
                            : (sorceryConfig.mana.imageUrl || '/assets/sorcery/mana.png?v=2')
                        }
                        alt={isAvatar ? 'Vida' : 'Mana'}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#E8DECA]">
                      {isAvatar ? 'Vida' : 'Custo de Mana'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStepMana(-1)}
                      className="w-7 h-7 flex items-center justify-center bg-[#24221E] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs font-bold cursor-pointer transition-colors"
                      title={isAvatar ? 'Diminuir Vida' : 'Diminuir Mana'}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={currentManaOrVida}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        onUpdateSorceryMana({ quantity: isNaN(val) || val < 0 ? 0 : val });
                      }}
                      className="w-12 text-center text-sm font-bold font-mono text-[#E8DECA] bg-[#24221E] border border-[#453B2D] rounded py-0.5 focus:border-[#C5A675] outline-none"
                      title={isAvatar ? 'Valor numérico de Vida' : 'Custo numérico de Mana'}
                    />
                    <button
                      type="button"
                      onClick={() => handleStepMana(1)}
                      className="w-7 h-7 flex items-center justify-center bg-[#24221E] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs font-bold cursor-pointer transition-colors"
                      title={isAvatar ? 'Aumentar Vida' : 'Aumentar Mana'}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Threshold Elemental (Oculto no Avatar) */}
            {activeCardType !== 'avatar' && (
            <div className="bg-[#302D27] p-3.5 rounded-lg border border-[#65543C] space-y-3">
              <div>
                <span className="text-xs font-semibold text-[#E8DECA] block">Threshold Elemental</span>
                <span className="text-[10px] text-[#B5A995]">
                  Requisitos de afinidade elemental da carta
                </span>
              </div>

              {allowedThresholdElements.length === 0 ? (
                <div className="p-3 bg-[#24221E] rounded border border-[#453B2D] text-center text-xs text-[#8F8270]">
                  Nenhum Threshold elemental disponível para o atributo Neutro.
                </div>
              ) : (
                <div className={`grid ${allowedThresholdElements.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                  {/* Fogo */}
                  {allowedThresholdElements.includes('fire') && (
                    <div className="bg-[#24221E] p-2 rounded border border-[#453B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🔥</span>
                        <span className="text-xs font-medium text-[#D89B78]">Fogo</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('fire', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono text-[#D89B78]">
                          {sorceryConfig.threshold.fire || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('fire', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Água */}
                  {allowedThresholdElements.includes('water') && (
                    <div className="bg-[#24221E] p-2 rounded border border-[#453B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">💧</span>
                        <span className="text-xs font-medium text-[#8CBED6]">Água</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('water', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono text-[#8CBED6]">
                          {sorceryConfig.threshold.water || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('water', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Terra (Land) */}
                  {allowedThresholdElements.includes('earth') && (
                    <div className="bg-[#24221E] p-2 rounded border border-[#453B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">⛰️</span>
                        <span className="text-xs font-medium text-[#C5A675]">Terra</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('earth', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono text-[#C5A675]">
                          {sorceryConfig.threshold.earth || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('earth', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ar */}
                  {allowedThresholdElements.includes('air') && (
                    <div className="bg-[#24221E] p-2 rounded border border-[#453B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">💨</span>
                        <span className="text-xs font-medium text-[#B5C9D5]">Ar</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('air', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono text-[#B5C9D5]">
                          {sorceryConfig.threshold.air || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('air', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Espírito */}
                  {allowedThresholdElements.includes('espirito') && (
                    <div className="bg-[#24221E] p-2 rounded border border-[#453B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#1a1815] border border-[#2b6cb0] p-0.5 flex items-center justify-center shrink-0">
                          <img
                            src={getThresholdElementImagePath('espirito', sorceryConfig.threshold.elementImages)}
                            alt="Espírito"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-[#63B3ED]">Espírito</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('espirito', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono text-[#63B3ED]">
                          {sorceryConfig.threshold.espirito || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('espirito', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Matéria */}
                  {allowedThresholdElements.includes('materia') && (
                    <div className="bg-[#24221E] p-2 rounded border border-[#453B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#1a1815] border border-[#65543C] p-0.5 flex items-center justify-center shrink-0">
                          <img
                            src={getThresholdElementImagePath('materia', sorceryConfig.threshold.elementImages)}
                            alt="Matéria"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-[#C5A675]">Matéria</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('materia', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono text-[#C5A675]">
                          {sorceryConfig.threshold.materia || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('materia', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Vazio */}
                  {allowedThresholdElements.includes('vazio') && (
                    <div className="bg-[#24221E] p-2 rounded border border-[#453B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#1a1815] border border-[#7a4fa3] p-0.5 flex items-center justify-center shrink-0">
                          <img
                            src={getThresholdElementImagePath('vazio', sorceryConfig.threshold.elementImages)}
                            alt="Vazio"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-[#B892FF]">Vazio</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('vazio', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono text-[#B892FF]">
                          {sorceryConfig.threshold.vazio || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('vazio', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Vida */}
                  {allowedThresholdElements.includes('vida') && (
                    <div className="bg-[#24221E] p-2 rounded border border-[#453B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#1a1815] border border-[#3f7528] p-0.5 flex items-center justify-center shrink-0">
                          <img
                            src={getThresholdElementImagePath('vida', sorceryConfig.threshold.elementImages)}
                            alt="Vida"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-[#7ECB65]">Vida</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('vida', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono text-[#7ECB65]">
                          {sorceryConfig.threshold.vida || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('vida', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Morte */}
                  {allowedThresholdElements.includes('morte') && (
                    <div className="bg-[#24221E] p-2 rounded border border-[#453B2D] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#1a1815] border border-[#525252] p-0.5 flex items-center justify-center shrink-0">
                          <img
                            src={getThresholdElementImagePath('morte', sorceryConfig.threshold.elementImages)}
                            alt="Morte"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-[#A0A0A0]">Morte</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('morte', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold font-mono text-[#A0A0A0]">
                          {sorceryConfig.threshold.morte || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepThreshold('morte', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Posicionamento Livre dos Thresholds exclusivo para Site */}
              {activeCardType === 'site' && (
                <div className="bg-[#24221E] p-3 rounded-lg border border-[#453B2D] space-y-2.5 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-[#C5A675]" />
                      <span className="text-xs font-semibold text-[#E8DECA]">Posicionamento dos Thresholds</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetSiteThresholdPos}
                      className="text-[10px] text-[#B5A995] hover:text-[#E8DECA] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Restaurar posição padrão (82.9%, 84.0%)"
                    >
                      <RotateCcw className="w-3 h-3 text-[#C5A675]" />
                      <span>Padrão</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-[#8F8270] leading-tight">
                    Arraste diretamente na carta com o mouse ou ajuste os eixos X e Y abaixo.
                  </p>

                  {/* Eixo X */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#B5A995]">Posição X (Horizontal):</span>
                      <span className="font-mono text-[#E8DECA]">{siteThresholdX.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStepSiteThresholdPos('x', -0.5)}
                        className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="98"
                        step="0.5"
                        value={siteThresholdX}
                        onChange={(e) => onUpdateSorceryThreshold({ xPercent: parseFloat(e.target.value) })}
                        className="flex-1 accent-[#C5A675] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepSiteThresholdPos('x', 0.5)}
                        className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Eixo Y */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#B5A995]">Posição Y (Vertical):</span>
                      <span className="font-mono text-[#E8DECA]">{siteThresholdY.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStepSiteThresholdPos('y', -0.5)}
                        className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="98"
                        step="0.5"
                        value={siteThresholdY}
                        onChange={(e) => onUpdateSorceryThreshold({ yPercent: parseFloat(e.target.value) })}
                        className="flex-1 accent-[#C5A675] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepSiteThresholdPos('y', 0.5)}
                        className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Espaçamento gapXPercent */}
                  <div className="space-y-1 pt-1 border-t border-[#34352D]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#B5A995]">Espaçamento entre símbolos:</span>
                      <span className="font-mono text-[#E8DECA]">{siteGapX.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="6"
                      step="0.2"
                      value={siteGapX}
                      onChange={(e) => onUpdateSorceryThreshold({ gapXPercent: parseFloat(e.target.value) })}
                      className="w-full accent-[#C5A675] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
            )}

            {/* 3. Modo de Combate */}
            {activeCardType === 'site' ? (
              /* Configuração Exclusiva de Combate para Site (3 Opções) */
              <div className="bg-[#302D27] p-3.5 rounded-lg border border-[#65543C] space-y-3">
                <div>
                  <span className="text-xs font-semibold text-[#E8DECA] block">Configuração de Combate</span>
                  <span className="text-[10px] text-[#B5A995]">
                    Escolha quais atributos de combate devem aparecer na carta
                  </span>
                </div>

                {/* Seletor com 3 opções exclusivo para Site */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectSiteCombat('attack-only')}
                    className={`py-2 px-1.5 rounded text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border text-center ${
                      siteCombatOpt === 'attack-only'
                        ? 'bg-[#24221E] border-[#C5A675] text-[#C5A675] shadow-xs'
                        : 'bg-[#24221E] border-[#453B2D] text-[#B5A995] hover:text-[#E8DECA]'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Somente Attack</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSiteCombat('attack-defense')}
                    className={`py-2 px-1.5 rounded text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border text-center ${
                      siteCombatOpt === 'attack-defense'
                        ? 'bg-[#24221E] border-[#8CBED6] text-[#8CBED6] shadow-xs'
                        : 'bg-[#24221E] border-[#453B2D] text-[#B5A995] hover:text-[#E8DECA]'
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      <Swords className="w-3 h-3" />
                      <Shield className="w-3 h-3" />
                    </div>
                    <span>Attack & Def</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSiteCombat('none')}
                    className={`py-2 px-1.5 rounded text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border text-center ${
                      siteCombatOpt === 'none'
                        ? 'bg-[#24221E] border-[#A24F43] text-[#FAF5E9] shadow-xs'
                        : 'bg-[#24221E] border-[#453B2D] text-[#B5A995] hover:text-[#E8DECA]'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Sem atributos</span>
                  </button>
                </div>

                {/* Conteúdo dependente da opção de combate do Site */}
                {siteCombatOpt === 'none' ? (
                  <div className="p-2.5 bg-[#24221E] rounded border border-[#453B2D] text-center">
                    <p className="text-xs text-[#C5A675] font-medium">Atributos Ocultos</p>
                    <p className="text-[10px] text-[#8F8270] mt-0.5 leading-relaxed">
                      Nenhum ícone ou valor de combate será renderizado na carta. Seus valores e posições continuam salvos e serão restaurados ao reativar.
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#453B2D] space-y-2">
                    {/* Campo de Ataque */}
                    <div className="flex items-center justify-between bg-[#24221E] p-2 rounded border border-[#453B2D]">
                      <div className="flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-[#C5A675]" />
                        <span className="text-xs font-medium text-[#E8DECA]">Ataque (ATK):</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStepCombatValue('attack', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          maxLength={4}
                          value={atkValue}
                          onChange={(e) => handleCustomCombatValue('attack', e.target.value)}
                          placeholder="4"
                          className="w-12 h-6 text-center text-xs font-bold font-mono text-[#E8DECA] bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded focus:outline-none"
                          title="Aceita números, * ou X"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepCombatValue('attack', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Campo de Defesa (Apenas se 'attack-defense') */}
                    {siteCombatOpt === 'attack-defense' && (
                      <div className="flex items-center justify-between bg-[#24221E] p-2 rounded border border-[#453B2D]">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#8CBED6]" />
                          <span className="text-xs font-medium text-[#E8DECA]">Defesa (DEF):</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStepCombatValue('defense', -1)}
                            className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            maxLength={4}
                            value={defValue}
                            onChange={(e) => handleCustomCombatValue('defense', e.target.value)}
                            placeholder="5"
                            className="w-12 h-6 text-center text-xs font-bold font-mono text-[#E8DECA] bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded focus:outline-none"
                            title="Aceita números, * ou X"
                          />
                          <button
                            type="button"
                            onClick={() => handleStepCombatValue('defense', 1)}
                            className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeCardType === 'avatar' ? (
              /* Configuração Exclusiva de Combate para Avatar (Somente ATK) */
              <div className="bg-[#302D27] p-3.5 rounded-lg border border-[#65543C] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#E8DECA] block">Ataque do Avatar (ATK)</span>
                    <span className="text-[10px] text-[#B5A995]">
                      O Avatar possui exclusivamente o atributo de Ataque
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#C5A675] border border-[#65543C] px-2 py-0.5 rounded bg-[#24221E]">
                    ATK Único
                  </span>
                </div>

                <div className="pt-1">
                  {/* Campo de Ataque Único */}
                  <div className="flex items-center justify-between bg-[#24221E] p-2 rounded border border-[#453B2D]">
                    <div className="flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-[#C5A675]" />
                      <span className="text-xs font-medium text-[#E8DECA]">Ataque (ATK):</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStepCombatValue('attack', -1)}
                        className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        title="Diminuir ataque"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        maxLength={4}
                        value={atkValue}
                        onChange={(e) => handleCustomCombatValue('attack', e.target.value)}
                        placeholder="2"
                        className="w-12 h-6 text-center text-xs font-bold font-mono text-[#E8DECA] bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded focus:outline-none"
                        title="Aceita números, * ou X"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepCombatValue('attack', 1)}
                        className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        title="Aumentar ataque"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Configuração Original de Combate para Criaturas / Outros Tipos */
              hasCombat && (
                <div className="bg-[#302D27] p-3.5 rounded-lg border border-[#65543C] space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-[#E8DECA] block">Modo de Combate</span>
                    <span className="text-[10px] text-[#B5A995]">
                      Defina se a criatura possui apenas Ataque ou Ataque & Defesa
                    </span>
                  </div>

                  {/* Alternância de Modo de Combate */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectCombatMode('attack-only')}
                      className={`py-2 px-2.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        !isDual
                          ? 'bg-[#24221E] border-[#C5A675] text-[#C5A675]'
                          : 'bg-[#24221E] border-[#453B2D] text-[#B5A995] hover:text-[#E8DECA]'
                      }`}
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Somente ATK</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectCombatMode('attack-defense')}
                      className={`py-2 px-2.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        isDual
                          ? 'bg-[#24221E] border-[#8CBED6] text-[#8CBED6]'
                          : 'bg-[#24221E] border-[#453B2D] text-[#B5A995] hover:text-[#E8DECA]'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>ATK / DEF</span>
                    </button>
                  </div>

                  {/* Campos de Valores de Ataque e Defesa */}
                  <div className="pt-2 border-t border-[#453B2D] space-y-2">
                    {/* Campo de Ataque */}
                    <div className="flex items-center justify-between bg-[#24221E] p-2 rounded border border-[#453B2D]">
                      <div className="flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-[#C5A675]" />
                        <span className="text-xs font-medium text-[#E8DECA]">Ataque (ATK):</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStepCombatValue('attack', -1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          maxLength={4}
                          value={atkValue}
                          onChange={(e) => handleCustomCombatValue('attack', e.target.value)}
                          placeholder="4"
                          className="w-12 h-6 text-center text-xs font-bold font-mono text-[#E8DECA] bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded focus:outline-none"
                          title="Aceita números, * ou X"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepCombatValue('attack', 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Campo de Defesa */}
                    {isDual && (
                      <div className="flex items-center justify-between bg-[#24221E] p-2 rounded border border-[#453B2D]">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#8CBED6]" />
                          <span className="text-xs font-medium text-[#E8DECA]">Defesa (DEF):</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStepCombatValue('defense', -1)}
                            className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            maxLength={4}
                            value={defValue}
                            onChange={(e) => handleCustomCombatValue('defense', e.target.value)}
                            placeholder="5"
                            className="w-12 h-6 text-center text-xs font-bold font-mono text-[#E8DECA] bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded focus:outline-none"
                            title="Aceita números, * ou X"
                          />
                          <button
                            type="button"
                            onClick={() => handleStepCombatValue('defense', 1)}
                            className="w-6 h-6 flex items-center justify-center bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] border border-[#453B2D] rounded text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Navegação entre seções */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSection('data')}
                className="flex-1 py-2.5 px-3 bg-[#302D27] hover:bg-[#34352D] text-[#B5A995] hover:text-[#E8DECA] text-xs font-medium rounded border border-[#65543C] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('appearance')}
                className="flex-1 py-2.5 px-3 bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] text-xs font-medium rounded border border-[#65543C] hover:border-[#C5A675] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>Aparência</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A675]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            SEÇÃO 3: APARÊNCIA (ILUSTRAÇÃO E MOLDURA ANCESTRAL)
           ======================================================== */}
        {activeSection === 'appearance' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8DECA] font-arcane flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#C5A675]" />
                <span>Aparência e Ilustração</span>
              </h3>
              <p className="text-[11px] text-[#B5A995] mt-0.5">
                Envie a arte da sua carta e escolha a moldura ancestral.
              </p>
            </div>

            {/* Upload da Ilustração */}
            <div className="bg-[#302D27] p-3.5 rounded-lg border border-[#65543C] space-y-3">
              <span className="text-xs font-semibold text-[#E8DECA] block">Ilustração da Carta</span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUploadImage(file);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />

              {artConfig.imageUrl ? (
                <div className="space-y-3">
                  {/* Thumbnail de Prévia */}
                  <div className="relative w-full h-32 rounded overflow-hidden border border-[#453B2D] bg-[#24221E] group">
                    <img
                      src={artConfig.imageUrl}
                      alt="Arte da Carta"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 bg-[#302D27] text-[#E8DECA] text-xs font-medium rounded border border-[#65543C] hover:border-[#C5A675] flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-[#C5A675]" />
                        <span>Substituir</span>
                      </button>
                      <button
                        type="button"
                        onClick={onClearImage}
                        className="px-2.5 py-1.5 bg-[#A24F43] hover:bg-[#B85B4E] text-[#FAF5E9] text-xs font-medium rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#C5A675] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A675]" />
                      Arte carregada
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#B5A995] hover:text-[#E8DECA] underline text-[11px] cursor-pointer"
                    >
                      Trocar Imagem
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 border border-dashed border-[#65543C] hover:border-[#C5A675] bg-[#24221E] hover:bg-[#2B2822] rounded flex flex-col items-center justify-center p-4 cursor-pointer transition-colors group"
                >
                  <div className="w-8 h-8 rounded bg-[#302D27] flex items-center justify-center text-[#B5A995] group-hover:text-[#C5A675] mb-1.5 border border-[#453B2D]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-[#E8DECA] group-hover:text-[#FAF5E9]">
                    Carregar ilustração
                  </span>
                  <span className="text-[10px] text-[#8F8270] mt-0.5">
                    PNG, JPG ou WebP
                  </span>
                </div>
              )}
            </div>

            {/* Enquadramento da Imagem */}
            <div className="bg-[#302D27] p-3.5 rounded-lg border border-[#65543C] space-y-3">
              <span className="text-xs font-semibold text-[#E8DECA] block">Enquadramento da Imagem</span>

              {/* Modo de Proporção (Cover / Contain / Fill) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#B5A995] block">
                  Proporção da Arte:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['cover', 'contain', 'fill'] as const).map((fitMode) => (
                    <button
                      key={fitMode}
                      type="button"
                      onClick={() => onUpdateArtConfig({ fit: fitMode })}
                      className={`py-1.5 text-xs font-medium rounded capitalize border transition-all cursor-pointer ${
                        artConfig.fit === fitMode
                          ? 'bg-[#24221E] text-[#C5A675] border-[#C5A675]'
                          : 'bg-[#24221E] text-[#B5A995] border-[#453B2D] hover:text-[#E8DECA]'
                      }`}
                    >
                      {fitMode === 'cover' ? 'Cobrir' : fitMode === 'contain' ? 'Conter' : 'Esticar'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modo Sangria Total vs Área Delimitada */}
              <div className="space-y-1.5 pt-2 border-t border-[#453B2D]">
                <label className="text-[11px] font-medium text-[#B5A995] block">
                  Estilo de Corte:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateArtConfig({ mode: 'full-bleed' })}
                    className={`py-1.5 px-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                      artConfig.mode === 'full-bleed'
                        ? 'bg-[#24221E] border-[#C5A675] text-[#C5A675]'
                        : 'bg-[#24221E] border-[#453B2D] text-[#B5A995] hover:text-[#E8DECA]'
                    }`}
                  >
                    Sangria Total
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateArtConfig({ mode: 'framed' })}
                    className={`py-1.5 px-2 text-xs font-medium rounded border transition-all cursor-pointer ${
                      artConfig.mode === 'framed'
                        ? 'bg-[#24221E] border-[#C5A675] text-[#C5A675]'
                        : 'bg-[#24221E] border-[#453B2D] text-[#B5A995] hover:text-[#E8DECA]'
                    }`}
                  >
                    Área Delimitada
                  </button>
                </div>
              </div>

              {/* Opacidade da Arte */}
              <div className="space-y-1 pt-2 border-t border-[#453B2D]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#B5A995]">Opacidade:</span>
                  <span className="font-mono text-[#E8DECA] font-medium">
                    {Math.round((artConfig.opacity ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={artConfig.opacity ?? 1}
                  onChange={(e) => onUpdateArtConfig({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#C5A675] cursor-pointer"
                />
              </div>
            </div>

            {/* MOLDURA DA CARTA (CARDFRAME / ATRIBUTOS ANCESTRAIS) */}
            <div className="bg-[#302D27] border border-[#65543C] rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#E8DECA] font-arcane uppercase tracking-wide">
                    Moldura Ancestral
                  </h4>
                </div>
                {frameConfig?.imageUrl && (
                  <span className="text-[10px] font-mono text-[#C5A675] border border-[#65543C] px-2 py-0.5 rounded bg-[#24221E]">
                    Ativa
                  </span>
                )}
              </div>

              {/* Grid dos atributos conforme o tipo de carta */}
              <div
                className={`grid gap-2 ${
                  activeCardType === 'site'
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : 'grid-cols-3'
                }`}
              >
                {getAttributesForType(activeCardType).map((attr) => {
                  const isCurrent =
                    frameConfig?.imageUrl?.includes(attr.fileName) ||
                    frameConfig?.imageUrl?.includes(`/${attr.id}.png`) ||
                    frameConfig?.imageUrl?.includes(`/${attr.id}_`) ||
                    frameConfig?.imageUrl?.includes(`/${attr.id}(1).png`) ||
                    selectedAttribute === attr.id;

                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => {
                        onUpdateFrameConfig?.({
                          imageUrl: attr.framePath,
                          opacity: 1,
                          fit: 'fill',
                          isVisible: true,
                        });
                        onSelectAttribute?.(attr.id);
                      }}
                      className={`flex flex-col items-center p-1.5 rounded border text-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#34352D] border-[#C5A675] ring-1 ring-[#C5A675]/40'
                          : 'bg-[#24221E] hover:bg-[#34352D] border-[#453B2D] hover:border-[#65543C]'
                      }`}
                    >
                      <div
                        className={`w-full ${
                          activeCardType === 'site' ? 'aspect-[88/63]' : 'aspect-[63/88]'
                        } rounded bg-[#1A1916] overflow-hidden mb-1 relative border border-[#453B2D] flex items-center justify-center`}
                      >
                        <img
                          src={attr.framePath}
                          alt={attr.name}
                          className="w-full h-full object-contain pointer-events-none select-none"
                          loading="lazy"
                        />
                        {isCurrent && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C5A675] text-[#24221E] rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className={`text-[11px] font-medium ${isCurrent ? 'text-[#C5A675]' : 'text-[#B5A995]'}`}>
                        {attr.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Opções de Moldura */}
              {frameConfig?.imageUrl && (
                <div className="pt-2 border-t border-[#453B2D] flex items-center justify-between text-xs text-[#B5A995]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={frameConfig.isVisible}
                      onChange={(e) => onUpdateFrameConfig?.({ isVisible: e.target.checked })}
                      className="accent-[#C5A675] rounded"
                    />
                    <span>Exibir moldura na carta</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => onUpdateFrameConfig?.({ imageUrl: null })}
                    className="text-[11px] text-[#A24F43] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remover</span>
                  </button>
                </div>
              )}
            </div>

            {/* Navegação entre seções */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSection('attributes')}
                className="flex-1 py-2.5 px-3 bg-[#302D27] hover:bg-[#34352D] text-[#B5A995] hover:text-[#E8DECA] text-xs font-medium rounded border border-[#65543C] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('finish')}
                className="flex-1 py-2.5 px-3 bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] text-xs font-medium rounded border border-[#65543C] hover:border-[#C5A675] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>Finalizar Carta</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A675]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            SEÇÃO 4: FINALIZAR (RESUMO, EXPORTAR PNG, SALVAR)
           ======================================================== */}
        {activeSection === 'finish' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8DECA] font-arcane flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A675]" />
                <span>Finalizar e Exportar</span>
              </h3>
              <p className="text-[11px] text-[#B5A995] mt-0.5">
                Revise sua carta e faça o download em alta resolução pronta para impressão.
              </p>
            </div>

            {/* Resumo da Carta */}
            <div className="bg-[#302D27] p-4 rounded-lg border border-[#65543C] space-y-2.5">
              <span className="text-xs font-bold text-[#E8DECA] block font-arcane">
                Resumo da Criação ({getCardTypeName(activeCardType)})
              </span>

              <div className="text-xs space-y-1.5 text-[#B5A995] border-t border-[#453B2D] pt-2">
                <div className="flex justify-between">
                  <span className="text-[#8F8270]">Nome:</span>
                  <span className="font-semibold text-[#E8DECA]">{cardName || 'Sem nome'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F8270]">Tipo:</span>
                  <span className="font-medium text-[#E8DECA]">{cardType || `${getCardTypeName(activeCardType)} padrão`}</span>
                </div>
                {activeCardType !== 'site' ? (
                  <div className="flex justify-between">
                    <span className="text-[#8F8270]">Custo:</span>
                    <span className="font-medium text-[#C5A675]">
                      {sorceryConfig.mana.quantity} Mana
                      {((sorceryConfig.threshold.fire || 0) +
                        (sorceryConfig.threshold.water || 0) +
                        (sorceryConfig.threshold.earth || 0) +
                        (sorceryConfig.threshold.air || 0) +
                        (sorceryConfig.threshold.materia || 0) +
                        (sorceryConfig.threshold.vazio || 0) +
                        (sorceryConfig.threshold.vida || 0) +
                        (sorceryConfig.threshold.morte || 0)) > 0 &&
                        ` • Thresh: ${[
                          sorceryConfig.threshold.fire ? `🔥${sorceryConfig.threshold.fire}` : '',
                          sorceryConfig.threshold.water ? `💧${sorceryConfig.threshold.water}` : '',
                          sorceryConfig.threshold.earth ? `⛰️${sorceryConfig.threshold.earth}` : '',
                          sorceryConfig.threshold.air ? `💨${sorceryConfig.threshold.air}` : '',
                          sorceryConfig.threshold.materia ? `⚙️${sorceryConfig.threshold.materia}` : '',
                          sorceryConfig.threshold.vazio ? `🌌${sorceryConfig.threshold.vazio}` : '',
                          sorceryConfig.threshold.vida ? `🌿${sorceryConfig.threshold.vida}` : '',
                          sorceryConfig.threshold.morte ? `💀${sorceryConfig.threshold.morte}` : '',
                        ].filter(Boolean).join(' ')}`}
                    </span>
                  </div>
                ) : (
                  ((sorceryConfig.threshold.fire || 0) +
                    (sorceryConfig.threshold.water || 0) +
                    (sorceryConfig.threshold.earth || 0) +
                    (sorceryConfig.threshold.air || 0) +
                    (sorceryConfig.threshold.materia || 0) +
                    (sorceryConfig.threshold.vazio || 0) +
                    (sorceryConfig.threshold.vida || 0) +
                    (sorceryConfig.threshold.morte || 0)) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#8F8270]">Threshold:</span>
                      <span className="font-medium text-[#C5A675]">
                        {[
                          sorceryConfig.threshold.fire ? `🔥${sorceryConfig.threshold.fire}` : '',
                          sorceryConfig.threshold.water ? `💧${sorceryConfig.threshold.water}` : '',
                          sorceryConfig.threshold.earth ? `⛰️${sorceryConfig.threshold.earth}` : '',
                          sorceryConfig.threshold.air ? `💨${sorceryConfig.threshold.air}` : '',
                          sorceryConfig.threshold.materia ? `⚙️${sorceryConfig.threshold.materia}` : '',
                          sorceryConfig.threshold.vazio ? `🌌${sorceryConfig.threshold.vazio}` : '',
                          sorceryConfig.threshold.vida ? `🌿${sorceryConfig.threshold.vida}` : '',
                          sorceryConfig.threshold.morte ? `💀${sorceryConfig.threshold.morte}` : '',
                        ].filter(Boolean).join(' ')}
                      </span>
                    </div>
                  )
                )}
                {hasCombat && (
                  <div className="flex justify-between">
                    <span className="text-[#8F8270]">Combate:</span>
                    <span className="font-mono font-medium text-[#E8DECA]">
                      {isDual ? `ATK ${atkValue} | DEF ${defValue}` : `ATK ${atkValue}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#8F8270]">Ilustração:</span>
                  <span className="text-[#E8DECA]">
                    {artConfig.imageUrl ? 'Personalizada' : 'Sem imagem'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Principais de Finalização */}
            <div className="space-y-2 pt-2">
              {/* Botão Baixar Imagem PNG */}
              <button
                type="button"
                onClick={onExportPng}
                className="w-full py-3 px-4 bg-[#A24F43] hover:bg-[#B85B4E] text-[#FAF5E9] text-xs font-semibold rounded flex items-center justify-center gap-2 transition-all shadow-xs border border-[#65543C] cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#E8DECA]" />
                <span>Exportar Imagem PNG (300 DPI)</span>
              </button>

              {/* Botão Salvar / Exportar JSON */}
              <button
                type="button"
                onClick={onOpenConfigModal}
                className="w-full py-2.5 px-4 bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] text-xs font-medium rounded flex items-center justify-center gap-2 transition-colors border border-[#65543C] hover:border-[#C5A675] cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-[#B5A995]" />
                <span>Salvar Projeto / Exportar JSON</span>
              </button>

              {/* Botão Nova Carta */}
              <button
                type="button"
                onClick={onRequestNewCard}
                className="w-full py-2.5 px-4 bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] text-xs font-medium rounded flex items-center justify-center gap-2 transition-colors border border-[#65543C] hover:border-[#C5A675] cursor-pointer"
              >
                <FilePlus2 className="w-3.5 h-3.5 text-[#C5A675]" />
                <span>Iniciar Nova Carta</span>
              </button>
            </div>

            {/* Aviso Informativo */}
            <div className="bg-[#24221E] border border-[#453B2D] rounded p-3 text-[11px] text-[#B5A995] flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-[#C5A675] shrink-0 mt-0.5" />
              <span>
                Para alterar fontes, coordenadas de caixas ou espaçamentos avançados, alterne para o <strong className="text-[#E8DECA]">Modo Administrador</strong> na barra superior.
              </span>
            </div>

            {/* Navegação de Retorno */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveSection('data')}
                className="w-full py-2 px-3 bg-[#302D27] hover:bg-[#34352D] text-[#B5A995] hover:text-[#E8DECA] text-xs font-medium rounded flex items-center justify-center gap-1 transition-colors border border-[#453B2D] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para o Início da Edição</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
