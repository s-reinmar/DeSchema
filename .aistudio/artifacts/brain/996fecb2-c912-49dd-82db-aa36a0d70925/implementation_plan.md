# Plan: Dedykowany Moduł SymbolParser i Globalne Ujednolicenie Etykiet

Wdrożenie dedykowanego modułu `SymbolParser` w pliku `src/utils/symbol-parser.ts`, realizującego jednolite formatowanie symboli, indeksów i wzorów fizycznych w oparciu o czyste znaki Unicode z bezpiecznym fallbackiem HTML, zastępującego dotychczasowy formater w całej aplikacji.

> [!IMPORTANT]
> **Decyzje architektoniczne uzgodnione z użytkownikiem:**
> - **Dedykowany moduł i klasa:** Statyczna klasa `SymbolParser` w `src/utils/symbol-parser.ts` zawierająca główną funkcję `formatSymbol(label: string): string` oraz metody wspomagające renderowanie prozy i SVG.
> - **Format wyjściowy:** Czyste znaki Unicode (np. indeksy dolne $U_{in} \rightarrow U_{\text{in}}$ przy użyciu znaków subskryptu `ᵢₙ`, `₀₁₂₃₄₅₆₇₈₉`) z bezpiecznym fallbackiem HTML (`<sub>` / `<sup>`) tam, gdzie znaki Unicode nie pokrywają całego zapisu.
> - **Strategia integracji:** Zastąpienie dotychczasowego `label-formatter.tsx` nowym, zunifikowanym modułem `SymbolParser` we wszystkich komponentach widoku i schematu.

---

## 1. Architektura Modułu SymbolParser

Zgodnie z zasadami SOLID (SRP, DIP) oraz czystego TypeScript:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SymbolParser (src/utils/symbol-parser.ts)            │
│  - formatSymbol(label: string): string                                 │
│    -> Główna funkcja: czyści LaTeX (&, _, ^, \, $, {}) i zamienia      │
│       indeksy na znaki Unicode (np. R_L -> Rʟ / Rₗ, U_in -> Uᵢₙ).      │
│  - formatToHtml(raw: string): React.ReactNode                          │
│    -> Formatuje prozę/wzory czatu i kroków na czysty HTML (<sub>, etc.) │
│  - sanitizeSvg(svgContent: string): string                             │
│    -> Przekształca etykiety <text> w SVG na zagnieżdżone <tspan>       │
│  - cleanLatex(raw: string): string                                     │
│    -> Eliminuje szum LaTeX (&, $, \quad, \text)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
  ┌────────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
  │ SvgSchematic    │      │ SocraticChat    │      │ SocraticStep    │
  │ Viewer          │      │ Panel           │      │ Section         │
  └─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Mapowanie znaków Unicode dla indeksów
- Cyfry indeksu dolnego: `₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉`
- Znaki i operatory: `₊ ₋ ₌ ₍ ₎`
- Litery indeksu dolnego: `ₐ ₑ ₕ ᵢ ⱼ ₖ ₗ ₘ ₙ ₒ ₚ ᵣ ₛ ₜ ᵤ ᵥ ₓ`
- Litery greckie i symbole fizyczne: `Δ`, `π`, `β`, `Ω`, `µ`, `≈`, `≥`, `≤`, `·`, `∥`, `√`
- Zastąpienie śmieci LaTeX: usunięcie znaków `&`, `\\`, `$`, `\quad`, zamiana `\cdot` na `·`.

---

## 2. Zakres Zmian w Komponentach

1. **`src/utils/symbol-parser.ts` (Nowy plik):**
   - Utworzenie w pełni otypowanej klasy statycznej `SymbolParser`.
   - Implementacja `formatSymbol(label: string): string` (czysty Unicode z fallbackiem).
   - Metody pomocnicze: `formatToHtml`, `sanitizeSvg`, `formatFormula`.
   - Zapewnienie kompatybilności wstecznej dla dotychczas importowanych funkcji (`formatSchematicLabel`, `formatRichScientificText`, `sanitizeSvgTextLabels`).

2. **`src/components/SvgSchematicViewer.tsx`:**
   - Podpięcie `SymbolParser.formatSymbol` oraz `SymbolParser.sanitizeSvg` do dynamicznego parsera napisów schematu.

3. **`src/components/SocraticStepSection.tsx`:**
   - Użycie `SymbolParser.formatToHtml` oraz `SymbolParser.formatSymbol` dla tytułów kroków, pytań, wskazówek i odpowiedzi refleksyjnych.

4. **`src/components/SocraticChatPanel.tsx`:**
   - Użycie `SymbolParser.formatToHtml` w dialogu czatu i szybkich podpowiedziach.

5. **`src/components/SymbolShowUpPopover.tsx` oraz `CheatsheetModal.tsx`:**
   - Spójne formatowanie etykiet komponentów, wzorów i opisów fizycznych przy użyciu `SymbolParser`.

6. **Dokumentacja w `docs/changes/`:**
   - Wygenerowanie raportu architektonicznego Markdown opisującego wdrożenie `SymbolParser`.

---

## 3. Plan Weryfikacji

- **Kompilacja i Linter:** `compile_applet` oraz `lint_applet` (`tsc --noEmit`).
- **Testy jednostkowe / przypadki brzegowe:** Sprawdzenie formatowania `U_{in}`, `R_{b1}`, `C_{filtr}`, `V_D`, `I_C`, `U_{CE,sat}`, `& = \frac{...}{...}`.
- **Weryfikacja interfejsu:** Potwierdzenie estetycznego wyglądu schematów, pytań sokratejskich i czatu bez widocznych śmieci LaTeX.
