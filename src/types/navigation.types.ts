/**
 * @file navigation.types.ts
 * @description Strongly-typed contracts for TopMenu navigation, settings state, and help drawer actions.
 * @author @s-reinmar
 * @license MIT
 */

/**
 * Supported Gemini AI models for Socratic circuit tutoring.
 */
export type AvailableAiModel = 'gemini-3.5-flash-lite' | 'gemini-3.8-flash' | 'gemini-4-argon';

/**
 * Supported application interface language codes.
 */
export type AppLanguage = 'PL' | 'EN';

/**
 * Application global settings state.
 */
export interface SettingsState {
  readonly aiModel: AvailableAiModel;
  readonly deepThinking: boolean;
  readonly language: AppLanguage;
}

/**
 * Definition of a guided prompt item in the Help Drawer prompt database.
 */
export interface HelpPromptItem {
  readonly id: 'hint' | 'simpler' | 'why' | 'cheatsheet' | 'summary';
  readonly label: string;
  readonly description: string;
  readonly prompt?: string;
  readonly isSpecialAction?: boolean;
}

/**
 * Definition of a keyboard shortcut indicator for the chat control section.
 */
export interface ChatShortcutItem {
  readonly keyCombo: string;
  readonly description: string;
}

/**
 * Result structure emitted after JSON circuit parsing.
 */
export interface JsonUploadResult {
  readonly success: boolean;
  readonly circuitId?: string;
  readonly errorMessage?: string;
}
