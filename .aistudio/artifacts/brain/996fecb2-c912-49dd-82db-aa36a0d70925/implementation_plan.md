# DeSchema Mentor – Relacyjna Baza Obwodów (Cloud SQL PostgreSQL) i Autoryzacja Użytkowników

Architektura migracji ze statycznych plików JSON do chmurowej bazy relacyjnej Cloud SQL (PostgreSQL) obsługiwanej przez Drizzle ORM, zintegrowanej z Firebase Auth dla obsługi katalogu publicznego oraz prywatnych obwodów użytkowników.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Podsumowanie decyzji projektowych potwierdzonych w fazie wywiadu:

- **Silnik bazodanowy:** Relacyjna baza danych **Cloud SQL (PostgreSQL)** zintegrowana z uwierzytelnianiem **Firebase Auth (Google Sign-In)**.
- **Model danych:** Znormalizowany schemat relacyjny (`circuits`, `circuit_symbols`, `socratic_steps`) z wektorową warstwą SVG oraz metadanymi fizycznymi.
- **Zakres dostępności:**
  - **Katalog publiczny:** Wzorcowe obwody edukacyjne dostępne dla każdego bez konieczności logowania.
  - **Katalog prywatny:** Możliwość tworzenia, edytowania i usuwania własnych obwodów przez zalogowanego użytkownika (`user_id`).

---

### 1. Overview & Core Concept

- **Problem:** Aktualne przechowywanie obwodów w postaci ręcznie preparowanych, statycznych plików JSON w `/public/resources/` uniemożliwia dynamiczne dodawanie nowych układów, wyklucza tworzenie prywatnych bibliotek użytkowników oraz utrudnia import i walidację z zewnętrznych źródeł.
- **Rozwiązanie:** Wdrożenie chmurowej relacyjnej bazy danych PostgreSQL (Cloud SQL Developer Edition) z tabelami połączonymi kluczami obcymi i kaskadami, zarządzanymi przez **Drizzle ORM**.
- **Kluczowa wartość:**
  - Dynamiczny katalog obwodów z wyszukiwaniem i filtrowaniem.
  - Zabezpieczony dostęp przez Firebase Auth z kontem Google.
  - Skalowalność do setek obwodów z zachowaniem błyskawicznego czasu ładowania i pełnego bezpieczeństwa.

---

### 2. User Experience & Visual Design

- **Przebieg użytkownika (User Flows):**
  1. **Przeglądanie katalogu (Public Access):** Użytkownik otwiera modal „Układy” w TopNavbar i widzi zakładki: *„Katalog Wzorcowy (Publiczny)”* oraz *„Moje Układy (Prywatne)”*.
  2. **Logowanie (Google Sign-In):** Przycisk „Zaloguj przez Google” w nagłówku i w panelu prywatnym. Po zalogowaniu wyświetlany jest avatar, imię oraz liczba własnych projektów.
  3. **Zarządzanie obwodami (Circuit CRUD):** Zalogowany użytkownik może dodać nowy obwód poprzez przejrzysty kreator (podstawowe parametry, kod wektorowy SVG, punkty pomiarowe i kroki sokratejskie) lub wyeksportować / usunąć własny obwód.
  4. **Nauka i dialog:** Wybór obwodu z bazy natychmiast ładuje wektor do `SvgSchematicViewer`, punkty aktywne do popoverów oraz konfiguruje czatbota sokratejskiego.

- **Identyfikacja wizualna i stylistyka:**
  - Spójność z istniejącym interfejsem DeSchema (ciemny motyw domyślny, gładkie przejścia `350ms cubic-bezier`, akcenty cyjanowe `#06b6d4` i indygo `#6366f1`).
  - Przejrzyste wskaźniki statusu autoryzacji w nagłówku (avatar użytkownika z menu wylogowania).
  - Eleganckie karty obwodów z miniaturą, liczbą kroków i symbolem kłódki/globu oznaczającym widoczność.

---

### 3. Key Product Decisions & Trade-Offs

- **Decyzja 1: Relacyjny model PostgreSQL vs. Nierelacyjne dokumenty**
  - *Wybrany wariant:* Cloud SQL (PostgreSQL) z Drizzle ORM.
  - *Dlaczego:* Precyzyjne relacje 1:N między obwodem, symbolami na schemacie (`x, y, label, role, formula`) a krokami sokratejskimi (`step_number, prompt, hint, reflection`). Spójność transakcyjna i integralność referencyjna kluczy obcych.
- **Decyzja 2: Hybrydowa autoryzacja z Firebase Auth**
  - *Wybrany wariant:* Identyfikacja tożsamości Firebase Auth (Google Provider) z powiązaniem klucza `user_id` w tabelach PostgreSQL.
  - *Dlaczego:* Brak konieczności zarządzania hasłami i wrażliwymi danymi, bezpieczny token JWT, standard OAuth2.
