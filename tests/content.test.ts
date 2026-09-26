/** Glossary and coach content tests. */

import { describe, it, expect } from 'vitest';
import { CONCEPTS, findConcept, formatConcepts } from '../src/engine/glossary';
import { CURRICULUM, formatCurriculum } from '../src/engine/teach';
import { FIELD_NOTES, whyFor, formatWhy, WHY_BLOCKS } from '../src/engine/coach';

describe('glossary', () => {
  it('has unique ids and non-empty bodies', () => {
    const ids = CONCEPTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CONCEPTS) {
      expect(c.body.length).toBeGreaterThan(20);
    }
  });

  it('findConcept resolves by id and title', () => {
    expect(findConcept('three-area')?.id).toBe('three-area');
    expect(findConcept('HEAD')?.id).toBe('head');
  });

  it('formatConcepts lists all', () => {
    expect(formatConcepts()).toContain('Three-area model');
  });
});

describe('curriculum', () => {
  it('has outcomes', () => {
    expect(CURRICULUM.length).toBeGreaterThan(4);
    expect(formatCurriculum()).toContain('three-area');
  });
});

describe('coach', () => {
  it('field notes exist', () => {
    expect(FIELD_NOTES.length).toBeGreaterThan(5);
  });

  it('whyFor matches triggers', () => {
    expect(whyFor('git add README.md')?.trigger).toBe('git add');
    expect(whyFor('git commit -m x')?.trigger).toBe('git commit');
    expect(whyFor('unknown')).toBeUndefined();
  });

  it('formatWhy includes title', () => {
    expect(formatWhy(WHY_BLOCKS[0])).toContain(WHY_BLOCKS[0].title);
  });
});
