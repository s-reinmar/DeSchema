# Raport: Ujednolicenie Wyświetlania Symboli i Eliminacja Artefaktów LaTeX

**Projekt:** DeSchema Mentor  
**Autor:** @s-reinmar  
**Licencja:** MIT  
**Data:** 2026-10-18  
**Wersja:** 1.3.0 (Scientific Typography & SVG Subscript Engine Edition)  

---

## 1. Zdiagnozowane Problemy i Zakres Interwencji

Wcześniej w niektórych modułach symbole były prezentowane z niesparsowanymi znacznikami LaTeX:
1. **Schemat wektorowy SVG:** Napisy w elementach `<text>` zawierały surowe podkreślniki i klamry, np. `U_{in} (AC)`, `C_{filtr}`, `R_b1`, `R_{b2}`, `D_1`, `Q_1 (NPN)`.
2. **Czat sokratejski (dialog z mentorem AI):** Wiadomości zawierały surowe znaczniki `&`, `$`, `\frac{...}{...}`, `\quad` lub niesformatowane indeksy dolne.
3. **Kroki dydaktyczne (Socratic Step Section):** Pola `promptQuestion`, `hint` oraz `reflectionAnswer` były wyświetlane jako czysty tekst bez parsowania oznaczeń komponentów ($D_1$, $U_{in}$, $V_A$, $V_K$, $C_{filtr}$, $R_L$).
4. **Karty "Show-Up" Popover:** Wzory z ułamkami LaTeX (`\frac`) wyświetlały się z dosłownym ciągiem `\frac{...}`.

---

## 2. Architektura Wprowadzonych Rozwiązań (Clean Architecture & SOLID)

Wprowadzono spójny, wielowarstwowy silnik typografii inżynierskiej (`src/utils/label-formatter.tsx`):

1. **`cleanLatexNoise(text: string): string`:**
   - Usuwa znaczniki wyrównania tabelarycznego LaTeX (`& =` → `=`, `&` → ` `).
   - Usuwa delimitery matematyczne Markdown/LaTeX (`$`, `$$`).
   - Oczyszcza komendy środowiskowe (`\begin{aligned}`, `\end{aligned}`, `\quad`, `\qquad`, `\text{...}`).

2. **`formatSchematicLabel(text: string): React.ReactNode`:**
   - Dedykowany do odznak i zwięzłych etykiet symboli (np. $U_{in}$, $R_{b1}$, $C_{filtr}$).
   - Przekształca indeksy dolne i górne na semantyczne tagi `<sub>` i `<sup>`.
   - Zastępuje kody LaTeX znakami Unicode ($\Delta$, $\pi$, $\beta$, $\cdot$, $\ge$, $\le$, $\approx$, $\parallel$, $\sqrt$).

3. **`formatFormulaHtml(rawFormula: string): React.ReactNode`:**
   - Obsługuje złożone wzory fizyczne z ułamkami `\frac{licznik}{mianownik}`, renderując dwupoziomowy układ ułamkowy z poziomą kreską ułamkową w czystym HTML/Tailwind CSS.

4. **`formatRichScientificText(rawText: string): React.ReactNode`:**
   - Obsługuje wieloliniową prozę (odpowiedzi czatu mentora, pytania sokratejskie, wskazówki i weryfikacje).
   - Tokenizuje zdania i automatycznie identyfikuje oraz formatuje wszystkie występujące symbole i wzory.

5. **`sanitizeSvgTextLabels(svgContent: string): string`:**
   - W czasie rzeczywistym parsuje elementy `<text>...</text>` wewnątrz SVG schematu.
   - Zamienia `_{indeks}` oraz `_indeks` na natywne węzły wektorowe `<tspan dy="3" font-size="0.74em">indeks</tspan><tspan dy="-3">`, eliminując surowe znaki `_` i `{}` ze schematu w każdym silniku przeglądarkowym.

6. **Inżynieria Promptu Mentora w `server.ts`:**
   - Wzbogacono instrukcję systemową o regułę bezwzględnego zakazu stosowania składni tabelarycznej LaTeX (`&`, `\begin{aligned}`, `$`, `$$`), wymuszając czystą notację inżynierską.

---

## 3. Zmodyfikowane Pliki

- `src/utils/label-formatter.tsx` – rozbudowa modułu formatowania i oczyszczania.
- `src/components/SvgSchematicViewer.tsx` – wpięcie `sanitizeSvgTextLabels` przy renderowaniu SVG.
- `src/components/SocraticChatPanel.tsx` – zastosowanie `formatRichScientificText` dla wiadomości czatu.
- `src/components/SocraticStepSection.tsx` – sformatowanie pytań, podpowiedzi i odpowiedzi weryfikacyjnych.
- `src/components/SymbolShowUpPopover.tsx` – zastosowanie `formatFormulaHtml` oraz `formatRichScientificText`.
- `src/components/modals/CheatsheetModal.tsx` – ujednolicenie oznaczeń i indeksów w ściągawce.
- `server.ts` – doprecyzowanie wytycznych formatowania dla modeli Gemini.

---

## 4. Wyniki Weryfikacji

- `compile_applet`: **Build succeeded** (0 błędów).
- `lint_applet` (`tsc --noEmit`): **0 błędów typowania**.
