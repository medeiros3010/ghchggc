/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sorcery Arcane Atelier - Theme Tokens & Style Constants
 * =========================================================================
 * Identidade visual inspirada no site oficial de Sorcery: Contested Realm.
 * Estética escura, sóbria, minimalista e clássica de fantasia.
 * 
 * Paleta Sorcery Atelier:
 * - Fundo principal: #24221E (carvão quente)
 * - Superfícies e cards: #302D27 (marrom-escuro)
 * - Superfícies secundárias: #34352D (oliva escuro / carvão)
 * - Superfície inputs / containers internos: #272420
 * - Texto principal: #E8DECA (pergaminho claro)
 * - Texto secundário: #B5A995 (bege acinzentado / pedra morna)
 * - Texto esmaecido: #8F8270
 * - Destaques: #C5A675 (bronze envelhecido / ouro antigo)
 * - Bordas: #65543C (bronze escurecido)
 * - Bordas sutis: #453B2D
 * - Acentos ocasionais: #A24F43 (vermelho terroso)
 */

export const ARCANE_THEME = {
  colors: {
    bgMain: '#24221E',           // Fundo principal - carvão quente
    surface: '#302D27',          // Superfícies e cards - marrom-escuro
    surfaceSecondary: '#34352D', // Superfícies secundárias - oliva escuro
    surfaceInput: '#272420',     // Superfície para inputs e caixas internas
    card: '#302D27',
    inputBg: '#272420',
    inputBorder: '#65543C',      // Bordas - bronze escurecido
    borderLight: '#453B2D',      // Bordas sutis
    borderBronze: '#65543C',     // Bordas padrão
    borderBronzeDark: '#856F50', // Bordas em foco / hover
    inkPrimary: '#E8DECA',       // Texto principal - pergaminho claro
    inkSecondary: '#B5A995',     // Texto secundário - bege acinzentado
    inkMuted: '#8F8270',         // Texto esmaecido
    bronzeGold: '#C5A675',       // Destaques - bronze envelhecido
    bronzeDark: '#9C7A4E',
    burgundyPrimary: '#A24F43',  // Acento terroso ocasional
    burgundyHover: '#B85B4E',
    burgundyLight: '#3D2825',
    forestAccent: '#4D6B58',
    forestLight: '#2B3830',
    steelAccent: '#5A758A',
    steelLight: '#27333D',
  },
  typography: {
    titleFont: 'font-arcane font-bold tracking-wide',
    editorialFont: 'font-editorial',
    uiFont: 'font-ui text-xs font-medium',
  },
};
