import React, { useState } from 'react';
import {
  CardArtConfig,
  CardDimensionsConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  TextBoxConfig,
} from '../types/card';
import { Copy, Check, Download, Upload, X } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  dimensions: CardDimensionsConfig;
  artConfig: CardArtConfig;
  frameConfig: CardFrameConfig;
  symbolsConfig?: CardSymbolsConfig;
  textBoxes: TextBoxConfig[];
  onImportConfig: (data: {
    dimensions?: CardDimensionsConfig;
    artConfig?: CardArtConfig;
    frameConfig?: CardFrameConfig;
    symbolsConfig?: CardSymbolsConfig;
    textBoxes?: TextBoxConfig[];
  }) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  dimensions,
  artConfig,
  frameConfig,
  symbolsConfig,
  textBoxes,
  onImportConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  // JSON exportável com todas as coordenadas percentuais e configurações definidas
  const exportPayload = {
    cardDimensions: dimensions,
    artLayout: {
      mode: artConfig.mode,
      fit: artConfig.fit,
      opacity: artConfig.opacity,
      frameTopPercent: artConfig.frameTopPercent,
      frameHeightPercent: artConfig.frameHeightPercent,
      frameMarginPercent: artConfig.frameMarginPercent,
    },
    cardFrame: {
      hasImage: !!frameConfig.imageUrl,
      opacity: frameConfig.opacity,
      fit: frameConfig.fit,
      isVisible: frameConfig.isVisible,
    },
    symbols: symbolsConfig ? {
      manaSymbol: {
        hasImage: !!symbolsConfig.manaSymbol.imageUrl,
        xPercent: symbolsConfig.manaSymbol.xPercent,
        yPercent: symbolsConfig.manaSymbol.yPercent,
        widthPercent: symbolsConfig.manaSymbol.widthPercent,
        heightPercent: symbolsConfig.manaSymbol.heightPercent,
        rotationDeg: symbolsConfig.manaSymbol.rotationDeg,
        opacity: symbolsConfig.manaSymbol.opacity,
        zIndex: symbolsConfig.manaSymbol.zIndex,
        keepAspectRatio: symbolsConfig.manaSymbol.keepAspectRatio,
        isVisible: symbolsConfig.manaSymbol.isVisible,
      },
      attackSymbol: {
        hasImage: !!symbolsConfig.attackSymbol.imageUrl,
        xPercent: symbolsConfig.attackSymbol.xPercent,
        yPercent: symbolsConfig.attackSymbol.yPercent,
        widthPercent: symbolsConfig.attackSymbol.widthPercent,
        heightPercent: symbolsConfig.attackSymbol.heightPercent,
        rotationDeg: symbolsConfig.attackSymbol.rotationDeg,
        opacity: symbolsConfig.attackSymbol.opacity,
        zIndex: symbolsConfig.attackSymbol.zIndex,
        keepAspectRatio: symbolsConfig.attackSymbol.keepAspectRatio,
        isVisible: symbolsConfig.attackSymbol.isVisible,
      },
    } : undefined,
    textBoxes: textBoxes.map((b) => ({
      id: b.id,
      name: b.name,
      content: b.content,
      xPercent: b.xPercent,
      yPercent: b.yPercent,
      widthPercent: b.widthPercent,
      heightPercent: b.heightPercent,
      fontSizePx: b.fontSizePx,
      fontWeight: b.fontWeight,
      fontFamily: b.fontFamily,
      textAlign: b.textAlign,
      letterSpacingPx: b.letterSpacingPx ?? 0,
      wordSpacingPx: b.wordSpacingPx ?? 0,
      lineHeight: b.lineHeight ?? 1.25,
      paragraphSpacingPx: b.paragraphSpacingPx ?? 4,
      textColor: b.textColor,
      bgColor: b.bgColor,
      borderColor: b.borderColor,
      borderWidthPx: b.borderWidthPx,
      borderRadiusPx: b.borderRadiusPx,
      paddingPx: b.paddingPx,
      paddingXPx: b.paddingXPx ?? b.paddingPx,
      paddingYPx: b.paddingYPx ?? b.paddingPx,
      isMultiline: b.isMultiline,
      paragraphAlignments: b.paragraphAlignments ?? [],
      autoFitText: b.autoFitText ?? true,
      minFontSizePx: b.minFontSizePx ?? 8,
      textStrokeEnabled: b.textStrokeEnabled ?? false,
      textStrokeWidthPx:
        b.textStrokeWidthPx ??
        ((b.role === 'title' || b.role === 'type' || b.id === 'box-title' || b.id === 'box-type') ? 0.8 : 1.0),
    })),
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `card-layout-${dimensions.widthMm}x${dimensions.heightMm}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJson);
      if (!parsed.textBoxes || !Array.isArray(parsed.textBoxes)) {
        throw new Error('O JSON precisa conter um array "textBoxes".');
      }
      onImportConfig(parsed);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setImportError(err.message);
      } else {
        setImportError('JSON inválido.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-2xs flex items-center justify-center p-4 font-ui">
      <div className="bg-[#302D27] rounded-lg shadow-2xl max-w-2xl w-full border border-[#65543C] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#453B2D] bg-[#24221E]">
          <div>
            <h2 className="text-base font-bold text-[#E8DECA] font-arcane tracking-wide">
              Exportar / Importar Configuração de Layout
            </h2>
            <p className="text-xs text-[#B5A995]">
              Coordenadas exatas das caixas de texto, símbolos e moldura.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#B5A995] hover:text-[#E8DECA] p-1.5 rounded hover:bg-[#34352D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Seção 1: Copiar JSON das Coordenadas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#E8DECA]">
                Coordenadas, Espaçamentos e Estilos (JSON)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[#24221E] hover:bg-[#34352D] text-[#E8DECA] rounded transition-colors border border-[#453B2D] hover:border-[#65543C] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#C5A675]" /> : <Copy className="w-3.5 h-3.5 text-[#C5A675]" />}
                  {copied ? 'Copiado!' : 'Copiar JSON'}
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[#24221E] hover:bg-[#34352D] text-[#E8DECA] rounded transition-colors border border-[#453B2D] hover:border-[#65543C] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#C5A675]" />
                  Baixar .json
                </button>
              </div>
            </div>
            <pre className="bg-[#1A1916] text-[#E8DECA] border border-[#453B2D] text-xs p-3.5 rounded overflow-x-auto max-h-60 font-mono leading-relaxed shadow-inner">
              {jsonString}
            </pre>
          </div>

          {/* Seção 2: Importar JSON existente */}
          <div className="pt-4 border-t border-[#453B2D]">
            <label className="block text-xs font-semibold text-[#E8DECA] mb-1">
              Restaurar ou Carregar Layout Personalizado
            </label>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Cole aqui o JSON de configuração exportado anteriormente..."
              rows={4}
              className="w-full text-xs font-mono p-3 bg-[#1A1916] border border-[#453B2D] focus:border-[#C5A675] rounded text-[#E8DECA] placeholder-[#8F8270] focus:outline-none"
            />
            {importError && (
              <p className="text-xs text-[#A24F43] mt-1 font-semibold">{importError}</p>
            )}
            <div className="mt-3 flex justify-end">
              <button
                disabled={!importJson.trim()}
                onClick={handleApplyImport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#A24F43] hover:bg-[#B85B4E] disabled:opacity-50 text-[#FAF5E9] text-xs font-semibold rounded transition-colors border border-[#65543C] cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#E8DECA]" />
                Aplicar Layout Importado
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
