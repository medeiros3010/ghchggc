/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CardForge - Construtor de Cartas Wireframe
 * =========================================================================
 * GUIA PARA O DESENVOLVEDOR:
 * 
 * 1. ONDE ALTERAR AS DIMENSÕES DA CARTA:
 *    - Arquivo: `src/types/card.ts` -> objeto `CARD_PRESETS`.
 *    - Padrão atual: 63mm x 88mm (proporção 63/88 = ~0.7159).
 * 
 * 2. CARDFRAME & SÍMBOLOS SUPERIORES (MANA & ATAQUE):
 *    - Símbolo 1 (Mana): Canto superior esquerdo.
 *    - Símbolo 2 (Ataque): Canto superior direito.
 *    - Ambos são camadas independentes sobre o Cardframe e arrastáveis diretamente.
 * 
 * 3. CONTROLES AVANÇADOS DE ESPAÇAMENTO TIPOGRÁFICO:
 *    - Letter Spacing (Espaçamento entre letras)
 *    - Word Spacing (Espaçamento entre palavras)
 *    - Line Height (Entrelinha proporcional: 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.5, 2.0...)
 *    - Paragraph Spacing (Espaçamento entre parágrafos em px)
 * 
 * 4. EXPORTAÇÃO DE COORDENADAS:
 *    - Botão "Exportar JSON" na barra superior para copiar os dados e fixar no código.
 * =========================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CardCanvas } from './components/CardCanvas';
