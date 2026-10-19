/**
 * @file predefined-circuits.ts
 * @description Catalog of built-in fundamental electronic circuits for DeSchema Mentor.
 * @author s-reinmar
 * @license MIT
 */

import type { Circuit } from '../types/circuit.types.ts';

import halfWaveRectifierData from '../../resources/half-wave-rectifier.json';
import npnCommonEmitterData from '../../resources/npn-common-emitter.json';
import zenerRegulatorData from '../../resources/zener-regulator.json';

export const PREDEFINED_CIRCUITS: readonly Circuit[] = [
  halfWaveRectifierData as Circuit,
  npnCommonEmitterData as Circuit,
  zenerRegulatorData as Circuit,
];
