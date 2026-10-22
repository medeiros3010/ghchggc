import React, { useState } from 'react';
import {
  CardArtConfig,
  CardDimensionsConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  CARD_PRESETS,
  CustomSymbolConfig,
  FontFamilyType,
  TextBoxConfig,
} from '../types/card';
import { CardLayoutPreset, PresetApplyMode } from '../types/preset';
import {
  SorceryElement,
  SORCERY_ELEMENTS,
  SorceryIndicatorsConfig,
  SorceryManaConfig,
  SorceryThresholdConfig,
  SorceryCombatConfig,
  CreatureCombatType,
  SingleAttackCombatConfig,
  DualCombatConfig,
  DEFAULT_SINGLE_ATTACK_CONFIG,
  DEFAULT_DUAL_COMBAT_CONFIG,
  computeThresholdDistribution,
  getCombatMode,
  saveStoredSorceryResources,
  getStoredSorceryResources,
  DEFAULT_ATTACK_STYLE,
  DEFAULT_DEFENSE_STYLE,
  getThresholdElementImagePath,
} from '../types/sorcery';
import { hasCombatAttributes } from '../types/cardType';
import {
  CARD_ATTRIBUTES,
  CardAttributeId,
  CardAttributeDefinition,
  getAllowedThresholdElements,
  findAttributeByFrameUrl,
} from '../types/cardAttribute';
import { SingleCombatControls } from './combat/SingleCombatControls';
import { DualCombatControls } from './combat/DualCombatControls';
import { generatePresetThumbnailSvg } from '../utils/presetManager';
import { AVAILABLE_FONTS, getFontCssProperties } from '../utils/fontHelper';
import {
  Plus,
  Minus,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Sliders,
  Type,
  Layout,
  Layers,
  Sparkles,
  Shield,
  RotateCcw,
  RotateCw,
  Move,
  Flame,
  Bookmark,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Palette,
  Settings2,
  Check,
  Swords,
  AlertTriangle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { calculateAutoFitFontSize } from '../utils/textFit';

interface SidebarControlsProps {
  cardType?: import('../types/cardType').CardTypeId | null;
  dimensions: CardDimensionsConfig;
  onChangeDimensions: (newDims: CardDimensionsConfig) => void;
  artConfig: CardArtConfig;
  onUpdateArtConfig: (updates: Partial<CardArtConfig>) => void;
  onUploadImage: (file: File) => void;
  onClearImage: () => void;
  frameConfig: CardFrameConfig;
  onUpdateFrameConfig: (updates: Partial<CardFrameConfig>) => void;
  onUploadCardFrame: (file: File) => void;
  onClearCardFrame: () => void;
  onApplySampleCardFrame: () => void;
  selectedAttribute?: CardAttributeId;
  onSelectAttribute?: (attrId: CardAttributeId) => void;
  symbolsConfig?: CardSymbolsConfig;
  // Indicadores Sorcery (Mana, Threshold e Combate)
  sorceryConfig: SorceryIndicatorsConfig;
  onUpdateSorceryMana: (updates: Partial<SorceryManaConfig>) => void;
  onUpdateSorceryThreshold: (updates: Partial<SorceryThresholdConfig>) => void;
  onUpdateSorceryCombat: (updates: Partial<SorceryCombatConfig>) => void;
  onResetSorceryToDefault?: () => void;
  isCombatSelected?: boolean;
  // Cadeados de Proteção Visual Independente
  isManaThresholdLocked?: boolean;
  onToggleManaThresholdLock?: () => void;
  isCombatLocked?: boolean;
  onToggleCombatLock?: () => void;
  // Caixas de texto
  textBoxes: TextBoxConfig[];
  selectedBoxId: string | null;
  onSelectBox: (id: string | null) => void;
  onAddTextBox: () => void;
  onDuplicateTextBox: (id: string) => void;
  onDeleteTextBox: (id: string) => void;
  onUpdateTextBox: (id: string, updates: Partial<TextBoxConfig>) => void;
  onResetToPreset: (presetName: 'tcg' | 'minimal' | 'blank') => void;
  presets?: CardLayoutPreset[];
  onLoadPreset?: (preset: CardLayoutPreset, mode: PresetApplyMode) => void;
  onOpenPresetsModal?: () => void;
  onSaveCurrentAsPreset?: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  cardType,
  dimensions,
  onChangeDimensions,
  artConfig,
  onUpdateArtConfig,
  onUploadImage,
  onClearImage,
  frameConfig,
  onUpdateFrameConfig,
  onUploadCardFrame,
  onClearCardFrame,
  onApplySampleCardFrame,
  selectedAttribute,
  onSelectAttribute,
  sorceryConfig,

  onUpdateSorceryMana,
  onUpdateSorceryThreshold,
  onUpdateSorceryCombat,
  onResetSorceryToDefault,
  isCombatSelected,
  isManaThresholdLocked = true,
  onToggleManaThresholdLock,
  isCombatLocked = true,
  onToggleCombatLock,
  textBoxes,
  selectedBoxId,
  onSelectBox,
  onAddTextBox,
  onDuplicateTextBox,
  onDeleteTextBox,
  onUpdateTextBox,
  onResetToPreset,
  presets = [],
  onLoadPreset,
  onOpenPresetsModal,
  onSaveCurrentAsPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'boxes' | 'inspector' | 'manaThreshold' | 'combat' | 'art' | 'cardframe' | 'presets'>('boxes');
  const [sorcerySubTab, setSorcerySubTab] = useState<'values' | 'position' | 'typography' | 'order'>('values');
  const [singleSubTab, setSingleSubTab] = useState<'dados' | 'posicao' | 'ataque' | 'tipografia'>('dados');
  const [dualSubTab, setDualSubTab] = useState<'dados' | 'posicao' | 'ataque' | 'defesa'>('dados');

  const hasCombat = hasCombatAttributes(cardType);

  React.useEffect(() => {
    if (!hasCombat && activeTab === 'combat') {
      setActiveTab('boxes');
    } else if (isCombatSelected && hasCombat) {
      setActiveTab('combat');
    }
  }, [isCombatSelected, hasCombat, activeTab]);

  const selectedBox = textBoxes.find((b) => b.id === selectedBoxId);

  const handleMoveElement = (element: SorceryElement, direction: 'up' | 'down') => {
    const currentOrder = [...sorceryConfig.threshold.elementOrder];
    const idx = currentOrder.indexOf(element);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;
    const temp = currentOrder[idx];
    currentOrder[idx] = currentOrder[targetIdx];
    currentOrder[targetIdx] = temp;
    onUpdateSorceryThreshold({ elementOrder: currentOrder });
  };

  return (
    <aside className="w-96 bg-[#24221E] border-l border-[#65543C] flex flex-col h-full overflow-hidden shadow-2xl font-ui text-[#E8DECA]">
      {/* 6 Abas Superiores */}
      <div className="flex border-b border-[#65543C] bg-[#1C1A17] p-1.5 shrink-0 gap-1">
        <button
          onClick={() => setActiveTab('boxes')}
          title="Caixas de Texto"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'boxes'
              ? 'bg-[#302D27] text-[#C5A675] shadow-xs border border-[#65543C] font-bold'
              : 'text-[#8E8271] hover:text-[#E8DECA] hover:bg-[#302D27]/40'
          }`}
        >
          <Layers className={`w-3.5 h-3.5 mb-0.5 ${activeTab === 'boxes' ? 'text-[#C5A675]' : 'text-[#8E8271]'}`} />
          <span>Caixas</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('inspector');
            if (!selectedBoxId && textBoxes.length > 0) {
              onSelectBox(textBoxes[0].id);
            }
          }}
          title="Inspetor e Espaçamentos"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'inspector'
              ? 'bg-[#302D27] text-[#C5A675] shadow-xs border border-[#65543C] font-bold'
              : 'text-[#8E8271] hover:text-[#E8DECA] hover:bg-[#302D27]/40'
          }`}
        >
          <Sliders className={`w-3.5 h-3.5 mb-0.5 ${activeTab === 'inspector' ? 'text-[#C5A675]' : 'text-[#8E8271]'}`} />
          <span>Inspetor</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('manaThreshold');
            onSelectBox(null);
          }}
          title={cardType === 'site' ? 'Threshold Elemental' : 'Atributos de Sorcery (Mana e Threshold)'}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 text-[9.5px] font-semibold rounded-md transition-all cursor-pointer relative ${
            activeTab === 'manaThreshold'
              ? 'bg-[#302D27] text-[#C5A675] shadow-xs border border-[#65543C] font-bold'
              : 'text-[#8E8271] hover:text-[#E8DECA] hover:bg-[#302D27]/40'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 mb-0.5 ${activeTab === 'manaThreshold' ? 'text-[#C5A675]' : 'text-[#8E8271]'}`} />
          <span>{cardType === 'site' ? 'Threshold' : 'Mana'}</span>
          {cardType !== 'site' && (
            <span className="absolute top-1 right-0.5 px-1 text-[7.5px] font-bold bg-[#3D221E] border border-[#A24F43]/60 text-[#F1A297] rounded-full leading-none py-0.5">
              {sorceryConfig.mana.quantity}
            </span>
          )}
        </button>

        {hasCombat && (
          <button
            onClick={() => {
              setActiveTab('combat');
              onSelectBox(null);
            }}
            title="Atributos de Ataque e Defesa de Sorcery"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 text-[9.5px] font-semibold rounded-md transition-all cursor-pointer relative ${
              activeTab === 'combat'
                ? 'bg-[#302D27] text-[#C5A675] shadow-xs border border-[#65543C] font-bold'
                : 'text-[#8E8271] hover:text-[#E8DECA] hover:bg-[#302D27]/40'
            }`}
          >
            <Swords className={`w-3.5 h-3.5 mb-0.5 ${activeTab === 'combat' ? 'text-[#C5A675]' : 'text-[#8E8271]'}`} />
            <span>Atk/Def</span>
            {(() => {
              const m = getCombatMode(sorceryConfig.combat);
              if (m === 'dual') {
                return (
                  <span className="absolute top-1 right-0.5 px-1 text-[7.5px] font-bold bg-[#3D221E] border border-[#A24F43]/60 text-[#F1A297] rounded-full leading-none py-0.5">
                    {sorceryConfig.combat.attack}/{sorceryConfig.combat.defense}
                  </span>
                );
              }
              if (m === 'single') {
                return (
                  <span className="absolute top-1 right-0.5 px-1 text-[7.5px] font-bold bg-[#3D221E] border border-[#A24F43]/60 text-[#F1A297] rounded-full leading-none py-0.5">
                    {sorceryConfig.combat.attack}
                  </span>
                );
              }
              return null;
            })()}
          </button>
        )}

        <button
          onClick={() => setActiveTab('art')}
          title="Arte Frontal / Ilustração"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === 'art'
              ? 'bg-[#302D27] text-[#C5A675] shadow-xs border border-[#65543C] font-bold'
              : 'text-[#8E8271] hover:text-[#E8DECA] hover:bg-[#302D27]/40'
          }`}
        >
          <ImageIcon className={`w-3.5 h-3.5 mb-0.5 ${activeTab === 'art' ? 'text-[#C5A675]' : 'text-[#8E8271]'}`} />
          <span>Arte</span>
        </button>

        <button
          onClick={() => setActiveTab('cardframe')}
          title="Cardframe (Moldura Frontal)"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer relative ${
            activeTab === 'cardframe'
              ? 'bg-[#302D27] text-[#C5A675] shadow-xs border border-[#65543C] font-bold'
              : 'text-[#8E8271] hover:text-[#E8DECA] hover:bg-[#302D27]/40'
          }`}
        >
          <Layout className={`w-3.5 h-3.5 mb-0.5 ${activeTab === 'cardframe' ? 'text-[#C5A675]' : 'text-[#8E8271]'}`} />
          <span>Moldura</span>
          {frameConfig.imageUrl && (
            <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[#C5A675]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          title="Modelos de Carta (Presets)"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer relative ${
            activeTab === 'presets'
              ? 'bg-[#302D27] text-[#C5A675] shadow-xs border border-[#65543C] font-bold'
              : 'text-[#8E8271] hover:text-[#E8DECA] hover:bg-[#302D27]/40'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 mb-0.5 ${activeTab === 'presets' ? 'text-[#C5A675]' : 'text-[#8E8271]'}`} />
          <span>Modelos</span>
          {presets.length > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#C5A675]" />
          )}
        </button>
      </div>

      {/* Conteúdo da Aba */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ========================================================
            ABA 1: LISTAGEM DE CAIXAS DE TEXTO
           ======================================================== */}
        {activeTab === 'boxes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#C5A675]">
                  Caixas de Texto na Frente
                </h3>
                <p className="text-[11px] text-[#8E8271]">
                  Arraste na carta para definir as posições definitivas.
                </p>
              </div>
              <button
                onClick={onAddTextBox}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#C5A675] hover:bg-[#D5B685] text-[#1C1A17] rounded transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Caixa
              </button>
            </div>

            {/* Presets Rápidos */}
            <div className="bg-[#302D27] border border-[#65543C] p-2.5 rounded-lg space-y-1.5">
              <span className="text-[11px] font-semibold text-[#B5A995] block">
                Modelos de Posições (Presets):
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => onResetToPreset('tcg')}
                  className="px-2 py-1 text-[11px] bg-[#24221E] border border-[#65543C] hover:border-[#C5A675] rounded text-[#E8DECA] font-medium transition-colors cursor-pointer"
                >
                  TCG Padrão
                </button>
                <button
                  onClick={() => onResetToPreset('minimal')}
                  className="px-2 py-1 text-[11px] bg-[#24221E] border border-[#65543C] hover:border-[#C5A675] rounded text-[#E8DECA] font-medium transition-colors cursor-pointer"
                >
                  Mínimo
                </button>
                <button
                  onClick={() => onResetToPreset('blank')}
                  className="px-2 py-1 text-[11px] bg-[#24221E] border border-[#65543C] hover:border-[#A24F43] rounded text-[#F1A297] font-medium transition-colors cursor-pointer"
                >
                  Limpar Tudo
                </button>
              </div>
            </div>

            {/* Lista das Caixas */}
            <div className="space-y-2">
              {textBoxes.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-[#65543C]/60 rounded-lg">
                  <Type className="w-8 h-8 mx-auto text-[#8E8271] mb-2" />
                  <p className="text-xs text-[#B5A995] font-medium">Nenhuma caixa de texto</p>
                  <button
                    onClick={onAddTextBox}
                    className="mt-2 text-xs text-[#C5A675] font-semibold hover:underline cursor-pointer"
                  >
                    + Adicionar primeira caixa
                  </button>
                </div>
              ) : (
                textBoxes.map((box) => {
                  const isSelected = selectedBoxId === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={() => {
                        onSelectBox(box.id);
                        setActiveTab('inspector');
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#C5A675] bg-[#34352D] ring-1 ring-[#C5A675]/50 shadow-xs'
                          : 'border-[#65543C] bg-[#302D27] hover:border-[#C5A675]/60 hover:bg-[#34352D]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-[#65543C]"
                            style={{ backgroundColor: box.textColor || '#000' }}
                          />
                          <span className="text-xs font-semibold text-[#E8DECA] truncate">
                            {box.name}
                          </span>
                        </div>

                        {/* Ações da Caixa */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Travar/Destravar */}
                          <button
                            title={box.isLocked ? 'Destravar Arraste' : 'Travar Posição'}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTextBox(box.id, { isLocked: !box.isLocked });
                            }}
                            className={`p-1 rounded hover:bg-[#24221E] cursor-pointer ${
                              box.isLocked ? 'text-[#C5A675]' : 'text-[#8E8271]'
                            }`}
                          >
                            {box.isLocked ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Visibilidade */}
                          <button
                            title={box.isVisible ? 'Ocultar Caixa' : 'Exibir Caixa'}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTextBox(box.id, { isVisible: !box.isVisible });
                            }}
                            className="p-1 rounded hover:bg-[#24221E] text-[#8E8271] cursor-pointer"
                          >
                            {box.isVisible ? (
                              <Eye className="w-3.5 h-3.5 text-[#C5A675]" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-[#F1A297]" />
                            )}
                          </button>

                          {/* Duplicar */}
                          <button
                            title="Duplicar Caixa"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateTextBox(box.id);
                            }}
                            className="p-1 rounded hover:bg-[#24221E] text-[#8E8271] hover:text-[#E8DECA] cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Deletar */}
                          <button
                            title="Remover Caixa"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTextBox(box.id);
                            }}
                            className="p-1 rounded hover:bg-[#24221E] text-[#8E8271] hover:text-[#F1A297] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Prévia do texto e coordenadas */}
                      <p className="text-[11px] text-[#B5A995] truncate mb-1.5 font-mono">
                        "{box.content || 'Vazio'}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#8E8271] font-mono border-t border-[#453B2D] pt-1">
                        <span>
                          Pos: X: {box.xPercent}% · Y: {box.yPercent}%
                        </span>
                        <span>Fonte: {box.fontFamily}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: INSPETOR E PROPRIEDADES DA CAIXA SELECIONADA
           ======================================================== */}
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            {!selectedBox ? (
              <div className="text-center py-10 border border-slate-200 rounded-lg p-4">
                <Sliders className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-600 font-semibold">Nenhuma caixa selecionada</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Clique em uma caixa na carta ou na lista para editar suas propriedades.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {selectedBox.name}
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateTextBox(selectedBox.id, { isLocked: !selectedBox.isLocked })
                    }
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium border ${
                      selectedBox.isLocked
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {selectedBox.isLocked ? (
                      <>
                        <Lock className="w-3 h-3" /> Posição Travada
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" /> Arraste Livre
                      </>
                    )}
                  </button>
                </div>

                {/* 1. Identificador e Conteúdo */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nome / Rótulo Identificador
                    </label>
                    <input
                      type="text"
                      value={selectedBox.name}
                      onChange={(e) =>
                        onUpdateTextBox(selectedBox.id, { name: e.target.value })
                      }
                      className="w-full text-xs p-2 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Conteúdo do Texto
                    </label>
                    {selectedBox.isMultiline ? (
                      <textarea
                        value={selectedBox.content}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, { content: e.target.value })
                        }
                        rows={3}
                        className="w-full text-xs p-2 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={selectedBox.content}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, { content: e.target.value })
                        }
                        className="w-full text-xs p-2 border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* 2. Coordenadas e Posicionamento Preciso */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Posicionamento na Carta</span>
                    <span className="text-[10px] text-slate-400 font-mono">Em % da carta</span>
                  </div>

                  {/* Eixo X */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                      <span>Posição X (Horizontal):</span>
                      <span className="font-semibold">{selectedBox.xPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="0.5"
                      value={selectedBox.xPercent}
                      disabled={selectedBox.isLocked}
                      onChange={(e) =>
                        onUpdateTextBox(selectedBox.id, {
                          xPercent: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-blue-600 disabled:opacity-40"
                    />
                  </div>

                  {/* Eixo Y */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                      <span>Posição Y (Vertical):</span>
                      <span className="font-semibold">{selectedBox.yPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="95"
                      step="0.5"
                      value={selectedBox.yPercent}
                      disabled={selectedBox.isLocked}
                      onChange={(e) =>
                        onUpdateTextBox(selectedBox.id, {
                          yPercent: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-blue-600 disabled:opacity-40"
                    />
                  </div>

                  {/* Largura % */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                      <span>Largura da Caixa:</span>
                      <span className="font-semibold">{selectedBox.widthPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={selectedBox.widthPercent}
                      disabled={selectedBox.isLocked}
                      onChange={(e) =>
                        onUpdateTextBox(selectedBox.id, {
                          widthPercent: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-blue-600 disabled:opacity-40"
                    />
                  </div>

                  {/* Altura % (se aplicável) */}
                  {selectedBox.heightPercent && (
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                        <span>Altura Mínima:</span>
                        <span className="font-semibold">{selectedBox.heightPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="50"
                        step="0.5"
                        value={selectedBox.heightPercent}
                        disabled={selectedBox.isLocked}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            heightPercent: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-blue-600 disabled:opacity-40"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Tipografia & Estilo */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block">Tipografia & Fonte</span>

                  {/* Seletor de Família da Fonte */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Fonte Tipográfica
                    </label>
                    <select
                      value={selectedBox.fontFamily}
                      onChange={(e) =>
                        onUpdateTextBox(selectedBox.id, {
                          fontFamily: e.target.value as FontFamilyType,
                        })
                      }
                      className="w-full text-xs p-2 border border-slate-200 rounded-md bg-white focus:border-blue-500 focus:outline-none"
                    >
                      <optgroup label="Fantasia & Card Games">
                        <option value="morpheus">Morpheus — Títulos e Classificações</option>
                      </optgroup>
                      <optgroup label="Serifadas Clássicas">
                        <option value="palatino">Palatino Regular — Descrições e Habilidades</option>
                        <option value="palatino-italic">Palatino Italic — Textos Narrativos e Citações</option>
                        <option value="book-antiqua">Book Antiqua — Serifada Alternativa</option>
                        <option value="book-antiqua-italic">Book Antiqua Italic — Versão Itálica</option>
                      </optgroup>
                      <optgroup label="Fontes Padrão">
                        <option value="sans">Sem Serifa (Moderna)</option>
                        <option value="serif">Serifada Básica (Georgia)</option>
                        <option value="mono">Monoespaçada (Código / Números)</option>
                      </optgroup>
                    </select>

                    {/* Pré-visualização da Fonte e Status de Carregamento */}
                    <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Amostra com a fonte ativa:</span>
                        <span className="text-emerald-700 font-medium">✓ Carregada</span>
                      </div>
                      <div
                        style={{
                          fontFamily: getFontCssProperties(selectedBox.fontFamily).fontFamily,
                          fontStyle: getFontCssProperties(selectedBox.fontFamily).fontStyle,
                          fontWeight: selectedBox.fontWeight,
                        }}
                        className="text-slate-800 text-sm truncate"
                      >
                        {selectedBox.content || 'Guardião do Vazio 123'}
                      </div>
                    </div>
                  </div>

                  {/* Tamanho da Fonte & Auto Fit (Redimensionamento Automático) */}
                  {(() => {
                    const isAutoFit = selectedBox.autoFitText ?? true;
                    const fitResult = calculateAutoFitFontSize(selectedBox, 360, 360 / (63 / 88));
                    const effectiveFont = fitResult.effectiveFontSizePx;
                    const isReduced = fitResult.isReduced;
                    const isOverflowing = fitResult.isOverflowing;

                    return (
                      <div className="space-y-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                        {/* Toggle Ajustar texto automaticamente à caixa */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              Ajustar texto automaticamente à caixa (Auto Fit)
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Reduz a fonte para caber sem ultrapassar as bordas
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={isAutoFit}
                              onChange={(e) =>
                                onUpdateTextBox(selectedBox.id, {
                                  autoFitText: e.target.checked,
                                  minFontSizePx: selectedBox.minFontSizePx ?? 8,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {/* Tamanho Base da Fonte */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                            <span className="font-semibold text-slate-700">Tamanho Base da Fonte:</span>
                            <span className="font-bold text-slate-900">{selectedBox.fontSizePx}px</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="8"
                              max="40"
                              value={selectedBox.fontSizePx}
                              onChange={(e) =>
                                onUpdateTextBox(selectedBox.id, {
                                  fontSizePx: parseInt(e.target.value, 10),
                                })
                              }
                              className="flex-1 accent-blue-600"
                            />
                            <input
                              type="number"
                              min="6"
                              max="48"
                              value={selectedBox.fontSizePx}
                              onChange={(e) =>
                                onUpdateTextBox(selectedBox.id, {
                                  fontSizePx: parseInt(e.target.value, 10) || 12,
                                })
                              }
                              className="w-14 text-xs p-1 border border-slate-300 rounded text-center font-mono font-bold"
                            />
                          </div>
                        </div>

                        {/* Configuração de Tamanho Mínimo e Status do Auto Fit */}
                        {isAutoFit && (
                          <div className="pt-2 border-t border-slate-200/80 space-y-2">
                            <div>
                              <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                                <span>Tamanho Mínimo da Fonte:</span>
                                <span className="font-semibold text-slate-800">
                                  {selectedBox.minFontSizePx ?? 8}px
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="4"
                                  max="20"
                                  step="1"
                                  value={selectedBox.minFontSizePx ?? 8}
                                  onChange={(e) =>
                                    onUpdateTextBox(selectedBox.id, {
                                      minFontSizePx: parseInt(e.target.value, 10),
                                    })
                                  }
                                  className="flex-1 accent-blue-600"
                                />
                                <input
                                  type="number"
                                  min="4"
                                  max="24"
                                  value={selectedBox.minFontSizePx ?? 8}
                                  onChange={(e) =>
                                    onUpdateTextBox(selectedBox.id, {
                                      minFontSizePx: parseInt(e.target.value, 10) || 6,
                                    })
                                  }
                                  className="w-14 text-xs p-1 border border-slate-300 rounded text-center font-mono"
                                />
                              </div>
                            </div>

                            {/* Status visual do Auto Fit */}
                            {isOverflowing ? (
                              <div className="p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-800 flex items-start gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block">Aviso: excesso de conteúdo</span>
                                  <span>
                                    O texto ultrapassa a caixa mesmo no tamanho mínimo ({selectedBox.minFontSizePx ?? 8}px).
                                    Aumente as dimensões da caixa ou reduza o texto.
                                  </span>
                                </div>
                              </div>
                            ) : isReduced ? (
                              <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center justify-between">
                                <span className="flex items-center gap-1 font-medium">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  Tamanho efetivo: <strong className="font-mono text-blue-800">{effectiveFont.toFixed(1)}px</strong>
                                </span>
                                <span className="text-[10px] text-blue-600 font-medium">
                                  (Reduzido de {selectedBox.fontSizePx}px)
                                </span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center justify-between">
                                <span>✓ Texto cabe no tamanho original ({selectedBox.fontSizePx}px)</span>
                                <span className="font-mono font-bold text-emerald-700">100%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Alinhamento Geral e Peso */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                        Alinhamento Geral
                      </label>
                      <div className="flex rounded-md border border-slate-200 bg-white p-0.5">
                        {[
                          { id: 'left', label: 'Esq', icon: AlignLeft },
                          { id: 'center', label: 'Cen', icon: AlignCenter },
                          { id: 'right', label: 'Dir', icon: AlignRight },
                        ].map((btn) => {
                          const IconComp = btn.icon;
                          const isActive = (selectedBox.textAlign || 'left') === btn.id;
                          return (
                            <button
                              key={btn.id}
                              type="button"
                              onClick={() =>
                                onUpdateTextBox(selectedBox.id, {
                                  textAlign: btn.id as TextBoxConfig['textAlign'],
                                })
                              }
                              title={`Alinhamento padrão da caixa: ${btn.label}`}
                              className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition-colors ${
                                isActive
                                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-700 font-semibold mb-1">Peso da Fonte</label>
                      <select
                        value={selectedBox.fontWeight}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            fontWeight: e.target.value as TextBoxConfig['fontWeight'],
                          })
                        }
                        className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white font-medium"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Médio</option>
                        <option value="semibold">Semibold</option>
                        <option value="bold">Negrito</option>
                        <option value="black">Black (Pesado)</option>
                      </select>
                    </div>
                  </div>

                  {/* ALINHAMENTO INDIVIDUAL POR PARÁGRAFO / LINHA */}
                  {(() => {
                    const paragraphs = (selectedBox.content || '').split(/\r?\n/);
                    if (paragraphs.length <= 1) return null;

                    const alignments = selectedBox.paragraphAlignments || [];

                    return (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Alinhamento por Parágrafo ({paragraphs.length} linhas)
                          </span>
                          {alignments.some(Boolean) && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateTextBox(selectedBox.id, { paragraphAlignments: [] })
                              }
                              className="text-[10px] text-slate-400 hover:text-blue-600 underline font-medium"
                            >
                              Restaurar padrão
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Escolha alinhamentos diferentes para cada linha sem alterar as demais:
                        </p>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                          {paragraphs.map((para, idx) => {
                            const currentAlign = alignments[idx];
                            const isCustom = Boolean(currentAlign);
                            const displayPara = para.trim()
                              ? para.slice(0, 24) + (para.length > 24 ? '…' : '')
                              : '(linha em branco)';

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded text-xs gap-1.5 shadow-2xs"
                              >
                                <div className="truncate flex-1 min-w-0" title={para || '(em branco)'}>
                                  <span className="font-mono text-[10px] text-blue-600 font-bold mr-1">
                                    P{idx + 1}:
                                  </span>
                                  <span className="text-[11px] text-slate-700 truncate">
                                    {displayPara}
                                  </span>
                                </div>

                                <div className="flex items-center gap-0.5 shrink-0 bg-slate-100 p-0.5 rounded border border-slate-200/60">
                                  {[
                                    { id: 'left', icon: AlignLeft, title: 'Esquerda' },
                                    { id: 'center', icon: AlignCenter, title: 'Centralizar' },
                                    { id: 'right', icon: AlignRight, title: 'Direita' },
                                  ].map((opt) => {
                                    const IconC = opt.icon;
                                    const isSel = isCustom
                                      ? currentAlign === opt.id
                                      : (selectedBox.textAlign || 'left') === opt.id;
                                    const isExplicit = isCustom && currentAlign === opt.id;

                                    return (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                          const nextAligns = [...alignments];
                                          if (isExplicit) {
                                            // Se clicar no explicitamente selecionado, volta para o padrão geral da caixa
                                            delete nextAligns[idx];
                                          } else {
                                            nextAligns[idx] = opt.id as 'left' | 'center' | 'right';
                                          }
                                          onUpdateTextBox(selectedBox.id, { paragraphAlignments: nextAligns });
                                        }}
                                        title={`${opt.title} este parágrafo`}
                                        className={`p-1 rounded text-xs transition-colors ${
                                          isExplicit
                                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                                            : isSel
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'text-slate-600 hover:bg-white'
                                        }`}
                                      >
                                        <IconC className="w-3 h-3" />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Cores de Texto e Fundo */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Cor do Texto</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedBox.textColor}
                          onChange={(e) =>
                            onUpdateTextBox(selectedBox.id, { textColor: e.target.value })
                          }
                          className="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedBox.textColor}
                          onChange={(e) =>
                            onUpdateTextBox(selectedBox.id, { textColor: e.target.value })
                          }
                          className="w-full text-xs p-1 border border-slate-200 rounded font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Estilo de Fundo</label>
                      <select
                        value={
                          selectedBox.bgColor === 'transparent'
                            ? 'transparent'
                            : selectedBox.bgColor.includes('255, 255, 255')
                            ? 'white-translucent'
                            : selectedBox.bgColor.includes('15, 23, 42')
                            ? 'dark-translucent'
                            : 'custom'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'transparent') {
                            onUpdateTextBox(selectedBox.id, { bgColor: 'transparent', borderWidthPx: 0 });
                          } else if (val === 'white-translucent') {
                            onUpdateTextBox(selectedBox.id, {
                              bgColor: 'rgba(255, 255, 255, 0.92)',
                              borderColor: '#cbd5e1',
                              borderWidthPx: 1,
                            });
                          } else if (val === 'dark-translucent') {
                            onUpdateTextBox(selectedBox.id, {
                              bgColor: 'rgba(15, 23, 42, 0.88)',
                              textColor: '#f8fafc',
                              borderColor: '#475569',
                              borderWidthPx: 1,
                            });
                          }
                        }}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                      >
                        <option value="white-translucent">Branco Translúcido</option>
                        <option value="dark-translucent">Escuro Translúcido</option>
                        <option value="transparent">Transparente (Sem Fundo)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. CONTROLES DE CONTORNO DAS LETRAS (TEXT OUTLINE / STROKE) */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3 pt-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        Contorno das Letras
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        (Letras, não a borda)
                      </span>
                    </div>

                    {/* Toggle Ativar / Desativar */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] font-semibold text-slate-600">
                        {selectedBox.textStrokeEnabled ? 'Ativado' : 'Desativado'}
                      </span>
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBox.textStrokeEnabled)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const isTitleOrType =
                              selectedBox.role === 'title' ||
                              selectedBox.role === 'type' ||
                              selectedBox.id === 'box-title' ||
                              selectedBox.id === 'box-type';
                            const defaultWidth = isTitleOrType ? 0.8 : 1.0;
                            onUpdateTextBox(selectedBox.id, {
                              textStrokeEnabled: isChecked,
                              textStrokeWidthPx:
                                isChecked && (!selectedBox.textStrokeWidthPx || selectedBox.textStrokeWidthPx <= 0)
                                  ? defaultWidth
                                  : selectedBox.textStrokeWidthPx ?? defaultWidth,
                              textStrokeColor: selectedBox.textStrokeColor || '#000000',
                            });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                  </div>

                  {selectedBox.textStrokeEnabled ? (
                    <div className="space-y-3 pt-1">
                      {/* Cor do Contorno (Independente da Cor do Texto) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-slate-700">
                            Cor do Contorno das Letras
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Cor do Texto: {selectedBox.textColor}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedBox.textStrokeColor || '#000000'}
                            onChange={(e) =>
                              onUpdateTextBox(selectedBox.id, { textStrokeColor: e.target.value })
                            }
                            className="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer shrink-0"
                            title="Escolher cor do contorno das letras"
                          />
                          <input
                            type="text"
                            value={selectedBox.textStrokeColor || '#000000'}
                            onChange={(e) =>
                              onUpdateTextBox(selectedBox.id, { textStrokeColor: e.target.value })
                            }
                            className="w-24 text-xs p-1 border border-slate-200 rounded font-mono"
                            placeholder="#000000"
                          />

                          {/* Cores rápidas para contorno */}
                          <div className="flex items-center gap-1 ml-auto">
                            {[
                              { label: 'Preto', color: '#000000' },
                              { label: 'Branco', color: '#ffffff' },
                              { label: 'Ouro', color: '#b45309' },
                              { label: 'Grafite', color: '#1e293b' },
                            ].map((preset) => (
                              <button
                                key={preset.color}
                                type="button"
                                onClick={() =>
                                  onUpdateTextBox(selectedBox.id, { textStrokeColor: preset.color })
                                }
                                title={`Cor ${preset.label}: ${preset.color}`}
                                style={{ backgroundColor: preset.color }}
                                className={`w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform shadow-2xs ${
                                  (selectedBox.textStrokeColor || '#000000').toLowerCase() === preset.color.toLowerCase()
                                    ? 'ring-2 ring-blue-500 ring-offset-1'
                                    : ''
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Espessura do Contorno com Decimais */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <span className="font-semibold">Espessura do Contorno:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-800 font-bold">
                              {(selectedBox.textStrokeWidthPx ?? 1.0).toFixed(1)} px
                            </span>
                            {(() => {
                              const isTitleOrType =
                                selectedBox.role === 'title' ||
                                selectedBox.role === 'type' ||
                                selectedBox.id === 'box-title' ||
                                selectedBox.id === 'box-type';
                              const defaultWidth = isTitleOrType ? 0.8 : 1.0;
                              return (
                                <button
                                  type="button"
                                  onClick={() => onUpdateTextBox(selectedBox.id, { textStrokeWidthPx: defaultWidth })}
                                  title={`Restaurar padrão (${defaultWidth.toFixed(1)}px)`}
                                  className="text-[10px] text-slate-400 hover:text-blue-600 underline"
                                >
                                  Reset
                                </button>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Chips com valores decimais de espessura */}
                        <div className="flex flex-wrap gap-1">
                          {[0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0].map((w) => {
                            const isCurrent = Math.abs((selectedBox.textStrokeWidthPx ?? 1.0) - w) < 0.05;
                            return (
                              <button
                                key={w}
                                type="button"
                                onClick={() => onUpdateTextBox(selectedBox.id, { textStrokeWidthPx: w })}
                                className={`px-1.5 py-0.5 text-[10px] rounded border font-mono transition-colors ${
                                  isCurrent
                                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                {w.toFixed(1)}px
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0.1"
                            max="6.0"
                            step="0.1"
                            value={selectedBox.textStrokeWidthPx ?? 1.0}
                            onChange={(e) =>
                              onUpdateTextBox(selectedBox.id, {
                                textStrokeWidthPx: parseFloat(e.target.value),
                              })
                            }
                            className="flex-1 accent-blue-600"
                          />
                          <input
                            type="number"
                            min="0.1"
                            max="15.0"
                            step="0.1"
                            value={selectedBox.textStrokeWidthPx ?? 1.0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              onUpdateTextBox(selectedBox.id, {
                                textStrokeWidthPx: isNaN(val) ? 0.1 : Math.max(0.1, val),
                              });
                            }}
                            className="w-16 text-xs p-1 border border-slate-300 rounded text-center font-mono"
                          />
                        </div>
                      </div>

                      {/* Amostra visual do contorno */}
                      <div className="p-2 bg-slate-100 border border-slate-200 rounded text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Amostra com contorno:</span>
                          <span className="font-mono text-slate-600">
                            {(selectedBox.textStrokeWidthPx ?? 1.0).toFixed(1)}px {selectedBox.textStrokeColor || '#000000'}
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: getFontCssProperties(selectedBox.fontFamily).fontFamily,
                            fontStyle: getFontCssProperties(selectedBox.fontFamily).fontStyle,
                            fontWeight: selectedBox.fontWeight,
                            color: selectedBox.textColor,
                            WebkitTextStroke: `${selectedBox.textStrokeWidthPx ?? 1.0}px ${selectedBox.textStrokeColor || '#000000'}`,
                            paintOrder: 'stroke fill',
                          }}
                          className="text-base truncate tracking-wide py-1"
                        >
                          {selectedBox.content || 'Guardião do Vazio 123'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-[11px] text-slate-500 bg-white/70 rounded border border-dashed border-slate-200">
                      O contorno das letras está desativado nesta caixa.
                    </div>
                  )}
                </div>

                {/* 5. CONTROLES AVANÇADOS DE ESPAÇAMENTO TIPOGRÁFICO E MARGENS */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3.5 pt-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      Espaçamentos & Margens (Aproveitamento Máximo)
                    </span>
                    <span className="text-[10px] text-blue-600 font-medium">Controle Fino</span>
                  </div>

                  {/* A. Margens Internas da Caixa (Padding Horizontal e Vertical) */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Margens Internas da Caixa (Padding)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Reduza ou zere as margens para que o texto aproveite 100% da área útil
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateTextBox(selectedBox.id, {
                            paddingPx: 0,
                            paddingXPx: 0,
                            paddingYPx: 0,
                          })
                        }
                        title="Zerar todas as margens para máximo espaço"
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                      >
                        Zerar (0px)
                      </button>
                    </div>

                    {/* Padding Horizontal */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-700">
                        <span className="font-semibold">Margem Horizontal (Esquerda / Direita):</span>
                        <span className="font-mono text-slate-800 font-bold">
                          {selectedBox.paddingXPx !== undefined ? selectedBox.paddingXPx : (selectedBox.paddingPx ?? 0)} px
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[0, 2, 4, 6, 8, 12].map((pVal) => {
                          const curr = selectedBox.paddingXPx !== undefined ? selectedBox.paddingXPx : (selectedBox.paddingPx ?? 0);
                          const isSel = curr === pVal;
                          return (
                            <button
                              key={pVal}
                              type="button"
                              onClick={() =>
                                onUpdateTextBox(selectedBox.id, {
                                  paddingXPx: pVal,
                                  paddingPx: pVal,
                                })
                              }
                              className={`px-1.5 py-0.5 text-[10px] rounded border font-mono transition-colors ${
                                isSel
                                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {pVal}px
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="1"
                          value={selectedBox.paddingXPx !== undefined ? selectedBox.paddingXPx : (selectedBox.paddingPx ?? 0)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onUpdateTextBox(selectedBox.id, {
                              paddingXPx: val,
                              paddingPx: val,
                            });
                          }}
                          className="flex-1 accent-blue-600"
                        />
                        <input
                          type="number"
                          min="0"
                          max="30"
                          step="1"
                          value={selectedBox.paddingXPx !== undefined ? selectedBox.paddingXPx : (selectedBox.paddingPx ?? 0)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            onUpdateTextBox(selectedBox.id, {
                              paddingXPx: val,
                              paddingPx: val,
                            });
                          }}
                          className="w-14 text-xs p-1 border border-slate-300 rounded text-center font-mono"
                        />
                      </div>
                    </div>

                    {/* Padding Vertical */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-700">
                        <span className="font-semibold">Margem Vertical (Topo / Base):</span>
                        <span className="font-mono text-slate-800 font-bold">
                          {selectedBox.paddingYPx !== undefined ? selectedBox.paddingYPx : (selectedBox.paddingPx ?? 0)} px
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[0, 2, 4, 6, 8, 12].map((pVal) => {
                          const curr = selectedBox.paddingYPx !== undefined ? selectedBox.paddingYPx : (selectedBox.paddingPx ?? 0);
                          const isSel = curr === pVal;
                          return (
                            <button
                              key={pVal}
                              type="button"
                              onClick={() =>
                                onUpdateTextBox(selectedBox.id, {
                                  paddingYPx: pVal,
                                })
                              }
                              className={`px-1.5 py-0.5 text-[10px] rounded border font-mono transition-colors ${
                                isSel
                                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {pVal}px
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="1"
                          value={selectedBox.paddingYPx !== undefined ? selectedBox.paddingYPx : (selectedBox.paddingPx ?? 0)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onUpdateTextBox(selectedBox.id, {
                              paddingYPx: val,
                            });
                          }}
                          className="flex-1 accent-blue-600"
                        />
                        <input
                          type="number"
                          min="0"
                          max="30"
                          step="1"
                          value={selectedBox.paddingYPx !== undefined ? selectedBox.paddingYPx : (selectedBox.paddingPx ?? 0)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            onUpdateTextBox(selectedBox.id, {
                              paddingYPx: val,
                            });
                          }}
                          className="w-14 text-xs p-1 border border-slate-300 rounded text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* B. Espaçamento entre Linhas (Line Height) - Permite valores menores */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-700">
                      <span className="font-semibold">Espaçamento entre Linhas (Entrelinha):</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-800 font-bold">
                          {(selectedBox.lineHeight ?? 1.25).toFixed(2)}x
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateTextBox(selectedBox.id, { lineHeight: 1.25 })}
                          title="Restaurar padrão (1.25x)"
                          className="text-[10px] text-slate-400 hover:text-blue-600 underline"
                        >
                          Reset (1.25x)
                        </button>
                      </div>
                    </div>

                    {/* Chips com valores proporcionais menores e padrão */}
                    <div className="flex flex-wrap gap-1">
                      {[0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 2.0].map((lh) => {
                        const isCurrent = Math.abs((selectedBox.lineHeight ?? 1.25) - lh) < 0.02;
                        return (
                          <button
                            key={lh}
                            type="button"
                            onClick={() => onUpdateTextBox(selectedBox.id, { lineHeight: lh })}
                            className={`px-1.5 py-0.5 text-[10px] rounded border font-mono transition-colors ${
                              isCurrent
                                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            {lh}x
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.05"
                        value={selectedBox.lineHeight ?? 1.25}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            lineHeight: parseFloat(e.target.value),
                          })
                        }
                        className="flex-1 accent-blue-600"
                      />
                      <input
                        type="number"
                        min="0.5"
                        max="4.0"
                        step="0.05"
                        value={selectedBox.lineHeight ?? 1.25}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            lineHeight: parseFloat(e.target.value) || 1.25,
                          })
                        }
                        className="w-14 text-xs p-1 border border-slate-300 rounded text-center font-mono"
                      />
                    </div>
                  </div>

                  {/* C. Espaçamento entre Letras (Letter Spacing) - Permite valores negativos */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-700">
                      <span className="font-semibold">Espaçamento entre Letras:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-800 font-bold">
                          {selectedBox.letterSpacingPx || 0} px
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateTextBox(selectedBox.id, { letterSpacingPx: 0 })}
                          title="Restaurar padrão (0px)"
                          className="text-[10px] text-slate-400 hover:text-blue-600 underline"
                        >
                          Reset (0px)
                        </button>
                      </div>
                    </div>

                    {/* Chips com valores rápidos incluindo negativos */}
                    <div className="flex flex-wrap gap-1">
                      {[-2, -1, -0.5, 0, 0.5, 1, 2, 4].map((ls) => {
                        const isCurrent = Math.abs((selectedBox.letterSpacingPx ?? 0) - ls) < 0.1;
                        return (
                          <button
                            key={ls}
                            type="button"
                            onClick={() => onUpdateTextBox(selectedBox.id, { letterSpacingPx: ls })}
                            className={`px-1.5 py-0.5 text-[10px] rounded border font-mono transition-colors ${
                              isCurrent
                                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            {ls > 0 ? `+${ls}` : ls}px
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-4"
                        max="15"
                        step="0.5"
                        value={selectedBox.letterSpacingPx ?? 0}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            letterSpacingPx: parseFloat(e.target.value),
                          })
                        }
                        className="flex-1 accent-blue-600"
                      />
                      <input
                        type="number"
                        min="-4"
                        max="20"
                        step="0.5"
                        value={selectedBox.letterSpacingPx ?? 0}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            letterSpacingPx: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-14 text-xs p-1 border border-slate-300 rounded text-center font-mono"
                      />
                    </div>
                  </div>

                  {/* D. Espaçamento entre Parágrafos */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-700">
                      <span className="font-semibold">Espaçamento entre Parágrafos:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-800 font-bold">
                          {selectedBox.paragraphSpacingPx ?? 4} px
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateTextBox(selectedBox.id, { paragraphSpacingPx: 4 })}
                          title="Restaurar padrão (4px)"
                          className="text-[10px] text-slate-400 hover:text-blue-600 underline"
                        >
                          Reset (4px)
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={selectedBox.paragraphSpacingPx ?? 4}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            paragraphSpacingPx: parseInt(e.target.value, 10),
                          })
                        }
                        className="flex-1 accent-blue-600"
                      />
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="1"
                        value={selectedBox.paragraphSpacingPx ?? 4}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            paragraphSpacingPx: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-14 text-xs p-1 border border-slate-300 rounded text-center font-mono"
                      />
                    </div>
                  </div>

                  {/* E. Espaçamento entre Palavras (Word Spacing) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-700">
                      <span className="font-semibold">Espaçamento entre Palavras:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-800 font-bold">
                          {selectedBox.wordSpacingPx || 0} px
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateTextBox(selectedBox.id, { wordSpacingPx: 0 })}
                          title="Restaurar padrão (0px)"
                          className="text-[10px] text-slate-400 hover:text-blue-600 underline"
                        >
                          Reset (0px)
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="-5"
                        max="25"
                        step="0.5"
                        value={selectedBox.wordSpacingPx ?? 0}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            wordSpacingPx: parseFloat(e.target.value),
                          })
                        }
                        className="flex-1 accent-blue-600"
                      />
                      <input
                        type="number"
                        min="-5"
                        max="30"
                        step="0.5"
                        value={selectedBox.wordSpacingPx ?? 0}
                        onChange={(e) =>
                          onUpdateTextBox(selectedBox.id, {
                            wordSpacingPx: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-14 text-xs p-1 border border-slate-300 rounded text-center font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo de Caixa: Linha Única ou Multilinha */}
                <div className="pt-1 flex items-center justify-between text-xs text-slate-700">
                  <label htmlFor="multiline-toggle" className="cursor-pointer">
                    Permitir Múltiplas Linhas (Texto Longo / Regras)
                  </label>
                  <input
                    id="multiline-toggle"
                    type="checkbox"
                    checked={selectedBox.isMultiline}
                    onChange={(e) =>
                      onUpdateTextBox(selectedBox.id, { isMultiline: e.target.checked })
                    }
                    className="rounded text-blue-600 accent-blue-600 w-4 h-4 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================
            ABA: MANA & THRESHOLD (ELEMENTOS DA CARTA)
           ======================================================== */}
        {activeTab === 'manaThreshold' && (() => {
          const effectiveAttribute =
            selectedAttribute ||
            (frameConfig.imageUrl ? findAttributeByFrameUrl(frameConfig.imageUrl)?.id : undefined);
          const allowedThresholdElements = getAllowedThresholdElements(effectiveAttribute);
          const distSummary = computeThresholdDistribution(
            sorceryConfig.threshold,
            sorceryConfig.mana,
            allowedThresholdElements,
            cardType
          );
          const totalThresholds = allowedThresholdElements.reduce(
            (acc, elem) => acc + (sorceryConfig.threshold[elem] || 0),
            0
          );

          return (
            <div className="space-y-4">
              {/* Cabeçalho da Seção */}
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {cardType === 'site' ? 'Threshold Elemental' : 'Mana & Threshold'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {cardType === 'site'
                        ? 'Afinidade elemental em linha horizontal'
                        : 'Indicadores oficiais de Sorcery: Contested Realm'}
                    </p>
                  </div>
                </div>

                {/* Status Badges e Cadeado de Proteção Visual */}
                <div className="flex items-center gap-1.5">
                  {cardType !== 'site' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Mana: {sorceryConfig.mana.quantity}
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Elem: {totalThresholds}
                  </span>

                  {/* Cadeado da Seção Mana / Threshold */}
                  <button
                    type="button"
                    onClick={onToggleManaThresholdLock}
                    title={isManaThresholdLocked ? "Desbloquear configurações avançadas" : "Bloquear configurações avançadas"}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shadow-xs ${
                      isManaThresholdLocked
                        ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 ring-2 ring-emerald-400/30'
                    }`}
                  >
                    {isManaThresholdLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px]">Bloqueado</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px]">Desbloqueado</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-Abas do Menu de Edição (4 Vistas ou 3 para Site) */}
              <div className={`grid ${cardType === 'site' ? 'grid-cols-3' : 'grid-cols-4'} gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg`}>
                <button
                  type="button"
                  onClick={() => setSorcerySubTab('values')}
                  className={`py-1.5 px-1 rounded-md text-[10.5px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    sorcerySubTab === 'values'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={cardType === 'site' ? 'Inserir e alterar valores de Thresholds' : 'Inserir e alterar valores de Mana e Elementos'}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Valores</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSorcerySubTab('position')}
                  className={`py-1.5 px-1 rounded-md text-[10.5px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    sorcerySubTab === 'position'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={cardType === 'site' ? 'Menu de edição do local e espaçamento dos thresholds' : 'Menu de edição do local da mana e threshold'}
                >
                  <div className="flex items-center gap-1">
                    <Move className="w-3.5 h-3.5" />
                    {isManaThresholdLocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                  </div>
                  <span>Local & Tam</span>
                </button>

                {cardType !== 'site' && (
                  <button
                    type="button"
                    onClick={() => setSorcerySubTab('typography')}
                    className={`py-1.5 px-1 rounded-md text-[10.5px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors ${
                      sorcerySubTab === 'typography'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Editar fonte, tamanho, cor e contorno do número de mana"
                  >
                    <div className="flex items-center gap-1">
                      <Type className="w-3.5 h-3.5" />
                      {isManaThresholdLocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                    </div>
                    <span>Fonte & Cor</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSorcerySubTab('order')}
                  className={`py-1.5 px-1 rounded-md text-[10.5px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    sorcerySubTab === 'order'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Modificar a ordem de preenchimento dos elementos"
                >
                  <div className="flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5" />
                    {isManaThresholdLocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                  </div>
                  <span>Ordem Elem</span>
                </button>
              </div>

              {/* Mensagem de bloqueio do cadeado quando usuário clica em sub-aba avançada */}
              {isManaThresholdLocked && sorcerySubTab !== 'values' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-amber-900">Configurações Avançadas Bloqueadas</h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    As coordenadas X/Y, dimensões, distâncias, fontes e ordem dos elementos de Mana & Threshold estão protegidas pelo cadeado para manter o padrão visual que você ajustou.
                  </p>
                  {onToggleManaThresholdLock && (
                    <button
                      type="button"
                      onClick={onToggleManaThresholdLock}
                      className="mt-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Desbloquear Configurações Avançadas</span>
                    </button>
                  )}
                </div>
              )}

              {/* ========================================================
                  VISTA 1: VALORES E QUANTIDADES (MANA E 4 ELEMENTOS)
                 ======================================================== */}
              {sorcerySubTab === 'values' && (
                <div className="space-y-4">
                  {/* SEÇÃO 1: QUANTIDADE DE MANA (Oculto em Site) */}
                  {cardType !== 'site' && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          1. Quantidade de Mana
                        </span>
                        <button
                          type="button"
                          onClick={() => setSorcerySubTab('position')}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Settings2 className="w-3 h-3" />
                          <span>Ajustar Local</span>
                        </button>
                      </div>

                      {/* Card visual de Mana com preview da esfera e stepper */}
                      <div className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                        {/* Visualizador da esfera com número */}
                        <div className="w-16 h-16 rounded-full relative flex items-center justify-center shrink-0 drop-shadow-md bg-slate-900/10">
                          <img
                            src={sorceryConfig.mana.imageUrl || '/assets/sorcery/mana.png?v=2'}
                            alt="Esfera de Mana"
                            className="w-full h-full object-contain pointer-events-none select-none"
                          />
                          <span
                            style={{
                              fontFamily: getFontCssProperties(sorceryConfig.mana.fontFamily).fontFamily,
                              fontSize: '22px',
                              color: sorceryConfig.mana.fontColor || '#ffffff',
                              WebkitTextStroke:
                                sorceryConfig.mana.strokeWidthPx && sorceryConfig.mana.strokeWidthPx > 0
                                  ? `${sorceryConfig.mana.strokeWidthPx}px ${sorceryConfig.mana.strokeColor || '#000000'}`
                                  : 'none',
                              paintOrder:
                                sorceryConfig.mana.strokeWidthPx && sorceryConfig.mana.strokeWidthPx > 0
                                  ? 'stroke fill'
                                  : 'normal',
                            }}
                            className="absolute inset-0 flex items-center justify-center font-bold pointer-events-none select-none leading-none"
                          >
                            {sorceryConfig.mana.quantity}
                          </span>
                        </div>

                        {/* Controles de Incremento e Campo Direto */}
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-600 block">
                            Custo de Mana da Carta:
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                              onUpdateSorceryMana({
                                quantity: Math.max(0, sorceryConfig.mana.quantity - 1),
                              })
                              }
                              title="Diminuir mana"
                              className="w-10 h-10 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors shadow-2xs text-lg disabled:opacity-40"
                              disabled={sorceryConfig.mana.quantity <= 0}
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={sorceryConfig.mana.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                onUpdateSorceryMana({
                                  quantity: isNaN(val) || val < 0 ? 0 : val,
                                });
                              }}
                              className="w-20 h-10 text-center text-xl font-black text-slate-900 bg-white border-2 border-indigo-400 focus:border-indigo-600 rounded-lg outline-none shadow-inner"
                            />

                            <button
                              type="button"
                              onClick={() =>
                              onUpdateSorceryMana({
                                quantity: sorceryConfig.mana.quantity + 1,
                              })
                              }
                              title="Aumentar mana"
                              className="w-10 h-10 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors shadow-2xs text-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Botões Rápidos de Mana (0 a 8) */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-medium block">
                          Atalhos rápidos:
                        </span>
                        <div className="grid grid-cols-7 gap-1">
                          {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => onUpdateSorceryMana({ quantity: num })}
                              className={`py-1 text-xs font-bold rounded border transition-colors ${
                                sorceryConfig.mana.quantity === num
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEÇÃO 2: THRESHOLD DA CARTA (4 ELEMENTOS) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {cardType === 'site' ? 'Threshold (Afinidade Elemental)' : '2. Threshold (Afinidade Elemental)'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSorcerySubTab('position')}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Settings2 className="w-3 h-3" />
                          <span>Local</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSorceryThreshold({
                              fire: 0,
                              water: 0,
                              earth: 0,
                              air: 0,
                            })
                          }
                          className="text-[10px] text-slate-500 hover:text-rose-600 hover:underline font-medium"
                        >
                          Zerar Todos
                        </button>
                      </div>
                    </div>

                    {/* Mini Visualizador da Distribuição */}
                    {distSummary.totalSymbols > 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-800">
                            {distSummary.totalSymbols} {distSummary.totalSymbols === 1 ? 'símbolo' : 'símbolos'} {cardType === 'site' ? 'em linha horizontal única' : `em ${distSummary.totalColumns} ${distSummary.totalColumns === 1 ? 'coluna' : 'colunas'}`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {cardType === 'site' ? 'Linha horizontal única' : 'Máx 2 por coluna'}
                          </span>
                        </div>

                        {/* Visualização esquemática das colunas na carta */}
                        <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                          {Array.from({ length: distSummary.totalColumns }).map((_, colIdx) => {
                            const colItems = distSummary.items.filter((it) => it.col === colIdx);
                            return (
                              <div
                                key={`col-preview-${colIdx}`}
                                className="bg-white border border-slate-300 rounded p-1 flex flex-col gap-1 items-center shadow-2xs min-w-[28px]"
                                title={`Coluna ${colIdx + 1}: ${colItems.map((i) => SORCERY_ELEMENTS[i.element].name).join(' e ')}`}
                              >
                                <span className="text-[8px] font-mono font-bold text-slate-400">
                                  C{colIdx + 1}
                                </span>
                                {colItems.map((it) => (
                                  <div
                                    key={`chip-${it.index}`}
                                    className="w-5 h-5 rounded p-0.5 flex items-center justify-center bg-slate-50 border border-slate-200"
                                    title={`${SORCERY_ELEMENTS[it.element].name} (Linha ${it.row === 0 ? 'Superior' : 'Inferior'})`}
                                  >
                                    <img
                                      src={sorceryConfig.threshold.elementImages[it.element]}
                                      alt={it.element}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5 text-center text-[11px] text-slate-500">
                        {allowedThresholdElements.length === 0
                          ? 'Cartas com atributo Neutro não utilizam Thresholds elementais.'
                          : 'Nenhum requisito elemental configurado. Ajuste as quantidades abaixo.'}
                      </div>
                    )}

                    {/* Lista dos Elementos com Controles Independentes permitidos para o atributo */}
                    {allowedThresholdElements.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 text-center text-xs text-slate-500">
                        Nenhum Threshold elemental disponível para o atributo Neutro.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* 1. FOGO */}
                        {allowedThresholdElements.includes('fire') && (
                          <div className="flex items-center justify-between p-2.5 bg-orange-50/50 hover:bg-orange-50 rounded-lg border border-orange-200/70 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-md bg-white border border-orange-300 shadow-2xs flex items-center justify-center shrink-0 p-0.5">
                                <img
                                  src="/assets/sorcery/threshold_fire.png"
                                  alt="Fogo"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-orange-950 block">
                                  Fogo (Fire)
                                </span>
                                <span className="text-[10px] text-orange-700">
                                  {sorceryConfig.threshold.fire === 0
                                    ? 'Nenhum requisito'
                                    : `${sorceryConfig.threshold.fire} ${sorceryConfig.threshold.fire === 1 ? 'símbolo' : 'símbolos'}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    fire: Math.max(0, sorceryConfig.threshold.fire - 1),
                                  })
                                }
                                disabled={sorceryConfig.threshold.fire <= 0}
                                className="w-7 h-7 rounded bg-white hover:bg-orange-100 border border-orange-300 text-orange-800 font-bold flex items-center justify-center text-xs disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={sorceryConfig.threshold.fire}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateSorceryThreshold({
                                    fire: isNaN(val) || val < 0 ? 0 : val,
                                  });
                                }}
                                className="w-10 h-7 text-center font-bold text-xs bg-white border border-orange-300 rounded text-orange-950"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    fire: sorceryConfig.threshold.fire + 1,
                                  })
                                }
                                className="w-7 h-7 rounded bg-white hover:bg-orange-100 border border-orange-300 text-orange-800 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 2. ÁGUA */}
                        {allowedThresholdElements.includes('water') && (
                          <div className="flex items-center justify-between p-2.5 bg-cyan-50/50 hover:bg-cyan-50 rounded-lg border border-cyan-200/70 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-md bg-white border border-cyan-300 shadow-2xs flex items-center justify-center shrink-0 p-0.5">
                                <img
                                  src="/assets/sorcery/threshold_water.png"
                                  alt="Água"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-cyan-950 block">
                                  Água (Water)
                                </span>
                                <span className="text-[10px] text-cyan-700">
                                  {sorceryConfig.threshold.water === 0
                                    ? 'Nenhum requisito'
                                    : `${sorceryConfig.threshold.water} ${sorceryConfig.threshold.water === 1 ? 'símbolo' : 'símbolos'}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    water: Math.max(0, sorceryConfig.threshold.water - 1),
                                  })
                                }
                                disabled={sorceryConfig.threshold.water <= 0}
                                className="w-7 h-7 rounded bg-white hover:bg-cyan-100 border border-cyan-300 text-cyan-800 font-bold flex items-center justify-center text-xs disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={sorceryConfig.threshold.water}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateSorceryThreshold({
                                    water: isNaN(val) || val < 0 ? 0 : val,
                                  });
                                }}
                                className="w-10 h-7 text-center font-bold text-xs bg-white border border-cyan-300 rounded text-cyan-950"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    water: sorceryConfig.threshold.water + 1,
                                  })
                                }
                                className="w-7 h-7 rounded bg-white hover:bg-cyan-100 border border-cyan-300 text-cyan-800 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 3. TERRA */}
                        {allowedThresholdElements.includes('earth') && (
                          <div className="flex items-center justify-between p-2.5 bg-amber-50/50 hover:bg-amber-50 rounded-lg border border-amber-200/70 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-md bg-white border border-amber-300 shadow-2xs flex items-center justify-center shrink-0 p-0.5">
                                <img
                                  src="/assets/sorcery/threshold_earth.png"
                                  alt="Terra"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-amber-950 block">
                                  Terra (Earth)
                                </span>
                                <span className="text-[10px] text-amber-700">
                                  {sorceryConfig.threshold.earth === 0
                                    ? 'Nenhum requisito'
                                    : `${sorceryConfig.threshold.earth} ${sorceryConfig.threshold.earth === 1 ? 'símbolo' : 'símbolos'}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    earth: Math.max(0, sorceryConfig.threshold.earth - 1),
                                  })
                                }
                                disabled={sorceryConfig.threshold.earth <= 0}
                                className="w-7 h-7 rounded bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold flex items-center justify-center text-xs disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={sorceryConfig.threshold.earth}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateSorceryThreshold({
                                    earth: isNaN(val) || val < 0 ? 0 : val,
                                  });
                                }}
                                className="w-10 h-7 text-center font-bold text-xs bg-white border border-amber-300 rounded text-amber-950"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    earth: sorceryConfig.threshold.earth + 1,
                                  })
                                }
                                className="w-7 h-7 rounded bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 4. AR */}
                        {allowedThresholdElements.includes('air') && (
                          <div className="flex items-center justify-between p-2.5 bg-slate-100/70 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-md bg-white border border-slate-300 shadow-2xs flex items-center justify-center shrink-0 p-0.5">
                                <img
                                  src="/assets/sorcery/threshold_air.png"
                                  alt="Ar"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">
                                  Ar (Air)
                                </span>
                                <span className="text-[10px] text-slate-600">
                                  {sorceryConfig.threshold.air === 0
                                    ? 'Nenhum requisito'
                                    : `${sorceryConfig.threshold.air} ${sorceryConfig.threshold.air === 1 ? 'símbolo' : 'símbolos'}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    air: Math.max(0, sorceryConfig.threshold.air - 1),
                                  })
                                }
                                disabled={sorceryConfig.threshold.air <= 0}
                                className="w-7 h-7 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold flex items-center justify-center text-xs disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={sorceryConfig.threshold.air}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateSorceryThreshold({
                                    air: isNaN(val) || val < 0 ? 0 : val,
                                  });
                                }}
                                className="w-10 h-7 text-center font-bold text-xs bg-white border border-slate-300 rounded text-slate-900"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    air: sorceryConfig.threshold.air + 1,
                                  })
                                }
                                className="w-7 h-7 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 5. MATÉRIA */}
                        {allowedThresholdElements.includes('materia') && (
                          <div className="flex items-center justify-between p-2.5 bg-amber-50/50 hover:bg-amber-50 rounded-lg border border-amber-200/70 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-md bg-white border border-amber-300 shadow-2xs flex items-center justify-center shrink-0 p-0.5">
                                <img
                                  src={getThresholdElementImagePath('materia', sorceryConfig.threshold?.elementImages)}
                                  alt="Matéria"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-amber-950 block">
                                  Matéria
                                </span>
                                <span className="text-[10px] text-amber-700">
                                  {(sorceryConfig.threshold.materia || 0) === 0
                                    ? 'Nenhum requisito'
                                    : `${sorceryConfig.threshold.materia} ${sorceryConfig.threshold.materia === 1 ? 'símbolo' : 'símbolos'}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    materia: Math.max(0, (sorceryConfig.threshold.materia || 0) - 1),
                                  })
                                }
                                disabled={(sorceryConfig.threshold.materia || 0) <= 0}
                                className="w-7 h-7 rounded bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold flex items-center justify-center text-xs disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={sorceryConfig.threshold.materia || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateSorceryThreshold({
                                    materia: isNaN(val) || val < 0 ? 0 : val,
                                  });
                                }}
                                className="w-10 h-7 text-center font-bold text-xs bg-white border border-amber-300 rounded text-amber-950"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    materia: (sorceryConfig.threshold.materia || 0) + 1,
                                  })
                                }
                                className="w-7 h-7 rounded bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 6. VAZIO */}
                        {allowedThresholdElements.includes('vazio') && (
                          <div className="flex items-center justify-between p-2.5 bg-purple-50/50 hover:bg-purple-50 rounded-lg border border-purple-200/70 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-md bg-white border border-purple-300 shadow-2xs flex items-center justify-center shrink-0 p-0.5">
                                <img
                                  src={getThresholdElementImagePath('vazio', sorceryConfig.threshold?.elementImages)}
                                  alt="Vazio"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-purple-950 block">
                                  Vazio
                                </span>
                                <span className="text-[10px] text-purple-700">
                                  {(sorceryConfig.threshold.vazio || 0) === 0
                                    ? 'Nenhum requisito'
                                    : `${sorceryConfig.threshold.vazio} ${sorceryConfig.threshold.vazio === 1 ? 'símbolo' : 'símbolos'}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    vazio: Math.max(0, (sorceryConfig.threshold.vazio || 0) - 1),
                                  })
                                }
                                disabled={(sorceryConfig.threshold.vazio || 0) <= 0}
                                className="w-7 h-7 rounded bg-white hover:bg-purple-100 border border-purple-300 text-purple-800 font-bold flex items-center justify-center text-xs disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={sorceryConfig.threshold.vazio || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateSorceryThreshold({
                                    vazio: isNaN(val) || val < 0 ? 0 : val,
                                  });
                                }}
                                className="w-10 h-7 text-center font-bold text-xs bg-white border border-purple-300 rounded text-purple-950"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    vazio: (sorceryConfig.threshold.vazio || 0) + 1,
                                  })
                                }
                                className="w-7 h-7 rounded bg-white hover:bg-purple-100 border border-purple-300 text-purple-800 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 7. VIDA */}
                        {allowedThresholdElements.includes('vida') && (
                          <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 hover:bg-emerald-50 rounded-lg border border-emerald-200/70 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-md bg-white border border-emerald-300 shadow-2xs flex items-center justify-center shrink-0 p-0.5">
                                <img
                                  src={getThresholdElementImagePath('vida', sorceryConfig.threshold?.elementImages)}
                                  alt="Vida"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-emerald-950 block">
                                  Vida
                                </span>
                                <span className="text-[10px] text-emerald-700">
                                  {(sorceryConfig.threshold.vida || 0) === 0
                                    ? 'Nenhum requisito'
                                    : `${sorceryConfig.threshold.vida} ${sorceryConfig.threshold.vida === 1 ? 'símbolo' : 'símbolos'}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    vida: Math.max(0, (sorceryConfig.threshold.vida || 0) - 1),
                                  })
                                }
                                disabled={(sorceryConfig.threshold.vida || 0) <= 0}
                                className="w-7 h-7 rounded bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center text-xs disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={sorceryConfig.threshold.vida || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateSorceryThreshold({
                                    vida: isNaN(val) || val < 0 ? 0 : val,
                                  });
                                }}
                                className="w-10 h-7 text-center font-bold text-xs bg-white border border-emerald-300 rounded text-emerald-950"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    vida: (sorceryConfig.threshold.vida || 0) + 1,
                                  })
                                }
                                className="w-7 h-7 rounded bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 8. MORTE */}
                        {allowedThresholdElements.includes('morte') && (
                          <div className="flex items-center justify-between p-2.5 bg-zinc-100/70 hover:bg-zinc-100 rounded-lg border border-zinc-300 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-md bg-white border border-zinc-300 shadow-2xs flex items-center justify-center shrink-0 p-0.5">
                                <img
                                  src={getThresholdElementImagePath('morte', sorceryConfig.threshold?.elementImages)}
                                  alt="Morte"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-zinc-900 block">
                                  Morte
                                </span>
                                <span className="text-[10px] text-zinc-600">
                                  {(sorceryConfig.threshold.morte || 0) === 0
                                    ? 'Nenhum requisito'
                                    : `${sorceryConfig.threshold.morte} ${sorceryConfig.threshold.morte === 1 ? 'símbolo' : 'símbolos'}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    morte: Math.max(0, (sorceryConfig.threshold.morte || 0) - 1),
                                  })
                                }
                                disabled={(sorceryConfig.threshold.morte || 0) <= 0}
                                className="w-7 h-7 rounded bg-white hover:bg-zinc-200 border border-zinc-300 text-zinc-800 font-bold flex items-center justify-center text-xs disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={sorceryConfig.threshold.morte || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  onUpdateSorceryThreshold({
                                    morte: isNaN(val) || val < 0 ? 0 : val,
                                  });
                                }}
                                className="w-10 h-7 text-center font-bold text-xs bg-white border border-zinc-300 rounded text-zinc-900"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSorceryThreshold({
                                    morte: (sorceryConfig.threshold.morte || 0) + 1,
                                  })
                                }
                                className="w-7 h-7 rounded bg-white hover:bg-zinc-200 border border-zinc-300 text-zinc-800 font-bold flex items-center justify-center text-xs transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Guia rápido para personalização de local e fonte */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Deseja alterar a posição ou a fonte?</span>
                      <button
                        type="button"
                        onClick={() => setSorcerySubTab('position')}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                      >
                        Abrir Menu de Edição →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  VISTA 2: MENU DE EDIÇÃO DO LOCAL DA MANA E THRESHOLD
                 ======================================================== */}
              {!isManaThresholdLocked && sorcerySubTab === 'position' && (
                <div className="space-y-4">
                  {/* BLOCO 1: LOCAL E TAMANHO DA MANA (Oculto em Site) */}
                  {cardType !== 'site' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Move className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-800">
                            Local e Tamanho da Mana
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSorceryMana({
                              xPercent: 5.5,
                              yPercent: 4.8,
                              widthPercent: 9.5,
                              heightPercent: 6.8,
                              scale: 1.0,
                              opacity: 1.0,
                              zIndex: 60,
                            })
                          }
                          title="Restaurar valores padrão oficiais da Mana"
                          className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Padrão</span>
                        </button>
                      </div>

                      {/* Toggle Exibir Mana */}
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-700">Exibir Bolinha de Mana</span>
                        <button
                          type="button"
                          onClick={() => onUpdateSorceryMana({ isVisible: !sorceryConfig.mana.isVisible })}
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                            sorceryConfig.mana.isVisible
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {sorceryConfig.mana.isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Visível
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Oculto
                            </>
                          )}
                        </button>
                      </div>

                      {/* Posição X e Y da Mana */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Posição X:</span>
                            <span className="font-mono font-semibold">{sorceryConfig.mana.xPercent.toFixed(1)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="80"
                            step="0.1"
                            value={sorceryConfig.mana.xPercent}
                            onChange={(e) =>
                              onUpdateSorceryMana({ xPercent: parseFloat(e.target.value) })
                            }
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Posição Y:</span>
                            <span className="font-mono font-semibold">{sorceryConfig.mana.yPercent.toFixed(1)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="80"
                            step="0.1"
                            value={sorceryConfig.mana.yPercent}
                            onChange={(e) =>
                              onUpdateSorceryMana({ yPercent: parseFloat(e.target.value) })
                            }
                            className="w-full accent-indigo-600"
                          />
                        </div>
                      </div>

                      {/* Escala / Tamanho da Mana */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Escala da Bolinha:</span>
                          <span className="font-mono font-semibold">
                            {Math.round((sorceryConfig.mana.scale || 1.0) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.05"
                          value={sorceryConfig.mana.scale || 1.0}
                          onChange={(e) =>
                            onUpdateSorceryMana({ scale: parseFloat(e.target.value) })
                          }
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      {/* Largura e Altura % da Mana */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Largura %:</span>
                            <span className="font-mono font-semibold">{sorceryConfig.mana.widthPercent.toFixed(1)}%</span>
                          </div>
                          <input
                            type="range"
                            min="4"
                            max="20"
                            step="0.1"
                            value={sorceryConfig.mana.widthPercent}
                            onChange={(e) =>
                              onUpdateSorceryMana({ widthPercent: parseFloat(e.target.value) })
                            }
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                            <span>Altura %:</span>
                            <span className="font-mono font-semibold">{sorceryConfig.mana.heightPercent.toFixed(1)}%</span>
                          </div>
                          <input
                            type="range"
                            min="4"
                            max="20"
                            step="0.1"
                            value={sorceryConfig.mana.heightPercent}
                            onChange={(e) =>
                              onUpdateSorceryMana({ heightPercent: parseFloat(e.target.value) })
                            }
                            className="w-full accent-indigo-600"
                          />
                        </div>
                      </div>

                      {/* Opacidade da Mana */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Opacidade:</span>
                          <span className="font-mono font-semibold">{Math.round((sorceryConfig.mana.opacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={sorceryConfig.mana.opacity ?? 1}
                          onChange={(e) =>
                            onUpdateSorceryMana({ opacity: parseFloat(e.target.value) })
                          }
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* BLOCO 2: LOCAL E ESPAÇAMENTOS DO THRESHOLD */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Move className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {cardType === 'site' ? 'Local e Espaçamento dos Thresholds (Linha Única)' : 'Local e Espaçamento dos Thresholds'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          cardType === 'site'
                            ? onUpdateSorceryThreshold({
                                xPercent: 5.5,
                                yPercent: 6.8,
                                scale: 0.85,
                                symbolWidthPercent: 3.8,
                                symbolHeightPercent: 5.2,
                                gapXPercent: 12,
                                gapYPercent: 0,
                                opacity: 1.0,
                                zIndex: 60,
                              })
                            : onUpdateSorceryThreshold({
                                distanceFromManaPercent: 0.1,
                                yPercent: 6.2,
                                scale: 0.8,
                                symbolWidthPercent: 4.8,
                                symbolHeightPercent: 3.4,
                                gapXPercent: -11,
                                gapYPercent: -0.4,
                                opacity: 1.0,
                                zIndex: 60,
                              })
                        }
                        title="Restaurar alinhamento padrão"
                        className="text-[10px] text-slate-500 hover:text-amber-600 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Padrão</span>
                      </button>
                    </div>

                    {/* Toggle Exibir Thresholds na Carta */}
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="font-semibold text-slate-700 block">Exibir na Carta</span>
                        <span className="text-[10px] text-slate-400">
                          {cardType === 'site' ? 'Alinhamento em linha única horizontal' : 'Ao lado direito do círculo de Mana'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSorceryThreshold({ isVisible: !sorceryConfig.threshold.isVisible })
                        }
                        className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                          sorceryConfig.threshold.isVisible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {sorceryConfig.threshold.isVisible ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Visível
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Oculto
                          </>
                        )}
                      </button>
                    </div>

                    {/* Distância da Bolinha de Mana ou Posição X Direta (para Site) */}
                    {cardType === 'site' ? (
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Posição Horizontal (Posição X):</span>
                          <span className="font-mono font-semibold">
                            {sorceryConfig.threshold.xPercent.toFixed(1)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="0.1"
                          value={sorceryConfig.threshold.xPercent}
                          onChange={(e) =>
                            onUpdateSorceryThreshold({
                              xPercent: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-amber-600"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Alinhamento horizontal inicial da linha de Thresholds na carta.
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Distância da Bolinha de Mana:</span>
                          <span className="font-mono font-semibold">
                            {(sorceryConfig.threshold.distanceFromManaPercent ?? 0.8).toFixed(1)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-2"
                          max="15"
                          step="0.1"
                          value={sorceryConfig.threshold.distanceFromManaPercent ?? 0.8}
                          onChange={(e) =>
                            onUpdateSorceryThreshold({
                              distanceFromManaPercent: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-amber-600"
                        />
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Afastamento horizontal da primeira coluna em relação à borda direita da bolinha de Mana.
                        </span>
                      </div>
                    )}

                    {/* Posição Vertical Y do Threshold */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Alinhamento Vertical (Posição Y):</span>
                        <span className="font-mono font-semibold">{sorceryConfig.threshold.yPercent.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="0.1"
                        value={sorceryConfig.threshold.yPercent}
                        onChange={(e) =>
                          onUpdateSorceryThreshold({ yPercent: parseFloat(e.target.value) })
                        }
                        className="w-full accent-amber-600"
                      />
                    </div>

                    {/* Escala dos Símbolos Elementais */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Escala dos Símbolos:</span>
                        <span className="font-mono font-semibold">
                          {Math.round((sorceryConfig.threshold.scale || 1.0) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.8"
                        step="0.05"
                        value={sorceryConfig.threshold.scale || 1.0}
                        onChange={(e) =>
                          onUpdateSorceryThreshold({ scale: parseFloat(e.target.value) })
                        }
                        className="w-full accent-amber-600"
                      />
                    </div>

                    {/* Largura e Altura de cada Símbolo */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Largura Símbolo:</span>
                          <span className="font-mono font-semibold">{sorceryConfig.threshold.symbolWidthPercent.toFixed(1)}%</span>
                        </div>
                        <input
                          type="range"
                          min="2.0"
                          max="8.0"
                          step="0.1"
                          value={sorceryConfig.threshold.symbolWidthPercent}
                          onChange={(e) =>
                            onUpdateSorceryThreshold({ symbolWidthPercent: parseFloat(e.target.value) })
                          }
                          className="w-full accent-amber-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Altura Símbolo:</span>
                          <span className="font-mono font-semibold">{sorceryConfig.threshold.symbolHeightPercent.toFixed(1)}%</span>
                        </div>
                        <input
                          type="range"
                          min="1.5"
                          max="6.0"
                          step="0.1"
                          value={sorceryConfig.threshold.symbolHeightPercent}
                          onChange={(e) =>
                            onUpdateSorceryThreshold({ symbolHeightPercent: parseFloat(e.target.value) })
                          }
                          className="w-full accent-amber-600"
                        />
                      </div>
                    </div>

                    {/* Espaçamentos entre Colunas (gapX) e Linhas (gapY) */}
                    <div className="space-y-3 pt-1 border-t border-slate-200">
                      {/* Espaço entre Colunas / Símbolos */}
                      <div className="space-y-1.5 p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-700">
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {cardType === 'site' ? 'Espaçamento Horizontal entre Símbolos:' : 'Espaçamento Horizontal entre Colunas:'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {cardType === 'site' ? 'Ajusta a distância horizontal entre os símbolos alinhados' : 'Valores negativos aproximam ou sobrepõem as colunas'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="-100"
                              max="200"
                              step="1"
                              value={Math.round(sorceryConfig.threshold.gapXPercent)}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                onUpdateSorceryThreshold({ gapXPercent: isNaN(val) ? 0 : val });
                              }}
                              className="w-16 text-xs p-1 border border-slate-300 rounded text-center font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
                            />
                            <span className="text-xs font-mono font-bold text-slate-500">%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="-100"
                            max="200"
                            step="1"
                            value={sorceryConfig.threshold.gapXPercent}
                            onChange={(e) =>
                              onUpdateSorceryThreshold({ gapXPercent: parseFloat(e.target.value) })
                            }
                            className="flex-1 accent-amber-600"
                          />
                          <button
                            type="button"
                            onClick={() => onUpdateSorceryThreshold({ gapXPercent: cardType === 'site' ? 12 : 0 })}
                            title={cardType === 'site' ? "Restaurar padrão (12%)" : "Restaurar padrão (0%)"}
                            className="text-[10px] text-slate-400 hover:text-amber-700 underline shrink-0 font-medium"
                          >
                            Reset ({cardType === 'site' ? '12%' : '0%'})
                          </button>
                        </div>
                      </div>

                      {/* Espaço vertical entre linhas (Gap Y) - Oculto em Site pois possui linha única horizontal */}
                      {cardType !== 'site' && (
                        <div className="space-y-1.5 p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-700">
                            <div>
                              <span className="font-semibold text-slate-800 block">Espaço vertical entre linhas (Gap Y):</span>
                              <span className="text-[10px] text-slate-400">Valores negativos aproximam ou sobrepõem os símbolos (-2,5% a +2,5%)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="-2.5"
                                max="2.5"
                                step="0.05"
                                value={parseFloat((sorceryConfig.threshold.gapYPercent ?? 0.3).toFixed(2))}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  onUpdateSorceryThreshold({
                                    gapYPercent: isNaN(val) ? 0.3 : Math.max(-2.5, Math.min(2.5, val)),
                                  });
                                }}
                                className="w-16 text-xs p-1 border border-slate-300 rounded text-center font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
                              />
                              <span className="text-xs font-mono font-bold text-slate-500">%</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="-2.5"
                              max="2.5"
                              step="0.05"
                              value={sorceryConfig.threshold.gapYPercent ?? 0.3}
                              onChange={(e) =>
                                onUpdateSorceryThreshold({ gapYPercent: parseFloat(e.target.value) })
                              }
                              className="flex-1 accent-amber-600"
                            />
                            <button
                              type="button"
                              onClick={() => onUpdateSorceryThreshold({ gapYPercent: 0.3 })}
                              title="Restaurar padrão (+0.3%)"
                              className="text-[10px] text-slate-400 hover:text-amber-700 underline shrink-0 font-medium"
                            >
                              Reset (+0.3%)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  VISTA 3: FONTE & ESTILO DO NÚMERO DE MANA (Oculto em Site)
                 ======================================================== */}
              {cardType !== 'site' && !isManaThresholdLocked && sorcerySubTab === 'typography' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Tipografia do Número de Mana
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSorceryMana({
                            fontFamily: 'morpheus',
                            fontSizePx: 20,
                            fontColor: '#ffffff',
                            strokeColor: '#000000',
                            strokeWidthPx: 0, // Padrão: sem contorno
                            textOffsetX: 0,
                            textOffsetY: 0,
                          })
                        }
                        title="Restaurar padrão da tipografia"
                        className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Padrão</span>
                      </button>
                    </div>

                    {/* Família da Fonte */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Família da Fonte:
                      </label>
                      <select
                        value={sorceryConfig.mana.fontFamily}
                        onChange={(e) =>
                          onUpdateSorceryMana({ fontFamily: e.target.value as FontFamilyType })
                        }
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                      >
                        {AVAILABLE_FONTS.map((font) => (
                          <option key={font.id} value={font.id}>
                            {font.name} ({font.usage})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tamanho da Fonte */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Tamanho da Fonte:</span>
                        <span className="font-mono font-semibold">{sorceryConfig.mana.fontSizePx}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="40"
                        step="1"
                        value={sorceryConfig.mana.fontSizePx}
                        onChange={(e) =>
                          onUpdateSorceryMana({ fontSizePx: parseInt(e.target.value, 10) })
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    {/* Cor Principal do Número */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Cor Principal do Número:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={sorceryConfig.mana.fontColor || '#ffffff'}
                          onChange={(e) => onUpdateSorceryMana({ fontColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={sorceryConfig.mana.fontColor || '#ffffff'}
                          onChange={(e) => onUpdateSorceryMana({ fontColor: e.target.value })}
                          className="flex-1 text-xs p-1.5 border border-slate-200 rounded font-mono uppercase bg-white"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        A cor é aplicada de forma pura e uniforme, sem sombras ou bordas escuras obrigatórias.
                      </span>
                    </div>

                    {/* CONTORNO OPCIONAL DO NÚMERO (Inicia desativado por padrão) */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="mana-stroke-toggle" className="flex items-center gap-2 cursor-pointer">
                          <input
                            id="mana-stroke-toggle"
                            type="checkbox"
                            checked={Boolean(sorceryConfig.mana.strokeWidthPx && sorceryConfig.mana.strokeWidthPx > 0)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onUpdateSorceryMana({ strokeWidthPx: 2 });
                              } else {
                                onUpdateSorceryMana({ strokeWidthPx: 0 });
                              }
                            }}
                            className="rounded accent-indigo-600 w-4 h-4"
                          />
                          <span className="text-[11px] font-semibold text-slate-800">
                            Ativar Contorno no Número
                          </span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sorceryConfig.mana.strokeWidthPx && sorceryConfig.mana.strokeWidthPx > 0
                            ? `${sorceryConfig.mana.strokeWidthPx}px`
                            : 'Desativado'}
                        </span>
                      </div>

                      {sorceryConfig.mana.strokeWidthPx && sorceryConfig.mana.strokeWidthPx > 0 ? (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                              Cor do Contorno:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={sorceryConfig.mana.strokeColor || '#000000'}
                                onChange={(e) => onUpdateSorceryMana({ strokeColor: e.target.value })}
                                className="w-7 h-7 rounded border border-slate-300 p-0.5 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={sorceryConfig.mana.strokeColor || '#000000'}
                                onChange={(e) => onUpdateSorceryMana({ strokeColor: e.target.value })}
                                className="flex-1 text-xs p-1 border border-slate-200 rounded font-mono uppercase bg-slate-50"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                              <span>Espessura:</span>
                              <span className="font-mono font-semibold">{sorceryConfig.mana.strokeWidthPx}px</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="8"
                              step="0.5"
                              value={sorceryConfig.mana.strokeWidthPx}
                              onChange={(e) =>
                                onUpdateSorceryMana({ strokeWidthPx: parseFloat(e.target.value) })
                              }
                              className="w-full accent-indigo-600"
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Ajuste Fino de Centralização (Offset X e Y) */}
                    <div className="border-t border-slate-200 pt-3 space-y-2.5">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Ajuste Fino de Centralização na Esfera:
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Ajuste X:</span>
                            <span className="font-mono font-semibold">{sorceryConfig.mana.textOffsetX || 0}px</span>
                          </div>
                          <input
                            type="range"
                            min="-20"
                            max="20"
                            step="1"
                            value={sorceryConfig.mana.textOffsetX || 0}
                            onChange={(e) =>
                              onUpdateSorceryMana({ textOffsetX: parseInt(e.target.value, 10) })
                            }
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Ajuste Y:</span>
                            <span className="font-mono font-semibold">{sorceryConfig.mana.textOffsetY || 0}px</span>
                          </div>
                          <input
                            type="range"
                            min="-20"
                            max="20"
                            step="1"
                            value={sorceryConfig.mana.textOffsetY || 0}
                            onChange={(e) =>
                              onUpdateSorceryMana({ textOffsetY: parseInt(e.target.value, 10) })
                            }
                            className="w-full accent-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  VISTA 4: ORDEM DOS ELEMENTOS (SUBIR / DESCER)
                 ======================================================== */}
              {!isManaThresholdLocked && sorcerySubTab === 'order' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Ordem de Preenchimento dos Símbolos
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSorceryThreshold({
                            elementOrder: ['fire', 'water', 'earth', 'air', 'materia', 'vazio', 'vida', 'morte'],
                          })
                        }
                        title="Restaurar ordem padrão: Fogo, Água, Terra, Ar, Matéria, Vazio, Vida, Morte"
                        className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Padrão</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Os símbolos são posicionados primeiro de cima para baixo (2 por coluna) e depois para a direita. Use as setas para definir a prioridade dos elementos.
                    </p>

                    {/* Lista Reordenável dos Elementos Permitidos */}
                    {(() => {
                      const visibleOrder = sorceryConfig.threshold.elementOrder.filter((elem) =>
                        allowedThresholdElements.includes(elem)
                      );

                      if (visibleOrder.length <= 1) {
                        return (
                          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 text-center text-xs text-slate-500">
                            {allowedThresholdElements.length === 0
                              ? 'Nenhum elemento ativo para ordenação no atributo Neutro.'
                              : 'Ordem fixa para atributo elemental único.'}
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {visibleOrder.map((elem, idx) => {
                            const meta = SORCERY_ELEMENTS[elem];
                            const count = sorceryConfig.threshold[elem] || 0;

                            return (
                              <div
                                key={elem}
                                className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center font-mono">
                                    {idx + 1}
                                  </span>
                                  <div className="w-7 h-7 rounded p-0.5 bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                    <img
                                      src={sorceryConfig.threshold.elementImages[elem]}
                                      alt={meta.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-slate-800 block">
                                      {meta.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      {count} {count === 1 ? 'símbolo' : 'símbolos'}
                                    </span>
                                  </div>
                                </div>

                                {/* Botões Subir / Descer */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveElement(elem, 'up')}
                                    title="Mover para cima"
                                    className="w-7 h-7 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-30 transition-colors"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === visibleOrder.length - 1}
                                    onClick={() => handleMoveElement(elem, 'down')}
                                    title="Mover para baixo"
                                    className="w-7 h-7 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-30 transition-colors"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================
            ABA: ATAQUE E DEFESA (ATK / DEF)
           ======================================================== */}
        {hasCombat && activeTab === 'combat' && (() => {
          const combat = sorceryConfig.combat;
          const selectedType = combat.selectedType || 'attack-only';

          const handleStepSingleAttack = (delta: number) => {
            const raw = combat.single?.value ?? '0';
            if (raw === '*' || raw === 'X') {
              onUpdateSorceryCombat({
                single: {
                  ...(combat.single || DEFAULT_SINGLE_ATTACK_CONFIG),
                  value: delta > 0 ? '1' : '0',
                },
                attack: delta > 0 ? '1' : '0',
              });
              return;
            }
            const num = parseInt(raw, 10);
            const next = isNaN(num) ? 1 : Math.max(0, num + delta);
            onUpdateSorceryCombat({
              single: {
                ...(combat.single || DEFAULT_SINGLE_ATTACK_CONFIG),
                value: String(next),
              },
              attack: String(next),
            });
          };

          const handleStepDualAttack = (delta: number) => {
            const raw = combat.dual?.attackValue ?? '4';
            if (raw === '*' || raw === 'X') {
              onUpdateSorceryCombat({
                dual: {
                  ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                  attackValue: delta > 0 ? '1' : '0',
                },
                attack: delta > 0 ? '1' : '0',
              });
              return;
            }
            const num = parseInt(raw, 10);
            const next = isNaN(num) ? 1 : Math.max(0, num + delta);
            onUpdateSorceryCombat({
              dual: {
                ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                attackValue: String(next),
              },
              attack: String(next),
            });
          };

          const handleStepDualDefense = (delta: number) => {
            const raw = combat.dual?.defenseValue ?? '5';
            if (raw === '*' || raw === 'X') {
              onUpdateSorceryCombat({
                dual: {
                  ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                  defenseValue: delta > 0 ? '1' : '0',
                },
                defense: delta > 0 ? '1' : '0',
              });
              return;
            }
            const num = parseInt(raw, 10);
            const next = isNaN(num) ? 1 : Math.max(0, num + delta);
            onUpdateSorceryCombat({
              dual: {
                ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                defenseValue: String(next),
              },
              defense: String(next),
            });
          };

          return (
            <div className="space-y-4">
              {/* ========================================================
                  CABEÇALHO DA ABA (BÁSICO DA CARTA)
                 ======================================================== */}
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
                      Escolha o tipo de indicador e preencha os valores
                    </p>
                  </div>
                </div>

                {/* Alternância de Visibilidade do Indicador na Carta */}
                <button
                  type="button"
                  onClick={() => onUpdateSorceryCombat({ isVisible: !combat.isVisible })}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all shadow-2xs ${
                    combat.isVisible
                      ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                      : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                  }`}
                  title={combat.isVisible ? 'Ocultar indicador da carta' : 'Exibir indicador na carta'}
                >
                  {combat.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{combat.isVisible ? 'Visível' : 'Oculto'}</span>
                </button>
              </div>

              {/* ========================================================
                  1. SELEÇÃO "SOMENTE ATK" OU "ATK + DEF" (TOTALMENTE FORA DO CADEADO)
                  Permitido alternar a qualquer momento, mesmo com cadeado fechado!
                 ======================================================== */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    Tipo de Indicador da Carta
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                    Sempre editável
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Alterne entre somente Ataque ou Ataque + Defesa. A imagem correspondente é trocada automaticamente.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Opção 1: Somente ATK */}
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSorceryCombat({
                        selectedType: 'attack-only',
                        attack: combat.single?.value ?? '0',
                        defense: null,
                      });
                    }}
                    className={`relative p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedType === 'attack-only'
                        ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          selectedType === 'attack-only'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Swords className="w-4 h-4" />
                      </div>
                      {selectedType === 'attack-only' && (
                        <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-xs text-slate-900 block leading-tight">
                        Somente ATK
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                        Criatura com apenas Ataque (imagem individual).
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-rose-100/80 flex items-center justify-between">
                      <span className="text-[9.5px] font-mono text-slate-500">Valor Atual:</span>
                      <span className="text-[11px] font-bold font-mono text-rose-700">
                        {combat.single?.value ?? '0'}
                      </span>
                    </div>
                  </button>

                  {/* Opção 2: ATK + DEF */}
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSorceryCombat({
                        selectedType: 'attack-defense',
                        attack: combat.dual?.attackValue ?? '4',
                        defense: combat.dual?.defenseValue ?? '5',
                      });
                    }}
                    className={`relative p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedType === 'attack-defense'
                        ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          selectedType === 'attack-defense'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                      </div>
                      {selectedType === 'attack-defense' && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-xs text-slate-900 block leading-tight">
                        ATK + DEF
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                        Criatura com Ataque e Defesa (imagem dupla).
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-indigo-100/80 flex items-center justify-between">
                      <span className="text-[9.5px] font-mono text-slate-500">Valores:</span>
                      <span className="text-[11px] font-bold font-mono text-indigo-700">
                        {combat.dual?.attackValue ?? '4'} / {combat.dual?.defenseValue ?? '5'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ========================================================
                  2. VALORES DA CARTA (TOTALMENTE FORA DO CADEADO)
                  Acessíveis mesmo com cadeado fechado, aceitando números e *
                 ======================================================== */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Valores de Combate da Carta
                </span>

                {selectedType === 'attack-only' ? (
                  /* Campo de Ataque Individual */
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-rose-600" />
                      <span>Valor de Ataque (Número, * ou X)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStepSingleAttack(-1)}
                        className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0 shadow-2xs"
                        title="Diminuir ataque"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="text"
                        value={combat.single?.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          onUpdateSorceryCombat({
                            single: {
                              ...(combat.single || DEFAULT_SINGLE_ATTACK_CONFIG),
                              value: val,
                            },
                            attack: val,
                          });
                        }}
                        placeholder="0"
                        maxLength={4}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-center text-sm font-bold font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepSingleAttack(1)}
                        className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0 shadow-2xs"
                        title="Aumentar ataque"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSorceryCombat({
                            single: {
                              ...(combat.single || DEFAULT_SINGLE_ATTACK_CONFIG),
                              value: '*',
                            },
                            attack: '*',
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold font-mono shadow-2xs"
                        title="Definir ataque como *"
                      >
                        *
                      </button>
                    </div>

                    {/* Atalhos rápidos para ataque individual */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {['0', '1', '2', '3', '4', '5', '6', '7', '8', 'X', '*'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            onUpdateSorceryCombat({
                              single: {
                                ...(combat.single || DEFAULT_SINGLE_ATTACK_CONFIG),
                                value: v,
                              },
                              attack: v,
                            });
                          }}
                          className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md border transition-colors ${
                            combat.single?.value === v
                              ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Campos de Ataque e Defesa Duplos */
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Ataque */}
                    <div className="bg-white border border-rose-200 p-2.5 rounded-lg space-y-1.5 shadow-2xs">
                      <label className="text-[11px] font-bold text-rose-900 flex items-center gap-1">
                        <Swords className="w-3.5 h-3.5 text-rose-600" />
                        <span>Ataque (Atk)</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepDualAttack(-1)}
                          className="w-7 h-7 rounded border border-rose-300 bg-white hover:bg-rose-50 flex items-center justify-center text-rose-800 font-bold shrink-0 text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={combat.dual?.attackValue ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            onUpdateSorceryCombat({
                              dual: {
                                ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                                attackValue: val,
                              },
                              attack: val,
                            });
                          }}
                          placeholder="4"
                          maxLength={4}
                          className="flex-1 px-2 py-1 border border-rose-300 rounded text-center text-xs font-bold font-mono bg-white focus:ring-1 focus:ring-rose-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepDualAttack(1)}
                          className="w-7 h-7 rounded border border-rose-300 bg-white hover:bg-rose-50 flex items-center justify-center text-rose-800 font-bold shrink-0 text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSorceryCombat({
                              dual: {
                                ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                                attackValue: '*',
                              },
                              attack: '*',
                            });
                          }}
                          className="px-2 py-1 rounded border border-rose-300 bg-rose-100 text-rose-800 text-xs font-bold font-mono"
                          title="Definir ataque *"
                        >
                          *
                        </button>
                      </div>
                    </div>

                    {/* Defesa */}
                    <div className="bg-white border border-sky-200 p-2.5 rounded-lg space-y-1.5 shadow-2xs">
                      <label className="text-[11px] font-bold text-sky-900 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-sky-600" />
                        <span>Defesa (Def)</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepDualDefense(-1)}
                          className="w-7 h-7 rounded border border-sky-300 bg-white hover:bg-sky-50 flex items-center justify-center text-sky-800 font-bold shrink-0 text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={combat.dual?.defenseValue ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            onUpdateSorceryCombat({
                              dual: {
                                ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                                defenseValue: val,
                              },
                              defense: val,
                            });
                          }}
                          placeholder="5"
                          maxLength={4}
                          className="flex-1 px-2 py-1 border border-sky-300 rounded text-center text-xs font-bold font-mono bg-white focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepDualDefense(1)}
                          className="w-7 h-7 rounded border border-sky-300 bg-white hover:bg-sky-50 flex items-center justify-center text-sky-800 font-bold shrink-0 text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSorceryCombat({
                              dual: {
                                ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                                defenseValue: '*',
                              },
                              defense: '*',
                            });
                          }}
                          className="px-2 py-1 rounded border border-sky-300 bg-sky-100 text-sky-800 text-xs font-bold font-mono"
                          title="Definir defesa *"
                        >
                          *
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================
                  3. SEÇÃO DE PERSONALIZAÇÃO VISUAL AVANÇADA (PROTEGIDA PELO CADEADO)
                  Posições X/Y, dimensões, escala, fontes, cores e imagens
                 ======================================================== */}
              <div className="border border-slate-200 bg-white rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-slate-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        Personalização Visual Avançada
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Posições X/Y, dimensões, imagens de fundo e tipografia
                      </p>
                    </div>
                  </div>

                  {/* Botão Cadeado Exclusivo para Proteção Visual */}
                  <button
                    type="button"
                    onClick={onToggleCombatLock}
                    title={isCombatLocked ? "Desbloquear configurações visuais avançadas" : "Bloquear configurações visuais avançadas"}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shadow-xs ${
                      isCombatLocked
                        ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 ring-2 ring-emerald-400/30'
                    }`}
                  >
                    {isCombatLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-[11px]">Bloqueado</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px]">Desbloqueado</span>
                      </>
                    )}
                  </button>
                </div>

                {isCombatLocked ? (
                  /* Banner de Proteção Visual */
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-center space-y-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Configurações Visuais Protegidas
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                      As coordenadas X/Y na carta, âncoras dos números, fontes, cores e imagens de fundo estão protegidas contra alterações acidentais.
                    </p>
                    <button
                      type="button"
                      onClick={onToggleCombatLock}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs mt-1"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Desbloquear Ajustes Visuais</span>
                    </button>
                  </div>
                ) : (
                  /* Controles Visuais Avançados Desbloqueados */
                  <div className="pt-1">
                    {selectedType === 'attack-only' ? (
                      <SingleCombatControls
                        config={combat.single || DEFAULT_SINGLE_ATTACK_CONFIG}
                        isVisible={combat.isVisible}
                        isLocked={false}
                        onUnlock={onToggleCombatLock}
                        onAddDefense={(defVal) => {
                          onUpdateSorceryCombat({
                            selectedType: 'attack-defense',
                            single: {
                              ...(combat.single || DEFAULT_SINGLE_ATTACK_CONFIG),
                            },
                            dual: {
                              ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                              attackValue: combat.single?.value || '0',
                              defenseValue: defVal,
                            },
                            attack: combat.single?.value || '0',
                            defense: defVal,
                          });
                        }}
                        onUpdate={(updates) =>
                          onUpdateSorceryCombat({
                            single: {
                              ...(combat.single || DEFAULT_SINGLE_ATTACK_CONFIG),
                              ...updates,
                            },
                          })
                        }
                        onToggleVisibility={() =>
                          onUpdateSorceryCombat({ isVisible: !combat.isVisible })
                        }
                      />
                    ) : (
                      <DualCombatControls
                        config={combat.dual || DEFAULT_DUAL_COMBAT_CONFIG}
                        isVisible={combat.isVisible}
                        isLocked={false}
                        onUnlock={onToggleCombatLock}
                        onClearDefense={() => {
                          onUpdateSorceryCombat({
                            selectedType: 'attack-only',
                            single: {
                              ...(combat.single || DEFAULT_SINGLE_ATTACK_CONFIG),
                              value: combat.dual?.attackValue || '0',
                            },
                            dual: {
                              ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                              defenseValue: '',
                            },
                            attack: combat.dual?.attackValue || '0',
                            defense: null,
                          });
                        }}
                        onUpdate={(updates) => {
                          onUpdateSorceryCombat({
                            dual: {
                              ...(combat.dual || DEFAULT_DUAL_COMBAT_CONFIG),
                              ...updates,
                            },
                          });
                        }}
                        onToggleVisibility={() =>
                          onUpdateSorceryCombat({ isVisible: !combat.isVisible })
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
        {activeTab === 'art' && (
          <div className="space-y-5">
            {/* 1. Upload de Imagem de Arte */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Ilustração / Arte Frontal
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Camada de baixo (fica sob a moldura e os textos)
                  </span>
                </div>
                {artConfig.imageUrl && (
                  <button
                    onClick={onClearImage}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remover
                  </button>
                )}
              </div>

              {artConfig.imageUrl ? (
                <div className="relative border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center gap-3">
                  <img
                    src={artConfig.imageUrl}
                    alt="Preview Arte"
                    className="w-16 h-20 object-cover rounded border border-slate-300"
                  />
                  <div className="flex-1 text-xs space-y-1">
                    <span className="text-emerald-700 font-semibold block">Arte Carregada</span>
                    <label className="inline-block text-[11px] text-blue-600 hover:underline cursor-pointer font-medium">
                      Trocar Arte
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            onUploadImage(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/20 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-1.5" />
                  <span className="text-xs font-semibold text-slate-700">
                    Carregar Ilustração do Dispositivo
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, WebP ou GIF
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onUploadImage(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* 2. Disposição da Arte (Framed vs Full-Bleed) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">
                Disposição da Ilustração
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateArtConfig({ mode: 'framed' })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    artConfig.mode === 'framed'
                      ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-800 block">
                    Moldura Designada
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Área de janela clássica de ilustração no meio superior.
                  </span>
                </button>

                <button
                  onClick={() => onUpdateArtConfig({ mode: 'full-bleed' })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    artConfig.mode === 'full-bleed'
                      ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-800 block">
                    Sangria Total
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Arte ocupa 100% do fundo da carta (Full-Art).
                  </span>
                </button>
              </div>

              {/* Ajuste de Encaixe */}
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Enquadramento da Imagem
                </label>
                <select
                  value={artConfig.fit}
                  onChange={(e) =>
                    onUpdateArtConfig({ fit: e.target.value as CardArtConfig['fit'] })
                  }
                  className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                >
                  <option value="cover">Preencher e Cortar Bordas (Cover)</option>
                  <option value="contain">Conter Imagem Completa (Contain)</option>
                  <option value="fill">Esticar na Área (Fill)</option>
                </select>
              </div>
            </div>

            {/* 3. Formato e Dimensões Físicas */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">
                Formato Físico da Carta
              </span>

              <div className="space-y-2">
                {Object.entries(CARD_PRESETS).map(([key, preset]) => {
                  const isCurrent = dimensions.widthMm === preset.widthMm && dimensions.heightMm === preset.heightMm;
                  return (
                    <button
                      key={key}
                      onClick={() => onChangeDimensions(preset)}
                      className={`w-full p-2 rounded-lg border text-left flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/50 font-semibold text-blue-900'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{preset.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {preset.widthMm}x{preset.heightMm}mm
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 5: CARDFRAME (MOLDURA FRONTAL SOBRE A ARTE)
           ======================================================== */}
        {activeTab === 'cardframe' && (
          <div className="space-y-5">
            {/* Cabeçalho explicativo de camadas */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Cardframe / Moldura Frontal
                </h3>
                {frameConfig.imageUrl && (
                  <button
                    onClick={onClearCardFrame}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remover
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Imagem (geralmente PNG transparente) com as bordas e molduras que se sobrepõem à ilustração frontal.
              </p>
            </div>

            {/* Diagrama Visual de Camadas */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] space-y-1">
              <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wide">
                Ordem das Camadas na Carta:
              </span>
              <div className="flex items-center gap-1 font-mono text-[9px] flex-wrap">
                <span className="px-1 py-0.5 bg-slate-200 text-slate-700 rounded">1. Arte</span>
                <span className="text-slate-400">→</span>
                <span className="px-1 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded border border-blue-300">
                  2. Cardframe
                </span>
                <span className="text-slate-400">→</span>
                <span className="px-1 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded border border-amber-300">
                  3. Atributos (Mana & Combate)
                </span>
                <span className="text-slate-400">→</span>
                <span className="px-1 py-0.5 bg-slate-200 text-slate-700 rounded">4. Textos</span>
              </div>
            </div>

            {/* Upload do Cardframe */}
            <div>
              {frameConfig.imageUrl ? (
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-22 rounded border border-slate-300 overflow-hidden bg-slate-200 flex items-center justify-center relative">
                      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] bg-[size:10px_10px]" />
                      <img
                        src={frameConfig.imageUrl}
                        alt="Cardframe Ativo"
                        className="w-full h-full object-contain relative z-10"
                      />
                    </div>
                    <div className="flex-1 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-800">Cardframe Ativo</span>
                      </div>
                      <label className="inline-block text-[11px] text-blue-600 hover:underline cursor-pointer font-medium">
                        Trocar Arquivo de Moldura
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              onUploadCardFrame(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/50 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                    <Layout className="w-9 h-9 text-blue-500 mb-2 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-bold text-slate-800">
                      Carregar Imagem de Cardframe (PNG)
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Recomendado: PNG com transparência (630 × 880 px)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          onUploadCardFrame(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Botão de Exemplo Rápido */}
                  <button
                    onClick={onApplySampleCardFrame}
                    className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Testar com Cardframe Wireframe Exemplo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Seletor Oficial de Molduras por Atributo (Multi, Neutral, Land, Air, Fire, Water) */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Molduras de Atributos (Sorcery)</span>
                </label>
                <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                  6 molduras
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Selecione uma das molduras ancestrais em alta fidelidade para aplicar à carta:
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {CARD_ATTRIBUTES.map((attr) => {
                  const isCurrent =
                    frameConfig.imageUrl?.includes(attr.fileName) ||
                    frameConfig.imageUrl?.includes(`/${attr.id}.png`) ||
                    frameConfig.imageUrl?.includes(`/${attr.id}_`) ||
                    selectedAttribute === attr.id;

                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => {
                        onUpdateFrameConfig({
                          imageUrl: attr.framePath,
                          opacity: 1,
                          fit: 'fill',
                          isVisible: true,
                        });
                        onSelectAttribute?.(attr.id);
                      }}
                      className={`flex flex-col items-center p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/80 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-full aspect-[63/88] rounded bg-slate-100 overflow-hidden mb-1 relative border border-slate-200 flex items-center justify-center">
                        <img
                          src={attr.framePath}
                          alt={attr.name}
                          className="w-full h-full object-contain pointer-events-none select-none"
                          loading="lazy"
                        />
                        {isCurrent && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className={`text-[11px] font-bold ${isCurrent ? 'text-amber-900' : 'text-slate-700'}`}>
                        {attr.name}
                      </span>
                      <span className="text-[9px] text-slate-400 leading-tight">
                        {attr.elementName.split('/')[0].trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>


            {/* Controles de Aparência do Cardframe */}
            {frameConfig.imageUrl && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                    <span>Opacidade da Moldura:</span>
                    <span className="font-semibold">{Math.round(frameConfig.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={frameConfig.opacity}
                    onChange={(e) =>
                      onUpdateFrameConfig({ opacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">
                    Modo de Ajuste do Cardframe
                  </label>
                  <select
                    value={frameConfig.fit}
                    onChange={(e) =>
                      onUpdateFrameConfig({ fit: e.target.value as CardFrameConfig['fit'] })
                    }
                    className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                  >
                    <option value="fill">Preencher Dimensões da Carta (Fill - Padrão)</option>
                    <option value="cover">Cobrir Proporcional (Cover)</option>
                    <option value="contain">Conter Inteiro (Contain)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700 pt-1">
                  <span>Exibir Moldura na Carta</span>
                  <input
                    type="checkbox"
                    checked={frameConfig.isVisible}
                    onChange={(e) =>
                      onUpdateFrameConfig({ isVisible: e.target.checked })
                    }
                    className="rounded text-blue-600 accent-blue-600 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            ABA 6: MODELOS DE CARTA (CARD LAYOUT PRESETS)
           ======================================================== */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-blue-600" />
                  <span>Modelos de Carta</span>
                </h3>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {presets.length} {presets.length === 1 ? 'modelo' : 'modelos'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Layouts prontos para reuso instantâneo. A arte principal nunca é salva no modelo.
              </p>
            </div>

            {/* Botões de Ação Principal */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={onSaveCurrentAsPreset || onOpenPresetsModal}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Salvar Layout Atual como Modelo</span>
              </button>

              <button
                type="button"
                onClick={onOpenPresetsModal}
                className="w-full py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Abrir Gerenciador Completo & Importar</span>
              </button>
            </div>

            {/* Aviso da Regra Fundamental */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[10px] text-blue-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                🛡️ Regra Fundamental dos Modelos:
              </span>
              <p className="text-blue-800 leading-tight">
                O modelo salva dimensões, Cardframe, símbolos de mana/ataque e todas as caixas de texto.
                <strong> A ilustração principal NÃO é salva</strong>, permitindo que você aplique o mesmo layout
                em diferentes cartas.
              </p>
            </div>

            {/* Lista dos Modelos Salvos */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-slate-700 block">
                Modelos Disponíveis ({presets.length}):
              </span>

              {presets.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4">
                  <Bookmark className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <span className="text-xs text-slate-500 font-medium">Nenhum modelo cadastrado</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {presets.map((preset) => {
                    const thumb = generatePresetThumbnailSvg(preset);
                    return (
                      <div
                        key={preset.id}
                        className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs hover:border-blue-300 transition-all space-y-2"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Miniatura do layout */}
                          <div className="w-10 h-14 rounded border border-slate-300 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={thumb} alt={preset.name} className="w-full h-full object-contain pointer-events-none" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-800 truncate" title={preset.name}>
                                {preset.name}
                              </h4>
                              {preset.isBuiltIn && (
                                <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {preset.textBoxes.length} caixas · {preset.dimensions.widthMm}x{preset.dimensions.heightMm}mm
                            </span>
                            {preset.description && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                {preset.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Botões de Ação Rápida */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onLoadPreset?.(preset, 'preserve-art')}
                            title="Aplica o layout preservando a arte atual da carta"
                            className="py-1 px-2 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Aplicar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onLoadPreset?.(preset, 'blank-art')}
                            title="Aplica o layout deixando a arte em branco"
                            className="py-1 px-2 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center gap-1 transition-colors border border-slate-200"
                          >
                            <ImageIcon className="w-2.5 h-2.5 text-slate-500" />
                            <span>Em Branco</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
