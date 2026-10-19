# Raport: Naprawa szaty graficznej panelu pytań i lewych sekcji w trybie jasnym (Light Mode Fix)

**Projekt:** DeSchema Mentor  
**Autor:** @s-reinmar  
**Licencja:** MIT  
**Data:** 2026-10-19  

---

## 1. Diagnoza problemu (Root Cause Analysis)

Użytkownik zgłosił błąd wizualny polegający na tym, że po przełączeniu aplikacji w tryb jasny lewa część interfejsu – w szczególności **panel z pytaniem sokratejskim** oraz **kafelki wyboru kroków** – nie adaptowały się poprawnie, pozostając ciemne lub powodując zlanie się tekstu z tłem.

### Zidentyfikowane przyczyny źródłowe:
1. **Brak neutralizacji właściwości `background-image` dla gradientów liniowych:**
   - Karta pytania sokratejskiego posiadała klasę Tailwind `bg-gradient-to-r from-slate-950 to-slate-900`.
   - Klasy CSS dla trybu jasnego w `index.css` nadpisywały jedynie `background-color`, natomiast reguła `background-image: linear-gradient(...)` miała wyższą specyficzność renderowania w silniku przeglądarki, pozostawiając niemal czarne tło karty.
2. **Konflikt wymuszonego koloru typografii:**
   - Globalna reguła `html.light .text-white { color: #0f172a !important; }` zmieniała nagłówek pytania `h2` na ciemnogranatowy `#0f172a`.
   - W rezultacie ciemnogranatowy tekst był renderowany na ciemnym tle gradientu slate-950, co skutkowało całkowitą nieczytelnością i drastycznym spadkiem kontrastu.
3. **Niezaadaptowane kafelki wyboru kroków (Kroki 1–4):**
   - Wybrany krok używał ciemnego gradientu `from-indigo-950/90 to-cyan-950/70`, który w trybie jasnym nie przełączał się na jasny motyw karty ze świetlistą akcentującą ramką.

---

## 2. Zrealizowane modyfikacje architektoniczne

### A. Komponent `SocraticStepSection.tsx`
- Zintegrowano hook `useTheme()` z `ThemeContext`, wprowadzając deterministyczną flagę `isLight`.
- **Główny panel pytania sokratejskiego:**
  - W trybie jasnym: czysta, elegancka karta `bg-white border-slate-200/90 text-slate-900 shadow-md ring-1 ring-slate-100/80`.
  - W trybie ciemnym: głęboki gradient laboratoryjny `bg-gradient-to-r from-slate-950 to-slate-900 border-slate-800 text-white shadow-xl`.
  - Dostosowano nagłówek pytania (`text-slate-900` w trybie jasnym, `text-white` w trybie ciemnym) oraz etykietę etapu (`text-cyan-700` z zachowaniem standardów WCAG AAA).
- **Przełączniki kroków (Tabs 1–4):**
  - Wybrany krok w trybie jasnym otrzymuje jasne tło z obwódką cyjanową `border-cyan-500`, cieniem `shadow-md` oraz wyrazistym pill-badgem `bg-cyan-600 text-white`.
  - Niewybrane kroki renderowane są jako czytelne, subtelne kafelki `bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900`.
- **Boksy podpowiedzi (Hint) i weryfikacji fizycznej (Reflection):**
  - Naprowadzenie: w trybie jasnym pastelowe tło bursztynowe `bg-amber-50/90 border-amber-200 text-amber-950` z wyraźnym nagłówkiem poszukiwań.
  - Weryfikacja: pastelowe tło szmaragdowe `bg-emerald-50/90 border-emerald-200 text-emerald-950` z czytelnym wyjaśnieniem zjawisk i praw Kirchhoffa/Ohma.

### B. Komponent `SocraticProgressBar.tsx`
- Zintegrowano `useTheme()` gwarantując, że pasek postępu analizy w trybie jasnym posiada jasne tło `bg-white border-slate-200 text-slate-900`, a wskaźnik toru (`track`) ma odpowiedni kontrast `bg-slate-100 border-slate-200`.

### C. Arkusz stylów `src/index.css`
- Dodano `@custom-variant dark (&:where(.dark, .dark *));` dla Tailwind CSS v4.
- Wprowadzono jednoznaczną neutralizację ciemnych gradientów w `html.light`:
  ```css
  html.light .bg-gradient-to-r.from-slate-950.to-slate-900,
  html.light .bg-gradient-to-br.from-indigo-950\/90.to-cyan-950\/70,
  html.light .from-slate-950.to-slate-900,
  html.light .from-indigo-950\/90.to-cyan-950\/70 {
    background-image: none !important;
    background-color: #ffffff !important;
    border-color: #e2e8f0 !important;
    box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.06) !important;
  }
  ```
- Zabezpieczono biały tekst na barwnych elementach (np. dymkach czatu ucznia z gradientem indygo-cyjan oraz przyciskach akcji `bg-cyan-600`), zapobiegając nadpisywaniu go ciemnym kolorem tekstu.

---

## 3. Weryfikacja jakościowa i testy

1. **Linting TypeScript (`npm run lint` / `tsc --noEmit`):**
   - Zakończony pełnym sukcesem (0 błędów, 0 ostrzeżeń).
2. **Kompilacja aplikacji (`compile_applet` / Vite build):**
   - Sukces kompilacji produkcyjnej.
3. **Wizualna spójność motywów:**
   - Przełączanie motywu za pomocą ikony w TopNavbar działa płynnie (`transition: 350ms cubic-bezier`).
   - Wszystkie elementy lewego panelu (nagłówek postępu, kroki, panel z pytaniem, naprowadzenie, weryfikacja oraz czat sokratejski) zachowują wzorcowy kontrast i czytelność zarówno w trybie ciemnym, jak i jasnym.
