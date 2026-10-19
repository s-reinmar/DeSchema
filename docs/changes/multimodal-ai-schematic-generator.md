# Raport Zmian: Multimodalny Generator Układów i Pytań Sokratejskich z Obrazów (Gemini AI)

## 1. Cel i Kontekst Biznesowy
Użytkownik zdefiniował potrzebę odejścia od ręcznego tworzenia plików JSON ze schematami (np. `public/resources/half-wave-rectifier.json`). Zamiast żmudnego manualnego kodowania wektorów SVG i pytań, wprowadzono funkcjonalność automatycznego generowania układów na podstawie zdjęć, skanów lub zrzutów ekranu schematów elektronicznych.

Zgodnie z ustaleniami:
- **Wprowadzanie obrazu**: Przesyłanie plików graficznych PNG/JPG/WebP metodą Drag & Drop, eksploratora plików oraz natywnego wklejania ze schowka (`Ctrl+V` / `Cmd+V`).
- **Analiza Multimodalna AI**: Model `@google/genai` (`gemini-3.8-flash`) analizuje topologię obwodu, generuje znormalizowany kod wektorowy SVG w stylistyce aplikacji (`viewBox="0 0 700 400"`, `stroke="currentColor"`), identyfikuje elementy składowe oraz formułuje dokładnie 4 pytania dydaktyczne w metodyce sokratejskiej.
- **Interaktywny Kreator (Wizard)**: Możliwość podglądu SVG i porównania z oryginalnym obrazem, edycji metadanych, modyfikacji pytań sokratejskich i symboli przed zatwierdzeniem i persystencją w relacyjnej bazie Cloud SQL PostgreSQL.

---

## 2. Architektura i Przestrzeganie Zasad SOLID / Clean Architecture

### A. Zasada Pojedynczej Odpowiedzialności (Single Responsibility Principle - SRP)
- **`src/interfaces/circuit-analyzer.interface.ts`**: Czyste kontrakty DTO (`CircuitAnalysisRequest`, `CircuitAnalysisResult`) oraz interfejs serwisu `ICircuitAnalyzerService`.
- **`src/services/circuit-analyzer.service.ts`**: Serwis backendowy odpowiedzialny wyłącznie za komunikację z modelem Gemini, prompt engineering układów elektronicznych i walidację strukturalną JSON (`Type.OBJECT`).
- **`src/services/circuit-analyzer-client.service.ts`**: Klient HTTP odizolowany od komponentów React, odpowiedzialny za komunikację z endpointem serwerowym.
- **`src/components/modals/schematic-wizard/SchematicUploadStage.tsx`**: Komponent odpowiedzialny za przeciąganie plików, nasłuch schowka `paste` i podgląd zdjęcia referencyjnego.
- **`src/components/modals/schematic-wizard/SchematicEditorStage.tsx`**: Interaktywny edytor schematu z dynamicznym podglądem SVG, edycją kroków sokratejskich i listy komponentów.
- **`src/components/modals/SchematicAiWizardModal.tsx`**: Koordynator procesu, zarządzający przejściami stanów (upload $\to$ analiza $\to$ edycja $\to$ persystencja).

### B. Odwrócenie Zależności (Dependency Inversion Principle - DIP)
- Moduły wyższego poziomu zależą od interfejsu `ICircuitAnalyzerService`, a nie od konkretnej implementacji biblioteki `@google/genai` czy klienta `fetch`.
- Wstrzykiwanie klienta Gemini oraz bazy danych za pośrednictwem konstruktorów klas serwisowych.

### C. Rygorystyczne Typowanie (Strict Typing)
- Zero użycia typu `any`.
- Precyzyjne typowanie etapów sokratejskich (`1 | 2 | 3 | 4`), wektorów SVG, metadanych fizycznych symboli (rola fizyczna, wzory, wartości typowe).

---

## 3. Zaimplementowane Trasy API i Komponenty

1. **`POST /api/circuits/analyze-image`**:
   - Bezpieczna trasa serwerowa obsługująca ładunki do 20MB.
   - Wykorzystanie `@google/genai` z modelem `gemini-3.8-flash` oraz nagłówkiem `User-Agent: aistudio-build`.
   - Zwraca ściśle ustrukturyzowany dokument obwodu gotowy do prezentacji i zapisu w bazie danych.

2. **UI Triggers**:
   - Nowy przycisk **"Skanuj schemat (AI)"** z ikoną `Sparkles` w głównym pasku `TopNavbar` (dostępny w wersji desktopowej i menu mobilnym).
   - Przycisk **"Generuj z obrazu (AI)"** wewnątrz katalogu `CircuitsManagerModal`.

3. **Interaktywny Kreator (SchematicAiWizardModal)**:
   - Tryby podglądu: "Tylko Wektor SVG", "Porównaj Obok Siebie" z oryginalnym zdjęciem, "Oryginalny Obraz".
   - 4 edytowalne karty pytań sokratejskich (Tytuł, Pytanie, Wskazówka, Wyjaśnienie dydaktyczne, docelowe symbole).
   - Tabela wykrytych komponentów z rolami fizycznymi i wzorami.
   - Możliwość bezpośredniego podglądu i modyfikacji surowego kodu SVG.

---

## 4. Weryfikacja Jakościowa
- Kompilacja produkcyjna (`npm run build` / `vite build`) zakończona powodzeniem.
- Walidacja lintera (`tsc --noEmit`) zakończona bez ostrzeżeń i błędów typowania.
