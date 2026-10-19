# Raport: Wdrożenie Relacyjnej Bazy Obwodów Cloud SQL (PostgreSQL) oraz Firebase Authentication

**Projekt:** DeSchema Mentor  
**Autor:** @s-reinmar  
**Licencja:** MIT  
**Data:** 2026-10-19  
**Wersja:** 1.4.0 (Cloud SQL Relational Schematics & Multi-User Catalog)

---

## 1. Cel i geneza zmian (Rationale)

Dotychczasowe rozwiązanie przechowywało 3 schematy elektroniczne w postaci ręcznie preparowanych, statycznych plików JSON w `/public/resources/` (`half-wave-rectifier.json`, `npn-common-emitter.json`, `zener-regulator.json`). Ograniczało to możliwości rozwojowe platformy:
- Wykluczało tworzenie dynamicznych, prywatnych bibliotek użytkowników.
- Uniemożliwiało tworzenie nowych schematów bez ręcznej edycji plików źródłowych aplikacji.
- Brakowało relacji między elementami obwodu a krokami analizy sokratejskiej.

W odpowiedzi na wymagania zaimplementowano chmurową relacyjną bazę danych **Google Cloud SQL (PostgreSQL Developer Edition)** zarządzaną przez **Drizzle ORM**, zintegrowaną z **Firebase Authentication (Google Sign-In)**.

---

## 2. Architektura Systemu i Bazy Danych

### 2.1. Znormalizowany Schemat Relacyjny PostgreSQL (`src/db/schema.ts`)

1. **Tabela `users`:**
   - `uid` (`text`, Primary Key) – identyfikator użytkownika z Firebase Auth.
   - `email` (`text`, NOT NULL) – adres e-mail użytkownika.
   - `display_name` (`text`) – imię i nazwisko / pseudonim.
   - `photo_url` (`text`) – awatar z profilu Google.
   - `created_at` (`timestamp with time zone`, DEFAULT now()).

2. **Tabela `circuits`:**
   - `id` (`varchar(128)`, Primary Key) – unikalny identyfikator układu.
   - `title` (`text`, NOT NULL) – tytuł układu.
   - `description` (`text`) – opis pedagogiczny obwodu.
   - `svg_view_box` (`varchar(64)`, NOT NULL, DEFAULT `'0 0 700 400'`) – parametry widoku wektora SVG.
   - `svg_content` (`text`, NOT NULL) – czysty wektor XML/SVG warstw schematu.
   - `is_public` (`boolean`, NOT NULL, DEFAULT `false`) – flaga widoczności (katalog publiczny vs prywatny).
   - `user_id` (`text`, FK -> `users.uid` ON DELETE CASCADE, nullable dla obwodów wzorcowych).
   - `created_at` (`timestamp with time zone`, DEFAULT now()).

3. **Tabela `circuit_symbols`:**
   - `id` (`varchar(128)`, Primary Key).
   - `circuit_id` (`varchar(128)`, FK -> `circuits.id` ON DELETE CASCADE).
   - `label` (`varchar(64)`, NOT NULL) – oznaczenie na schemacie (np. `D_1`, `R_b1`).
   - `name` (`text`, NOT NULL) – pełna nazwa techniczna.
   - `x`, `y` (`real`, NOT NULL) – współrzędne wektorowe punktu aktywnego.
   - `physical_role`, `formula`, `formula_description`, `typical_value`, `explanation` (`text`).

4. **Tabela `socratic_steps`:**
   - `id` (`serial`, Primary Key).
   - `circuit_id` (`varchar(128)`, FK -> `circuits.id` ON DELETE CASCADE).
   - `step_number` (`integer`, NOT NULL, 1..4).
   - `title`, `prompt_question`, `hint`, `reflection_answer` (`text`, NOT NULL).
   - `target_symbol_ids` (`jsonb`, NOT NULL, DEFAULT `'[]'`).

---

## 3. Bezpieczeństwo i Przepływ Autoryzacji (Auth Architecture)

1. **Uwierzytelnianie klienta (Frontend):**
   - Moduł `src/lib/firebase.ts` oraz `src/context/AuthContext.tsx`.
   - Logowanie przez wyskakujące okno Google Sign-In (`signInWithPopup`).
   - Token JWT przechowywany wyłącznie w pamięci aplikacji (brak zapisu wrażliwego tokenu w `localStorage`).

2. **Weryfikacja serwera (Backend):**
   - Moduł `src/lib/firebase-admin.ts` inicjalizowany statycznym importem `firebase-applet-config.json`.
   - Middleware `requireAuth` weryfikuje nagłówek `Authorization: Bearer <token>` za pomocą `adminAuth.verifyIdToken()`.
   - Middleware `optionalAuth` pozwala anonimowym użytkownikom na swobodny dostęp do katalogu publicznego, a po dołączeniu tokenu dołącza prywatne schematy użytkownika.

---

## 4. Endpoints API (`/api/circuits`)

- `GET /api/circuits` – zwraca wszystkie obwody publiczne oraz prywatne obwody zalogowanego użytkownika.
- `GET /api/circuits/:id` – zwraca pełny model obwodu wraz z symbolami i krokami sokratejskimi.
- `POST /api/circuits` – tworzy nowy obwód w bazie Cloud SQL dla zalogowanego użytkownika (`requireAuth`).
- `DELETE /api/circuits/:id` – usuwa prywatny obwód użytkownika z weryfikacją praw własności (`requireAuth`).

---

## 5. Seedowanie i Ciągłość Dydaktyczna

W pliku `src/db/seed.ts` zaimplementowano procedurę `seedInitialCircuits()`, uruchamianą automatycznie przy starcie serwera Express. Zapewnia ona, że 3 wzorcowe obwody dydaktyczne:
- `half-wave-rectifier`
- `npn-common-emitter`
- `zener-regulator`
są zawsze obecne w bazie danych PostgreSQL jako obwody publiczne (`is_public = true`, `user_id = NULL`).

---

## 6. Weryfikacja i Walidacja

1. **Aprowizacja bazy Cloud SQL:** Pomyślnie utworzono instancję `ai-studio-996fecb2` w regionie `europe-west1`.
2. **Aktualizacja schematu Drizzle:** Uruchomiono `UpdateSchema`, tabele i relacje zostały poprawnie utworzone.
3. **Weryfikacja SQL:** Zapytanie do `information_schema.columns` potwierdziło obecność wszystkich kolumn i typów danych.
4. **Weryfikacja kompilacji:** `lint_applet` (`tsc --noEmit`) oraz `compile_applet` (`npm run build`) zakończyły się pełnym sukcesem bez błędów.
