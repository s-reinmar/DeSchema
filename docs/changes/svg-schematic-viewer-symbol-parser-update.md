# Raport: Integracja SymbolParser.formatSymbol() w SvgSchematicViewer

**Projekt:** DeSchema Mentor  
**Autor:** @s-reinmar  
**Licencja:** MIT  
**Data:** 2026-10-18  

---

## 1. Cel Zmiany

Celem aktualizacji było pełne i bezpośrednie wykorzystanie metody `SymbolParser.formatSymbol()` w komponencie `src/components/SvgSchematicViewer.tsx` oraz współpracującym `src/components/SymbolShowUpPopover.tsx`. Zapewnia to bezwzględną spójność renderowania etykiet komponentów, symboli w hotspotach schematu wektorowego, przyciskach szybkiego wyboru kroków oraz kartach inspekcji "Show-Up" bez jakichkolwiek artefaktów składni LaTeX (takich jak `&`, `_`, `^`, `{`, `}`).

---

## 2. Zakres Przeprowadzonych Modyfikacji

1. **`src/components/SvgSchematicViewer.tsx`**:
   - Bezpośredni import `SymbolParser` z `../utils/symbol-parser.ts`.
   - Zastąpienie bezpośrednich wywołań lokalnych funkcji na `SymbolParser.formatSymbol(s.label)` w sekcji przycisków symboli bieżącego kroku (`Symbole w kroku:`).
   - Renderowanie etykiet interaktywnych hotspotów na wektorze SVG za pomocą `SymbolParser.formatSymbol(sym.label)`.
   - Dynamiczne formatowanie tytułów schematów w selektorze `<select>` oraz w nagłówku podrzędnym (`circuit.title`).
   - Formatowanie symboli pomocniczych w dolnym pasku statusowym (`R_b1`, `U_{in}`, `D_z`).
   - Zachowanie dynamicznego oczyszczania elementów `<text>` w kodzie SVG za pomocą `SymbolParser.sanitizeSvg(circuit.svgContent)`.

2. **`src/components/SymbolShowUpPopover.tsx`**:
   - Bezpośrednie użycie `SymbolParser.formatSymbol(symbol.label)` w głównym badge'u symbolu.
   - Użycie `SymbolParser.formatSymbol(symbol.name)` w nagłówku karty inspekcyjnej.
   - Zabezpieczenie wartości typowej za pomocą `SymbolParser.formatSymbol(symbol.typicalValue)`.

---

## 3. Zgodność z Pryncypiami SOLID

- **SRP (Single Responsibility Principle):** Komponenty widoku (`SvgSchematicViewer`, `SymbolShowUpPopover`) odpowiadają wyłącznie za prezentację i interakcję użytkownika ze schematem; transformacja i normalizacja ciągów znaków jest całkowicie delegowana do dedykowanego modułu domenowego `SymbolParser`.
- **DIP (Dependency Inversion Principle):** Komponenty nie tworzą lokalnych reguł przetwarzania tekstu ani nie zależą od detali parsowania wyrażeń regularnych – korzystają ze standaryzowanego interfejsu `SymbolParser`.

---

## 4. Weryfikacja Jakościowa

- `npm run lint` (`tsc --noEmit`): Zakończone pomyślnie z kodem wyjścia 0.
- `compile_applet` (`npm run build`): Zbudowano bez ostrzeżeń i błędów.
