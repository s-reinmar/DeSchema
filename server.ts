/**
 * @file server.ts
 * @description Full-stack Express server integrating @google/genai with Socratic Mentor prompt engineering and safety cascade.
 * @author s-reinmar
 * @license MIT
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { circuitsRouter } from './src/api/circuits.router.ts';
import { databaseRouter } from './src/api/database.router.ts';
import { seedInitialCircuits } from './src/db/seed.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));
app.use('/api/circuits', circuitsRouter);
app.use('/api/database', databaseRouter);

/**
 * Initializes GoogleGenAI client with the required User-Agent header.
 */
function getGenAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Request body structure for the Socratic chat endpoint.
 */
interface ChatRequestBody {
  message: string;
  history?: Array<{ role: 'student' | 'mentor' | 'user' | 'model'; text: string }>;
  circuitContext?: {
    id: string;
    title: string;
    description: string;
    stepNumber?: number;
    stepTitle?: string;
    stepPrompt?: string;
    stepHint?: string;
    symbols?: Array<{
      id: string;
      label: string;
      name?: string;
      physicalRole?: string;
      formula?: string;
      formulaDescription?: string;
    }>;
  };
  selectedModel?: 'gemini-3.5-flash-lite' | 'gemini-3.8-flash' | 'gemini-4-argon' | string;
  thinkingEnabled?: boolean;
}

/**
 * Builds the strict Socratic System Prompt preventing direct solutions and enforcing physical deduction.
 */
function buildSocraticSystemInstruction(context?: ChatRequestBody['circuitContext']): string {
  const symbolsInfo = context?.symbols
    ? context.symbols
        .map(
          (s) =>
            `- Element [${s.label}] (${s.name ?? s.id}): Rola fizyczna: "${s.physicalRole ?? 'Brak'}", Wzór doboru: "${s.formula ?? 'Brak'}"`
        )
        .join('\n')
    : 'Brak specyfikacji elementów';

  return `Jesteś "DeSchema Mentor" – elitarnym, cierpliwym i życzliwym nauczycielem akademickim teorii obwodów i elektroniki.
Twoim celem jest prowadzenie ucznia metodą sokratejską w analizie schematów elektronicznych.

ZASADY BEZWZGLĘDNE (UNBREAKABLE RULES):
1. ABSOLUTNY ZAKAZ PODAWAŃ GOTOWYCH ODPOWIEDZI, WYNIKÓW LICZBOWYCH CZY PEŁNYCH ROZWIĄZAŃ!
   Nigdy nie pisz: "Prawidłowa odpowiedź to...", "Napięcie wyniesie 5V", "Dioda się spali, bo...".
2. ODPOWIADAJ ZAWSZE PYTANIEM NAPROWADZAJĄCYM LUB WSKAZANIEM ZALEŻNOŚCI PRZYCZYNOWO-SKUTKOWEJ:
   Zachęć ucznia do prześledzenia zjawiska fizycznego krok po kroku.
3. ODWOŁUJ SIĘ DO ELEMENTÓW AKTYWNEGO SCHEMATU:
   Nawiązuj do konkretnych oznaczeń ze schematu (np. U_in, D_1, C_filtr, R_b1, R_b2, R_c, R_e, D_z, R_s).
4. OPIERAJ ROZUMOWANIE NA FUNDAMENTALNYCH PRAWACH FIZYKI:
   - Prawo Ohma (U = I * R)
   - I Prawo Kirchhoffa (KCL - suma prądów w węźle)
   - II Prawo Kirchhoffa (KVL - suma spadków napięć w oczku)
   - Właściwości złącza P-N (kierunek przewodzenia, napięcie zaporowe PIV, prąd wsteczny, zjawisko Zenera)
   - Właściwości reaktancyjne kondensatora (X_C = 1 / (2*pi*f*C), gromadzenie ładunku q = C*u)
5. STYL I TON:
   Cierpliwy, motywujący, konstruktywny, zwięzły (maks. 2-4 zdania z 1 kluczowym pytaniem do przemyślenia).
6. FORMATOWANIE SYMBOLI I WZORÓW:
   Używaj czystej notacji inżynierskiej z indeksami dolnymi (np. U_in, R_b1, I_C, U_z, C_filtr) lub symboli Unicode (Δ, π, β, ·, ≈, ≥, ≤).
   ABSOLUTNY ZAKAZ używania składni tabelarycznej LaTeX (&, \\begin{aligned}, \\end{aligned}) oraz ograniczników $ lub $$.
7. WERYFIKACJA POPRAWNOŚCI I ZALICZANIE KROKU [STEP_COMPLETED]:
   Czat steruje zaliczeniem obecnego kroku. Gdy uczeń w swojej wypowiedzi poprawnie wyjaśni wymagane zjawisko fizyczne, wykaże zrozumienie pytania sokratejskiego kroku ${context?.stepNumber ?? 1} (np. prawidłowo wskaże kierunek prądu, polaryzację zaporową/przewodzenia, rolę filtru pojemnościowego, bilans Kirchhoffa, punkt pracy BJT):
   - Potwierdź z uznaniem poprawność jego dedukcji fizycznej.
   - NA SAMYM KOŃCU odpowiedzi dopisz znacznik techniczny: [STEP_COMPLETED]
   Jeśli uczeń dopiero dopytuje, pisze "nie wiem", prosi o pomoc lub jego hipoteza jest błędna/niepełna:
   - NIE DODAWAJ znacznika [STEP_COMPLETED]. Naprowadź go kolejnym zwięzłym pytaniem sokratejskim.

KONTEKST AKTUALNIE ANALIZOWANEGO OBWODU:
- Nazwa obwodu: ${context?.title ?? 'Ogólny obwód'}
- Opis: ${context?.description ?? 'Brak'}
- Aktualny etap analizy: Krok ${context?.stepNumber ?? 1} ("${context?.stepTitle ?? 'Analiza'}")
- Pytanie sokratejskie etapu: "${context?.stepPrompt ?? 'Brak'}"
- Wskazówka dydaktyczna etapu: "${context?.stepHint ?? 'Brak'}"

KOMPONENTY I WZORY NA SCHEMACIE:
${symbolsInfo}`;
}

