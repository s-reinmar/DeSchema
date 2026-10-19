# Plan Implementacji: Refaktoryzacja i Uporządkowanie Paska Nawigacji (TopMenu)

Kompleksowa przebudowa komponentu nawigacyjnego `TopNavbar` w systemie **DeSchema Mentor** w oparciu o zasady Clean Architecture, SOLID oraz wytyczne użytkownika zebrane w fazie projektowej.

---

## 1. Architektura i Podział Odpowiedzialności (SOLID)

### A. Komponenty i Moduły
1. **`src/types/navigation.types.ts`**:
   - Definicje interfejsów stanu: `SettingsState` (model, deepThinking, language, controlsConfig).
   - Definicje struktur pomocy: `HelpPromptItem`, `ChatShortcutItem`.
   - Typy zdarzeń nawigacji i wgrywania JSON.
2. **`src/components/navigation/SettingsDropdown.tsx`**:
   - Dropdown z sekcjami:
     - **Silnik:** dwukierunkowy wybór modelu AI (`gemini-3.5-flash-lite`, `gemini-3.8-flash`, `gemini-4-argon`) + przełącznik `Deep Thinking Mode`.
     - **Język:** selektor `PL` / `EN` (elegancki interfejs wyboru).
     - **Sterowanie:** wygaszona sekcja `disabled` z informacją o przyszłej konfiguracji skrótów i czułości.
3. **`src/components/navigation/HelpDrawer.tsx`**:
   - Wysuwany z prawej strony boczny panel (Drawer) z tłem typu backdrop blur i animacją:
     - **Sterowanie czatem:** instrukcja metody sokratejskiej oraz lista skrótów klawiszowych (np. `Enter` – wyślij, `Shift+Enter` – nowa linia, `Esc` – zamknij panel).
     - **Baza podpowiedzi:** zgrupowane akcje sokratejskie przeniesione z paska czatu (`Wskazówka`, `Wyjaśnij prościej`, `Dlaczego tak zrobiliśmy`, `Ściągawka praw`, `Podsumujmy`).
     - Kliknięcie w podpowiedź natychmiast wyzwala prompt w aktywnym czacie (lub otwiera ściągawkę praw dla `Ściągawka praw`).
4. **`src/components/modals/AboutModal.tsx`**:
   - Dedykowane okno dialogowe: nazwa, wersja, autorzy (@s-reinmar), licencja MIT, stack technologiczny i cele dydaktyczne.
5. **`src/components/navigation/JsonUploadButton.tsx`**:
   - Kompaktowy przycisk wyzwalający ukryty `<input type="file" accept=".json" />`.
   - Asynchroniczne wczytanie (`file.text()`), bezpieczny `JSON.parse` w bloku `try...catch`, walidacja struktury `Circuit`, obsługa powiadomienia o błędzie oraz reset `input.value = ''`.
6. **`src/components/TopNavbar.tsx` (Koordynator / Facade)**:
   - Integracja wszystkich modułów w czystym pasku o długości poniżej 200 linii.

---

## 2. Zmiany w UI i Integracja z Czatorem Sokratejskim

1. **Przeniesienie podpowiedzi z `SocraticChatPanel.tsx`**:
   - Usunięcie powielonych przycisków `QUICK_ACTIONS` z dołu panelu czatu, aby zyskać czystszy, bardziej przestronny interfejs dialogowy.
   - Stan wybranego modelu i `thinkingEnabled` zostanie podniesiony do poziomu rodzica (`App.tsx`) lub przekazany poprzez callbacki, umożliwiając synchronizację z nowym menu **Ustawienia**.
2. **Globalny callback do wyzwalania promptu**:
   - `onTriggerPrompt: (promptText: string) => void` przekazywany do `TopNavbar` -> `HelpDrawer`.

---

## 3. Dostępność (ARIA) i UX
- Menu rozwijane Ustawień wyposażone w `aria-haspopup="true"`, `aria-expanded` oraz nasłuchiwanie kliknięcia poza obszar (Click Outside) i klawisza `Escape`.
- Drawer Pomocy z atrybutem `role="dialog"`, `aria-label="Panel pomocy i baza podpowiedzi"`.
- Zapewnienie pełnej responsywności mobilnej (Drawer i Dropdown dostosowane do ekranów dotykowych).

---

## 4. Weryfikacja i Raport
1. Kompilacja TypeScript (`npm run lint` / `tsc --noEmit`).
2. Budowanie produkcyjne (`compile_applet`).
3. Wygenerowanie raportu architektonicznego w `docs/changes/topmenu-refactor-settings-help-json.md`.
