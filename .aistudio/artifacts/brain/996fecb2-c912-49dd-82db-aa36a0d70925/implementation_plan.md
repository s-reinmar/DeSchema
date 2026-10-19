# Plan: Ujednolicenie Prezentacji Symboli i Likwidacja Artefaktów LaTeX

Ujednolicenie systemu renderowania symboli fizycznych, indeksów dolnych i górnych oraz wzorów matematycznych w aplikacji DeSchema Mentor w celu całkowitego usunięcia niepożądanych artefaktów składni LaTeX (takich jak `&`, `_`, `{`, `}`, `$` czy niesparsowane komendy `\frac`).

> [!IMPORTANT]
> **Kluczowe decyzje uzgodnione z użytkownikiem w fazie pytań:**
> - **Zakres wdrożenia:** Pełne ujednolicenie i oczyszczenie we wszystkich modułach aplikacji: czat sokratejski, karty kroków dydaktycznych, schemat wektorowy SVG, popovery *Show-Up* oraz modale ściągawek.
> - **Styl wzorów:** Czysty, semantyczny HTML z indeksami dolnymi (`<sub>`), górnymi (`<sup>`) oraz naturalnymi symbolami Unicode (np. $\Delta$, $\pi$, $\beta$, $\approx$, $\ge$, $\le$, $\cdot$, $\parallel$, $\sqrt$).
> - **Schemat wektorowy SVG:** Dynamiczny parser etykiet SVG w czasie renderowania, przekształcający etykiety tekstowe zawierające składnię indeksów na estetyczne węzły `<tspan>` o zmniejszonej skali i właściwym przesunięciu `dy`.

---

## 1. Przegląd i Cel Architektoniczny

Obecnie w części komponentów (np. w nagłówkach niektórych kart) symbole są renderowane poprawnie, jednak w innych miejscach (dialog czatu Gemini, pytania sokratejskie, podpowiedzi, refleksje kroków oraz surowa treść `<text>` wewnątrz SVG) pojawiają się surowe znaczniki LaTeX:
- podkreślniki i klamry: `U_{in}`, `C_{filtr}`, `R_b1`, `V_D`, `U_{CE,sat}`,
- separatory i znaczniki wyrównania: `&`, `\\`,
- ograniczniki wzorów: `$`, `$$`,
- komendy ułamków i symboli: `\frac{...}{...}`, `\quad`, `\cdot`.

Wprowadzona zostanie jednolita, wielowarstwowa architektura formatowania i oczyszczania tekstu (`SchematicTextFormatter`), która gwarantuje spójną typografię inżynierską w całym systemie bez naruszania zasad SOLID i bez wprowadzania bibliotek z zewnętrznych źródeł podatnych na awarie.

---

## 2. Doświadczenie Użytkownika i Kierunek Wizualny

- **Czat Sokratejski:** Odpowiedzi mentora i pytania ucznia automatycznie renderują symbole indeksowane ($U_{in}$, $I_C$, $R_{b1}$, $\beta$) w kolorze akcentowym (`text-cyan-300`), z usuniętymi znakami `&`, `$` i czystym zapisem ułamkowym lub iloczynowym.
- **Kroki Sokratejskie:** Treść pytania, podpowiedzi (`hint`) oraz weryfikacji fizycznej (`reflectionAnswer`) jest przepuszczana przez formater typograficzny, zapewniając eleganckie indeksy dolne i górne.
- **Wektorowy Schemat SVG:** Napisy wewnątrz schematu SVG (np. $U_{in}$, $D_1$, $C_{filtr}$, $R_L$, $Q_1$, $R_{b1}$) renderują się z natywnym indeksem dolnym (poprzez `<tspan dy="3" font-size="0.75em">`), bez surowych znaków `_` ani `{}`.
- **Karty "Show-Up" i Ściągawka Praw:** Złożone wzory fizyczne (np. dobór pojemności filtra, bilans prądów węzła) są czytelne, pozbawione surowego kodu LaTeX.

