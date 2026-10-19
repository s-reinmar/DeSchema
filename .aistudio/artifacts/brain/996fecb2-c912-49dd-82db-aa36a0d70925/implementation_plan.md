# Plan Implementacji: Moduł Sesja, Panel Zarządzania Układami oraz Usunięcie Nadmiarowego Wgrywania JSON

Zgodnie z wytycznymi użytkownika przebudowujemy strukturę górnego menu (`TopNavbar`), wprowadzamy moduł zarządzania sesją (pełny stan nauki) oraz modalny katalog układów z zarezerwowanym miejscem pod przyszłą rozbudowę.

---

## 1. Kolejność i Struktura Nowego Menu Górnego (`TopNavbar`)
Pasek nawigacji otrzyma następujący, uporządkowany układ:
1. **Logo & Nazwa** (`DeSchema Mentor`)
2. **Sesja** (Nowy Dropdown przed „Układy” i „Ustawienia”):
   - **Zapisz postęp (Eksportuj do JSON):** pobranie pełnego stanu (`obwód`, `krok`, `historia czatu`, `znaczniki schematu`, `timestamp`).
   - **Wczytaj sesję (Importuj z JSON):** bezpieczny odczyt pliku `.json` i odtworzenie stanu sesji.
   - **Historia sesji / Wznów poprzednią:** lista poprzednich sesji zapisanych lokalnie w `localStorage` z możliwością natychmiastowego wznowienia.
3. **Układy** (Nowy Przycisk otwierający Okno Modalne – za „Sesją”, przed „Ustawieniami”):
   - Wizualny katalog dostępnych obwodów wzorcowych z podglądem tytułów, opisów i liczby kroków.
   - Możliwość natychmiastowego przełączenia aktywnego obwodu.
   - Eleganckie, zarezerwowane puste miejsce (placeholder) pod przyszłe dodawanie układów (bez aktywnej implementacji wgrywania JSON).
4. **Ustawienia** (Istniejący Dropdown: Silnik AI, Deep Thinking, Język, Sterowanie).
5. **Pomoc** (Wysuwany Drawer: Skróty, instrukcja, Baza podpowiedzi).
6. **O programie** (Modal: Informacje o aplikacji, autor, licencja MIT).
7. **Przełącznik motywu** (Jasny/Ciemny).

---

## 2. Usunięcie Starego Wgrywania JSON (Kompaktowy i Czysty UI)
1. **Z `TopNavbar.tsx`:** Usunięcie przycisku `JsonUploadButton` oraz starego `UploadModal`.
2. **Z `SchematicControlsBar.tsx` (Pasek schematu):** Usunięcie przycisku `FolderOpen` („Wgraj układ”) oraz callbacku `onOpenUploadModal`.
3. **Z `SvgSchematicViewer.tsx`:** Usunięcie referencji do `onOpenUploadModal`.
4. **Z `App.tsx`:** Usunięcie `UploadModal` i stanu `isUploadModalOpen`.

---

## 3. Nowe Moduły i Interfejsy (SOLID)
1. **`src/types/session.types.ts`:**
   - `SessionData`: `version`, `circuitId`, `currentStepNumber`, `chatMessages`, `annotations`, `savedAt`, `title`.
   - `SessionHistoryEntry`: metadane historii sesji.
2. **`src/services/session.service.ts`:**
   - Czysty serwis domenowy (bez zależności od React): serializacja do JSON, pobieranie przez przeglądarkę (`Blob`/`URL.createObjectURL`), walidacja importu, persystencja historii w `localStorage`.
3. **`src/components/navigation/SessionDropdown.tsx`:**
   - Dropdown w menu górnym obsługujący eksport, import i listę historii.
4. **`src/components/modals/CircuitsManagerModal.tsx`:**
   - Dedykowane okno modalne do przeglądania i aktywacji układów z zarezerwowanym pustym miejscem pod przyszłe wgrywanie.

---

## 4. Weryfikacja Jakościowa
1. Testy statyczne TypeScript (`npm run lint` / `tsc --noEmit`).
2. Kompilacja produkcyjna (`compile_applet`).
3. Wygenerowanie raportu architektonicznego w `docs/changes/session-management-and-circuits-catalog.md`.
