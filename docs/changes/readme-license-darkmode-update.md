# Raport: Aktualizacja README.md, usunięcie duplikatów licencji i domyślny tryb ciemny

**Projekt:** DeSchema Mentor  
**Autor:** @s-reinmar  
**Licencja:** MIT  
**Data:** 2026-10-19  

---

## 1. Zakres wprowadzonych zmian

Zrealizowano następujące cele określone przez użytkownika:
1. **Aktualizacja dokumentacji `README.md`:**
   - Zaktualizowano opis projektu do wersji **1.3.0**.
   - Uwzględniono nowo zaimplementowane moduły:
     - Moduł nawigacyjny **„Sesja”** (zapisywanie do JSON, wczytywanie sesji z JSON, historia poprzednich sesji).
     - Moduł **„Układy”** (`CircuitsManagerModal`) – modal z katalogiem obwodów i zarezerwowanym miejscem na nowe schematy.
     - Silnik podglądu wektorowego `SvgSchematicViewer`: dopasowanie do widoku (**Zoom-to-Fit**), powiększanie kółkiem myszy (**Wheel-Zoom**) z izolacją przewijania, ręczne przesuwanie (**Pan / Drag**), warstwa adnotacji i znaczników schematu (`SchematicAnnotationsLayer`).
     - Usunięcie zdublowanych kontrolek zoomu (usunięto przycisk resetu 100%, zachowano dopasowanie).
     - Adaptacyjny motyw ciemny i jasny z animacją przejścia (`350ms cubic-bezier`).
     - Zaktualizowano schemat architektury katalogów w projekcie.
2. **Usunięcie zdublowanych plików licencji i dokumentacji na GitHubie:**
   - Usunięto zbędny plik `licence`, pozostawiając kanoniczny plik `LICENSE` (MIT License).
   - Usunięto zbędny, pisany małymi literami plik `readme.md`, pozostawiając kanoniczny `README.md`.
3. **Ustawienie domyślnego trybu ciemnego:**
   - W `src/context/ThemeContext.tsx` usunięto automatyczne przełączanie na motyw jasny wynikające z systemowego zapytania mediów `prefers-color-scheme: light`.
   - Nowy użytkownik lub użytkownik bez zapisanych preferencji w `localStorage` zawsze rozpoczyna pracę w zoptymalizowanym pod kątem schematów **trybie ciemnym** (`'dark'`).

---

## 2. Weryfikacja jakościowa

- **Struktura repozytorium:** W korzeniu projektu znajduje się dokładnie jeden plik `LICENSE` oraz dokładnie jeden plik `README.md`.
- **Weryfikacja TypeScript (`npm run lint` / `tsc --noEmit`):** Zakończona sukcesem (0 błędów).
- **Kompilacja aplikacji (`compile_applet` / Vite build):** Zakończona sukcesem.
