# Raport z Realizacji: Zadanie #1 – Baza SQL, Architektura Single-User i Panel Administratora

**Data:** 20 października 2026  
**Autor:** @s-reinmar  
**Zgłoszenie:** Zadanie #1: Baza SQL, Architektura i Panel Administratora (Model jednoosobowy, weryfikacja metryk, przebudowa eksploratora na podgląd SVG, eksport czystych SVG, audyt zależności i kosztów Cloud SQL).

---

## 1. Architektura Single-User / Private Tool (Model Jednoosobowy)

### Diagnoza i Uzasadnienie Refaktoryzacji
W pierwotnej implementacji baza danych posiadała naleciałości wielodostępowej architektury SaaS (tabela `users`, powiązania `userId`, podział na katalogi publiczne i prywatne, sprawdzanie uprawnień w endpointach API). W narzędziu dedykowanym jednemu użytkownikowi (Private Single-Operator Tool) architektura ta generowała niepotrzebną złożoność, sztuczne blokady logowania w edytorze oraz narzut sieciowy.

### Wprowadzone Zmiany Architektoniczne:
1. **Usunięcie tabeli `users` z bazy danych:**
   - W schemacie Drizzle (`src/db/schema.ts`) usunięto tabelę `users` oraz relacje `usersRelations` i `author`.
   - Z tabeli `circuits` usunięto kolumnę klucza obcego `user_id`. Wszystkie obwody w bazie należą bezpośrednio do aplikacji i jej właściciela.
   - Usunięto zbędny plik `src/db/users.ts`.
2. **Odchudzenie Middleware Autoryzacji (`src/middleware/auth.ts`):**
   - Usunięto operację synchronizacji/zapisu użytkowników do bazy danych PostgreSQL (`getOrCreateUser`).
   - Logowanie kontem Google (Firebase SSO) pełni wyłącznie rolę **bramki weryfikacji tożsamości właściciela (Owner Identity Gatekeeper)** bez tworzenia bazy użytkowników.
3. **Uproszczenie Warstwy Zapytań (`src/db/circuits.ts` oraz `src/api/circuits.router.ts`):**
   - Metody `getCircuitsFromDb()`, `getCircuitByIdFromDb(id)`, `insertCircuitToDb()` oraz `deleteCircuitFromDb(id)` nie filtrują już po identyfikatorze `userId`.
   - W edytorze i katalogu zniesiono sztuczne blokady `user &&` – właściciel ma bezpośredni dostęp do tworzenia, edycji i usuwania schematów.

---

## 2. UI Paska Nawigacji Górnej (`TopNavbar.tsx`)

- **Usunięcie nadmiarowego przycisku:**
  - Usunięto ikonkę `Baza SQL` znajdującą się pomiędzy pozycją „O programie” a awatarem użytkownika Google w prawym panelu sterowania (`TopNavbar.tsx`).
- **Dostęp do Panelu Administratora:**
  - Zgodnie z zasadami czystego UI, wejście do Panelu Administratora Bazy Danych jest dostępne w rozwijanym menu profilu użytkownika (`UserAuthButton`) oraz w menu mobilnym.

---

## 3. Przegląd & Metryki – Eliminacja Sztucznych Wskaźników

### Usunięcie Martwych Danych i Autentyczna Telemetria:
- Zastąpiono sztywne, sztuczne teksty autentycznym sondowaniem połączenia PostgreSQL (`probePostgresConnection()` w `src/api/database.router.ts`).
- Serwer wykonuje realne zapytanie SQL:
  ```sql
  SELECT inet_server_addr() as host, inet_server_port() as port, current_database() as db, version() as version, NOW() as now;
  ```
- **Obsługa stanów połączenia:**
  - **Online:** Wyświetla rzeczywisty adres hosta, port, nazwę bazy, precyzyjną wersję PostgreSQL oraz rzeczywistą latencję zapytania (ping) w milisekundach.
  - **Offline / Standalone:** Jeśli połączenie z Cloud SQL nie jest aktywne lub timeout przekroczy 2500ms, panel **nie wyświetla fałszywego zielonego statusu „Połączono”**, lecz rzetelnie informuje: *„Tryb Lokalny / Standalone (Brak instancji Cloud SQL)”* oraz wskazuje bieżący magazyn lokalny (`/public/resources/` i `localStorage`).

### Ujednolicenie Etykiet Pól:
Zgodnie z wymaganiami zadania zaktualizowano etykiety kart statystyk na następujące:
1. **Obwody (`circuits`)** – liczba zsyntetyzowanych schematów wektorowych SVG.
2. **Symbole (`circuit_symbols`)** – liczba zindeksowanych punktów fizycznych, wzorów i parametrów.
3. **Kroki (`socratic_steps`)** – liczba 4-etapowych pytań sokratejskich.
4. **Konta (`users`)** – wartość `1` z etykietą: *Model Single-User (Właściciel)*.

---

## 4. Eksplorator Danych – Nowy Widok Wizualny Schematów SVG

