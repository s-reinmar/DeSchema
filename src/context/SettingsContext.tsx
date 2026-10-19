/**
 * @file SettingsContext.tsx
 * @description Context providing two-way application settings and prompt dispatcher for the Socratic chat.
 * @author @s-reinmar
 * @license MIT
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { AvailableAiModel, AppLanguage, SettingsState } from '../types/navigation.types.ts';

type PromptListener = (prompt: string) => void;

interface SettingsContextType {
  readonly settings: SettingsState;
  readonly setAiModel: (model: AvailableAiModel) => void;
  readonly setDeepThinking: (enabled: boolean) => void;
  readonly setLanguage: (language: AppLanguage) => void;
  readonly triggerPrompt: (promptText: string) => void;
  readonly registerPromptListener: (listener: PromptListener) => () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SettingsState = {
  aiModel: 'gemini-3.5-flash-lite',
  deepThinking: false,
  language: 'PL',
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const promptListenersRef = useRef<Set<PromptListener>>(new Set());

  const setAiModel = useCallback((model: AvailableAiModel) => {
    setSettings((prev) => ({
      ...prev,
      aiModel: model,
      deepThinking: model === 'gemini-4-argon' ? true : prev.deepThinking,
    }));
  }, []);

  const setDeepThinking = useCallback((enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      deepThinking: enabled,
    }));
  }, []);

  const setLanguage = useCallback((language: AppLanguage) => {
    setSettings((prev) => ({
      ...prev,
      language,
    }));
  }, []);

  const triggerPrompt = useCallback((promptText: string) => {
    promptListenersRef.current.forEach((listener) => {
      try {
        listener(promptText);
      } catch (err) {
        console.error('Error executing prompt listener:', err);
      }
    });
  }, []);

  const registerPromptListener = useCallback((listener: PromptListener) => {
    promptListenersRef.current.add(listener);
    return () => {
      promptListenersRef.current.delete(listener);
    };
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setAiModel,
        setDeepThinking,
        setLanguage,
        triggerPrompt,
        registerPromptListener,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
