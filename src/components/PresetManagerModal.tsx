import React, { useState, useRef } from 'react';
import { CardLayoutPreset, PresetApplyMode } from '../types/preset';
import {
  CardArtConfig,
  CardDimensionsConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  TextBoxConfig,
} from '../types/card';
import {
  createPresetFromState,
  deletePreset,
  duplicatePreset,
  exportPresetAsJson,
  generatePresetThumbnailSvg,
  parseAndValidatePresetFile,
  persistPresets,
  saveNewPreset,
  updateExistingPreset,
} from '../utils/presetManager';
import {
  Bookmark,
  Plus,
  Upload,
  Download,
  Copy,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Shield,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface PresetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: CardLayoutPreset[];
  onPresetsChange: (updated: CardLayoutPreset[]) => void;
  // Estado atual da carta para salvar ou atualizar
  currentDimensions: CardDimensionsConfig;
  currentArtConfig: CardArtConfig;
  currentFrameConfig: CardFrameConfig;
  currentSymbolsConfig: CardSymbolsConfig;
  currentTextBoxes: TextBoxConfig[];
  currentSorceryConfig?: import('../types/sorcery').SorceryIndicatorsConfig;
  // Callback para carregar
  onLoadPreset: (preset: CardLayoutPreset, mode: PresetApplyMode) => void;
}

