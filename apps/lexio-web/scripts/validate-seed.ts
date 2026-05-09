/**
 * validate-seed.ts — validates seed-it-tech.json against the Card Zod schema.
 *
 * Run via: npx tsx scripts/validate-seed.ts
 * Also called by the typecheck pipeline to catch schema drift early.
 *
 * Exit code 0 = valid, 1 = invalid (prints errors).
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Seed card schema — subset of CardSchema (id/deckId/createdBy added by loader)
// ---------------------------------------------------------------------------

const WordFamilySchema = z
  .object({
    verb: z.string().optional(),
    noun: z.string().optional(),
    adj: z.string().optional(),
    adv: z.string().optional(),
  })
  .nullable()
  .optional(); // optional at seed level — seed cards may omit it

const SeedCardSchema = z.object({
  word: z.string().min(1),
  /** Legacy single-IPA (optional — prefer ipaUs/ipaUk) */
  ipa: z.string().nullable().optional(),
  ipaUs: z.string().nullable().optional(),
  ipaUk: z.string().nullable().optional(),
  definition: z.string().min(1),
  exampleSentence: z.string().nullable(),
  exampleTranslation: z.string().nullable(),
  audioWordUrl: z.string().url().nullable(),
  audioSentenceUrl: z.string().url().nullable(),
  imageUrl: z.string().url().nullable(),
  tags: z.array(z.string()).min(1),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).nullable(),
  exerciseTypes: z
    .array(z.enum(['flashcard', 'multiple_choice', 'type', 'listening', 'context']))
    .min(1),
  collocations: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  wordFamily: WordFamilySchema,
  etymology: z.string().nullable().optional(),
  frequencyRank: z.number().int().positive().nullable().optional(),
});

const SeedFileSchema = z.object({
  version: z.number().int().positive(),
  deck: z.object({
    title: z.string().min(1),
    description: z.string(),
  }),
  cards: z.array(SeedCardSchema).min(1),
});

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const seedPath = join(__dirname, '..', 'public', 'data', 'seed-it-tech.json');

let raw: unknown;
try {
  raw = JSON.parse(readFileSync(seedPath, 'utf-8'));
} catch (err) {
  console.error('Failed to read seed file:', seedPath);
  console.error(err);
  process.exit(1);
}

const result = SeedFileSchema.safeParse(raw);

if (!result.success) {
  console.error('Seed validation FAILED:');
  for (const issue of result.error.issues) {
    console.error(`  [${issue.path.join('.')}] ${issue.message}`);
  }
  process.exit(1);
}

const { cards } = result.data;
console.log(`Seed validation PASSED — ${cards.length} cards validated.`);

// Additional checks beyond Zod
const words = cards.map((c) => c.word);
const unique = new Set(words);
if (unique.size !== words.length) {
  const dupes = words.filter((w, i) => words.indexOf(w) !== i);
  console.error(`Duplicate words detected: ${dupes.join(', ')}`);
  process.exit(1);
}

if (cards.length < 30) {
  console.error(`Expected at least 30 cards, got ${cards.length}`);
  process.exit(1);
}

console.log('All checks passed.');
process.exit(0);
