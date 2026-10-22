/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EditorMode - Modos de Utilização do CardForge
 * =========================================================================
 * - Modo Usuário ('user'): Interface simplificada focada em criação ágil de cartas.
 * - Modo Administrador ('admin'): Interface técnica completa com controle de layout,
 *   coordenadas, fontes, espaçamentos e configurações padrão.
 */

export type EditorMode = 'user' | 'admin';

export interface EditorModeConfig {
  mode: EditorMode;
  label: string;
  shortLabel: string;
  description: string;
}

export const EDITOR_MODES: Record<EditorMode, EditorModeConfig> = {
  user: {
    mode: 'user',
    label: 'Modo Usuário',
    shortLabel: 'Usuário',
    description: 'Criação simplificada de cartas com campos diretos de conteúdo e atributos.',
  },
  admin: {
    mode: 'admin',
    label: 'Modo Administrador',
    shortLabel: 'Administrador',
    description: 'Edição técnica completa: coordenadas, fontes, molduras, cadeados e presets de layout.',
  },
};
