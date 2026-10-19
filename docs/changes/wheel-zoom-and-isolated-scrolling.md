# Raport: Izolacja Kółka Myszy (Zoom Schematu vs. Niezależne Przewijanie Paneli)

**Projekt:** DeSchema Mentor  
**Autor:** @s-reinmar  
**Licencja:** MIT  
**Data:** 2026-10-19  

---

## 1. Problem i Cel Zmiany

Dotychczas ruch kółkiem myszy nad schematem powodował niechciane przewijanie całej strony (window scroll), zamiast izolowanego skalowania grafiki SVG. Dodatkowo przewijanie zawartości po lewej stronie wpływało na przesunięcie całego widoku.

Celem zmiany było:
1. Skalowanie schematu za pomocą kółka myszy wyłącznie w obrębie kontenera SVG bez poruszania stroną ani lewymi panelami.
2. Niezależne przewijanie lewego panelu pedagogicznego (kroki, pytania, czat), podczas gdy prawy panel ze schematem pozostaje stabilnie zakotwiczony.

---

## 2. Architektura i Rozwiązanie Techniczne (SOLID)

1. **Rejestracja zdarzenia niepasywnego (`passive: false`) w `useSchematicPanZoom` (SRP):**
   - Standardowe zdarzenie React `onWheel` jest w nowoczesnych przeglądarkach rejestrowane jako pasywne, przez co `e.preventDefault()` jest ignorowane przez silnik przeglądarki.
   - W hooku `useSchematicPanZoom` podpięto bezpośredni nasłuchiwacz `element.addEventListener('wheel', onNativeWheel, { passive: false })` do referencji `containerRef`. Wywołanie `e.preventDefault()` i `e.stopPropagation()` w tym zdarzeniu bezwzględnie blokuje przewijanie strony i izoluje zoom do schematu.
2. **Niezależna kolumna przewijania w `src/App.tsx` (Separation of Concerns):**
   - Na ekranach stacjonarnych (`xl:`) lewa sekcja otrzymała dedykowany zakres wysokości `xl:max-h-[calc(100vh-8.5rem)] xl:overflow-y-auto overscroll-contain`.
   - Przewijanie kółkiem myszy po lewej stronie przewija wyłącznie lewy panel, a prawy panel schematu pozostaje zakotwiczony (`xl:sticky xl:top-20 overscroll-contain`).
3. **Właściwości CSS `overscroll-contain` i `touch-none`:**
   - Zapobiegają przenoszeniu nadmiarowego pędu przewijania (scroll chaining) na nadrzędne elementy DOM.

---

## 3. Weryfikacja Jakościowa

- `npm run lint` (`tsc --noEmit`): Zakończone sukcesem (0 błędów).
- `compile_applet` (`npm run build`): Kompilacja produkcyjna bez błędów i ostrzeżeń.
- Zrestartowano dev server (`restart_dev_server`).
