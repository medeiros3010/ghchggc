import React from 'react';
import { TextBoxConfig } from '../../types/card';
import { getFontCssProperties } from '../../utils/fontHelper';
import { calculateAutoFitFontSize } from '../../utils/textFit';
import { Move } from 'lucide-react';

interface SiteCompositeTitleProps {
  titleBox: TextBoxConfig;
  typeBox?: TextBoxConfig;
  isEditMode: boolean;
  isSelected: boolean;
  baseWidth: number;
  baseHeight: number;
  onSelect: () => void;
  onStartMove: (e: React.PointerEvent) => void;
  onStartResize: (e: React.PointerEvent) => void;
}

/**
 * SiteCompositeTitle
 * 
 * Componente exclusivo para cartas do tipo Site.
 * Renderiza o Nome da Carta e Tipo/Subtipo em uma única linha contínua
 * compartilhando o mesmo container e alinhamento visual, com tipografia
 * 100% independente para cada segmento e separador automático " - ".
 */
export const SiteCompositeTitle: React.FC<SiteCompositeTitleProps> = ({
  titleBox,
  typeBox,
  isEditMode,
  isSelected,
  baseWidth,
  baseHeight,
  onSelect,
  onStartMove,
  onStartResize,
}) => {
  const rawTitle = titleBox.content || '';
  const rawType = typeBox?.content || '';

  const hasTitle = rawTitle.trim().length > 0;
  const hasType = rawType.trim().length > 0;
  const hasSeparator = hasTitle && hasType;

  // Tipografia do Nome
  const titleFont = getFontCssProperties(titleBox.fontFamily);
  const titleFit = calculateAutoFitFontSize(titleBox, baseWidth, baseHeight);
  const titleFontSize = titleFit.effectiveFontSizePx;
  const titleColor = titleBox.textColor || '#ffffff';
  const titleWeight = titleBox.fontWeight || 'bold';
  const titleStyle = titleFont.fontStyle || 'normal';
  const titleLetterSpacing = `${titleBox.letterSpacingPx || 0}px`;

  const hasTitleStroke = Boolean(titleBox.textStrokeEnabled && (titleBox.textStrokeWidthPx ?? 0) > 0);
  const titleStrokeStyle: React.CSSProperties = hasTitleStroke
    ? {
        WebkitTextStroke: `${titleBox.textStrokeWidthPx}px ${titleBox.textStrokeColor || '#000000'}`,
        paintOrder: 'stroke fill',
      }
    : {};

  // Tipografia do Tipo / Subtipo
  const typeFont = typeBox ? getFontCssProperties(typeBox.fontFamily) : titleFont;
  // Se o tipo tem fontSizePx específico, respeita, senão calcula proporcionalmente
  const typeFontSize = typeBox?.fontSizePx || Math.max(8, Math.round(titleFontSize * 0.75));
  const typeColor = typeBox?.textColor || titleColor;
  const typeWeight = typeBox?.fontWeight || 'normal';
  const typeStyle = typeFont.fontStyle || 'normal';
  const typeLetterSpacing = `${typeBox?.letterSpacingPx || 0}px`;

  const hasTypeStroke = Boolean(typeBox?.textStrokeEnabled && (typeBox.textStrokeWidthPx ?? 0) > 0);
  const typeStrokeStyle: React.CSSProperties = hasTypeStroke
    ? {
        WebkitTextStroke: `${typeBox!.textStrokeWidthPx}px ${typeBox!.textStrokeColor || '#000000'}`,
        paintOrder: 'stroke fill',
      }
    : titleStrokeStyle;

  // Alinhamento horizontal da linha composta (left, center, right)
  const alignment = titleBox.textAlign || 'center';

  const padX = titleBox.paddingXPx !== undefined ? titleBox.paddingXPx : (titleBox.paddingPx ?? 0);
  const padY = titleBox.paddingYPx !== undefined ? titleBox.paddingYPx : (titleBox.paddingPx ?? 0);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        position: 'absolute',
        left: `${titleBox.xPercent}%`,
        top: `${titleBox.yPercent}%`,
        width: `${titleBox.widthPercent}%`,
        minHeight: titleBox.heightPercent ? `${titleBox.heightPercent}%` : undefined,
        backgroundColor: titleBox.bgColor || 'transparent',
        borderRadius: `${titleBox.borderRadiusPx || 0}px`,
        border: titleBox.borderWidthPx > 0 ? `${titleBox.borderWidthPx}px solid ${titleBox.borderColor}` : 'none',
        padding: `${padY}px ${padX}px`,
        textAlign: alignment,
        zIndex: 35,
      }}
      className={`group transition-shadow select-none ${
        isSelected && isEditMode
          ? 'ring-2 ring-[#C5A675] shadow-lg'
          : isEditMode
          ? 'hover:ring-1 hover:ring-[#C5A675]/60 cursor-grab active:cursor-grabbing'
          : ''
      }`}
      title={`Título Composto: ${rawTitle}${hasSeparator ? ' - ' : ''}${rawType}`}
    >
      {/* Handle de Arraste da Linha Completa no Modo Edição */}
      {isEditMode && (
        <div
          onPointerDown={onStartMove}
          className={`absolute -top-5 left-0 right-0 h-5 px-1.5 flex items-center justify-between text-[9px] font-mono rounded-t transition-opacity ${
            isSelected
              ? 'bg-[#C5A675] text-[#1C1A17] font-bold opacity-100'
              : 'bg-[#302D27] text-[#E8DECA] opacity-0 group-hover:opacity-90'
          } cursor-move`}
        >
          <span className="font-sans font-semibold truncate">
            Título Composto (Site)
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8px] opacity-80">
              {titleBox.xPercent}% · {titleBox.yPercent}%
            </span>
            <Move className="w-2.5 h-2.5" />
          </div>
        </div>
      )}

      {/* Linha Única Contínua com os 3 segmentos inline */}
      <div
        style={{
          width: '100%',
          textAlign: alignment,
          lineHeight: titleBox.lineHeight || 1.25,
        }}
        className="w-full truncate leading-[inherit]"
      >
        {/* 1. Nome da Carta */}
        {hasTitle && (
          <span
            className="site-title-name"
            style={{
              fontFamily: titleFont.fontFamily,
              fontStyle: titleStyle,
              fontWeight: titleWeight,
              fontSize: `${titleFontSize}px`,
              color: titleColor,
              letterSpacing: titleLetterSpacing,
              ...titleStrokeStyle,
            }}
          >
            {rawTitle}
          </span>
        )}

        {/* 2. Separador Automático " - " */}
        {hasSeparator && (
          <span
            className="site-title-separator"
            style={{
              fontFamily: typeFont.fontFamily,
              fontStyle: typeStyle,
              fontWeight: typeWeight,
              fontSize: `${typeFontSize}px`,
              color: typeColor,
              whiteSpace: 'pre',
              ...typeStrokeStyle,
            }}
          >
            {' - '}
          </span>
        )}

        {/* 3. Tipo e Subtipo */}
        {hasType && (
          <span
            className="site-title-type"
            style={{
              fontFamily: typeFont.fontFamily,
              fontStyle: typeStyle,
              fontWeight: typeWeight,
              fontSize: `${typeFontSize}px`,
              color: typeColor,
              letterSpacing: typeLetterSpacing,
              ...typeStrokeStyle,
            }}
          >
            {rawType}
          </span>
        )}

        {!hasTitle && !hasType && (
          <span className="text-[#8F8270] italic text-xs">
            {isEditMode ? 'Nome da Carta - Tipo' : '\u00A0'}
          </span>
        )}
      </div>

      {/* Puxador de Redimensionamento */}
      {isEditMode && isSelected && (
        <div
          onPointerDown={onStartResize}
          title="Arraste para redimensionar a largura do título composto"
          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#C5A675] border border-white rounded-sm cursor-nwse-resize shadow flex items-center justify-center z-30"
        >
          <div className="w-1.5 h-1.5 border-r border-b border-[#1C1A17]" />
        </div>
      )}
    </div>
  );
};
