# Generator Układów i Zadań Sokratejskich z Obrazów (Multimodal AI)

Automatyczne przekształcanie zdjęć, skanów i zrzutów ekranu schematów elektronicznych w interaktywne układy wektorowe SVG z 4-etapowymi pytaniami dydaktycznymi, punktami pomiarowymi oraz bezpośrednim zapisem w relacyjnej bazie Cloud SQL PostgreSQL.

> [!IMPORTANT]
> **Potwierdzone decyzje architektoniczne:**
> - **Źródło obrazu**: Przesyłanie plików graficznych (PNG, JPG, WebP) poprzez Drag & Drop, przeglądarkę plików oraz natywne wklejanie ze schowka systemowego (`Ctrl+V` / `Cmd+V`).
> - **Silnik wektorowy**: Serwerowa analiza multimodalna przez `@google/genai` (`gemini-3.8-flash`) generująca znormalizowany kod wektorowy SVG dopasowany do stylistyki DeSchema (`viewBox="0 0 700 400"`), pozycje komponentów oraz współrzędne punktów pomiarowych.
> - **Przepływ pracy**: 3-krokowy kreator (Upload & Analiza → Interaktywny Podgląd i Edycja → Zapis do Cloud SQL jako układ publiczny lub prywatny).

---

## 1. Przegląd i Koncepcja Biznesowa

- **Dla kogo**: Nauczyciele elektroniki, studenci, inżynierowie i pasjonaci tworzący interaktywne materiały dydaktyczne.
- **Problem**: Ręczne przepisywanie schematów z podręczników lub zrzutów do JSON i ręczne kodowanie współrzędnych SVG oraz pytań testowych było czasochłonne i żmudne.
- **Rozwiązanie**: Wystarczy wkleić zdjęcie schematu z podręcznika lub zrzut ekranu z symulatora (np. LTspice, Falstad, schemat z tablicy). Model Gemini analizuje topologię obwodu, generuje czysty wektor SVG zgodny z systemem punktów kontrolnych aplikacji, ekstrahuje elementy składowe oraz formułuje 4 pytania w metodyce sokratejskiej (od identyfikacji topologii, przez punkty pomiarowe, po diagnozę stanów awaryjnych).

---

## 2. Architektura Interfejsu i Doświadczenie Użytkownika (UX)

### Kluczowe Etapy Kreatora (Modal Wizard)
1. **Krok 1: Wprowadzenie obrazu (Dropzone & Paste Zone)**:
   - Duży, estetyczny obszar przeciągania plików z natywnym nasłuchem zdarzenia `paste` na oknie (wklejenie bezpośrednio ze schowka).
   - Opcjonalne pole na wskazówki dydaktyczne (np. "Skup się na filtrze dolnoprzepustowym", "Oblicz napięcie na diodzie Zenera").
   - Natychmiastowy miniaturowy podgląd załadowanego zdjęcia z możliwością wymiany.
   - Pasek postępu analizy multimodalnej (ekstrakcja topologii $\to$ generowanie SVG $\to$ tworzenie pytań sokratejskich).

2. **Krok 2: Interaktywna Weryfikacja i Edycja (Split View)**:
   - **Lewa strona (Wizualizacja SVG)**: Interaktywne płótno SVG z podświetlaniem wygenerowanych węzłów i punktów pomiarowych (np. TP1, TP2, IN, OUT). Możliwość przełączania między wygenerowanym SVG a oryginalnym zdjęciem referencyjnym.
   - **Prawa strona (Edytor Dydaktyczny)**:
     - Formularz metadanych: Tytuł, Kategoria (`Prostowniki`, `Wzmacniacze`, `Filtry`, etc.), Poziom trudności.
     - 4 pytania sokratejskie: Edytowalne pola pytania, warianty odpowiedzi A/B/C/D, wskaźnik poprawnej odpowiedzi oraz wyjaśnienie dydaktyczne.
     - Lista symboli elektronicznych (identyfikator, wartość, typ).

