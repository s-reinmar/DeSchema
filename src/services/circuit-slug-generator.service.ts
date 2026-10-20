/**
 * @file circuit-slug-generator.service.ts
 * @description Domain service for generating concise, semantic English slugs and classifying
 * electronic schematics into 4 canonical categories based on engineering terminology.
 * @author @s-reinmar
 * @license MIT
 */

import type { CircuitCategory } from '../types/circuit.types.ts';

const DICTIONARY_MAP: Readonly<Array<[RegExp, string]>> = [
  // Compound terms first
  [/szerokopasmow[yae]/gi, 'wideband'],
  [/przedwzmacniacz/gi, 'preamp'],
  [/wzmacniacz/gi, 'amplifier'],
  [/prostownik jednopo[łl]owkow[yae]/gi, 'half-wave-rectifier'],
  [/prostownik dwupo[łl]owkow[yae]/gi, 'full-wave-rectifier'],
  [/prostownik/gi, 'rectifier'],
  [/mostek graetz[a]?/gi, 'graetz-bridge'],
  [/stabilizator parametryczn[yae]/gi, 'shunt-regulator'],
  [/stabilizator/gi, 'regulator'],
  [/diod[aęy]\s+zener[a]?/gi, 'zener-diode'],
  [/zener[a]?/gi, 'zener'],
  [/filtr[em]*\s+pojemno[sś]ciow[ym]/gi, 'cap-filter'],
  [/filtr[em]*\s+dolnoprzepustow[ym]/gi, 'lowpass-filter'],
  [/filtr[em]*\s+g[oó]rnoprzepustow[ym]/gi, 'highpass-filter'],
  [/filtr/gi, 'filter'],
  [/wsp[oó]ln[yeym]\s+emiter[ze]*|\bOE\b/gi, 'common-emitter'],
  [/wsp[oó]ln[yeym]\s+baz[ieę]*|\bOB\b|\bCB\b/gi, 'common-base'],
  [/wsp[oó]ln[yeym]\s+kolektor[ze]*|\bOC\b/gi, 'common-collector'],
  [/tranzystorow[yae]/gi, 'transistor'],
  [/tranzystor/gi, 'transistor'],
  [/bipolarne?g?o?/gi, 'bjt'],
  [/przerzutnik/gi, 'flip-flop'],
  [/bramk[aię]/gi, 'gate'],
  [/licznik/gi, 'counter'],
  [/generator/gi, 'generator'],
  [/zasilacz/gi, 'power-supply'],
  [/napi[eę]ci[a]/gi, 'voltage'],
  [/w\.cz\.|\bwcz\b/gi, 'rf'],
  [/m\.cz\.|\bmcz\b/gi, 'af'],
  [/w\s+konfiguracji/gi, ''],
  [/uk[łl]ad/gi, 'circuit'],
  [/\b(ze?|z|w|we|oraz|dla|na|do)\b/gi, ''],
];

export class CircuitSlugGenerator {
  /**
   * Generates a clean, concise English slug from a circuit title.
   * If userSlug is provided, it sanitizes it to strict kebab-case.
   */
  public static generateEnglishSlug(title: string, userSlug?: string): string {
    if (userSlug && userSlug.trim()) {
      return CircuitSlugGenerator.sanitizeToKebabCase(userSlug);
    }

    if (!title || !title.trim()) {
      return 'circuit';
    }

    let translated = title.trim();

    // Replace known Polish terms with English counterparts
    for (const [pattern, replacement] of DICTIONARY_MAP) {
      translated = translated.replace(pattern, replacement);
    }

    return CircuitSlugGenerator.sanitizeToKebabCase(translated);
  }

  /**
   * Resolves display slug: if the raw ID is technical (like `ai-gen-1792400984372` or `custom-1729...`),
   * it intelligently generates an English slug from title, rather than showing raw number strings.
   */
  public static resolveDisplaySlug(rawId: string, title?: string, explicitSlug?: string): string {
    if (explicitSlug && explicitSlug.trim() && !/^ai-gen-|^custom-/.test(explicitSlug)) {
      return CircuitSlugGenerator.sanitizeToKebabCase(explicitSlug);
    }

    if (rawId && !/^ai-gen-|^custom-/.test(rawId)) {
      return CircuitSlugGenerator.sanitizeToKebabCase(rawId);
    }

    if (title && title.trim()) {
      return CircuitSlugGenerator.generateEnglishSlug(title);
    }

    return CircuitSlugGenerator.sanitizeToKebabCase(rawId || 'circuit');
  }

  /**
   * Automatically detects the most appropriate category based on terminology in title/description.
   */
  public static detectCategory(title: string, description?: string): CircuitCategory {
    const combined = `${title || ''} ${description || ''}`.toLowerCase();

    // 1. High frequency & filters
    if (
      /w\.cz\.|\bvhf\b|\buhf\b|\bmhz\b|\bghz\b|antena|rezonans|filtr|pasmow|lc\b|dolnoprzepust|górnoprzepust/.test(
        combined
      )
    ) {
      return 'Technika w.cz. i filtry';
    }

    // 2. Power supplies & rectifiers
    if (
      /zasilacz|prostownik|stabilizator|regulator|zener|graetz|lm317|tętnien|pojemnościow|dc-dc|przetwornic/.test(
        combined
      )
    ) {
      return 'Zasilacze';
    }

    // 3. Digital circuits
    if (/cyfrow|bramk|przerzutnik|ttl|cmos|logiczn|licznik|rejestr|\band\b|\bnand\b|\bnor\b|\bxor\b|zegar/.test(combined)) {
      return 'Układy cyfrowe';
    }

    // 4. Default to Amplifiers if transistor or amplifier related, or default category
    return 'Wzmacniacze';
  }

  /**
   * Converts any string into a clean, URL-safe kebab-case format (max 35 chars).
   */
  public static sanitizeToKebabCase(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, '')         // trim hyphens
      .slice(0, 35)                    // enforce max length
      .replace(/-+$/, '') || 'circuit';
  }
}
