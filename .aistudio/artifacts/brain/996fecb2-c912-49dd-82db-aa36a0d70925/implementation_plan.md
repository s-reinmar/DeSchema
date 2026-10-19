# Ujednolicenie Architektury Zasobów Obwodów (Single Source of Truth)

Ujednolicenie lokalizacji plików definicji obwodów elektronicznych w aplikacji DeSchema Mentor poprzez usunięcie nadmiarowego katalogu `/resources/` i ustanowienie `/public/resources/` jako jedynego, spójnego źródła prawdy (SSOT).

### User Review & Critical Decisions

> [!IMPORTANT]
> Zgodnie z wyborem użytkownika:
> - **Potwierdzona decyzja:** Ujednolicenie struktury zasobów do katalogu `/public/resources/` jako pojedynczego źródła prawdy (Single Source of Truth).
> - **Eliminacja długu technologicznego:** Usunięcie zduplikowanego katalogu `/resources/` z głównego drzewa projektu.
> - **Pobieranie i synchronizacja:** `CircuitRepository` pobiera wzorcowe schematy bezpośrednio przez protokół HTTP (`fetch('/resources/*.json')`), a w przypadku braku połączenia lub inicjalizacji wspiera się bezpiecznym stanem początkowym.

---

### 1. Overview & Core Concept

- **Problem:** Pliki `half-wave-rectifier.json`, `npn-common-emitter.json` oraz `zener-regulator.json` istniały równolegle w dwóch miejscach (`/resources/` i `/public/resources/`), co łamało zasadę DRY (*Don't Repeat Yourself*) i groziło rozsynchronizowaniem wzorów i opisów.
- **Rozwiązanie:** 
  1. Ustanowienie `/public/resources/` jako wyłącznego repozytorium plików JSON z obwodami.
  2. Usunięcie katalogu `/resources/` z projektu.
  3. Dostosowanie `CircuitRepository` oraz modułu `predefined-circuits.ts` do asynchronicznego ładowania przez `fetch('/resources/...')` przy zachowaniu płynnego pierwszego renderowania.
  4. Weryfikacja działania selektora, nawigacji `<` i `>`, kart Show-Up oraz czatbota sokratejskiego.

---

### 2. User Experience & Visual Design

- **Zachowanie UI:** Użytkownik nie odczuwa żadnych opóźnień ani przestojów. Wszystkie 3 obwody ładują się błyskawicznie z serwera deweloperskiego/produkcyjnego.
- **Nawigacja obwodami:** Przełączanie schematów (`<`, `>`, lista rozwijana) działa w 100% płynnie.
- **Dodawanie własnych obwodów:** Upload z dysku i zapis w `localStorage` funkcjonują bez zmian, harmonijnie współistniejąc z publicznymi zasobami.

---

### 3. Key Product Decisions & Trade-Offs

- **Decyzja:** Utrzymanie wyłącznie `/public/resources/`
  - *Dlaczego:* W ekosystemie Vite pliki umieszczone w `public/` są natywnie serwowane pod ścieżką bazową (`/resources/nazwa.json`) zarówno w trybie deweloperskim, jak i po zbudowaniu produkcyjnym (`npm run build`). Pozwala to na łatwą edycję plików JSON bez konieczności rekompilacji całego kodu TypeScript.
  - *Alternatywa odrzucona:* Trzymanie plików w `src/resources` i importowanie ich do kodu JS/TS zwiększałoby rozmiar głównego bundla aplikacji o grafiki wektorowe SVG i rozbudowane opisy.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   PUBLIC STATIC ASSETS                 │
│              /public/resources/*.json                  │
│       (Jedno Źródło Prawdy - Single Source of Truth)   │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP GET /resources/*.json
                           ▼
┌────────────────────────────────────────────────────────┐
│                   CircuitRepository                    │
│      - fetchPredefinedCircuits('/resources/...')       │
│      - localStorage custom circuits cache              │
│      - CircuitValidator schema verification            │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   SvgSchematicViewer    │         │   SocraticChatPanel     │
│   (Prawy panel schemat) │         │   (Lewy panel mentor)   │
└─────────────────────────┘         └─────────────────────────┘
```

#### Kroki wdrożenia po zatwierdzeniu:
1. Aktualizacja `src/data/predefined-circuits.ts` oraz `src/services/circuit-repository.ts` – usunięcie bezpośrednich statycznych importów z `../../resources/*.json` i zastąpienie ich czystym ładowaniem z `/public/resources/`.
2. Usunięcie katalogu `/resources/`.
3. Weryfikacja kompilacji TypeScript (`compile_applet` oraz `lint_applet`).
4. Aktualizacja dokumentacji w `docs/changes/deschema-mentor-implementation.md`.