3. **Krok 3: Publikacja i Persystencja**:
   - Wybór docelowej lokalizacji: Zapis do własnego katalogu prywatnego (Cloud SQL) lub katalogu publicznego (jeśli uprawniony).
   - Natychmiastowe załadowanie nowego obwodu na stół roboczy aplikacji bez przeładowywania strony.

---

## 3. Schemat Przepływu Danych i Komponentów

```
┌────────────────────────────────────────────────────────┐
│                   Klient (React)                       │
│  [Paste/Upload Modal] ──(Base64 Image + Prompt)──────┐ │
│         ▲                                            │ │
│         │ (Podgląd SVG + 4 pytania do edycji)        │ │
│  [SchematicStudioWizard]                             │ │
│         │ (Zatwierdzony Circuit Document)            │ │
│         ▼                                            │ │
└─────────┼────────────────────────────────────────────┼─┘
          │ POST /api/circuits/analyze-image           │ POST /api/circuits
          ▼                                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend Express (server.ts)              │
│  ┌───────────────────────┐   ┌───────────────────────┐ │
│  │ Gemini 3.8 Flash      │   │ Drizzle ORM           │ │
│  │ Multimodal Analysis   │   │ Cloud SQL PostgreSQL  │ │
│  │ JSON Structured Output│   │ Transactional Insert  │ │
│  └───────────────────────┘   └───────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 4. Specyfikacja Techniczna i Kontrakty

### Endpoint Backendowy: `POST /api/circuits/analyze-image`
- **Model**: `gemini-3.8-flash`
- **System Instruction**: Ścisłe wytyczne dotyczące generowania wektora SVG (linie siatki, standardowe symbole IEC/ANSI diody, rezystora, kondensatora, tranzystora, źródła zasilania, masy, etykiety `text`, punkty pomiarowe z klasą `checkpoint-node`).
- **Response Schema (`Type.OBJECT`)**:
  - `title`: string
  - `description`: string
  - `category`: string
  - `difficulty`: enum (`Podstawowy`, `Średni`, `Zaawansowany`)
  - `svgContent`: string (czysty kod węzłów `<g>` i `<path>` wewnątrz viewBox 0 0 700 400)
  - `symbols`: tablica `{ id, type, label, value, x, y }`
  - `socraticSteps`: dokładnie 4 obiekty `{ stage, stageName, question, options, correctAnswerIndex, explanation, hint, targetPoint }`

### Integracja z Interfejsem Użytkownika
- Przycisk **"Generuj z Obrazu (AI)"** zintegrowany w `TopNavbar` oraz wewnątrz katalogu `CircuitsManagerModal`.
- Dostępny w trybie ciemnym i jasnym, zgodny z zasadą Zero-Pill oraz wytycznymi WCAG.

---

## 5. Plan Wdrożenia

1. **Serwis Backendowy Gemini**: Dodanie dedykowanej trasy analizy multimodalnej w `src/api/circuits.router.ts` z walidacją rozmiaru obrazu i ustrukturyzowanym schematem JSON.
2. **Warstwa Domenowa (TypeScript)**: Dodanie interfejsów kreatora i walidatorów w `src/interfaces/circuit-generator.interface.ts`.
3. **Komponenty Interfejsu**:
   - `SchematicUploadZone`: Obsługa Drag&Drop oraz zdarzenia `onPaste` ze schowka.
   - `SchematicAiWizardModal`: 3-krokowy kreator z podglądem SVG, edytorem pytań i punktów kontrolnych.
4. **Podpięcie do Menu i Repozytorium**: Integracja z `TopNavbar` oraz `CircuitRepository` do bezpośredniego zapisu w bazie Cloud SQL.
5. **Weryfikacja**: Test kompilacji TypeScript, weryfikacja obsługi błędów oraz testy responsywności w obu motywach (jasny/ciemny).
