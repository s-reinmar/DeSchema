# Raport Zmian: Sterowanie Zaliczeniem Etapów przez Czat oraz Ujednolicenie Alfabetu Greckiego

**Data:** 20 października 2026  
**Autor:** @s-reinmar  
**Zgłoszenie / Zakres:**
1. Zablokowanie manualnego klikania „Ukończono” przez użytkownika – zaliczeniem etapu steruje wyłącznie czat po udzieleniu merytorycznie poprawnej odpowiedzi.
2. Ujednolicenie występowania liter alfabetu greckiego oraz notacji fizyko-technicznej w całej aplikacji.

---

## 1. Sterowanie Ukończeniem Kroków (Chat-Authoritative Completion)

### Problem:
- Pole „Ukończono (Tak/Nie)” w sekcji pytań sokratejskich było interaktywnym przyciskiem, który użytkownik mógł kliknąć i ręcznie zmienić status zaliczenia etapu.
- Dodatkowo, wysłanie jakiejkolwiek wiadomości na czacie (nawet „nie wiem” lub „pomocy”) natychmiastowo i przedwcześnie zaliczało etap w aplikacji.

### Rozwiązanie i Zmiany Architektoniczne:
1. **Pasywny wskaźnik statusu w widoku:**
   - W pliku `src/components/SocraticStepSection.tsx` zastąpiono element `<button>` czystym, nieklikalnym elementem `<span>` o dedykowanej stylistyce badge'a statusowego.
   - Użytkownik nie ma możliwości manualnego kliknięcia ani przełączenia stanu ukończenia.
   - Stan etapu (dyskretny wskaźnik `Tak` / `Nie`) jest w 100% zdeterminowany zewnętrznie przez stan sesji pedagogicznej.
2. **Autoryzacja zaliczenia przez mentora AI / heurystyki offline:**
   - W `server.ts` rozbudowano instrukcję systemową dla modeli Gemini (`buildSocraticSystemInstruction`), nakazując modelowi analizę poprawności fizycznej hipotezy ucznia pod kątem bieżącego pytania sokratejskiego.
   - Jeśli odpowiedź ucznia jest poprawna, model dołącza znacznik `[STEP_COMPLETED]`, a serwer zwraca flagę `stepCompleted: true`.
   - Zabezpieczono silnik zapasowy offline (`generateOfflineSocraticResponse`): prośby o pomoc („nie wiem”, „pomóż”, „wyjaśnij”) nie zaliczają kroku, a odpowiedzi zawierające poprawne pojęcia fizyczne (polaryzacja zaporowa, stała czasowa, tętnienia, PIV, stan diody, bilans Kirchhoffa itp.) skutkują zaliczeniem etapu.
3. **Synchronizacja w panelu czatu (`SocraticChatPanel.tsx`):**
   - Usunięto natychmiastowe wywołanie `onStepAutoCompleted` przy zdarzeniu `submit`.
   - Zaliczenie etapu `onStepAutoCompleted(stepNumber)` następuje wyłącznie wtedy, gdy odpowiedź mentora potwierdza zaliczenie (`stepCompleted: true`).
   - W dymku wiadomości mentora pojawia się elegancki, zielony badge: `✓ Etap zaliczony poprawną odpowiedzią!`.

---

## 2. Ujednolicenie Liter Alfabetu Greckiego i Notacji Technicznej

### Problem:
- W różnych częściach schematów, opisów, wzorów i pytań symbole greckie występowały w niespójnych formatach: LaTeX (`\beta`, `\Delta`, `\Omega`, `\tau`), formy słowne bez ukośnika (`Delta`, `beta`, `tau`, `pi`, `kohm`, `uF`), a także zduplikowane punkty kodowe Unicode (np. znak Ohma `\u2126` vs grecka Omega `\u03A9`, znak mikro `\u00B5` vs greckie mi `\u03BC`, warianty symboli `ϑ`, `ϕ`, `ϖ`).
- Część wyrażeń w tekście nie była rozpoznawana i renderowała się jako zwykły tekst bez odpowiedniego formatowania naukowego.

### Rozwiązanie w module `SymbolParser` (`src/utils/symbol-parser.ts`):
1. **Kanonizacja wariantów Unicode (`GREEK_CANONICAL_MAP`):**
   - Wszystkie znaki kompatybilnościowe są natychmiast mapowane do oficjalnych greckich znaków bazowych Unicode (np. `\u2126` -> `Ω`, `\u00B5` -> `μ`, `\u03D1` -> `θ`, `\u03D5` -> `φ`, `\u03D6` -> `π`, `\u03F1` -> `ρ`, `\u03F5` -> `ε`, `\u03F0` -> `κ`).
2. **Kompletna baza liter greckich (Majuskuła i Minuskuła):**
   - Rozszerzono mapowanie `LATEX_SYMBOL_MAP` o wszystkie 24 litery alfabetu greckiego w wersji wielkiej (`\Alpha` ... `\Omega`) oraz małej (`\alpha` ... `\omega`).
   - Rozszerzono `GREEK_WORDS_MAP` o nazwy słowne wielką i małą literą (`Delta` -> `Δ`, `Beta` -> `Β`, `beta` -> `β`, `tau` -> `τ`, `pi` -> `π`, `omega` -> `ω`, `Omega` -> `Ω` itp.).
3. **Jednostki inżynierskie:**
   - Automatyczna normalizacja jednostek: `kohm` / `kOhm` / `kOmega` -> `kΩ`, `Mohm` / `MOhm` -> `MΩ`, `Gohm` -> `GΩ`, `ohm` / `Ohm` -> `Ω`.
   - Normalizacja prefiksu mikro: `470uF` -> `470 μF`, `10uH` -> `10 μH`, `1uA` -> `1 μA`.
4. **Obsługa zakresu Unicode `[\u0370-\u03FF]`:**
   - W funkcji `formatRichScientificText` zaktualizowano wyrażenia regularne do pełnego bloku Unicode greki i koptyjskiego, dzięki czemu każda grecka litera w zdaniu (np. `β`, `τ`, `ΔU_wy`, `I_C = β · I_B`) jest poprawnie stylizowana.
5. **Poprawne tagi `<tspan>` w SVG (`sanitizeSvg`):**
   - Zastąpiono niezamknięte tagi `<tspan dy="...">` prawidłowymi atrybutami SVG `<tspan baseline-shift="sub">` oraz `<tspan baseline-shift="super">`, gwarantując pełną zgodność ze standardem SVG.

---

## 3. Podsumowanie Weryfikacji

- **Kompilacja TypeScript / Vite:** Brak błędów.
- **Linter (ESLint):** Brak ostrzeżeń i błędów.
- **Zasady SOLID:** Logika parsowania greki i formuł pozostaje w headless klasie `SymbolParser` (SRP, DIP), a widoki korzystają z czystych, otypowanych interfejsów bez użycia typu `any`.
