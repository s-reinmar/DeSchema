# Raport Implementacji i Architektury: DeSchema Mentor

**Autor:** @s-reinmar  
**Licencja:** MIT  
**Data:** 2026-10-18  
**Wersja:** 1.2.0 Single Source of Truth & Resources Unification Edition  

---

## 1. Ujednolicenie Architektury Zasobów (SSOT)

Zlikwidowano redundancję i naruszenie zasady DRY (*Don't Repeat Yourself*):
- **Poprzedni stan:** Pliki JSON obwodów (`half-wave-rectifier.json`, `npn-common-emitter.json`, `zener-regulator.json`) znajdowały się w dwóch miejscach: `/resources/` oraz `/public/resources/`.
- **Wdrożona zmiana:**
  - Usunięto zduplikowany katalog `/resources/` z głównego drzewa projektu.
  - Ustanowiono katalog `/public/resources/` jako wyłączne, pojedyncze źródło prawdy (**Single Source of Truth - SSOT**).
  - W ekosystemie Vite pliki z katalogu `public/resources/` są serwowane bezpośrednio przez serwer pod ścieżką HTTP `/resources/*.json`.
  - `src/data/predefined-circuits.ts`: usunięto statyczne importy z bundlera, zastępując je konfiguracją deskryptorów `PREDEFINED_RESOURCE_FILES` oraz `PREDEFINED_CIRCUITS_META`.
  - `CircuitRepository`: pobiera definicje obwodów asynchronicznie przez `fetch('/resources/${fileName}')` z walidacją `CircuitValidator`, zapewniając natychmiastowe ładowanie i zero narzutu na wielkość paczki JS (`bundle size`).
  - `App.tsx`: dodano elegancki stan ładowania (`Loader2`) eliminujący jakiekolwiek błędy wyścigu podczas pierwszego renderowania.

---

## 2. Podsumowanie Wdrożonych Komponentów

1. **Wzorcowe obwody elektroniczne (`/public/resources/`):**
   - `half-wave-rectifier.json` – Prostownik jednopołówkowy ($U_{in}, D_1, C_{filtr}, R_L$).
   - `npn-common-emitter.json` – Wzmacniacz tranzystorowy OE ($U_{CC}, Q_1, R_{b1}, R_{b2}, R_c, R_e, C_e, C_{in}, C_{out}$).
   - `zener-regulator.json` – Stabilizator parametryczny ($U_{in}, R_s, D_z, R_L$).
2. **Prawy panel schematu (`SvgSchematicViewer`):**
   - Wektorowy render SVG ze skalowaniem zoom.
   - Pasek sterowania nad schematem (`<`, `>`, select obwodów, "Otwórz z lokalizacji / Wgraj układ").
   - Interaktywne popovery **"Show-Up"** (`SymbolShowUpPopover`): co oznacza symbol, rola fizyczna, ścisły wzór doboru wartości.
   - Formatowanie indeksów `formatSchematicLabel` ($R_{b1}, U_{in}, D_z, C_{filtr}$).
3. **Lewy panel czatbota sokratejskiego (`SocraticChatPanel`):**
   - Selektor modelu Gemini (`flash-lite`, `flash`, `argon`).
   - Przełącznik trybu myślenia (Thinking Mode).
   - Cztery szybkie akcje sokratejskie: *"Dlaczego tak zrobiliśmy?"*, *"Wskazówka"*, *"Wyjaśnij prościej"*, *"Podsumujmy"*.
   - Obsługa `Enter` (wyślij) oraz `Shift + Enter` (nowa linia).
   - Komunikat przypominający: *"Mentor pomoże Ci zrozumieć każdy krok"*.
4. **Backend `server.ts` z `@google/genai`:**
   - Endpoint `POST /api/chat`.
   - Inżynieria Promptu Mentora: bezwzględny zakaz podawania gotowców, nakaz zadawania pytań o prawa Ohma i Kirchhoffa.
   - Bezpieczna kaskada: automatyczny fallback na `flash-lite` przy błędzie lub przeciążeniu.
5. **Modale wiedzy:**
   - `CheatsheetModal`: Prawo Ohma, prawa Kirchhoffa (KCL, KVL), dioda krzemowa i Zenera, wzmocnienie tranzystora BJT.
   - `AboutModal`: Tytuł DeSchema, Podtytuł Mentor, Autor `@s-reinmar`, Licencja MIT.

---

## 3. Status Weryfikacji

- `compile_applet`: **Build succeeded** (0 błędów).
- `lint_applet` (`tsc --noEmit`): **0 błędów typowania**.
- Dev server: **Port 3000 (`tsx server.ts`) aktywny**.