Zamiast surowej tabeli bazodanowej (typu phpMyAdmin z podglądem kodu JSON), wdrożono dedykowany **Eksplorator Schematów SVG** (`src/components/modals/database/DatabaseTableBrowserTab.tsx`):
- **Wizualny podgląd graficzny SVG:** Każdy obwód posiada dedykowany panel renderujący wektor XML SVG ze skalowaniem `viewBox`, pozwalający natychmiast ocenić poprawność geometrii obwodu.
- **Wypunktowane Symbole:** Czytelna, punktowana lista komponentów (`• D1 (1N4007) - Dioda prostownicza — [UF ≈ 0.7V]`) bez aktywnych linków.
- **Wypunktowane Pytania:** Czytelna, numerowana lista 4 etapów sokratejskich z pytaniem wiodącym – bez aktywnych odnośników.
- **Wyszukiwarka:** Filtrowanie w czasie rzeczywistym po tytule lub ID układu.

---

## 5. Audyt Funkcji Administracyjnych i Eksport Czystych SVG

### Ocena Zasadności Funkcji Administracyjnych:
1. **„Przywróć obwody wzorcowe (Re-seed)”:**
   - **Ocena:** **W pełni zasadna i krytyczna dla odporności aplikacji.**  
   - W przypadku przypadkowego usunięcia schematów fabrycznych (`half-wave-rectifier`, `npn-common-emitter`, `zener-regulator`), funkcja natychmiast odczytuje definicje z `/public/resources/` i przywraca stan początkowy w bazie PostgreSQL.
2. **„Eksportuj zrzut bazy (JSON Backup)” – Zmiana Założenia:**
   - **Ocena:** Dotychczasowy pełny zrzut JSON (z pytaniami, historią sesji, punktami kontrolnymi) naruszał koncepcję uniwersalności wektorów i uzależniał dane od silnika mentora.
   - **Nowe Rozwiązanie:** **Eksport generuje wyłącznie czyste pliki SVG (`.svg`)**.
   - Plik SVG zawiera kompletny nagłówek XML, poprawne deklaracje `xmlns`, `viewBox` oraz style, bez jakichkolwiek powiązanych pytań dydaktycznych, wyników czy punktów kontrolnych.
   - Użytkownik może pobrać pojedynczy schemat przyciskiem **„Pobierz SVG”** lub wyeksportować wszystkie obwody jednym kliknięciem z poziomu zakładki *Przegląd & Metryki*.

---

## 6. Zarządzanie Bazą SQL i Niezależność Offline

- Przygotowano plik schematu SQL: **`public/resources/deschema-schema.sql`** oraz dedykowany endpoint `GET /api/database/schema-sql`.
- W zakładce **„Schemat & DDL”** dodano przycisk **„Pobierz plik SQL (.sql)”** oraz **„Kopiuj DDL”**.
- Zawarto pełną specyfikację tabel (`circuits`, `circuit_symbols`, `socratic_steps`) wraz z indeksami relacyjnymi.
- Dodano instrukcję uruchomienia aplikacji z lokalnym kontenerem PostgreSQL (`docker run --name deschema-pg -p 5432:5432 postgres:15-alpine`), co zapewnia 100% odporności na brak dostępu do sieci i niezależność od chmury.

---

## 7. Audyt Zależności Chmurowych (Google Cloud SQL)

| Parametr / Komponent | Stan w Google Cloud SQL | Alternatywa Lokalna / Zero-Cost | Wnioski i Rekomendacje |
| :--- | :--- | :--- | :--- |
| **Typ instancji** | `db-f1-micro` (1 vCPU, 0.6 GB RAM) | Lokalny Docker / SQLite | Minimalna instancja Cloud SQL generuje stały koszt ok. 7–10 USD/miesiąc nawet przy zerowym ruchu. |
| **Magazyn danych** | Min. 10 GB SSD Persistent Disk | System plików / wolumen Docker | Schematy wektorowe SVG zajmują kilkadziesiąt kilobajtów; 10 GB to ogromny nadmiar. |
| **Połączenia i Pooling** | Limit 25–50 połączeń równoległych | Singleton pool w `src/db/index.ts` | Model jednoosobowy wymaga maksymalnie 2–5 połączeń; pool `max: 10` jest w pełni bezpieczny. |
| **Egress (Ruch sieciowy)** | Opłaty za transfer wychodzący poza region GCP | Brak opłat | Eksport plików SVG generuje pomijalny transfer (rzędu kilkunastu KB). |
| **Rekomendacja Kosztowa** | W środowisku produkcyjnym Cloud SQL warto rozważyć Cloud SQL Auth Proxy lub migrację na darmowy tier Neon/Supabase (0 USD) albo lokalny kontener SQLite/Docker. |

---

## 8. Status Weryfikacji Technicznej

- `compile_applet`: **Build succeeded** (brak błędów kompilacji Vite/TypeScript).
- `lint_applet`: **0 błędów** (`tsc --noEmit` zakończone sukcesem).
