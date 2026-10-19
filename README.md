# DeSchema Mentor

> **Prowadzi krok po kroku • Analiza schematów i obwodów • Cierpliwy dialog bez gotowców**

**Autor:** [@s-reinmar](https://github.com/s-reinmar)  
**Licencja:** [MIT License](./LICENSE)  
**Wersja:** 1.3.0 (Interactive Vector Engine, Session Persistence & Dual Theme Architecture)  

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
- **Moduł „Układy” (za Sesją i przed Ustawieniami):**
  - Okno modalne (`CircuitsManagerModal`) prezentujące katalog obwodów wzorcowych, ich opisy fizyczne oraz zarezerwowaną przestrzeń dla nowych projektów.
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

### 2. Układ Dual-Panel Workspace:

#### A. Lewy Panel – Pedagogika Sokratejska & Dialog:
- **Wskaźnik postępu analizy (`SocraticProgressBar`):**
  - Dynamiczny pasek postępu wizualizujący aktualny etap analizy (1–4), procent ukończenia oraz stan poszczególnych faz.
- **Nawigacja etapowa (`SocraticStepSection`):**
  - 4 etapy poznawcze:
    1. *Krok 1: Topologia i kierunek przepływu ładunków*
    2. *Krok 2: Punkt pracy (polaryzacja DC i bilans napięć)*
    3. *Krok 3: Dynamika sygnałowa (AC i zjawiska przejściowe)*
    4. *Krok 4: Stany graniczne, tętnienia i zabezpieczenia*
- **Panel pytania sokratejskiego:**
  - Pytanie wiodące danego kroku z naukowym formatowaniem wzorów.
  - Interaktywny przycisk **💡 Potrzebuję naprowadzenia** (wskazówka kierunkowa bez podawania odpowiedzi).
  - Interaktywny przycisk **🔍 Zweryfikuj swoje myślenie** (sprawdzenie fizycznej hipotezy ucznia).
  - Pełna adaptacja wizualna do trybu jasnego i ciemnego z zachowaniem standardów kontrastu WCAG AAA.
- **Dedykowany czatbot sokratejski (`SocraticChatPanel`):**
  - Wybór modeli Google Gemini: `⚡ Flash-Lite` (`gemini-3.5-flash-lite`), `⚖️ Flash` (`gemini-3.8-flash`), `🧠 Argon` (`gemini-4-argon`).
  - Przełącznik głębokiego toku myślenia (*Thinking Mode*).
  - Automatyczna kaskada bezpieczeństwa (*Safety Cascade Fallback*).
  - Matematyczny parser wyrażeń fizycznych i indeksów LaTeX (`SymbolParser`).
  - Szybkie akcje sokratejskie (*„Dlaczego tak zrobiliśmy?”*, *„Wskazówka”*, *„Wyjaśnij prościej”*, *„Podsumujmy”*).
  - Obsługa klawiatury: `Enter` wysyła wiadomość, `Shift + Enter` tworzy nową linię.
  - Dwuetapowa synchronizacja stanu sesji z panelem głównym aplikacji.

#### B. Prawy Panel – Silnik Wektorowy Schematów (`SvgSchematicViewer`):
- **Sterowanie widokiem i manipulacja przestrzenna:**
  - Narzędzie **Dopasuj (Zoom-to-Fit):** automatyczne wyśrodkowanie i optymalne wyskalowanie schematu do rozmiaru widoku.
  - Skalowanie kółkiem myszy (**Wheel-Zoom**) z izolacją przewijania – obrót kółkiem myszy skaluje wyłącznie schemat, bez przesuwania sąsiednich paneli.
  - Ręczne przesuwanie schematu (**Pan / Drag**) z wizualnym wskaźnikiem kursora (`cursor-grab` / `cursor-grabbing`).
  - Przyciski powiększania (`+`), pomniejszania (`-`) oraz przełączania obwodów (`<`, `>`).
  - Usunięcie zdublowanych kontrolek widoku dla maksymalnej przejrzystości interfejsu.
- **Warstwa Adnotacji i Znaczników (`SchematicAnnotationsLayer`):**
  - Możliwość tworzenia tymczasowych znaczników i notatek bezpośrednio na elementach obwodu.
  - Automatyczna rotacja palety kolorów wyróżnień, edycja i usuwanie adnotacji.
  - Zapis i odtwarzanie znaczników w ramach eksportu/importu sesji JSON.
- **Punkty kluczowe (Hotspots) i karty „Show-Up” (`SymbolShowUpPopover`):**
  - Wyjaśnienie roli fizycznej komponentu, ścisły wzór projektowy oraz typowe wartości rzeczywiste (np. 1N4007, BC547, 470µF).
  - Ukrycie suwaków przewijania (`no-scrollbar`) dla estetyki i czystości widoku.

---

### 3. Wzorcowe Schematy Elektroniczne (SSOT):
Wszystkie schematy zdefiniowane są w jednolitym katalogu `/public/resources/`:
1. `half-wave-rectifier.json` – Prostownik jednopołówkowy z filtrem pojemnościowym ($U_{in}, D_1, C_{filtr}, R_L$).
2. `npn-common-emitter.json` – Wzmacniacz tranzystorowy we wspólnym emiterze OE ($U_{CC}, Q_1, R_{b1}, R_{b2}, R_c, R_e, C_e, C_{in}, C_{out}$).
3. `zener-regulator.json` – Równoległy stabilizator parametryczny z diodą Zenera ($U_{in}, R_s, D_z, R_L$).

---

### 4. Backend i Bezpieczeństwo Gemini API (`server.ts`):
- Serwer full-stack w oparciu o Express i oficjalne SDK `@google/genai` (wersja 2.4.0) na porcie 3000 (`tsx server.ts`).
- Dedykowany endpoint `POST /api/chat` przesyłający kontekst obwodu, bieżący etap oraz historię dialogu.
- **Inżynieria Promptu Mentora:** System prompt wymusza sokratejską metodę nauczania – bezwzględny zakaz podawania gotowych wyników liczbowych, stawianie pytań naprowadzających o zjawiska fizyczne i prawa Kirchhoffa/Ohma.
- **Safety Cascade:** Automatyczne przełączanie na model zapasowy `gemini-3.5-flash-lite` w przypadku przeciążenia lub niedostępności modeli wyższego rzędu.
- **Fallback Offline:** W przypadku braku skonfigurowanego klucza API serwer automatycznie serwuje heurystyczne odpowiedzi mentora offline.

---

## 🛠️ Wymagania Systemowe

- **Node.js:** `>= 18.0.0` (rekomendowany Node.js 20 LTS lub 22)
- **NPM:** `>= 9.0.0`
- **Przeglądarka:** Nowoczesna przeglądarka wspierająca standard ECMAScript 2022 oraz grafikę SVG (Chrome, Firefox, Safari, Edge).

### Zmienne środowiskowe (`.env`):
Skonfiguruj klucz API w pliku `.env`:

```env
# Klucz API dla modeli Gemini (wymagany do działania czatbota sokratejskiego online)
GEMINI_API_KEY="Twój_Klucz_Gemini_API"

# Opcjonalny port serwera (domyślnie 3000)
PORT=3000
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
│   └── resources/                     # Pojedyncze źródło prawdy (SSOT) dla definicji JSON obwodów
│       ├── half-wave-rectifier.json
│       ├── npn-common-emitter.json
│       └── zener-regulator.json
├── src/
│   ├── components/                    # Warstwa prezentacji (View)
│   │   ├── modals/                    # Okna dialogowe (CircuitsManagerModal, AboutModal, CheatSheetModal)
│   │   ├── navigation/                # Elementy paska nawigacji (SessionDropdown, SettingsDropdown, HelpDrawer)
│   │   ├── schematic/                 # Komponenty schematu (SchematicControlsBar, SchematicAnnotationsLayer)
│   │   ├── SocraticChatPanel.tsx      # Panel czatbota z obsługą modeli Gemini i toku myślenia
│   │   ├── SocraticProgressBar.tsx    # Wskaźnik postępu analizy obwodu
│   │   ├── SocraticStepSection.tsx    # 4-etapowy kontener pytań sokratejskich
│   │   ├── SvgSchematicViewer.tsx     # Silnik wektorowy ze skalowaniem, przesuwaniem i adnotacjami
│   │   ├── SymbolShowUpPopover.tsx    # Karty popover z rolą fizyczną i wzorami
│   │   ├── TopNavbar.tsx              # Pasek nawigacji łączący Sesję, Układy, Ustawienia i Motyw
│   │   └── Footer.tsx                 # Stopka z oznaczeniem autora i licencji
│   ├── context/                       # Zarządzanie stanem globalnym (ThemeContext, SettingsContext)
│   ├── data/                          # Metadane wbudowanych obwodów
│   ├── interfaces/                    # Kontrakty i abstrakcje (ICircuitRepository, IStorageService, ISessionService)
│   ├── services/                      # Serwisy domenowe i infrastrukturalne
│   │   ├── circuit-repository.ts      # Repozytorium obwodów (pobieranie HTTP + storage)
│   │   ├── circuit-validator.ts       # Walidator schematów obwodów
│   │   ├── local-storage-storage.service.ts # Adapter pamięci lokalnej z fallbackiem in-memory
│   │   └── session.service.ts         # Eksport, import i historia sesji
│   ├── types/                         # Ścisłe definicje typów TypeScript
│   │   ├── circuit.types.ts           # Typy obwodu, symboli i kroków sokratejskich
│   │   ├── session.types.ts           # Typy sesji, wiadomości i danych zapisu
│   │   └── annotation.types.ts        # Typy znaczników i adnotacji schematu
│   └── utils/                         # Narzędzia typograficzne i naukowe
│       └── symbol-parser.ts           # Parser indeksów dolnych/górnych, symboli LaTeX i formuł fizycznych
├── docs/
│   └── changes/                       # Dokumentacja architektoniczna i raporty zmian
├── server.ts                          # Serwer Express obsługujący proxy Gemini API i kaskadę modeli
├── LICENSE                            # Jednolity, kanoniczny plik licencji MIT
└── README.md                          # Dokumentacja projektu
```

---

## 📜 Licencja

Projekt jest udostępniany na zasadach licencji [MIT License](./LICENSE).  
Copyright (c) 2026 **@s-reinmar**.