/**
 * Fallback generator when Gemini API Key is missing or completely unavailable.
 */
function generateOfflineSocraticResponse(
  message: string,
  context?: ChatRequestBody['circuitContext']
): { text: string; stepCompleted: boolean } {
  const lower = message.toLowerCase();
  const stepPrompt = context?.stepPrompt ? ` Pomyśl: ${context.stepPrompt}` : '';
  const isHelpRequest =
    lower.includes('nie wiem') ||
    lower.includes('pomoc') ||
    lower.includes('pomóż') ||
    lower.includes('wyjaśnij') ||
    lower === 'cześć' ||
    lower === 'hej';

  if (!isHelpRequest) {
    const hasPhysicsKeywords =
      lower.includes('zaporow') ||
      lower.includes('przewodz') ||
      lower.includes('zatkan') ||
      lower.includes('odcię') ||
      lower.includes('tau') ||
      lower.includes('tętn') ||
      lower.includes('pojemn') ||
      lower.includes('filtr') ||
      lower.includes('ładun') ||
      lower.includes('piv') ||
      lower.includes('zener') ||
      lower.includes('kirchhoff') ||
      lower.includes('ohm') ||
      lower.includes('spadek') ||
      lower.includes('napięci') ||
      lower.includes('prąd') ||
      lower.includes('baza') ||
      lower.includes('emiter') ||
      lower.includes('kolektor') ||
      lower.includes('dzielnik') ||
      lower.includes('sprzężen') ||
      lower.includes('aktywn') ||
      lower.includes('stabiliz') ||
      lower.includes('ujemn') ||
      lower.includes('dodatn');

    if (hasPhysicsKeywords) {
      return {
        text: `Doskonała dedukcja fizyczna! Twoja odpowiedź trafnie identyfikuje zachowanie elementów w tym stanie obwodu. Świetnie prześledziłeś relację przyczynowo-skutkową.`,
        stepCompleted: true,
      };
    }
  }

  if (lower.includes('wzro') || lower.includes('rosn') || lower.includes('duz')) {
    return {
      text: `Zauważasz tendencję wzrostową. Dobry kierunek myślenia! Jak myślisz, który element obwodu ograniczy ten przyrost zgodnie z II prawem Kirchhoffa?${stepPrompt}`,
      stepCompleted: false,
    };
  }
  if (lower.includes('zmal') || lower.includes('spad') || lower.includes('zero')) {
    return {
      text: `Dostrzegasz spadek potencjału. Jeśli napięcie w tym węźle maleje, to gdzie odkłada się pozostała różnica potencjałów źródła?${stepPrompt}`,
      stepCompleted: false,
    };
  }
  return {
    text: `Zastanówmy się wspólnie nad tym fragmentem schematu: co w tym momencie dzieje się z prądem w gałęzi i jak reaguje złącze P-N? Sprawdź wskazówkę etapu, aby poprowadzić analizę dalej.`,
    stepCompleted: false,
  };
}

