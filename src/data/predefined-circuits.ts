/**
 * @file predefined-circuits.ts
 * @description Catalog identifiers and endpoints for built-in electronic circuits served from /public/resources/.
 * @author @s-reinmar
 * @license MIT
 */

/**
 * Static filenames served directly by the web server from /public/resources/
 * (Single Source of Truth - SSOT).
 */
export const PREDEFINED_RESOURCE_FILES: readonly string[] = [
  'half-wave-rectifier.json',
  'npn-common-emitter.json',
  'zener-regulator.json',
];

/**
 * Predefined catalog descriptors allowing instant navigation and labeling before fetch resolves.
 */
export const PREDEFINED_CIRCUITS_META = [
  {
    id: 'half-wave-rectifier',
    title: 'Prostownik jednopołówkowy z filtrem pojemnościowym',
    fileName: 'half-wave-rectifier.json',
  },
  {
    id: 'npn-common-emitter',
    title: 'Wzmacniacz tranzystorowy we wspólnym emiterze (OE)',
    fileName: 'npn-common-emitter.json',
  },
  {
    id: 'zener-regulator',
    title: 'Równoległy stabilizator parametryczny z diodą Zenera',
    fileName: 'zener-regulator.json',
  },
] as const;
