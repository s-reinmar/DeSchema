# DeSchema Mentor

> **Prowadzi krok po kroku • Analiza schematów i obwodów • Cierpliwy dialog bez gotowców**

**Autor:** [@s-reinmar](https://github.com/s-reinmar)  
**Licencja:** [MIT License](./LICENSE)  
**Wersja:** 1.4.0 (Cloud SQL PostgreSQL, Firebase Authentication & Multimodal AI Circuit Generator)  

---

## 📌 Stan Projektu

Projekt znajduje się w stabilnej fazie produkcyjnej (**Production Ready**). Wszystkie wymagane moduły, logika obliczeniowa i interfejsy zostały zaimplementowane, w pełni otypowane w języku **TypeScript** (Zero `any`, strict null checks) i zweryfikowane pod kątem reguł **Clean Architecture** oraz zasad **SOLID** (SRP, DIP, OCP).

Domyślnym motywem wizualnym aplikacji jest **tryb ciemny** (*Default Dark Mode*), zoptymalizowany pod kątem kontrastu wektorowych schematów laboratoryjnych.

---

## 🚀 Kluczowe Funkcjonalności

### 1. Pasek Nawigacji Górnej (`TopNavbar`):
- **Moduł „Sesja” (przed Ustawieniami):**
  - **Zapisz postęp (Eksportuj do JSON):** eksportuje pełny stan aplikacji (identyfikator obwodu, aktywny krok analizy, historię konwersacji czatbota, znaczniki i adnotacje schematu oraz timestamp).
  - **Wczytaj sesję (Importuj z JSON):** bezpieczny import stanu z pliku JSON wraz z walidacją struktury.
  - **Historia sesji / Wznów poprzednią:** natychmiastowe przywracanie zapisanych punktów kontrolnych z pamięci lokalnej.
- **Moduł „Układy” (`CircuitsManagerModal`):**
  - Dostęp do relacyjnej bazy Cloud SQL: katalogu układów wzorcowych oraz prywatnych obwodów użytkownika.
  - Akcja **„Wgraj Schemat”** – bezpośrednie uruchomienie multimodalnego kreatora AI z poziomu panelu układów.
  - Akcja **„Ręczny edytor”** – formularz tworzenia schematów z ręczną definicją wektora SVG i pytań sokratejskich.
- **Szybka akcja „Wgraj Schemat” (pasek główny oraz menu mobilne):**
  - Wygodny przycisk akcji z ikoną wysyłania otwierający kreator analizy schematów.
- **Uwierzytelnianie użytkownika (`UserAuthButton`):**
  - Integracja z Google Sign-In (Firebase Authentication) z prezentacją awatara, adresu e-mail oraz synchronizacją tokenu JWT.
- **Ustawienia (`SettingsDropdown`):**
  - Konfiguracja parametrów dydaktycznych, wybór preferowanego modelu Gemini oraz przełącznik toku głębokiego myślenia (*Thinking Mode*).
- **Pomoc (`HelpDrawer`):**
  - Wysuwany panel boczny z kompendium praw fizyki: Prawo Ohma, I i II Prawo Kirchhoffa (KCL, KVL), złącze krzemowe P-N, charakterystyka stabilizacji Zenera, wzmacniacz OE.
- **O programie (`AboutModal`):**
  - Informacje o wersji, autorze (`@s-reinmar`), licencji MIT oraz zasadach architektury Clean Code.
- **Przełącznik motywu (Dark / Light):**
  - Płynne, animowane przejście kolorystyczne (`350ms cubic-bezier`) między trybem ciemnym a jasnym z ikoną Słońce/Księżyc.
  - **Domyślnie aktywny tryb ciemny** bez względu na preferencje systemowe.

---

### 2. Baza Danych Google Cloud SQL & Autoryzacja Firebase:
- **Relacyjna Baza Cloud SQL PostgreSQL:**
  - Architektura oparta o ORM Drizzle (`drizzle-orm` / `pg`).
  - Tabela `circuits` przechowuje znormalizowane schematy:
    - `id` (klucz główny), `title`, `description`, `category`, `svg_view_box`, `svg_content`.
    - `symbols` (struktura JSONB komponentów z rolami fizycznymi i formułami).
    - `socratic_steps` (struktura JSONB 4 sokratejskich kroków dydaktycznych).
    - `owner_id` (identyfikator użytkownika Firebase dla obwodów prywatnych).
    - `is_public` (flaga katalogu publicznego).
    - `created_at`, `updated_at`.
- **System Uprawnień i Bezpieczeństwa:**
  - Trasa API `/api/circuits` zabezpieczona middleware'em weryfikującym tokeny JWT (`AuthRequest`).
  - Użytkownicy niezalogowani mają dostęp w trybie odczytu do katalogu publicznego.
  - Użytkownicy zalogowani kontem Google posiadają odizolowany magazyn prywatnych obwodów z pełnym cyklem CRUD.
- **Odporność na awarie (Resilient Cache Fallback):**
  - W przypadku braku łączności z Cloud SQL aplikacja transparentnie przełącza się na lokalną bazę predefiniowanych obwodów JSON.

---

### 3. Wgrywanie i Generowanie Schematów przez Multimodalne AI (Gemini):
- **Uniwersalne metody wprowadzania obrazu (`SchematicUploadStage`):**
  - **Przeciągnij i upuść (Drag & Drop):** obsługa plików graficznych PNG, JPG, JPEG, WebP.
  - **Wybór z dysku:** klasyczny selektor plików z natywnym filtrowaniem formatów rastrowych.
  - **Wklejanie ze schowka (Ctrl+V / Cmd+V):** globalny i kontenerowy nasłuch zdarzeń wklejania – użytkownik może wkleić zrzut ekranu schematu bezpośrednio ze schowka systemowego bez konieczności zapisywania pliku na dysku.
- **Multimodalna Analiza Geometrii Obwodu (`CircuitAnalyzerService`):**
  - Wykorzystanie modelu `gemini-3.8-flash` z biblioteki `@google/genai` (SDK 2.4.0) za pośrednictwem endpointu `POST /api/circuits/analyze-image`.
  - Generowanie czystego kodu wektorowego SVG (`<rect>`, `<path>`, `<circle>`, `<line>`, `<text>`) o spójnej stylistyce laboratoryjnej.
  - Automatyczna detekcja węzłów, etykiet zasilania ($V_{CC}$, $GND$) oraz punktów kontrolnych ($TP_1, TP_2, \dots$).
  - Ekstrakcja symboli obwodu z określeniem ich roli fizycznej, wzorów projektowych i typowych wartości komponentów.
- **Generowanie 4-stopniowych Pytań Sokratejskich:**
  - **Krok 1 (Topologia i polaryzacja wstępna):** rozpoznanie węzłów, kierunków prądów i stanu spoczynkowego.
  - **Krok 2 (Punkt pracy i dynamika sygnału):** bilans napięć KVL/KCL, przewodzenie elementów nieliniowych.
  - **Krok 3 (Ekstremalne warunki pracy):** maksymalne dopuszczalne napięcia wsteczne, moce strat i tętnienia.
  - **Krok 4 (Stany przejściowe i diagnostyka awarii):** zachowanie przy zwarciu/rozwarciu, stałe czasowe $\tau$.
- **Interaktywny Kreator i Edytor Przed Zapisem (`SchematicEditorStage`):**
  - Porównawczy widok side-by-side wgranego zdjęcia rastrowego z wygenerowanym wektorem SVG.
  - Edycja metadanych (tytuł, opis, kategoria, viewBox).
  - Wygodny edytor pytań sokratejskich, wskazówek oraz wyjaśnień.
  - Jedno-klikowy zapis wygenerowanego schematu bezpośrednio do bazy Cloud SQL PostgreSQL.

---

### 4. Układ Dual-Panel Workspace:

#### A. Lewy Panel – Pedagogika Sokratejska & Dialog:
- **Wskaźnik postępu analizy (`SocraticProgressBar`):**
  - Dynamiczny pasek postępu wizualizujący aktualny etap analizy (1–4), procent ukończenia oraz stan poszczególnych faz.
- **Nawigacja etapowa (`SocraticStepSection`):**
  - 4 etapy poznawcze zintegrowane z pytaniem wiodącym, formułami naukowymi i podpowiedziami.
- **Interaktywne akcje:**
  - **💡 Potrzebuję naprowadzenia** (kierunkowa wskazówka sokratejska bez podawania odpowiedzi).
  - **🔍 Zweryfikuj swoje myślenie** (walidacja hipotezy ucznia).
- **Dedykowany czatbot sokratejski (`SocraticChatPanel`):**
  - Obsługa modeli Google Gemini: `⚡ Flash-Lite` (`gemini-3.5-flash-lite`), `⚖️ Flash` (`gemini-3.8-flash`), `🧠 Argon` (`gemini-4-argon`).
  - Przełącznik głębokiego toku myślenia (*Thinking Mode*).
  - Bezpieczeństwo kaskadowe (*Safety Cascade Fallback*).
  - Parser symboli fizycznych i indeksów LaTeX (`SymbolParser`).

#### B. Prawy Panel – Silnik Wektorowy Schematów (`SvgSchematicViewer`):
- **Interakcja przestrzenna:**
  - Narzędzie **Dopasuj (Zoom-to-Fit)** do automatycznego kadrowania schematu.
  - Płynne skalowanie kółkiem myszy (**Wheel-Zoom**) z izolacją przewijania.
  - Przesuwanie widoku (**Pan / Drag**) z wizualnym wskaźnikiem kursora.
- **Warstwa Adnotacji i Znaczników (`SchematicAnnotationsLayer`):**
  - Rysowanie tymczasowych znaczników, notatek i punktów pomiarowych na schemacie z automatyczną rotacją barw.
- **Karty informacyjne komponentów (`SymbolShowUpPopover`):**
  - Karty z rolą fizyczną, wzorem matematycznym i typowymi parametrami rzeczywistymi.

---

### 5. Backend i Bezpieczeństwo Gemini API (`server.ts`):
- Serwer full-stack w oparciu o Express i oficjalne SDK `@google/genai` na porcie 3000 (`tsx server.ts`).
- Dedykowane endpointy REST:
  - `POST /api/chat` – dialog sokratejski z uwzględnieniem kontekstu schematu i aktualnego etapu.
  - `POST /api/circuits/analyze-image` – multimodalna synteza schematu z obrazu (PNG/JPG/schowek).
  - `GET /api/circuits`, `GET /api/circuits/:id`, `POST /api/circuits`, `DELETE /api/circuits/:id` – obsługa bazy Cloud SQL.
- Zwiększony limit payloadu JSON (`20mb`) dla wydajnego przesyłania obrazów o wysokiej rozdzielczości w Base64.
- **Prompt Sokratejski Mentora:** rygorystyczny zakaz podawania bezpośrednich wyników, nakaz naprowadzania ucznia pytaniami o prawa fizyki.

---

## 🛠️ Wymagania Systemowe

- **Node.js:** `>= 18.0.0` (rekomendowany Node.js 20 LTS lub 22)
- **NPM:** `>= 9.0.0`
- **Przeglądarka:** Nowoczesna przeglądarka wspierająca standard ECMAScript 2022, Canvas API oraz grafikę SVG (Chrome, Firefox, Safari, Edge).

### Zmienne środowiskowe (`.env`):
```env
# Klucz API dla modeli Gemini (wymagany do działania czatbota i multimodalnej analizy obrazu)
GEMINI_API_KEY="Twój_Klucz_Gemini_API"

# Opcjonalny port serwera (domyślnie 3000)
PORT=3000

# Parametry połączenia z Google Cloud SQL PostgreSQL (opcjonalne, przy braku następuje fallback in-memory)
DATABASE_URL="postgres://user:password@localhost:5432/deschema"
```

---

## 🚀 Instalacja i Uruchomienie

1. **Instalacja zależności:**
   ```bash
   npm install
   ```

2. **Uruchomienie serwera deweloperskiego (Full-Stack dev server):**
   ```bash
   npm run dev
   ```
   Aplikacja jest dostępna pod adresem: `http://localhost:3000`.

3. **Weryfikacja typowania (TypeScript Linter):**
   ```bash
   npm run lint
   ```

4. **Kompilacja produkcyjna:**
   ```bash
   npm run build
   ```

5. **Uruchomienie produkcyjne:**
   ```bash
   npm start
   ```

---

## 🏛️ Architektura Projektu

```
├── public/
│   └── resources/                     # Wzorcowe definicje JSON obwodów (fallback i seeding)
│       ├── half-wave-rectifier.json
│       ├── npn-common-emitter.json
│       └── zener-regulator.json
├── src/
│   ├── api/                           # Routery Express (circuits.router.ts)
│   ├── components/                    # Warstwa prezentacji (View)
│   │   ├── auth/                      # Komponenty logowania i profilu użytkownika
│   │   ├── modals/                    # Okna dialogowe
│   │   │   ├── schematic-wizard/      # Kreator: SchematicUploadStage, SchematicEditorStage
│   │   │   ├── CircuitsManagerModal.tsx # Panel Układy z akcją "Wgraj Schemat"
│   │   │   ├── SchematicAiWizardModal.tsx # Główny modal wgrywania schematów
│   │   │   ├── CreateCircuitModal.tsx # Ręczny edytor obwodów
│   │   │   ├── AboutModal.tsx
│   │   │   └── CheatsheetModal.tsx
│   │   ├── navigation/                # SessionDropdown, SettingsDropdown, HelpDrawer, UserAuthButton
│   │   ├── schematic/                 # SchematicControlsBar, SchematicAnnotationsLayer
│   │   ├── SocraticChatPanel.tsx      # Panel czatbota sokratejskiego
│   │   ├── SocraticProgressBar.tsx    # Wskaźnik postępu
│   │   ├── SocraticStepSection.tsx    # 4 kroki sokratejskie
│   │   ├── SvgSchematicViewer.tsx     # Silnik wektorowy schematów
│   │   ├── SymbolShowUpPopover.tsx    # Karty popover z fizycznymi wzorami
│   │   ├── TopNavbar.tsx              # Pasek nawigacji łączący Sesję, Układy, Wgraj Schemat i Profil
│   │   └── Footer.tsx                 # Stopka autorska
│   ├── context/                       # Zarządzanie stanem (ThemeContext, SettingsContext, AuthContext)
│   ├── db/                            # Warstwa bazodanowa Cloud SQL (schema.ts, client.ts, circuits.ts)
│   ├── interfaces/                    # Abstrakcje (ICircuitRepository, ICircuitAnalyzerService, IStorageService)
│   ├── middleware/                    # Middleware autoryzacji (auth.ts)
│   ├── services/                      # Logika domenowa i serwisy
│   │   ├── circuit-analyzer.service.ts        # Synteza schematów z obrazu przez Gemini API
│   │   ├── circuit-analyzer-client.service.ts # Klient HTTP dla kreatora schematów
│   │   ├── circuit-repository.ts              # Hybrydowe repozytorium Cloud SQL + local fallback
│   │   ├── circuit-validator.ts               # Walidator struktury obwodu
│   │   └── session.service.ts                 # Trwałość sesji użytkownika
│   ├── types/                         # Ścisłe definicje typów TypeScript
│   └── utils/                         # Narzędzia typograficzne (SymbolParser)
├── docs/
│   └── changes/                       # Raporty zmian i audyty architektoniczne
├── server.ts                          # Serwer Express obsługujący proxy Gemini i bazę Cloud SQL
├── LICENSE                            # Licencja MIT
└── README.md                          # Dokumentacja projektu
```

---

## 📜 Licencja

Projekt jest udostępniany na zasadach licencji [MIT License](./LICENSE).  
Copyright (c) 2026 **@s-reinmar**.
