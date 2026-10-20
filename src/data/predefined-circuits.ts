/**
 * @file predefined-circuits.ts
 * @description Catalog identifiers and endpoints for built-in electronic circuits served from /public/resources/.
 * @author @s-reinmar
 * @license MIT
 */

import type { CircuitCategory } from '../types/circuit.types.ts';

export const PREDEFINED_RESOURCE_FILES: readonly string[] = [
  'half-wave-rectifier.json',
  'npn-common-emitter.json',
  'zener-regulator.json',
];

export interface PredefinedCircuitMeta {
  readonly id: string;
  readonly title: string;
  readonly fileName: string;
  readonly category: CircuitCategory;
  readonly englishSlug: string;
}

export const PREDEFINED_CIRCUITS_META: readonly PredefinedCircuitMeta[] = [
  {
    id: 'half-wave-rectifier',
    title: 'Prostownik jednopołówkowy z filtrem pojemnościowym',
    fileName: 'half-wave-rectifier.json',
    category: 'Zasilacze',
    englishSlug: 'half-wave-rectifier',
  },
  {
    id: 'npn-common-emitter',
    title: 'Wzmacniacz tranzystorowy we wspólnym emiterze (OE)',
    fileName: 'npn-common-emitter.json',
    category: 'Wzmacniacze',
    englishSlug: 'npn-common-emitter',
  },
  {
    id: 'zener-regulator',
    title: 'Równoległy stabilizator parametryczny z diodą Zenera',
    fileName: 'zener-regulator.json',
    category: 'Zasilacze',
    englishSlug: 'zener-regulator',
  },
] as const;