- **Decyzja 3: Migracja i seeding bazy**
  - *Wybrany wariant:* Skrypt automatycznego seedowania 3 wzorcowych obwodów (`half-wave-rectifier`, `npn-common-emitter`, `zener-regulator`) jako rekordy publiczne (`is_public = true`, `user_id = NULL`), dzięki czemu aplikacja od razu posiada pełną bazę dydaktyczną.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React SPA)                           │
│  ┌───────────────────────┐  ┌────────────────────┐  ┌───────────────┐ │
│  │ TopNavbar (Auth Btn)  │  │ CircuitsManager    │  │ SvgSchematic  │ │
│  └──────────┬────────────┘  └─────────┬──────────┘  └───────┬───────┘ │
│             │                         │                     │         │
│             ▼                         ▼                     ▼         │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐ │
│  │   FirebaseAuthContext  │  │        CircuitService (API Client)    │ │
│  └──────────┬────────────┘  └───────────────────┬───────────────────┘ │
└─────────────┼───────────────────────────────────┼─────────────────────┘
              │ Token Bearer                       │ HTTP REST API
              ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express server.ts)                    │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐ │
│  │  Firebase Auth Verify │  │  API Routes: /api/circuits            │ │
│  │  Middleware           │  │  GET, POST, PUT, DELETE               │ │
│  └──────────┬────────────┘  └───────────────────┬───────────────────┘ │
│             │                                   │                     │
│             └─────────────────┬─────────────────┘                     │
│                               ▼                                       │
│                    ┌──────────────────────┐                           │
│                    │     Drizzle ORM      │                           │
│                    └──────────┬───────────┘                           │
└───────────────────────────────┼───────────────────────────────────────┘
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  CLOUD SQL (PostgreSQL Database)                       │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │       circuits       │  │ circuit_symbols  │  │  socratic_steps  │ │
│  │ (id, title, is_pub)  │  │ (id, circ_id, xy)│  │ (id, circ_id, pr)│ │
│  └──────────────────────┘  └──────────────────┘  └──────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### Schemat tabel bazy danych (`src/db/schema.ts`):
1. **`circuits`:**
   - `id`: varchar(128) primary key
   - `title`: text not null
   - `description`: text
   - `svg_view_box`: varchar(64) not null default '0 0 700 400'
   - `svg_content`: text not null
   - `is_public`: boolean not null default false
   - `user_id`: varchar(128) references auth users (nullable dla obwodów publicznych)
   - `created_at`: timestamp with time zone default now()
2. **`circuit_symbols`:**
   - `id`: varchar(128) primary key
   - `circuit_id`: varchar(128) references circuits(id) on delete cascade
   - `label`: varchar(64) not null
   - `name`: text not null
   - `x`: real not null
   - `y`: real not null
   - `physical_role`: text
   - `formula`: text
   - `typical_value`: text
   - `explanation`: text
3. **`socratic_steps`:**
   - `id`: serial primary key
   - `circuit_id`: varchar(128) references circuits(id) on delete cascade
   - `step_number`: integer not null (1..4)
   - `title`: text not null
   - `prompt_question`: text not null
   - `hint`: text not null
   - `reflection_answer`: text not null
   - `target_symbol_ids`: jsonb default '[]'

---

### 5. Plan Realizacji (Execution Steps)

1. **Uruchomienie procedury `cloudsql-setup`:**
   - Sprawdzenie kwalifikacji projektu (`CheckFeatureEligibility`).
   - Prezentacja interfejsu zgody chmurowej `show_aistudio_ui` (`cloudsql_setup`).
   - Inicjalizacja instancji Cloud SQL oraz Firebase Auth.
2. **Instalacja bibliotek ORM i sterowników bazy:**
   - `drizzle-orm`, `pg`, `@types/pg`, `drizzle-kit`, `firebase`.
3. **Konfiguracja schematu Drizzle:**
   - Utworzenie `src/db/schema.ts` i `src/db/drizzle.config.ts`.
   - Zastosowanie migracji schematu w bazie PostgreSQL.
4. **Seedowanie bazy:**
   - Przeniesienie 3 wzorcowych obwodów z plików JSON do bazy PostgreSQL jako obwody publiczne.
5. **Endpointy API w `server.ts`:**
   - `GET /api/circuits` (pobieranie katalogu publicznego + prywatnego użytkownika).
   - `GET /api/circuits/:id` (pobieranie szczegółów obwodu ze złączonymi symbolami i krokami).
   - `POST /api/circuits` (tworzenie nowego obwodu powiązanego z zalogowanym użytkownikiem).
   - `DELETE /api/circuits/:id` (usuwanie własnego obwodu).
6. **Integracja interfejsu użytkownika:**
   - Komponent logowania w `TopNavbar`.
   - Rozbudowa `CircuitsManagerModal` o przełączanie katalogu publicznego i prywatnego.
   - Połączenie `CircuitRepository` z nowym API REST backendu.
