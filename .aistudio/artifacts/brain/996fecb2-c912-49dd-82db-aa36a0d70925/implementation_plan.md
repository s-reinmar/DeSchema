# Plan Implementacji: Kategorie Schematów Elektrycznych oraz Angielski Slug (Krótka Nazwa)

Zgłoszenie użytkownika dotyczy wprowadzenia 4 taksonomicznych kategorii schematów elektrycznych, paska filtrowania na górze widoku, etykiet kategorii przy każdym schemacie oraz automatycznego generowania i edycji zwięzłych angielskich identyfikatorów/nazw (slug) w niebieskim polu (zamiast technicznych kodów typu `ai-gen-1792400984372`).

---

## 1. Wybrane Założenia & Odpowiedzi Użytkownika

1. **Zestaw kategorii schematów:**
   - `Zasilacze` (prostowniki, regulatory, stabilizatory napięcia, filtry pojemnościowe)
   - `Wzmacniacze` (stopnie OE, OB, OC, wzmacniacze operacyjne, stopnie mocy)
   - `Technika w.cz. i filtry` (wzmacniacze VHF/UHF, filtry LC/RC, obwody rezonansowe, mieszacze)
   - `Układy cyfrowe` (bramki logiczne, przerzutniki, liczniki, generatory zegarowe)
   - Domyślny filtr w widokach: `Wszystkie`
2. **Krótka nazwa po angielsku (slug w niebieskim polu):**
   - Zastąpienie losowych/liczbowych ID (np. `ai-gen-1792400984372`, `custom-1729...`) czytelnym, zwięzłym angielskim slugiem (np. `vhf-common-base-preamp`, `zener-regulator`, `half-wave-rectifier`, `npn-common-emitter`).
   - Wdrożenie bezstanowego modułu `CircuitSlugGenerator` generującego automatycznie angielski slug na podstawie polskiego tytułu/opisu oraz umożliwiającego ręczną edycję w modalach zapisu (`TokenSafeSvgUploadModal`, `CreateCircuitModal`, `SchematicEditorStage`).
3. **Prezentacja w interfejsie:**
   - Dyskretny, segmentowy pasek filtrów kategorii na górze listy w Eksploratorze bazy danych (`DatabaseTableBrowserTab.tsx`) oraz w katalogu układów (`CircuitsManagerModal.tsx`).
   - Elegancka, tekstowa etykieta kategorii przy każdym schemacie (zgodnie z zasadą *Zero-Pill Discipline* z `frontend-design`: czysty, nieopakowany tekst z separatorem typograficznym `·`).

---

## 2. Architektura i SOLID / DDD

### A. Nowe i Zmodyfikowane Kontrakty (`src/types/circuit.types.ts`, `src/interfaces/database-manager.interface.ts`)
- `CircuitCategory`: unia typów `'Zasilacze' | 'Wzmacniacze' | 'Technika w.cz. i filtry' | 'Układy cyfrowe'`.
- Rozszerzenie interfejsu `Circuit`:
  - `category?: CircuitCategory;`
  - `englishSlug?: string;`
- Rozszerzenie interfejsu `CircuitVectorItem`:
  - `category?: CircuitCategory;`
  - `englishSlug?: string;`

### B. Serwis Domenowy: `CircuitSlugGenerator` (`src/services/circuit-slug-generator.service.ts`)
- Odpowiedzialność (SRP):
  - Automatyczne tłumaczenie i mapowanie kluczowych pojęć elektrotechnicznych na zwięzłe angielskie terminy (np. *wzmacniacz* -> *amplifier/preamp*, *prostownik* -> *rectifier*, *stabilizator* -> *regulator*, *wspólna baza* -> *common-base*, *filtr* -> *filter*).
  - Sanitizacja ciągu do bezpiecznego formatu kebab-case (`[a-z0-9-]+`, max 35 znaków).
  - Automatyczna detekcja sugerowanej kategorii na podstawie słów kluczowych w tytule/opisie schematu.

### C. Aktualizacja Wzorcowych Schematów (`public/resources/` i `src/db/seed.ts`)
- Przypisanie jednoznacznych kategorii oraz zweryfikowanie angielskich slugów:
  - `half-wave-rectifier`: kategoria `Zasilacze`
  - `npn-common-emitter`: kategoria `Wzmacniacze`
  - `zener-regulator`: kategoria `Zasilacze`
  - Wygenerowane lub customowe schematy: automatyczna klasyfikacja do odpowiedniej kategorii (np. układ ze screena: `Technika w.cz. i filtry`, slug: `vhf-common-base-preamp`).

### D. Komponenty Prezentacyjne i Filtrowanie
1. **`DatabaseTableBrowserTab.tsx` (Eksplorator schematów SVG):**
   - Dodanie interaktywnego paska segmentów kategorii: `Wszystkie`, `Zasilacze`, `Wzmacniacze`, `Technika w.cz. i filtry`, `Układy cyfrowe`.
   - Filtrowanie listy schematów na żywo w pamięci z zachowaniem aktywnego pola wyszukiwarki.
   - Wyświetlenie w nagłówku akordeonu czystej etykiety kategorii obok tytułu oraz angielskiego sluga w niebieskim badge'u.
2. **`CircuitAccordionItem.tsx`:**
   - Wyświetlanie `circuit.englishSlug || circuit.id` w niebieskim polu (zabezpieczenie przed wyświetlaniem długich technicznych identyfikatorów).
   - Dyskretny separator i nazwa kategorii przed slugiem.
3. **Modale Uploadu i Tworzenia (`TokenSafeSvgUploadModal.tsx`, `CreateCircuitModal.tsx`, `SchematicEditorStage.tsx`):**
   - Pole wyboru kategorii (Dropdown/Segmented select z 4 opcjami).
   - Pole zwięzłego angielskiego sluga (`Krótka nazwa po angielsku (slug)`), wypełniane automatycznie w czasie rzeczywistym z tytułu, z możliwością pełnej edycji przez użytkownika.

---

## 3. Plan Weryfikacji i Bezpieczeństwo

1. **Weryfikacja Kompilacji:** Uruchomienie `compile_applet` i `lint_applet` (brak błędów typowania, brak typu `any`).
2. **Test Wizualny i Spójność:**
   - Weryfikacja wyświetlania schematu ze screena użytkownika: zamiast `ai-gen-1792400984372` pojawi się czytelny angielski slug (np. `vhf-common-base-preamp`) oraz kategoria `Technika w.cz. i filtry`.
   - Weryfikacja działania paska filtrów: kliknięcie `Wzmacniacze` wyświetla wyłącznie wzmacniacze, `Zasilacze` filtruje prostowniki i stabilizatory.
   - Weryfikacja dodawania nowego układu przez Token-Safe upload: podgląd sugerowanej kategorii i generowanego sluga.
3. **Dokumentacja:** Utworzenie szczegółowego raportu w `docs/changes/circuit-categories-and-english-slugs.md`.
