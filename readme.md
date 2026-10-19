# DeSchema Mentor

> **Prowadzi krok po kroku • Analiza schematów i obwodów • Cierpliwy dialog bez gotowców**

**Autor:** [@s-reinmar](https://github.com/s-reinmar)  
**Licencja:** [MIT License](./licence)  
**Wersja:** 1.2.0 (Dual-Panel Workspace & Sokratejski Mentor AI)

---

## 📌 Stan Projektu

Projekt znajduje się w stabilnej fazie produkcyjnej (**Production Ready**). Wszystkie wymagane moduły, logika obliczeniowa i interfejsy zostały zaimplementowane, w pełni otypowane w TypeScript i zweryfikowane pod kątem reguł Clean Architecture oraz zasad SOLID (SRP, DIP).

### Zrealizowane funkcjonalności:

1. **Układ Dual-Panel Workspace:**
   - **Lewy panel (`SocraticStepSection` & `SocraticChatPanel`):**
     - Selektor modeli AI: `⚡ Flash-Lite` (`gemini-3.5-flash-lite`), `⚖️ Flash` (`gemini-3.8-flash`), `🧠 Argon` (`gemini-4-argon`).
     - Przełącznik trybu głębokiego myślenia (*Thinking Mode*).
     - Cztery szybkie akcje sokratejskie: *"Dlaczego tak zrobiliśmy?"*, *"Wskazówka"*, *"Wyjaśnij prościej"*, *"Podsumujmy"*.
     - Obsługa klawiatury: `Enter` wysyła wiadomość, `Shift + Enter` tworzy nową linię.
     - Komunikat dydaktyczny: *"Mentor pomoże Ci zrozumieć każdy krok"*.
     - Cztery etapy poznawcze: Topologia, Punkt pracy, Dynamika, Stany graniczne.
   - **Prawy panel (`SvgSchematicViewer`):**
     - Wektorowe renderowanie schematu SVG z dynamicznym zoomem (+, -, 100%).
     - Zintegrowany pasek sterowania nad schematem: przyciski nawigacyjne `<` i `>`, lista rozwijana obwodów (schematy wzorcowe oraz wgrane przez użytkownika) oraz przycisk *"Otwórz z lokalizacji / Wgraj układ"*.
     - Formatowanie typograficzne indeksów dolnych i górnych (`formatSchematicLabel`) dla symboli takich jak $R_{b1}$, $U_{in}$, $C_{filtr}$, $D_z$, $U_{CE,sat}$.
     - Interaktywne popovery **"Show-Up"** (`SymbolShowUpPopover`): wyjaśnienie znaczenia symbolu, rola fizyczna oraz ścisły wzór doboru wartości.

2. **Wzorcowe Schematy Elektroniczne (`Single Source of Truth`):**
   - Wszystkie schematy przechowywane są w jednym spójnym katalogu `/public/resources/` (usunięto redundancję katalogu `/resources/`):
     - `half-wave-rectifier.json` – Prostownik jednopołówkowy z filtrem pojemnościowym ($U_{in}, D_1, C_{filtr}, R_L$).
     - `npn-common-emitter.json` – Wzmacniacz tranzystorowy we wspólnym emiterze ($U_{CC}, Q_1, R_{b1}, R_{b2}, R_c, R_e, C_e, C_{in}, C_{out}$).
     - `zener-regulator.json` – Równoległy stabilizator parametryczny z diodą Zenera ($U_{in}, R_s, D_z, R_L$).

3. **Backend i Integracja Gemini API (`server.ts`):**
   - Serwer full-stack oparty na Express i `@google/genai` uruchamiany na porcie 3000 (`tsx server.ts`).
   - Endpoint `POST /api/chat` przyjmujący kontekst analizowanego obwodu i historię dialogu.
   - **Inżynieria Promptu Mentora:** System prompt wymusza prowadzenie ucznia metodą sokratejską – bezwzględny zakaz podawania gotowych rozwiązań liczbowych, zadawanie pytań o prawa Ohma i Kirchhoffa.
   - **Bezpieczna Kaskada (Safety Cascade):** Automatyczny fallback na `gemini-3.5-flash-lite` przy przeciążeniu lub błędzie wybranego modelu wyższego rzędu.

4. **Modale Wiedzy:**
   - **Ściągawka praw:** Prawo Ohma, prawa Kirchhoffa (KCL, KVL), złącze krzemowe P-N, stabilizacja Zenera, wzmocnienie tranzystora w układzie OE.
   - **O programie:** Informacje o autorze (`@s-reinmar`), licencji MIT oraz zasadach architektury.

---

## 🛠️ Wymagania Systemowe

### Środowisko uruchomieniowe:
- **Node.js:** `>= 18.0.0` (zalecany Node.js 20 LTS lub 22)
- **NPM:** `>= 9.0.0`
- **Przeglądarka internetowa:** Dowolna nowoczesna przeglądarka z obsługą standardu ECMAScript 2022 oraz SVG (Chrome, Firefox, Safari, Edge)

### Zmienne środowiskowe (`.env`):
Aplikacja wymaga skonfigurowania klucza API dla modeli Google Gemini. W pliku `.env` (lub panelu sekretów środowiska chmurowego):

```env
# Klucz API dla modeli Gemini (wymagany do działania czatbota sokratejskiego)
GEMINI_API_KEY="Twój_Klucz_Gemini_API"

# Opcjonalny port serwera (domyślnie 3000)
PORT=3000
```

> **Uwaga:** Jeśli klucz `GEMINI_API_KEY` nie zostanie skonfigurowany, serwer automatycznie przełączy się w tryb heurystycznego mentora offline, zapewniając ciągłość działania interfejsu.

---

## 🚀 Instalacja i Uruchomienie

1. **Instalacja zależności:**
   ```bash
   npm install
   ```

2. **Uruchomienie w trybie deweloperskim (Full-Stack dev server):**
   ```bash
   npm run dev
   ```
   Aplikacja uruchomi serwer Express zintegrowany z middleware Vite pod adresem:
   `http://localhost:3000`

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

## 🏛️ Architektura i Struktura Projektu

Projekt realizuje zasady **Clean Architecture**, **Single Responsibility Principle (SRP)** oraz **Dependency Inversion Principle (DIP)**:

```
├── public/
│   └── resources/              # Pojedyncze źródło prawdy (SSOT) dla definicji JSON obwodów
│       ├── half-wave-rectifier.json
│       ├── npn-common-emitter.json
│       └── zener-regulator.json
├── src/
│   ├── components/             # Warstwa prezentacji (View)
│   │   ├── modals/             # Okna modalne (Ściągawka praw, O programie, Wgraj JSON)
│   │   ├── SocraticChatPanel.tsx   # Czatbot z selektorem modeli i akcjami sokratejskimi
│   │   ├── SocraticStepSection.tsx # Kontener 4 kroków analizy i dialogu
│   │   ├── SvgSchematicViewer.tsx  # Zaawansowany silnik wektorowy SVG ze sterowaniem
│   │   ├── SymbolShowUpPopover.tsx # Karty Show-Up z fizyką i wzorami
│   │   ├── TopNavbar.tsx           # Pasek nawigacji, przełącznik motywu
│   │   └── Footer.tsx              # Stopka z oznaczeniem autora i licencji
│   ├── context/                # Context motywu (Dark / Light mode)
│   ├── data/                   # Deskryptory katalogu zasobów
│   ├── interfaces/             # Kontrakty i interfejsy (ICircuitRepository, IStorageService)
│   ├── services/               # Warstwa domenowa i aplikacyjna
│   │   ├── circuit-repository.ts     # Repozytorium obwodów (pobieranie HTTP + localStorage)
│   │   ├── circuit-validator.ts      # Walidator schematu JSON
│   │   └── local-storage-storage.service.ts # Adapter pamięci z fallbackiem in-memory
│   ├── types/                  # Ścisłe typy domenowe TypeScript (Circuit, CircuitSymbol, SocraticStep)
│   └── utils/                  # Formatery typograficzne (formatSchematicLabel)
├── docs/
│   └── changes/                # Dokumentacja architektoniczna i raporty zmian
├── server.ts                   # Serwer Express z obsługą @google/genai i kaskady modeli
├── licence                     # Kopia licencji MIT (małe litery)
├── LICENSE                     # Pełny tekst licencji MIT
├── readme.md                   # Niniejsza dokumentacja (małe litery)
└── README.md                   # Główna dokumentacja projektu
```

---

## 📜 Licencja

Projekt objęty jest licencją [MIT License](./licence).  
Copyright (c) 2026 **@s-reinmar**.