---

## 3. Kluczowe Decyzje i Architektura Rozwiązania

```
┌─────────────────────────────────────────────────────────────────┐
│               SchematicTextFormatter (Utility Domain)            │
│  - formatSchematicLabel(text): React.ReactNode (Badge/Inline)   │
│  - formatRichScientificText(text): React.ReactNode (Prose/Chat) │
│  - formatFormulaHtml(formula): React.ReactNode (Math Formulas)  │
│  - sanitizeSvgTextLabels(svgContent): string (SVG <tspan> engine)│
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
      ┌────────▼────────┐        ┌────────▼────────┐
      │  Warstwa Widoku │        │  Wektorowy SVG  │
      │  - ChatPanel    │        │  - SvgViewer    │
      │  - StepSection  │        │    (przetwarza  │
      │  - ShowUpCard   │        │     <text> na   │
      │  - Cheatsheet   │        │     <tspan>)    │
      └─────────────────┘        └─────────────────┘
```

1. **Unifikacja silnika formatowania (`src/utils/label-formatter.tsx`):**
   - Dodanie metody `formatRichScientificText(text: string): React.ReactNode` – parsującej dłuższe bloki prozy (z czatu AI i podpowiedzi kroków), usuwającej śmieci `&`, `$`, `$$`, `\quad` i zamieniającej symbole z indeksami oraz grekę na elementy HTML `<sub>` / `<sup>` i glify Unicode.
   - Dodanie metody `formatFormulaHtml(formula: string): React.ReactNode` – dedykowanej dla wzorów z `\frac{licznik}{mianownik}`, zamieniającej ułamek LaTeX na czytelny zapis `licznik / mianownik` lub miniaturową strukturę ułamkową z kreską ułamkową.
   - Dodanie metody `sanitizeSvgTextLabels(svgContent: string): string` – dynamicznie transformującej etykiety `<text>..._{...}...</text>` wewnątrz łańcucha SVG na zagnieżdżone `<tspan dy="3" font-size="0.72em">` i resetujące `<tspan dy="-3">`, dzięki czemu grafika wektorowa wyświetla poprawne indeksy w każdym silniku przeglądarki.
2. **Aktualizacja instrukcji w `server.ts`:**
   - Dodanie do System Promptu instrukcji dla modeli Gemini, aby unikały składni tabelarycznej LaTeX (`&`, `\begin{aligned}`, `$$`), a wzory podawały w czytelnej notacji z indeksami dolnymi (np. `U_in`, `R_b1`, `I_C`) lub w notacji Unicode.
3. **Zastosowanie formatera w komponentach:**
   - `SocraticChatPanel.tsx`: użycie ujednoliconego formatera prozy i wzorów.
   - `SocraticStepSection.tsx`: otoczenie `currentStep.promptQuestion`, `hint` oraz `reflectionAnswer` ujednoliconym parserem.
   - `SvgSchematicViewer.tsx`: zintegrowanie `sanitizeSvgTextLabels` przed przekazaniem do `dangerouslySetInnerHTML`.
   - `SymbolShowUpPopover.tsx`: formatowanie pól `formula`, `formulaDescription`, `physicalRole` i `explanation`.
   - `CheatsheetModal.tsx`: weryfikacja wszystkich wzorów pod kątem czystości typograficznej.

---

## 4. Plan Weryfikacji

1. **Weryfikacja kompilacji i typowania:** Uruchomienie `compile_applet` i `lint_applet` (`tsc --noEmit`) – brak błędów.
2. **Weryfikacja schematów SVG:** Sprawdzenie wyświetlania napisów na schematach prostownika, wzmacniacza OE i stabilizatora Zenera pod kątem braku widocznych znaków `_` i `{}`.
3. **Weryfikacja czatu i kroków:** Test renderowania symboli w oknie czatu i w blokach pytań sokratejskich.
4. **Raport architektoniczny:** Sporządzenie dokumentacji w `docs/changes/` zgodnie z zasadami projektu.