export const PresetManagerModal: React.FC<PresetManagerModalProps> = ({
  isOpen,
  onClose,
  presets,
  onPresetsChange,
  currentDimensions,
  currentArtConfig,
  currentFrameConfig,
  currentSymbolsConfig,
  currentTextBoxes,
  currentSorceryConfig,
  onLoadPreset,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Estados para edição de nome/descrição inline
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Confirmação de exclusão
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);

  // Confirmação de carregamento
  const [pendingLoad, setPendingLoad] = useState<{
    preset: CardLayoutPreset;
    mode: PresetApplyMode;
  } | null>(null);

  // Conflito na importação
  const [importConflict, setImportConflict] = useState<{
    importedPreset: CardLayoutPreset;
    existingPreset: CardLayoutPreset;
  } | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtragem dos modelos por busca
  const filteredPresets = presets.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Salvar novo modelo
  const handleSaveCurrentAsPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset = createPresetFromState({
      name: newPresetName,
      description: newPresetDesc,
      dimensions: currentDimensions,
      artConfig: currentArtConfig,
      frameConfig: currentFrameConfig,
      symbolsConfig: currentSymbolsConfig,
      textBoxes: currentTextBoxes,
      sorceryConfig: currentSorceryConfig,
    });

    const updated = saveNewPreset(newPreset);
    onPresetsChange(updated);
    setIsSavingNew(false);
    setNewPresetName('');
    setNewPresetDesc('');
    setSaveSuccessMsg(`Modelo "${newPreset.name}" salvo com sucesso!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Atualizar modelo existente com o layout atual
  const handleUpdateWithCurrentLayout = (preset: CardLayoutPreset) => {
    const updatedModel = createPresetFromState({
      name: preset.name,
      description: preset.description,
      dimensions: currentDimensions,
      artConfig: currentArtConfig,
      frameConfig: currentFrameConfig,
      symbolsConfig: currentSymbolsConfig,
      textBoxes: currentTextBoxes,
      sorceryConfig: currentSorceryConfig,
      existingId: preset.id,
    });

    const updated = updateExistingPreset(preset.id, updatedModel);
    onPresetsChange(updated);
    showNotification('success', `Modelo "${preset.name}" atualizado com o layout atual!`);
  };

  // Duplicar modelo
  const handleDuplicate = (id: string) => {
    const { presets: updated, newPreset } = duplicatePreset(id);
    onPresetsChange(updated);
    if (newPreset) {
      showNotification('success', `Modelo duplicado como "${newPreset.name}".`);
    }
  };

  // Excluir modelo
  const handleConfirmDelete = () => {
    if (!deletingPresetId) return;
    const target = presets.find((p) => p.id === deletingPresetId);
    const updated = deletePreset(deletingPresetId);
    onPresetsChange(updated);
    setDeletingPresetId(null);
    showNotification('success', `Modelo "${target?.name || ''}" excluído.`);
  };

  // Salvar renomeação inline
  const handleSaveInlineEdit = (id: string) => {
    if (!editName.trim()) return;
    const updated = updateExistingPreset(id, {
      name: editName.trim(),
      description: editDesc.trim() || undefined,
    });
    onPresetsChange(updated);
    setEditingPresetId(null);
    showNotification('success', 'Informações do modelo atualizadas.');
  };

  // Manipular upload de arquivo JSON de modelo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parseResult = parseAndValidatePresetFile(content);

      if (!parseResult.success) {
        showNotification('error', parseResult.error);
        return;
      }

      const imported = parseResult.preset;
      // Checar se já existe modelo com o mesmo nome
      const existing = presets.find(
        (p) => p.name.trim().toLowerCase() === imported.name.trim().toLowerCase()
      );

      if (existing) {
        setImportConflict({ importedPreset: imported, existingPreset: existing });
      } else {
        const updated = saveNewPreset(imported);
        onPresetsChange(updated);
        showNotification('success', `Modelo "${imported.name}" importado com sucesso!`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Resolver conflito de importação
  const resolveConflict = (action: 'replace' | 'rename' | 'keep-both') => {
    if (!importConflict) return;
    const { importedPreset, existingPreset } = importConflict;

    let updatedList = [...presets];
    if (action === 'replace') {
      const replaced: CardLayoutPreset = {
        ...importedPreset,
        id: existingPreset.id,
        updatedAt: new Date().toISOString(),
      };
      updatedList = presets.map((p) => (p.id === existingPreset.id ? replaced : p));
      showNotification('success', `Modelo "${existingPreset.name}" substituído.`);
    } else {
      // Renomeia o novo
      const renamed: CardLayoutPreset = {
        ...importedPreset,
        name: `${importedPreset.name} (Importado ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`,
      };
      updatedList = [renamed, ...presets];
      showNotification('success', `Modelo importado como "${renamed.name}".`);
    }

    persistPresets(updatedList);
    onPresetsChange(updatedList);
    setImportConflict(null);
  };

  // Confirmar carregamento
  const handleConfirmLoad = () => {
    if (!pendingLoad) return;
    onLoadPreset(pendingLoad.preset, pendingLoad.mode);
    setPendingLoad(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-4 select-none font-ui">
      <div className="bg-[#302D27] rounded-lg shadow-2xl border border-[#65543C] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-[#453B2D] flex items-center justify-between bg-[#24221E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[#302D27] text-[#C5A675] border border-[#65543C] flex items-center justify-center shadow-xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#E8DECA] font-arcane tracking-wide">
                  Modelos de Carta (Card Layout Presets)
                </h2>
                <span className="text-[11px] font-mono bg-[#24221E] text-[#C5A675] border border-[#65543C] px-2 py-0.5 rounded-full font-bold">
                  {presets.length} {presets.length === 1 ? 'modelo' : 'modelos'}
                </span>
              </div>
              <p className="text-xs text-[#B5A995]">
                Salve, reutilize, exporte e importe layouts completos sem perder configurações ou arte.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#B5A995] hover:text-[#E8DECA] hover:bg-[#34352D] p-1.5 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificações flutuantes */}
        {notification && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-[#24221E] text-[#C5A675] border-b border-[#65543C]'
                : 'bg-[#24221E] text-[#A24F43] border-b border-[#A24F43]/40'
            }`}
          >
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-xs opacity-60 hover:opacity-100 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="px-4 py-2 text-xs font-semibold bg-[#24221E] text-[#C5A675] border-b border-[#65543C]">
            {saveSuccessMsg}
          </div>
        )}

        {/* Barra de Ações: Salvar Atual, Importar, Buscar */}
        <div className="p-4 bg-[#24221E] border-b border-[#453B2D] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSavingNew(true);
                setNewPresetName('');
                setNewPresetDesc('');
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-[#A24F43] hover:bg-[#B85B4E] text-[#FAF5E9] rounded flex items-center gap-1.5 shadow-xs transition-colors border border-[#65543C] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E8DECA]" />
              <span>Salvar Layout Atual como Modelo</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-xs font-medium bg-[#302D27] hover:bg-[#34352D] border border-[#65543C] hover:border-[#C5A675] text-[#E8DECA] rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#C5A675]" />
              <span>Importar Modelo (.json)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Campo de Busca */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#8F8270] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar modelos salvos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#1A1916] border border-[#453B2D] focus:border-[#C5A675] rounded text-[#E8DECA] placeholder-[#8F8270] focus:outline-none"
            />
          </div>
        </div>

        {/* Formulário Inline de "Salvar como Novo Modelo" */}
        {isSavingNew && (
          <div className="p-4 bg-[#24221E] border-b border-[#453B2D]">
            <form onSubmit={handleSaveCurrentAsPreset} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E8DECA] font-arcane flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-[#C5A675]" />
                  Salvar Novo Modelo a partir da Carta Atual
                </span>
                <span className="text-[11px] text-[#C5A675] bg-[#302D27] border border-[#65543C] px-2 py-0.5 rounded font-medium">
                  {currentTextBoxes.length} caixas de texto · Moldura {currentFrameConfig.imageUrl ? 'ativa' : 'vazia'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#E8DECA] mb-1">
                    Nome do Modelo <span className="text-[#A24F43]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TCG Criatura Lendária Dourada"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="w-full text-xs p-2 bg-[#1A1916] border border-[#453B2D] focus:border-[#C5A675] rounded text-[#E8DECA] placeholder-[#8F8270] focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#E8DECA] mb-1">
                    Descrição (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Layout para cartas raras com moldura ornamental e 2 linhas de flavor"
                    value={newPresetDesc}
                    onChange={(e) => setNewPresetDesc(e.target.value)}
                    className="w-full text-xs p-2 bg-[#1A1916] border border-[#453B2D] focus:border-[#C5A675] rounded text-[#E8DECA] placeholder-[#8F8270] focus:outline-none"
                  />
                </div>
              </div>

              {/* Lembrete da Regra Fundamental */}
              <div className="p-2.5 bg-[#1A1916] border border-[#453B2D] rounded text-[11px] text-[#B5A995] space-y-0.5">
                <span className="font-bold text-[#E8DECA] font-arcane">
                  🛡️ Regra Fundamental de Preservação:
                </span>
                <p className="text-[#8F8270] text-[10px]">
                  O modelo salvará as dimensões, moldura, símbolos, caixas de texto com seus estilos e textos,
                  <strong> mas NÃO salvará a arte principal da carta</strong>. Assim, você poderá carregar este
                  modelo em branco ou aplicar diretamente sobre qualquer nova ilustração.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSavingNew(false)}
                  className="px-3 py-1.5 text-xs text-[#B5A995] hover:text-[#E8DECA] rounded font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#A24F43] hover:bg-[#B85B4E] text-[#FAF5E9] rounded shadow-xs border border-[#65543C] cursor-pointer"
                >
                  Confirmar e Salvar Modelo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal / Diálogo de Conflito de Nome na Importação */}
        {importConflict && (
          <div className="p-4 bg-[#24221E] border-b border-[#453B2D] text-xs text-[#E8DECA] space-y-2">
            <span className="font-bold flex items-center gap-1.5 text-[#C5A675] font-arcane">
              ⚠️ Modelo Já Existente: "{importConflict.existingPreset.name}"
            </span>
            <p className="text-[11px] text-[#B5A995]">
              Já existe um modelo com este nome na sua biblioteca. Como você deseja prosseguir?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => resolveConflict('rename')}
                className="px-3 py-1 bg-[#302D27] border border-[#65543C] hover:border-[#C5A675] rounded text-[#E8DECA] font-medium cursor-pointer"
              >
                Manter Ambos (Renomear Novo)
              </button>
              <button
                onClick={() => resolveConflict('replace')}
                className="px-3 py-1 bg-[#A24F43] hover:bg-[#B85B4E] text-[#FAF5E9] rounded font-semibold border border-[#65543C] cursor-pointer"
              >
                Substituir Existente
              </button>
              <button
                onClick={() => setImportConflict(null)}
                className="px-3 py-1 text-[#B5A995] hover:text-[#E8DECA] hover:underline cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Diálogo de Confirmação para Carregar Modelo */}
        {pendingLoad && (
          <div className="p-4 bg-[#24221E] border-b border-[#453B2D] text-xs text-[#E8DECA] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm font-arcane text-[#E8DECA]">
                Carregar Modelo: "{pendingLoad.preset.name}"?
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#302D27] text-[#C5A675] border border-[#65543C] font-bold uppercase">
                {pendingLoad.mode === 'preserve-art' ? 'Manter Arte Atual' : 'Arte em Branco'}
              </span>
            </div>
            <p className="text-[11px] text-[#B5A995] leading-relaxed">
              {pendingLoad.mode === 'preserve-art'
                ? 'Todas as caixas de texto, molduras, dimensões e símbolos serão substituídos pelas configurações deste modelo. A sua ilustração principal atual será PRESERVADA intacta.'
                : 'Todas as configurações do modelo serão restauradas e a área da arte principal ficará VAZIA, pronta para receber uma nova ilustração.'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setPendingLoad(null)}
                className="px-3 py-1.5 text-xs text-[#B5A995] hover:text-[#E8DECA] rounded font-medium border border-[#453B2D] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLoad}
                className="px-4 py-1.5 text-xs font-semibold bg-[#A24F43] hover:bg-[#B85B4E] text-[#FAF5E9] rounded shadow-xs border border-[#65543C] cursor-pointer"
              >
                Sim, Carregar Modelo
              </button>
            </div>
          </div>
        )}

        {/* Diálogo de Confirmação para Excluir Modelo */}
        {deletingPresetId && (
          <div className="p-4 bg-[#24221E] border-b border-[#A24F43]/40 text-xs text-[#E8DECA] space-y-2">
            <span className="font-bold text-[#A24F43] font-arcane">
              Tem certeza que deseja excluir o modelo "{presets.find((p) => p.id === deletingPresetId)?.name}"?
            </span>
            <p className="text-[11px] text-[#B5A995]">
              Esta ação removerá o modelo permanentemente do armazenamento local.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setDeletingPresetId(null)}
                className="px-3 py-1 text-xs text-[#B5A995] hover:text-[#E8DECA] rounded font-medium border border-[#453B2D] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1 text-xs font-semibold bg-[#A24F43] hover:bg-[#B85B4E] text-[#FAF5E9] rounded border border-[#65543C] cursor-pointer"
              >
                Excluir Definitivamente
              </button>
            </div>
          </div>
        )}

        {/* Grade de Modelos Salvos */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#1A1916]">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-16 bg-[#24221E] border border-dashed border-[#453B2D] rounded p-8">
              <Bookmark className="w-10 h-10 text-[#C5A675] mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-[#E8DECA] font-arcane">Nenhum modelo encontrado</h3>
              <p className="text-xs text-[#8F8270] mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? 'Nenhum modelo corresponde aos termos pesquisados.'
                  : 'Você ainda não salvou nenhum modelo. Clique em "Salvar Layout Atual como Modelo" para criar o primeiro.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets.map((preset) => {
                const isEditing = editingPresetId === preset.id;
                const thumbnailSvg = generatePresetThumbnailSvg(preset);
                const formattedDate = new Date(preset.updatedAt || preset.createdAt).toLocaleDateString(
                  'pt-BR',
                  { day: '2-digit', month: 'short', year: 'numeric' }
                );

                return (
                  <div
                    key={preset.id}
                    className="bg-[#24221E] rounded border border-[#453B2D] hover:border-[#65543C] transition-all flex flex-col overflow-hidden group shadow-xs"
                  >
                    {/* Topo do Card com Miniatura e Tags */}
                    <div className="p-3.5 bg-[#302D27] border-b border-[#453B2D] flex items-center gap-3">
                      {/* Miniatura renderizada via SVG puro (Garantia: zero arte) */}
                      <div className="w-16 h-22 rounded border border-[#453B2D] bg-[#1A1916] shadow-xs overflow-hidden shrink-0 flex items-center justify-center relative">
                        <img
                          src={thumbnailSvg}
                          alt={preset.name}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      </div>

                      {/* Informações Resumidas */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full text-xs font-bold p-1 border border-[#C5A675] rounded bg-[#1A1916] text-[#E8DECA]"
                            />
                            <input
                              type="text"
                              placeholder="Descrição"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="w-full text-[10px] p-1 border border-[#453B2D] rounded bg-[#1A1916] text-[#B5A995]"
                            />
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveInlineEdit(preset.id)}
                                className="px-2 py-0.5 text-[10px] bg-[#A24F43] text-[#FAF5E9] rounded font-semibold cursor-pointer"
                              >
                                Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPresetId(null)}
                                className="px-2 py-0.5 text-[10px] text-[#B5A995] hover:underline cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4
                                title={preset.name}
                                className="text-xs font-bold text-[#E8DECA] font-arcane truncate max-w-[140px]"
                              >
                                {preset.name}
                              </h4>
                              {preset.isBuiltIn && (
                                <span className="text-[9px] font-semibold bg-[#24221E] text-[#C5A675] border border-[#65543C] px-1.5 py-0.2 rounded-full">
                                  Padrão
                                </span>
                              )}
                            </div>

                            {preset.description && (
                              <p
                                title={preset.description}
                                className="text-[11px] text-[#B5A995] line-clamp-2 mt-0.5 leading-tight"
                              >
                                {preset.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-[10px] text-[#8F8270] font-mono mt-1">
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formattedDate}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Fita de Detalhes dos Componentes Salvos */}
                    <div className="px-3.5 py-2 bg-[#24221E] text-[10px] text-[#8F8270] border-b border-[#453B2D] flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#C5A675]" />
                        {preset.textBoxes.length} caixas
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-[#8CBED6]" />
                        {preset.symbolsConfig.manaSymbol.isVisible ? 'Mana' : ''}
                        {preset.symbolsConfig.manaSymbol.isVisible && preset.symbolsConfig.attackSymbol.isVisible
                          ? ' + '
                          : ''}
                        {preset.symbolsConfig.attackSymbol.isVisible ? 'Ataque' : ''}
                        {!preset.symbolsConfig.manaSymbol.isVisible &&
                        !preset.symbolsConfig.attackSymbol.isVisible
                          ? 'Sem símbolos'
                          : ''}
                      </span>
                      <span>·</span>
                      <span className="truncate max-w-[70px]">
                        {preset.frameConfig.imageUrl ? 'Moldura' : 'Sem moldura'}
                      </span>
                    </div>

                    {/* Botões Principais de Aplicação */}
                    <div className="p-3 bg-[#24221E] space-y-2 flex-1 flex flex-col justify-between">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPendingLoad({ preset, mode: 'preserve-art' })}
                          title="Aplica o layout mantendo a ilustração principal atual da carta"
                          className="py-1.5 px-2 text-[11px] font-semibold bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] hover:text-[#FAF5E9] rounded flex items-center justify-center gap-1 transition-colors border border-[#65543C] hover:border-[#C5A675] cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#C5A675]" />
                          <span>Aplicar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPendingLoad({ preset, mode: 'blank-art' })}
                          title="Aplica o layout e deixa a área da arte em branco para uma nova imagem"
                          className="py-1.5 px-2 text-[11px] font-medium bg-[#1A1916] hover:bg-[#24221E] text-[#B5A995] hover:text-[#E8DECA] rounded flex items-center justify-center gap-1 transition-colors border border-[#453B2D] cursor-pointer"
                        >
                          <ImageIcon className="w-3 h-3 text-[#8F8270]" />
                          <span>Em Branco</span>
                        </button>
                      </div>

                      {/* Barra de Ações Secundárias (Exportar, Duplicar, Atualizar, Editar, Excluir) */}
                      <div className="flex items-center justify-between border-t border-[#453B2D] pt-2 text-[11px] text-[#B5A995]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => exportPresetAsJson(preset)}
                            title="Exportar arquivo .json independente"
                            className="p-1 hover:bg-[#302D27] rounded text-[#B5A995] hover:text-[#E8DECA] transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(preset.id)}
                            title="Duplicar modelo"
                            className="p-1 hover:bg-[#302D27] rounded text-[#B5A995] hover:text-[#E8DECA] transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateWithCurrentLayout(preset)}
                            title="Atualizar este modelo com o layout atual da tela"
                            className="p-1 hover:bg-[#302D27] rounded text-[#B5A995] hover:text-[#C5A675] transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingPresetId(preset.id);
                              setEditName(preset.name);
                              setEditDesc(preset.description || '');
                            }}
                            title="Renomear ou editar descrição"
                            className="p-1 hover:bg-[#302D27] rounded text-[#B5A995] hover:text-[#E8DECA] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDeletingPresetId(preset.id)}
                          title="Excluir modelo"
                          className="p-1 hover:bg-[#302D27] rounded text-[#8F8270] hover:text-[#A24F43] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-3 border-t border-[#453B2D] bg-[#24221E] flex items-center justify-between text-xs text-[#8F8270]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A675]" />
            <span>Armazenamento local persistente ativo (persistência garantida ao reabrir o app)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#302D27] hover:bg-[#34352D] text-[#E8DECA] rounded transition-colors border border-[#453B2D] hover:border-[#65543C] cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