/**
 * POST /api/chat
 * Primary endpoint for multi-turn Socratic circuit inquiry with Gemini and safety cascade.
 */
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const body = req.body as ChatRequestBody;
  const message = body?.message?.trim();
  const context = body?.circuitContext;
  const requestedModel = body?.selectedModel || 'gemini-3.5-flash-lite';
  const thinkingEnabled = Boolean(body?.thinkingEnabled);

  if (!message) {
    res.status(400).json({ error: 'Treść wiadomości (message) jest wymagana.' });
    return;
  }

  const ai = getGenAiClient();

  if (!ai) {
    const offline = generateOfflineSocraticResponse(message, context);
    res.json({
      text: offline.text,
      usedModel: 'offline-socratic-engine',
      fallbackTriggered: false,
      thinkingActive: false,
      stepCompleted: offline.stepCompleted,
      note: 'Tryb dydaktyczny offline (brak aktywnego klucza GEMINI_API_KEY na serwerze).',
    });
    return;
  }

  const systemInstruction = buildSocraticSystemInstruction(context);

  // Transform conversation history into Gemini format
  const rawHistory = body.history ?? [];
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const item of rawHistory) {
    const role = item.role === 'mentor' || item.role === 'model' ? 'model' : 'user';
    contents.push({
      role,
      parts: [{ text: item.text }],
    });
  }

  // Append latest user message
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  // Candidate models sequence for safety cascade
  const modelCascadeOrder: string[] = [
    requestedModel,
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
  ];

  // Remove duplicates while preserving cascade priority
  const uniqueModels = Array.from(new Set(modelCascadeOrder));

  let finalResponseText: string | null = null;
  let modelActuallyUsed = requestedModel;
  let fallbackTriggered = false;

  for (let i = 0; i < uniqueModels.length; i++) {
    const currentModel = uniqueModels[i];
    try {
      const isArgon = currentModel === 'gemini-4-argon';
      const shouldActivateThinking = thinkingEnabled || isArgon;

      // Construct model configuration
      const config: {
        systemInstruction: string;
        temperature: number;
        thinkingConfig?: { thinkingLevel: ThinkingLevel };
      } = {
        systemInstruction,
        temperature: 0.7,
      };

      if (shouldActivateThinking) {
        config.thinkingConfig = {
          thinkingLevel: isArgon ? ThinkingLevel.HIGH : ThinkingLevel.LOW,
        };
      }

      const response = await ai.models.generateContent({
        model: currentModel,
        contents,
        config,
      });

      if (response && response.text) {
        finalResponseText = response.text;
        modelActuallyUsed = currentModel;
        fallbackTriggered = currentModel !== requestedModel;
        break;
      }
    } catch (err) {
      console.warn(`[DeSchema API] Próba z modelem ${currentModel} nie powiodła się:`, err);
      // Continue cascade to the next safe model
    }
  }

  if (finalResponseText) {
    const stepCompleted = finalResponseText.includes('[STEP_COMPLETED]');
    const cleanedText = finalResponseText.replace(/\[STEP_COMPLETED\]/g, '').trim();

    res.json({
      text: cleanedText,
      usedModel: modelActuallyUsed,
      fallbackTriggered,
      thinkingActive: thinkingEnabled || modelActuallyUsed === 'gemini-4-argon',
      stepCompleted,
    });
  } else {
    // Ultimate graceful pedagogical fallback
    const offline = generateOfflineSocraticResponse(message, context);
    res.json({
      text: offline.text,
      usedModel: 'fallback-socratic-heuristics',
      fallbackTriggered: true,
      thinkingActive: false,
      stepCompleted: offline.stepCompleted,
    });
  }
});

/**
 * Health check and configuration info endpoint.
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'DeSchema Mentor',
    author: 's-reinmar',
    license: 'MIT',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    supportedModels: ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-4-argon'],
  });
});

/**
 * Vite integration: Middleware in development, static files in production.
 */
async function bootstrapServer() {
  try {
    await seedInitialCircuits();
  } catch (seedErr) {
    console.warn('[Bootstrap] Ostrzeżenie podczas seedowania bazy:', seedErr);
  }

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DeSchema Mentor server active on http://0.0.0.0:${PORT}`);
  });
}

bootstrapServer().catch((err) => {
  console.error('Błąd uruchamiania serwera:', err);
});