import { SidebarControls } from './components/SidebarControls';
import { ConfigModal } from './components/ConfigModal';
import {
  CardArtConfig,
  CardDimensionsConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  CARD_PRESETS,
  SORCERY_CARD_DIMENSIONS,
  CustomSymbolConfig,
  TextBoxConfig,
  TextBoxRole,
  findBoxByRole,
} from './types/card';
import {
  DEFAULT_CARD_ART,
  DEFAULT_CARD_FRAME,
  DEFAULT_CARD_SYMBOLS,
  DEFAULT_MANA_SYMBOL,
  DEFAULT_ATTACK_SYMBOL,
  DEFAULT_TCG_TEXT_BOXES,
  DEFAULT_SITE_TEXT_BOXES,
  getDefaultTextBoxesForType,
  SAMPLE_CARDFRAME_SVG,
  SAMPLE_SITE_CARDFRAME_SVG,
  SAMPLE_MANA_SVG,
  SAMPLE_ATTACK_SVG,
} from './utils/cardDefaults';
import { exportCardToPng } from './utils/exportCard';
import { ensureAllFontsLoaded } from './utils/fontHelper';
import { CardLayoutPreset, PresetApplyMode } from './types/preset';
import {
  SorceryIndicatorsConfig,
  SorceryManaConfig,
  SorceryThresholdConfig,
  SorceryCombatConfig,
  resetVisualsToPermanentDefaults,
} from './types/sorcery';
import { CardTypeId, hasCombatAttributes, getCardTypeName } from './types/cardType';
import { CardTypeSelector } from './components/CardTypeSelector';
import { CardAttributeSelector } from './components/CardAttributeSelector';
import {
  CardAttributeId,
  requiresAttributeSelection,
  getFrameUrlForAttribute,
  CARD_ATTRIBUTES,
} from './types/cardAttribute';
import { EditorMode } from './types/editorMode';
import { UserModeControls } from './components/UserModeControls';
import { getStoredPresets } from './utils/presetManager';
import { PresetManagerModal } from './components/PresetManagerModal';
import {
  CardTypeState,
  loadAllCardTypeStates,
  saveStoredCardTypeState,
  createNewCardState,
  getDefaultCardTypeState,
  getSessionActiveCardType,
  setSessionActiveCardType,
  getSessionHasStartedEditing,
  setSessionHasStartedEditing,
  getSessionLastActiveCardType,
  setSessionLastActiveCardType,
  getSessionSelectionStep,
  setSessionSelectionStep,
  getSessionPendingCardType,
  setSessionPendingCardType,
  persistCurrentSessionInMemory,
} from './utils/cardStateManager';
import {
  Download,
  Code2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Edit3,
  Grid,
  Info,
  Bookmark,
  Swords,
  Shield,
  AlertTriangle,
  Flame,
  FilePlus2,
  Lock,
  Unlock,
  ChevronLeft,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // 0. Arquitetura Modular com Preservação de Sessão em Memória:
  // Impede que trocar de aba, minimizar ou re-focar a janela reinicie o editor ou apague a edição.
  const [selectedCardType, setSelectedCardTypeState] = useState<CardTypeId | null>(() => getSessionActiveCardType());
  const [pendingCardType, setPendingCardTypeState] = useState<CardTypeId | null>(() => getSessionPendingCardType());
  const [selectionStep, setSelectionStepState] = useState<'type' | 'attribute'>(() => getSessionSelectionStep());
  const [isStartingNewCard, setIsStartingNewCard] = useState<boolean>(false);
  const [lastActiveCardType, setLastActiveCardTypeState] = useState<CardTypeId>(() => getSessionLastActiveCardType());
  const [hasStartedEditing, setHasStartedEditingState] = useState<boolean>(() => {
    const active = getSessionActiveCardType();
    return !!active || getSessionHasStartedEditing();
  });
  const [isConfirmNewCardOpen, setIsConfirmNewCardOpen] = useState<boolean>(false);

  // Setters sincronizados com a sessão em memória
  const setSelectedCardType = useCallback((type: CardTypeId | null) => {
    setSelectedCardTypeState(type);
    setSessionActiveCardType(type);
    if (type) {
      setHasStartedEditingState(true);
      setSessionHasStartedEditing(true);
      setLastActiveCardTypeState(type);
      setSessionLastActiveCardType(type);
    }
  }, []);

  const setPendingCardType = useCallback((type: CardTypeId | null) => {
    setPendingCardTypeState(type);
    setSessionPendingCardType(type);
  }, []);

  const setSelectionStep = useCallback((step: 'type' | 'attribute') => {
    setSelectionStepState(step);
    setSessionSelectionStep(step);
  }, []);

  const setLastActiveCardType = useCallback((type: CardTypeId) => {
    setLastActiveCardTypeState(type);
    setSessionLastActiveCardType(type);
  }, []);

  const setHasStartedEditing = useCallback((started: boolean) => {
    setHasStartedEditingState(started);
    setSessionHasStartedEditing(started);
  }, []);

  // Modo de Operação (Padrão: Modo Usuário 'user'; Opção: Modo Administrador 'admin')

  const [editorMode, setEditorMode] = useState<EditorMode>('user');

  // ARQUITETURA DE ESTADO INDEPENDENTE POR TIPO DE CARTA
  // Cada tipo (Minion, Site, Magic, Aura, Artifact, Avatar) mantém suas próprias configurações visuais,
  // dimensões, coordenadas, fontes, imagens e indicadores de forma 100% isolada e desacoplada.
  const [cardStates, setCardStates] = useState<Record<CardTypeId, CardTypeState>>(() =>
    loadAllCardTypeStates()
  );

  const activeCardType: CardTypeId = selectedCardType || 'minion';
  const currentCardState: CardTypeState =
    cardStates[activeCardType] || getDefaultCardTypeState(activeCardType);

  // Variáveis desestruturadas da carta atualmente ativa para renderização e inspeção
  const dimensions = currentCardState.dimensions;
  const artConfig = currentCardState.artConfig;
  const frameConfig = currentCardState.frameConfig;
  const symbolsConfig = currentCardState.symbolsConfig;
  const textBoxes = currentCardState.textBoxes;
  const sorceryConfig = currentCardState.sorceryConfig;

  // Função centralizada: atualiza e persiste exclusivamente as configurações do tipo de carta ativo
  const updateActiveCardState = (updater: (prev: CardTypeState) => CardTypeState) => {
    setCardStates((prevAll) => {
      const current = prevAll[activeCardType] || getDefaultCardTypeState(activeCardType);
      const updated = updater(current);
      const nextStates = {
        ...prevAll,
        [activeCardType]: updated,
      };
      saveStoredCardTypeState(activeCardType, updated);
      return nextStates;
    });
  };

  const handleDimensionsChange = (newDimensions: CardDimensionsConfig) => {
    updateActiveCardState((state) => ({
      ...state,
      dimensions: newDimensions,
    }));
  };

  const handleUpdateArtConfig = (updates: Partial<CardArtConfig>) => {
    updateActiveCardState((state) => ({
      ...state,
      artConfig: { ...state.artConfig, ...updates },
    }));
  };

  const handleUpdateFrameConfig = (updates: Partial<CardFrameConfig>) => {
    updateActiveCardState((state) => ({
      ...state,
      frameConfig: { ...state.frameConfig, ...updates },
    }));
  };

  const handleUpdateSymbolsConfig = (updates: Partial<CardSymbolsConfig>) => {
    updateActiveCardState((state) => ({
      ...state,
      symbolsConfig: { ...state.symbolsConfig, ...updates },
    }));
  };

  const handleUpdateSorceryMana = (updates: Partial<SorceryManaConfig>) => {
    updateActiveCardState((state) => ({
      ...state,
      sorceryConfig: {
        ...state.sorceryConfig,
        mana: {
          ...state.sorceryConfig.mana,
          ...updates,
        },
      },
    }));
  };

  const handleUpdateSorceryThreshold = (updates: Partial<SorceryThresholdConfig>) => {
    updateActiveCardState((state) => ({
      ...state,
      sorceryConfig: {
        ...state.sorceryConfig,
        threshold: {
          ...state.sorceryConfig.threshold,
          ...updates,
        },
      },
    }));
  };

  const handleUpdateSorceryCombat = (updates: Partial<SorceryCombatConfig>) => {
    updateActiveCardState((state) => ({
      ...state,
      sorceryConfig: {
        ...state.sorceryConfig,
        combat: {
          ...state.sorceryConfig.combat,
          ...updates,
          single: updates.single
            ? { ...state.sorceryConfig.combat.single, ...updates.single }
            : state.sorceryConfig.combat.single,
          dual: updates.dual
            ? { ...state.sorceryConfig.combat.dual, ...updates.dual }
            : state.sorceryConfig.combat.dual,
        },
      },
    }));
  };

  const handleResetSorceryToDefault = () => {
    updateActiveCardState((state) => ({
      ...state,
      sorceryConfig: resetVisualsToPermanentDefaults(true, state.sorceryConfig, state.cardType),
    }));
  };

  // 7. Seleção e Estado da Interface
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>('box-title');
  const [isCombatSelected, setIsCombatSelected] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [hasUserAdjustedZoom, setHasUserAdjustedZoom] = useState<boolean>(false);
  const mainContainerRef = useRef<HTMLElement>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [showInfoBanner, setShowInfoBanner] = useState<boolean>(true);

  // Cálculo automático do zoom inicial ergonômico conforme a tela e área disponível
  const calculateFitZoom = useCallback((): number => {
    const container = mainContainerRef.current;
    let containerWidth = container ? container.clientWidth : 0;
    let containerHeight = container ? container.clientHeight : 0;

    if (!containerWidth || !containerHeight) {
      const sidebarWidth = editorMode === 'admin' ? 420 : 384;
      const headerHeight = 60;
      containerWidth = Math.max(320, window.innerWidth - sidebarWidth);
      containerHeight = Math.max(320, window.innerHeight - headerHeight);
    }

    // Proporção física da carta: Site (88 × 63 mm horizontal); demais (63 × 88 mm vertical)
    const isLandscape = dimensions.widthMm > dimensions.heightMm;
    const baseWidth = isLandscape ? 503 : 360;
    const baseHeight = isLandscape ? 360 : Math.round(360 / dimensions.aspectRatio);

    // Margem de segurança de visualização ao redor da carta
    const safeMarginX = 48; // 24px em cada lateral
    const safeMarginY = 56; // 28px acima e abaixo

    const availableWidth = Math.max(160, containerWidth - safeMarginX);
    const availableHeight = Math.max(
      180,
      containerHeight - safeMarginY - (editorMode === 'admin' && showInfoBanner ? 70 : 0)
    );

    const scaleX = availableWidth / baseWidth;
    const scaleY = availableHeight / baseHeight;

    // Escala uniforme para enquadrar a carta inteira dentro da janela visível
    const rawFit = Math.min(scaleX, scaleY);

    // Limites de zoom: em telas grandes amplia suavemente até 1.35; em telas menores reduz até 0.5
    const clamped = Math.min(1.35, Math.max(0.5, rawFit));

    // Arredonda para múltiplo de 0.05 para valor amigável (ex: 85%, 90%, 105%)
    return Math.round(clamped * 20) / 20;
  }, [dimensions.widthMm, dimensions.heightMm, dimensions.aspectRatio, editorMode, showInfoBanner]);

  // Zoom inicial automático ao abrir o editor ou trocar o tipo de carta selecionada
  useEffect(() => {
    if (selectedCardType) {
      const optimal = calculateFitZoom();
      setZoom(optimal);
      setHasUserAdjustedZoom(false);
    }
  }, [selectedCardType, calculateFitZoom]);

  // Observer de redimensionamento para adaptar o zoom inicial caso a janela mude ANTES do ajuste manual
  useEffect(() => {
    if (!selectedCardType || !mainContainerRef.current) return;

    const observer = new ResizeObserver(() => {
      // NÃO redefine automaticamente após ajustes manuais do usuário
      if (!hasUserAdjustedZoom) {
        const optimal = calculateFitZoom();
        setZoom(optimal);
      }
    });

    observer.observe(mainContainerRef.current);
    return () => observer.disconnect();
  }, [selectedCardType, hasUserAdjustedZoom, calculateFitZoom]);

  // Proteção contra perda de edição e reinicialização de layout ao alternar abas ou janelas
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Ao voltar à aba, assegura que a sessão ativa em memória e o card permanecem intactos
        persistCurrentSessionInMemory();
      }
    };

    const handleWindowFocus = () => {
      // Ao recuperar o foco da janela, mantém exatamente o estado ativo e os dados digitados
      persistCurrentSessionInMemory();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleManualZoomChange = (newZoom: number) => {
    setHasUserAdjustedZoom(true);
    setZoom(newZoom);
  };

  // 8. Sistema de Modelos de Carta (Card Layout Presets)
  const [presets, setPresets] = useState<CardLayoutPreset[]>([]);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);

  // 9. Cadeados de Proteção Visual Independente
  const [isManaThresholdLocked, setIsManaThresholdLocked] = useState<boolean>(true);
  const [isCombatLocked, setIsCombatLocked] = useState<boolean>(true);

  // Ação "Nova Carta": limpa dados da carta preservando 100% da configuração visual do tipo ativo
  const handleNewCard = (targetType?: CardTypeId) => {
    const target = targetType || activeCardType;
    setCardStates((prevAll) => {
      const currentState = prevAll[target] || getDefaultCardTypeState(target);
      const freshState = createNewCardState(target, currentState);
      const nextStates = {
        ...prevAll,
        [target]: freshState,
      };
      saveStoredCardTypeState(target, freshState);
      return nextStates;
    });

    setIsManaThresholdLocked(true);
    setIsCombatLocked(true);
    setSelectedBoxId('box-title');
    setIsCombatSelected(false);
  };

  const handleResumeCard = (typeId: CardTypeId) => {
    setSelectedCardType(typeId);
    setLastActiveCardType(typeId);
    setSelectedBoxId('box-title');
    setIsCombatSelected(false);
  };

  const handleSelectCardType = (typeId: CardTypeId) => {
    if (requiresAttributeSelection(typeId)) {
      setPendingCardType(typeId);
      setIsStartingNewCard(false);
      setSelectionStep('attribute');
      return;
    }

    setSelectedCardType(typeId);
    setLastActiveCardType(typeId);
    setHasStartedEditing(true);
    setSelectedBoxId('box-title');
    setIsCombatSelected(false);
  };

  const handleStartFreshCard = (typeId: CardTypeId) => {
    if (requiresAttributeSelection(typeId)) {
      setPendingCardType(typeId);
      setIsStartingNewCard(true);
      setSelectionStep('attribute');
    } else {
      handleNewCard(typeId);
      setSelectedCardType(typeId);
      setLastActiveCardType(typeId);
      setHasStartedEditing(true);
    }
  };

  const handleConfirmAttributeSelection = (targetType: CardTypeId, attrId: CardAttributeId) => {
    const frameUrl = getFrameUrlForAttribute(attrId);

    setCardStates((prevAll) => {
      const existing = prevAll[targetType] || getDefaultCardTypeState(targetType);
      let updated: CardTypeState;

      if (isStartingNewCard) {
        updated = createNewCardState(targetType, existing, attrId);
      } else {
        updated = {
          ...existing,
          selectedAttribute: attrId,
          frameConfig: {
            ...existing.frameConfig,
            imageUrl: frameUrl,
            opacity: 1,
            fit: 'fill',
            isVisible: true,
          },
        };
      }

      saveStoredCardTypeState(targetType, updated);
      return {
        ...prevAll,
        [targetType]: updated,
      };
    });

    setSelectedCardType(targetType);
    setLastActiveCardType(targetType);
    setHasStartedEditing(true);
    setPendingCardType(null);
    setSelectionStep('type');
    setIsStartingNewCard(false);
    setSelectedBoxId('box-title');
    setIsCombatSelected(false);
  };

  const handleSelectAttribute = (attrId: CardAttributeId) => {
    const frameUrl = getFrameUrlForAttribute(attrId);
    updateActiveCardState((state) => ({
      ...state,
      selectedAttribute: attrId,
      frameConfig: {
        ...state.frameConfig,
        imageUrl: frameUrl,
        opacity: 1,
        fit: 'fill',
        isVisible: true,
      },
    }));
  };

  const handleRequestNewCard = () => {
    const defaultBoxes = getDefaultTextBoxesForType(activeCardType);
    const hasModifications =
      !!artConfig.imageUrl ||
      textBoxes.length !== defaultBoxes.length ||
      hasStartedEditing;
    if (hasModifications) {
      setIsConfirmNewCardOpen(true);
    } else {
      if (requiresAttributeSelection(activeCardType)) {
        setSelectedCardType(null);
        setPendingCardType(activeCardType);
        setIsStartingNewCard(true);
        setSelectionStep('attribute');
      } else {
        handleNewCard(activeCardType);
      }
    }
  };

  const handleConfirmNewCard = () => {
    setIsConfirmNewCardOpen(false);
    if (requiresAttributeSelection(activeCardType)) {
      setSelectedCardType(null);
      setPendingCardType(activeCardType);
      setIsStartingNewCard(true);
      setSelectionStep('attribute');
    } else {
      handleNewCard(activeCardType);
    }
  };


  // Atualização direta de conteúdo das caixas vinculadas por papel estável (Modo Usuário)
  const handleUpdateTextBoxContent = (role: TextBoxRole, content: string) => {
    updateActiveCardState((state: CardTypeState) => {
      const target = findBoxByRole(state.textBoxes, role);
      if (!target) return state;
      return {
        ...state,
        textBoxes: state.textBoxes.map((box: TextBoxConfig) => {
          if (box.id === target.id) {
            return {
              ...box,
              content,
              isVisible: content.trim().length > 0 ? true : box.isVisible,
            };
          }
          return box;
        }),
      };
    });
  };

  // Manipulação de Ataque na Barra Superior (Aceita números e *)
  const handleTopbarAttackChange = (raw: string) => {
    const val = raw.trim();
    updateActiveCardState((state) => {
      const prevCombat = state.sorceryConfig.combat;
      const isDualActive =
        prevCombat.selectedType === 'attack-defense' && !!prevCombat.dual?.defenseValue;
      return {
        ...state,
        sorceryConfig: {
          ...state.sorceryConfig,
          combat: {
            ...prevCombat,
            attack: val || null,
            single: {
              ...prevCombat.single,
              value: val,
            },
            dual: {
              ...prevCombat.dual,
              attackValue: val,
            },
            selectedType: isDualActive ? 'attack-defense' : 'attack-only',
          },
        },
      };
    });
  };

  // Manipulação de Defesa na Barra Superior (Alterna automaticamente entre ATK e ATK/DEF)
  const handleTopbarDefenseChange = (raw: string) => {
    const val = raw.trim();
    const hasDef = val !== '';
    updateActiveCardState((state) => {
      const prevCombat = state.sorceryConfig.combat;
      const atkVal = prevCombat.single?.value || prevCombat.dual?.attackValue || '4';
      return {
        ...state,
        sorceryConfig: {
          ...state.sorceryConfig,
          combat: {
            ...prevCombat,
            attack: atkVal,
            defense: hasDef ? val : null,
            selectedType: hasDef ? 'attack-defense' : 'attack-only',
            single: {
              ...prevCombat.single,
              value: atkVal,
            },
            dual: {
              ...prevCombat.dual,
              attackValue: atkVal,
              defenseValue: val,
            },
          },
        },
      };
    });
  };

  // Pré-carrega fontes tipográficas e sincroniza modelos salvos do armazenamento persistente
  useEffect(() => {
    ensureAllFontsLoaded();
    setPresets(getStoredPresets());
  }, []);

  // Aplicação de Modelo de Carta ao tipo de carta ativo
  const handleLoadPreset = (preset: CardLayoutPreset, mode: PresetApplyMode) => {
    updateActiveCardState((state) => ({
      ...state,
      dimensions: preset.dimensions,
      artConfig: {
        ...preset.artLayout,
        imageUrl: mode === 'preserve-art' ? state.artConfig.imageUrl : null,
      },
      frameConfig: preset.frameConfig,
      symbolsConfig: preset.symbolsConfig,
      textBoxes: preset.textBoxes,
      sorceryConfig: preset.sorceryConfig || state.sorceryConfig,
    }));
    if (preset.textBoxes.length > 0) {
      setSelectedBoxId(preset.textBoxes[0].id);
    }
  };

  // Manipulação de Upload de Arte (Ilustração)
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        const imageUrl = e.target.result as string;
        updateActiveCardState((state) => ({
          ...state,
          artConfig: {
            ...state.artConfig,
            imageUrl,
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    updateActiveCardState((state) => ({
      ...state,
      artConfig: {
        ...state.artConfig,
        imageUrl: null,
      },
    }));
  };

  // Manipulação de Upload de Cardframe (Moldura Frontal)
  const handleUploadCardFrame = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        const imageUrl = e.target.result as string;
        updateActiveCardState((state) => ({
          ...state,
          frameConfig: {
            ...state.frameConfig,
            imageUrl,
            isVisible: true,
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearCardFrame = () => {
    updateActiveCardState((state) => ({
      ...state,
      frameConfig: {
        ...state.frameConfig,
        imageUrl: null,
      },
    }));
  };

  const handleApplySampleCardFrame = () => {
    updateActiveCardState((state) => ({
      ...state,
      frameConfig: {
        ...state.frameConfig,
        imageUrl: state.cardType === 'site' ? SAMPLE_SITE_CARDFRAME_SVG : SAMPLE_CARDFRAME_SVG,
        isVisible: true,
      },
    }));
  };

  // Seleção integrada de elementos
  const handleSelectBox = (id: string | null) => {
    setSelectedBoxId(id);
    if (id !== null) {
      setIsCombatSelected(false);
    }
  };

  const handleSelectCombat = () => {
    setSelectedBoxId(null);
    setIsCombatSelected(true);
  };

  // Manipulação de Caixas de Texto
  const handleUpdateTextBox = (id: string, updates: Partial<TextBoxConfig>) => {
    updateActiveCardState((state: CardTypeState) => ({
      ...state,
      textBoxes: state.textBoxes.map((box: TextBoxConfig) => (box.id === id ? { ...box, ...updates } : box)),
    }));
  };

  const handleAddTextBox = () => {
    const newId = `box-${Date.now()}`;
    const newBox: TextBoxConfig = {
      id: newId,
      name: `Nova Caixa ${textBoxes.length + 1}`,
      content: 'Novo Texto',
      xPercent: 10,
      yPercent: 30,
      widthPercent: 80,
      heightPercent: 6,
      fontSizePx: 14,
      fontWeight: 'normal',
      fontFamily: 'sans',
      textAlign: 'left',
      letterSpacingPx: 0,
      wordSpacingPx: 0,
      lineHeight: 1.25,
      paragraphSpacingPx: 4,
      textStrokeEnabled: false,
      textStrokeColor: '#000000',
      textStrokeWidthPx: 1.0,
      textColor: '#0f172a',
      bgColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#cbd5e1',
      borderWidthPx: 1,
      borderRadiusPx: 6,
      paddingPx: 6,
      paddingXPx: 6,
      paddingYPx: 4,
      isLocked: false,
      isMultiline: false,
      isVisible: true,
      autoFitText: true,
      minFontSizePx: 8,
      paragraphAlignments: [],
    };

    updateActiveCardState((state: CardTypeState) => ({
      ...state,
      textBoxes: [...state.textBoxes, newBox],
    }));
    setSelectedBoxId(newId);
    setIsCombatSelected(false);
  };

  const handleDuplicateTextBox = (id: string) => {
    updateActiveCardState((state: CardTypeState) => {
      const target = state.textBoxes.find((b: TextBoxConfig) => b.id === id);
      if (!target) return state;

      const newId = `box-${Date.now()}`;
      const duplicated: TextBoxConfig = {
        ...target,
        id: newId,
        name: `${target.name} (Cópia)`,
        xPercent: Math.min(90, target.xPercent + 4),
        yPercent: Math.min(90, target.yPercent + 4),
        isLocked: false,
      };

      return {
        ...state,
        textBoxes: [...state.textBoxes, duplicated],
      };
    });
    setSelectedBoxId(`box-${Date.now()}`);
    setIsCombatSelected(false);
  };

  const handleDeleteTextBox = (id: string) => {
    updateActiveCardState((state: CardTypeState) => ({
      ...state,
      textBoxes: state.textBoxes.filter((b: TextBoxConfig) => b.id !== id),
    }));
    if (selectedBoxId === id) {
      setSelectedBoxId(null);
    }
  };

  // Carregar Presets de Texto
  const handleResetToPreset = (presetName: 'tcg' | 'minimal' | 'blank') => {
    if (presetName === 'tcg') {
      updateActiveCardState((state) => ({
        ...state,
        textBoxes: getDefaultTextBoxesForType(state.cardType),
      }));
      setSelectedBoxId('box-title');
    } else if (presetName === 'minimal') {
      updateActiveCardState((state) => ({
        ...state,
        textBoxes: [
          {
            id: 'box-title-min',
            name: 'Título Principal',
            content: 'Nome do Card',
            xPercent: 10,
            yPercent: 8,
            widthPercent: 80,
            heightPercent: 7,
            fontSizePx: 18,
            fontWeight: 'bold',
            fontFamily: 'morpheus',
            textAlign: 'center',
            letterSpacingPx: 0,
            wordSpacingPx: 0,
            lineHeight: 1.2,
            paragraphSpacingPx: 4,
            textColor: '#0f172a',
            bgColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#cbd5e1',
            borderWidthPx: 1,
            borderRadiusPx: 6,
            paddingPx: 6,
            isLocked: false,
            isMultiline: false,
            isVisible: true,
          },
          {
            id: 'box-desc-min',
            name: 'Descrição Central',
            content: 'Espaço para efeito principal e texto explicativo da carta.',
            xPercent: 10,
            yPercent: 65,
            widthPercent: 80,
            heightPercent: 25,
            fontSizePx: 13,
            fontWeight: 'normal',
            fontFamily: 'palatino',
            textAlign: 'center',
            letterSpacingPx: 0,
            wordSpacingPx: 0,
            lineHeight: 1.3,
            paragraphSpacingPx: 4,
            textColor: '#1e293b',
            bgColor: 'rgba(255, 255, 255, 0.92)',
            borderColor: '#cbd5e1',
            borderWidthPx: 1,
            borderRadiusPx: 6,
            paddingPx: 8,
            isLocked: false,
            isMultiline: true,
            isVisible: true,
          },
        ],
      }));
      setSelectedBoxId('box-title-min');
    } else if (presetName === 'blank') {
      updateActiveCardState((state) => ({
        ...state,
        textBoxes: [],
      }));
      setSelectedBoxId(null);
    }
  };

  // Exportar Imagem PNG em Alta Resolução
  const handleExportPng = () => {
    exportCardToPng(
      dimensions,
      artConfig,
      frameConfig,
      textBoxes,
      symbolsConfig,
      `carta-${activeCardType}-${dimensions.widthMm}x${dimensions.heightMm}.png`,
      sorceryConfig,
      activeCardType,
      currentCardState.selectedAttribute
    );
  };

  // Importar Configuração JSON
  const handleImportConfig = (data: {
    dimensions?: CardDimensionsConfig;
    artConfig?: CardArtConfig;
    frameConfig?: CardFrameConfig;
    symbolsConfig?: CardSymbolsConfig;
    textBoxes?: TextBoxConfig[];
  }) => {
    updateActiveCardState((state) => ({
      ...state,
      dimensions: data.dimensions || state.dimensions,
      artConfig: data.artConfig ? { ...state.artConfig, ...data.artConfig } : state.artConfig,
      frameConfig: data.frameConfig ? { ...state.frameConfig, ...data.frameConfig } : state.frameConfig,
      symbolsConfig: data.symbolsConfig
        ? {
            manaSymbol: { ...state.symbolsConfig.manaSymbol, ...data.symbolsConfig.manaSymbol },
            attackSymbol: { ...state.symbolsConfig.attackSymbol, ...data.symbolsConfig.attackSymbol },
          }
        : state.symbolsConfig,
      textBoxes: data.textBoxes || state.textBoxes,
    }));
  };

  // 0. Se nenhum tipo de carta estiver selecionado, exibe o fluxo de seleção inicial ou de atributo
  if (!selectedCardType) {
    if (selectionStep === 'attribute' && pendingCardType) {
      return (
        <CardAttributeSelector
          cardType={pendingCardType}
          currentAttribute={cardStates[pendingCardType]?.selectedAttribute}
          onSelectAttribute={(attributeId) => {
            handleConfirmAttributeSelection(pendingCardType, attributeId);
          }}
          onBack={() => {
            setSelectionStep('type');
            setPendingCardType(null);
            setIsStartingNewCard(false);
          }}
        />
      );
    }

    return (
      <CardTypeSelector
        onSelectType={handleSelectCardType}
        onResumeCard={handleResumeCard}
        hasActiveSession={hasStartedEditing}
        activeCardType={lastActiveCardType}
        onStartFreshCard={handleStartFreshCard}
        hasActiveMinionSession={hasStartedEditing && lastActiveCardType === 'minion'}
        onStartFreshMinion={() => handleStartFreshCard('minion')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#24221E] text-[#E8DECA] font-ui selection:bg-[#65543C] selection:text-[#E8DECA]">
      {/* ========================================================
          BARRA DE FERRAMENTAS SUPERIOR (HEADER - ARCANE ATELIER)
         ======================================================== */}
      <header className="h-14 bg-[#24221E] border-b border-[#453B2D] px-4 flex items-center justify-between shrink-0 z-40 font-ui">
        {/* Identificação, Botão "Tipos de carta", Dimensões e Seletor de Modo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedCardType(null);
              setSelectionStep('type');
              setPendingCardType(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] rounded border border-[#65543C] hover:border-[#C5A675] transition-all cursor-pointer group"
            title="Voltar para a seleção de tipos de carta (sua edição é mantida)"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#B5A995] group-hover:-translate-x-0.5 transition-transform" />
            <span>Tipos de carta</span>
          </button>

          <div className="h-4 w-px bg-[#453B2D]" />

          <div className="w-8 h-8 rounded border border-[#65543C] bg-[#302D27] text-[#C5A675] flex items-center justify-center font-arcane font-bold text-xs tracking-wider">
            CF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#E8DECA] font-arcane tracking-wide">CardForge</h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#302D27] text-[#C5A675] rounded border border-[#65543C] font-semibold">
                {getCardTypeName(selectedCardType)}
              </span>
            </div>
            <div className="text-[11px] text-[#B5A995] font-mono flex items-center gap-1.5">
              <span>{dimensions.widthMm}mm × {dimensions.heightMm}mm</span>
            </div>
          </div>

          <div className="h-5 w-px bg-[#453B2D]" />

          {/* Seletor Principal de Modo: Modo Usuário (Padrão) vs Modo Administrador */}
          <div className="flex items-center p-0.5 bg-[#1E1D19] rounded-lg border border-[#453B2D]">
            <button
              onClick={() => setEditorMode('user')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                editorMode === 'user'
                  ? 'bg-[#302D27] text-[#E8DECA] border border-[#65543C] shadow-xs'
                  : 'text-[#B5A995] hover:text-[#E8DECA]'
              }`}
              title="Modo Usuário: Interface limpa e simplificada para criar cartas"
            >
              <User className={`w-3.5 h-3.5 ${editorMode === 'user' ? 'text-[#C5A675]' : 'text-[#8F8270]'}`} />
              <span>Modo Usuário</span>
            </button>
            <button
              onClick={() => setEditorMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                editorMode === 'admin'
                  ? 'bg-[#302D27] text-[#C5A675] border border-[#65543C] shadow-xs'
                  : 'text-[#B5A995] hover:text-[#E8DECA]'
              }`}
              title="Modo Administrador: Ferramentas técnicas completas, coordenadas, fontes, moldura e presets"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${editorMode === 'admin' ? 'text-[#C5A675]' : 'text-[#8F8270]'}`} />
              <span>Modo Administrador</span>
            </button>
          </div>
        </div>

        {/* Controles de Visualização e Zoom */}
        <div className="flex items-center gap-2">
          {/* Se estiver no Modo Administrador, exibe alternância de modo edição e guias */}
          {editorMode === 'admin' && (
            <>
              <div className="flex items-center p-0.5 bg-[#1E1D19] rounded-lg border border-[#453B2D]">
                <button
                  onClick={() => setIsEditMode(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    isEditMode
                      ? 'bg-[#302D27] text-[#E8DECA] border border-[#65543C] shadow-xs'
                      : 'text-[#B5A995] hover:text-[#E8DECA]'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edição</span>
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    !isEditMode
                      ? 'bg-[#302D27] text-[#E8DECA] border border-[#65543C] shadow-xs'
                      : 'text-[#B5A995] hover:text-[#E8DECA]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Prévia</span>
                </button>
              </div>

              {isEditMode && (
                <button
                  onClick={() => setShowGuides(!showGuides)}
                  title={showGuides ? 'Ocultar Guias de Margem Segura' : 'Exibir Guias de Margem Segura'}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    showGuides
                      ? 'bg-[#302D27] text-[#C5A675] border-[#C5A675]'
                      : 'bg-[#24221E] text-[#B5A995] border-[#453B2D] hover:border-[#65543C]'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Guias</span>
                </button>
              )}
            </>
          )}

          {/* Controle de Zoom Responsivo */}
          <div className="flex items-center gap-1.5 bg-[#302D27] border border-[#65543C] rounded-lg px-2 py-1 shadow-2xs">
            <button
              onClick={() =>
                handleManualZoomChange(
                  Math.max(0.5, Math.round(((zoom > 2 ? zoom - 0.25 : zoom - 0.1)) * 100) / 100)
                )
              }
              title="Diminuir Zoom"
              className="p-1 hover:bg-[#34352D] rounded text-[#B5A995] hover:text-[#E8DECA] transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.05"
              value={zoom}
              onChange={(e) => handleManualZoomChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-[#C5A675] cursor-pointer h-1.5 bg-[#1E1D19] rounded-lg"
              title={`Zoom: ${Math.round(zoom * 100)}%`}
            />

            <span className="text-[11px] font-mono font-medium px-1 text-[#E8DECA] w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={() =>
                handleManualZoomChange(
                  Math.min(5.0, Math.round(((zoom >= 2 ? zoom + 0.25 : zoom + 0.1)) * 100) / 100)
                )
              }
              title="Aumentar Zoom (até 500%)"
              className="p-1 hover:bg-[#34352D] rounded text-[#B5A995] hover:text-[#E8DECA] transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-0.5 border-l border-[#453B2D] pl-1 ml-0.5">
              <button
                onClick={() => {
                  const optimal = calculateFitZoom();
                  setZoom(optimal);
                  setHasUserAdjustedZoom(false);
                }}
                title="Ajustar automaticamente à tela"
                className="px-1.5 py-0.5 text-[10px] font-mono rounded text-[#B5A995] hover:text-[#E8DECA] hover:bg-[#34352D] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-2.5 h-2.5" />
                Ajustar
              </button>

              <button
                onClick={() => handleManualZoomChange(1)}
                title="Zoom 100%"
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer ${
                  Math.abs(zoom - 1.0) < 0.05
                    ? 'bg-[#C5A675] text-[#24221E]'
                    : 'text-[#B5A995] hover:text-[#E8DECA] hover:bg-[#34352D]'
                }`}
              >
                100%
              </button>
            </div>
          </div>
        </div>

        {/* Atributos Oficiais de Sorcery no Topbar (Apenas no Modo Administrador) */}
        {editorMode === 'admin' && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#302D27] border border-[#65543C] rounded-lg">
            {/* Mana (Oculto em Site) */}
            {selectedCardType !== 'site' && (
              <>
                <div className="flex items-center gap-1.5" title="Custo de Mana da Carta">
                  <div className="w-5 h-5 rounded-full relative flex items-center justify-center shrink-0">
                    <img
                      src={sorceryConfig.mana.imageUrl || '/assets/sorcery/mana.png?v=2'}
                      alt="Mana"
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#B5A995]">Mana:</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={sorceryConfig.mana.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleUpdateSorceryMana({ quantity: isNaN(val) || val < 0 ? 0 : val });
                    }}
                    className="w-10 h-7 text-center text-xs font-bold text-[#E8DECA] bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded focus:outline-none"
                  />
                </div>
                <div className="h-4 w-px bg-[#453B2D]" />
              </>
            )}

            {/* Threshold (8 Modelos: Fogo, Água, Terra, Ar, Matéria, Vazio, Vida, Morte) */}
            <div className="flex items-center gap-1" title="Thresholds (Fogo / Água / Terra / Ar / Matéria / Vazio / Vida / Morte)">
              <span className="text-[11px] font-medium text-[#B5A995] mr-0.5">Threshold:</span>
              <div className="flex items-center gap-1">
                <span
                  className="px-1.5 py-0.5 bg-[#24221E] border border-[#65543C] text-[#D89B78] rounded text-[10px] font-bold flex items-center gap-0.5"
                  title="Fogo (Fire)"
                >
                  🔥 {sorceryConfig.threshold.fire || 0}
                </span>
                <span
                  className="px-1.5 py-0.5 bg-[#24221E] border border-[#65543C] text-[#8CBED6] rounded text-[10px] font-bold flex items-center gap-0.5"
                  title="Água (Water)"
                >
                  💧 {sorceryConfig.threshold.water || 0}
                </span>
                <span
                  className="px-1.5 py-0.5 bg-[#24221E] border border-[#65543C] text-[#C5A675] rounded text-[10px] font-bold flex items-center gap-0.5"
                  title="Terra (Earth)"
                >
                  ⛰ {sorceryConfig.threshold.earth || 0}
                </span>
                <span
                  className="px-1.5 py-0.5 bg-[#24221E] border border-[#65543C] text-[#B5C9D5] rounded text-[10px] font-bold flex items-center gap-0.5"
                  title="Ar (Air)"
                >
                  💨 {sorceryConfig.threshold.air || 0}
                </span>
                <span
                  className="px-1.5 py-0.5 bg-[#24221E] border border-[#65543C] text-[#C5A675] rounded text-[10px] font-bold flex items-center gap-0.5"
                  title="Matéria"
                >
                  ⚙️ {sorceryConfig.threshold.materia || 0}
                </span>
                <span
                  className="px-1.5 py-0.5 bg-[#24221E] border border-[#65543C] text-[#B892FF] rounded text-[10px] font-bold flex items-center gap-0.5"
                  title="Vazio"
                >
                  🌌 {sorceryConfig.threshold.vazio || 0}
                </span>
                <span
                  className="px-1.5 py-0.5 bg-[#24221E] border border-[#65543C] text-[#7ECB65] rounded text-[10px] font-bold flex items-center gap-0.5"
                  title="Vida"
                >
                  🌿 {sorceryConfig.threshold.vida || 0}
                </span>
                <span
                  className="px-1.5 py-0.5 bg-[#24221E] border border-[#65543C] text-[#A0A0A0] rounded text-[10px] font-bold flex items-center gap-0.5"
                  title="Morte"
                >
                  💀 {sorceryConfig.threshold.morte || 0}
                </span>
              </div>
            </div>

            {hasCombatAttributes(selectedCardType) && (
              <>
                <div className="h-4 w-px bg-[#453B2D]" />

                {/* ATAQUE | DEFESA */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <Swords className="w-3.5 h-3.5 text-[#C5A675]" />
                    <label htmlFor="topbar-attack" className="text-[11px] font-medium text-[#B5A995]">
                      ATK:
                    </label>
                    <input
                      id="topbar-attack"
                      type="text"
                      placeholder="4"
                      maxLength={4}
                      value={
                        sorceryConfig.combat.selectedType === 'attack-only'
                          ? (sorceryConfig.combat.single?.value ?? '')
                          : (sorceryConfig.combat.dual?.attackValue ?? '')
                      }
                      onChange={(e) => handleTopbarAttackChange(e.target.value)}
                      className="w-10 h-7 text-center text-xs font-bold font-mono text-[#E8DECA] bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded focus:outline-none placeholder:text-[10px] placeholder:text-[#8F8270]"
                      title="Valor de Ataque (Número, * ou X)"
                    />
                  </div>

                  <span className="text-[#453B2D] font-bold">|</span>

                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#8CBED6]" />
                    <label htmlFor="topbar-defense" className="text-[11px] font-medium text-[#B5A995]">
                      DEF:
                    </label>
                    <input
                      id="topbar-defense"
                      type="text"
                      placeholder="vazio"
                      maxLength={4}
                      value={
                        sorceryConfig.combat.selectedType === 'attack-defense'
                          ? (sorceryConfig.combat.dual?.defenseValue ?? '')
                          : ''
                      }
                      onChange={(e) => handleTopbarDefenseChange(e.target.value)}
                      className="w-10 h-7 text-center text-xs font-bold font-mono text-[#E8DECA] bg-[#24221E] border border-[#453B2D] focus:border-[#C5A675] rounded focus:outline-none placeholder:text-[10px] placeholder:text-[#8F8270]"
                      title="Valor de Defesa (Deixe vazio para usar apenas Ataque individual)"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          {/* Botão Nova Carta */}
          <button
            onClick={handleRequestNewCard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] rounded border border-[#65543C] hover:border-[#C5A675] transition-all cursor-pointer"
            title="Criar nova carta mantendo as configurações visuais protegidas"
          >
            <FilePlus2 className="w-3.5 h-3.5 text-[#C5A675]" />
            <span>Nova Carta</span>
          </button>

          {/* Botões específicos do Modo Administrador */}
          {editorMode === 'admin' && (
            <>
              <button
                onClick={() => setIsPresetModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] rounded border border-[#65543C] hover:border-[#C5A675] transition-all cursor-pointer"
                title="Gerenciar e salvar modelos reutilizáveis de cartas"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#C5A675]" />
                <span>Modelos</span>
                <span className="bg-[#24221E] text-[#C5A675] border border-[#65543C] text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  {presets.length}
                </span>
              </button>

              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] rounded border border-[#65543C] hover:border-[#C5A675] transition-all cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-[#B5A995]" />
                <span>JSON</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportPng}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#A24F43] hover:bg-[#B85B4E] text-[#FAF5E9] border border-[#65543C] rounded transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#E8DECA]" />
            <span>Baixar Imagem PNG</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          ÁREA PRINCIPAL DE TRABALHO (CANVAS + SIDEBAR)
         ======================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas da Carta com Rolagem / Centralização em Fundo Atelier Escuro */}
        <main
          ref={mainContainerRef}
          className="flex-1 overflow-auto flex flex-col items-center justify-start p-6 bg-[#1A1916]"
        >
          {/* Banner de instrução rápida (Apenas no Modo Administrador) */}
          {showInfoBanner && editorMode === 'admin' && (
            <div className="max-w-xl w-full mb-4 bg-[#302D27] border border-[#65543C] rounded-lg p-3 flex items-start justify-between text-xs text-[#E8DECA]">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#C5A675] mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#E8DECA] font-arcane tracking-wide">
                    Modo Administrador — Layout Técnico (Wireframe, Coordenadas & Cadeados)
                  </p>
                  <p className="text-[11px] leading-relaxed text-[#B5A995]">
                    • <strong>Símbolos de Mana & Ataque:</strong> Imagens sobrepostas com controle fino de escala e posição.<br />
                    • <strong>Espaçamentos Tipográficos:</strong> Ajuste letter-spacing, word-spacing, line-height e entrelinha.<br />
                    • <strong>Arraste & Redimensione:</strong> Mova qualquer caixa ou símbolo diretamente sobre a carta.<br />
                    • <strong>Presets:</strong> Salve o layout como modelo padrão para o tipo de carta.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoBanner(false)}
                className="text-[#B5A995] hover:text-[#E8DECA] text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Renderizador Visual da Carta (Compartilhado entre ambos os modos) */}
          <CardCanvas
            cardType={selectedCardType}
            selectedAttribute={currentCardState.selectedAttribute}
            dimensions={dimensions}
            artConfig={artConfig}
            frameConfig={frameConfig}
            symbolsConfig={symbolsConfig}
            sorceryConfig={sorceryConfig}
            onUpdateSorceryCombat={handleUpdateSorceryCombat}
            onUpdateSorceryThreshold={handleUpdateSorceryThreshold}
            isCombatSelected={isCombatSelected}
            onSelectCombat={handleSelectCombat}
            isCombatLocked={isCombatLocked}
            textBoxes={textBoxes}
            selectedBoxId={selectedBoxId}
            onSelectBox={handleSelectBox}
            onUpdateTextBox={handleUpdateTextBox}
            onUploadImage={handleUploadImage}
            onUploadCardFrame={handleUploadCardFrame}
            showGuides={editorMode === 'admin' ? showGuides : false}
            isEditMode={editorMode === 'admin' ? isEditMode : false}
            zoom={zoom}
          />
        </main>

        {/* Barra Lateral: Modo Usuário (Criação Simplificada) vs Modo Administrador (Técnico) */}
        {editorMode === 'user' ? (
          <UserModeControls
            cardType={selectedCardType}
            textBoxes={textBoxes}
            onUpdateTextBoxContent={handleUpdateTextBoxContent}
            onUpdateTextBox={handleUpdateTextBox}
            sorceryConfig={sorceryConfig}
            onUpdateSorceryMana={handleUpdateSorceryMana}
            onUpdateSorceryThreshold={handleUpdateSorceryThreshold}
            onUpdateSorceryCombat={handleUpdateSorceryCombat}
            artConfig={artConfig}
            onUpdateArtConfig={handleUpdateArtConfig}
            onUploadImage={handleUploadImage}
            onClearImage={handleClearImage}
            frameConfig={frameConfig}
            onUpdateFrameConfig={handleUpdateFrameConfig}
            selectedAttribute={currentCardState.selectedAttribute}
            onSelectAttribute={handleSelectAttribute}
            onExportPng={handleExportPng}
            onOpenConfigModal={() => setIsConfigModalOpen(true)}
            onRequestNewCard={handleRequestNewCard}
          />
        ) : (
          <SidebarControls
            cardType={selectedCardType}
            dimensions={dimensions}
            onChangeDimensions={handleDimensionsChange}
            artConfig={artConfig}
            onUpdateArtConfig={handleUpdateArtConfig}
            onUploadImage={handleUploadImage}
            onClearImage={handleClearImage}
            frameConfig={frameConfig}
            onUpdateFrameConfig={handleUpdateFrameConfig}
            onUploadCardFrame={handleUploadCardFrame}
            onClearCardFrame={handleClearCardFrame}
            onApplySampleCardFrame={handleApplySampleCardFrame}
            selectedAttribute={currentCardState.selectedAttribute}
            onSelectAttribute={handleSelectAttribute}
            sorceryConfig={sorceryConfig}

            onUpdateSorceryMana={handleUpdateSorceryMana}
            onUpdateSorceryThreshold={handleUpdateSorceryThreshold}
            onUpdateSorceryCombat={handleUpdateSorceryCombat}
            isCombatSelected={isCombatSelected}
            isManaThresholdLocked={isManaThresholdLocked}
            onToggleManaThresholdLock={() => setIsManaThresholdLocked((prev) => !prev)}
            isCombatLocked={isCombatLocked}
            onToggleCombatLock={() => setIsCombatLocked((prev) => !prev)}
            onResetSorceryToDefault={handleResetSorceryToDefault}
            textBoxes={textBoxes}
            selectedBoxId={selectedBoxId}
            onSelectBox={handleSelectBox}
            onAddTextBox={handleAddTextBox}
            onDuplicateTextBox={handleDuplicateTextBox}
            onDeleteTextBox={handleDeleteTextBox}
            onUpdateTextBox={handleUpdateTextBox}
            onResetToPreset={handleResetToPreset}
            presets={presets}
            onLoadPreset={handleLoadPreset}
            onOpenPresetsModal={() => setIsPresetModalOpen(true)}
            onSaveCurrentAsPreset={() => setIsPresetModalOpen(true)}
          />
        )}
      </div>

      {/* Modal Completo de Modelos de Carta (Card Layout Presets) */}
      <PresetManagerModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        presets={presets}
        onPresetsChange={setPresets}
        currentDimensions={dimensions}
        currentArtConfig={artConfig}
        currentFrameConfig={frameConfig}
        currentSymbolsConfig={symbolsConfig}
        currentTextBoxes={textBoxes}
        currentSorceryConfig={sorceryConfig}
        onLoadPreset={handleLoadPreset}
      />

      {/* Modal de Exportação e Importação de Configuração JSON */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        dimensions={dimensions}
        artConfig={artConfig}
        frameConfig={frameConfig}
        symbolsConfig={symbolsConfig}
        textBoxes={textBoxes}
        onImportConfig={handleImportConfig}
      />

      {/* Modal de Confirmação para Iniciar Nova Carta (Evita perda acidental) */}
      {isConfirmNewCardOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-4 font-ui"
          onClick={() => setIsConfirmNewCardOpen(false)}
        >
          <div
            className="bg-[#302D27] rounded-lg p-6 max-w-sm w-full shadow-2xl border border-[#65543C] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#24221E] text-[#C5A675] border border-[#65543C] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#C5A675]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#E8DECA] font-arcane tracking-wide">Iniciar Nova Carta?</h3>
                <span className="text-[11px] text-[#B5A995]">Atenção para alterações em andamento</span>
              </div>
            </div>

            <p className="text-xs text-[#B5A995] leading-relaxed">
              Você possui uma carta em edição. Ao criar uma nova carta, a arte atual e textos editados serão redefinidos para o modelo padrão protegido.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#453B2D]">
              <button
                type="button"
                onClick={() => setIsConfirmNewCardOpen(false)}
                className="px-3.5 py-2 text-xs font-medium bg-[#24221E] hover:bg-[#34352D] text-[#B5A995] hover:text-[#E8DECA] rounded transition-colors border border-[#453B2D] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmNewCard}
                className="px-3.5 py-2 text-xs font-semibold bg-[#A24F43] hover:bg-[#B85B4E] text-[#FAF5E9] rounded transition-colors shadow-xs border border-[#65543C] cursor-pointer"
              >
                Sim, Nova Carta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
