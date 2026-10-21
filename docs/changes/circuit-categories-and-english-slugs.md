# Raport Zmian: Kategorie Schematów Elektrycznych oraz Angielski Slug (Krótka Nazwa)

**Data:** 21 października 2026  
**Autor:** @s-reinmar  
**Zgłoszenie / Zakres:**
1. Wprowadzenie 4 kanonicznych kategorii taksonomicznych dla schematów elektrycznych:
   - `Zasilacze`
   - `Wzmacniacze`
   - `Technika w.cz. i filtry`
   - `Układy cyfrowe`
2. Zastąpienie losowych/technicznych identyfikatorów (np. `ai-gen-1792400984372`) czytelnym, zwięzłym angielskim slugiem w niebieskim polu (np. `vhf-common-base-preamp`, `half-wave-rectifier`, `npn-common-emitter`, `zener-regulator`), z zachowaniem automatycznego generowania i możliwości ręcznej edycji.
3. Prezentacja w interfejsie: segmentowy pasek filtrów kategorii na górze listy oraz dyskretna etykieta tekstowa kategorii z separatorem typograficznym `·` przy każdym schemacie (zgodnie z zasadą *Zero-Pill Discipline*).

---

## 1. Zrealizowane Zmiany Architektoniczne (SOLID & DDD)

### A. Model Domenowy & Typy (`src/types/circuit.types.ts`)
- Zdefiniowano unię typów `CircuitCategory`:
  ```ts
  export type CircuitCategory =
    | 'Zasilacze'
    | 'Wzmacniacze'
    | 'Technika w.cz. i filtry'
    | 'Układy cyfrowe';
  ```
- Rozszerzono kontrakty `Circuit`, `CircuitSummary` oraz DTO `CircuitVectorItem` o opcjonalne pola:
  - `category?: CircuitCategory;`
  - `englishSlug?: string;`

### B. Serwis Domenowy: `CircuitSlugGenerator` (`src/services/circuit-slug-generator.service.ts`)
- **Odpowiedzialność (SRP):**
  - Czysty, bezstanowy kalkulator generujący semantyczne angielskie identyfikatory na podstawie polskich terminów inżynierskich (np. *wzmacniacz* $\to$ *amplifier*, *przedwzmacniacz* $\to$ *preamp*, *prostownik* $\to$ *rectifier*, *wspólna baza* $\to$ *common-base*, *w.cz.* $\to$ *rf*).
  - Automatyczna klasyfikacja układów do 4 kanonicznych kategorii w metodzie `detectCategory(title, description)`.
  - Sanitizacja do bezpiecznego formatu kebab-case (`[a-z0-9-]+`, max 35 znaków).
  - Inteligentne rozwiązywanie identyfikatora w widoku (`resolveDisplaySlug`): jeśli ID schematu jest technicznym ciągiem typu `ai-gen-...` lub `custom-...`, zostaje on dynamicznie zastąpiony zwięzłym angielskim slugiem, eliminując nieczytelne kody z interfejsu użytkownika.

### C. Warstwa Danych & Baza Cloud SQL (`src/db/circuits.ts`, `src/data/predefined-circuits.ts`, `public/resources/*.json`)
- Wzbogacono mapowanie relacyjne `mapToCircuitDomain` o automatyczne przypisywanie kategorii i angielskiego sluga.
- Zaktualizowano metadane schematów wzorcowych:
  - `half-wave-rectifier.json` $\to$ Kategoria: `Zasilacze`, Slug: `half-wave-rectifier`
  - `npn-common-emitter.json` $\to$ Kategoria: `Wzmacniacze`, Slug: `npn-common-emitter`
  - `zener-regulator.json` $\to$ Kategoria: `Zasilacze`, Slug: `zener-regulator`

### D. Warstwa Prezentacji (UI/UX)
1. **Eksplorator schematów SVG (`DatabaseTableBrowserTab.tsx`):**
   - Interaktywny, segmentowy pasek wyboru kategorii na górze widoku (`Wszystkie`, `Zasilacze`, `Wzmacniacze`, `Technika w.cz. i filtry`, `Układy cyfrowe`) z licznikami schematów.
   - Połączone filtrowanie na żywo z wyszukiwarką tekstową.
2. **Katalog Obwodów (`CircuitsManagerModal.tsx`):**
   - Dodano pasek filtrów kategorii oraz pole szybkiego filtrowania.
   - W każdym wierszu schematu wyświetlana jest czysta tekstowa etykieta kategorii oraz niebieski badge angielskiego sluga (`CircuitSlugGenerator.resolveDisplaySlug`).
3. **Wiersz Schematu (`CircuitAccordionItem.tsx` & `SvgSchematicViewer.tsx`):**
   - Zastąpienie technicznych identyfikatorów `ai-gen-...` zwięzłym angielskim slugiem w dedykowanym niebieskim obrysie (`font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/25`).
   - Czysty, typograficzny zapis kategorii z separatorem `·`.
4. **Moduły Wgrywania i Tworzenia Schematów (`TokenSafeSvgUploadModal.tsx`, `CreateCircuitModal.tsx`, `SchematicEditorStage.tsx`):**
   - Dodano listę wyboru kategorii (z automatyczną detekcją na podstawie wpisywanego tytułu).
   - Dodano pole edycji angielskiego sluga z podglądem w czasie rzeczywistym.

---

## 2. Weryfikacja Jakości i Zgodność ze Standardami
- Kompilator TypeScript (`tsc --noEmit`): **0 błędów**.
- Kompilacja produkcyjna (`npm run build`): **SUKCES**.
- Rygor typowania: **Brak użycia typu `any`**; pełne otypowanie uniami `CircuitCategory`.
