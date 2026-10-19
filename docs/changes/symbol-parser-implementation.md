# Raport Architektoniczny: Dedykowany Moduł SymbolParser i Globalne Ujednolicenie Etykiet

**Projekt:** DeSchema Mentor  
**Autor:** @s-reinmar  
**Licencja:** MIT  
**Data:** 2026-10-18  

---

## 1. Cel i Zakres Zmian

W ramach zadania ujednolicono system prezentacji symboli fizycznych, indeksów oraz wzorów matematycznych w całej aplikacji DeSchema Mentor:
- Zaimplementowano dedykowany moduł `SymbolParser` w pliku `src/utils/symbol-parser.ts`.
- Zapewniono funkcję `formatSymbol(label: string): string`, która eliminuje artefakty LaTeX (np. `_`, `^`, `\`, `&`, `$`, `{}`) i konwertuje indeksy do czystego standardu znaków Unicode (np. $U_{in} \rightarrow Uᵢₙ$, $R_1 \rightarrow R₁$, $C_{filtr} \rightarrow Cfᵢₗₜᵣ$).
- Zaimplementowano bezpieczne metody renderowania zagnieżdżonych struktur semantycznych HTML (`<sub>`, `<sup>`, ułamki `\frac` z kreską ułamkową) oraz dynamiczne czyszczenie napisów w grafice wektorowej SVG (`sanitizeSvg`).
- Przeprowadzono refaktoryzację wszystkich komponentów widoku: `SvgSchematicViewer`, `SocraticStepSection`, `SocraticChatPanel`, `SymbolShowUpPopover` i `CheatsheetModal`.

---

## 2. Architektura i Zgodność z Zasadami SOLID

### Single Responsibility Principle (SRP)
Klasa statyczna `SymbolParser` oraz moduł `symbol-parser.ts` odpowiadają wyłącznie za parsowanie, transformację i oczyszczanie symboli oraz notacji matematyczno-fizycznej. Logika domenowa i obliczeniowa została całkowicie odseparowana od stanu aplikacji i komponentów widoku.

### Dependency Inversion Principle (DIP) / Interface-Driven Development
Zdefiniowano ścisły interfejs `ISymbolParser`:
```typescript
export interface ISymbolParser {
  formatSymbol(label: string): string;
  cleanLatex(raw: string): string;
  toUnicodeSubscript(text: string): string;
  toUnicodeSuperscript(text: string): string;
}
```
Komponenty UI importują stabilne funkcje (`formatSymbol`, `SymbolParser`) bez bezpośredniej zależności od wewnętrznych szczegółów implementacji parsera.

### Strict Typing & Anti-God Class
- Brak typu `any` (100% bezpieczne typowanie TypeScript).
- Moduł `symbol-parser.ts` zachowuje zwięzłą objętość (<250 linii kodu wykonawczego).
- Brak mieszania logiki z widokiem (brak operacji na drzewie DOM przeglądarki; czyste funkcje transformacji łańcuchów znaków i elementów React).

---

## 3. Zmodyfikowane i Utworzone Pliki

1. **`src/utils/symbol-parser.ts` (Nowy moduł):**
   - Interfejs `ISymbolParser`.
   - Klasa statyczna `SymbolParser` z metodami `formatSymbol`, `cleanLatexNoise`, `toUnicodeSubscript`, `toUnicodeSuperscript`, `sanitizeSvg`, `formatFormulaHtml`, `formatToHtml`, `formatRichScientificText`.
   - Bezpośrednio eksportowana funkcja `formatSymbol(label: string): string`.
2. **`src/utils/label-formatter.tsx`:**
   - Fasada re-eksportująca z `symbol-parser.ts` gwarantująca wsteczną kompatybilność.
3. **`src/components/SvgSchematicViewer.tsx`:**
   - Zastąpienie formatowania etykiet przez `formatSymbol` oraz `SymbolParser.sanitizeSvg` dla znaczników `<text>` wewnątrz SVG.
4. **`src/components/SocraticStepSection.tsx`:**
   - Użycie `SymbolParser.formatRichScientificText` dla tytułów kroków, pytań sokratejskich, podpowiedzi i refleksji.
5. **`src/components/SocraticChatPanel.tsx`:**
   - Integracja `SymbolParser.formatRichScientificText` z oknem czatu.
6. **`src/components/SymbolShowUpPopover.tsx`:**
   - Użycie `formatSymbol` dla identyfikatorów i nazw elementów oraz `SymbolParser.formatFormulaHtml` dla wzorów.
7. **`src/components/modals/CheatsheetModal.tsx`:**
   - Użycie `SymbolParser.formatToHtml` w zestawieniu praw fizycznych.

---

## 4. Weryfikacja

- `compile_applet`: Zakończona sukcesem (Build succeeded).
- `lint_applet`: Zakończona sukcesem (`tsc --noEmit` – 0 błędów typowania).
