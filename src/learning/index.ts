/** Knowledge-base resolver. English is the source of truth; FA/DE catalogs are
 *  keyed by the same ids and merged field-by-field with an English fallback, so a
 *  partially-translated topic still renders in the user's language. */
import type { Lang } from '../i18n/lang';
import type { TopicKnowledge } from './types';
import { TOPICS_EN } from './topics.en';
import { TOPICS_FA } from './topics.fa';
import { TOPICS_DE } from './topics.de';

const EN: Record<string, TopicKnowledge> = Object.fromEntries(TOPICS_EN.map((t) => [t.id, t]));

export function getTopic(id: string, lang: Lang): TopicKnowledge | undefined {
  const en = EN[id];
  if (!en) return undefined;
  if (lang === 'en') return en;
  const o = (lang === 'fa' ? TOPICS_FA : TOPICS_DE)[id];
  if (!o) return en;
  return {
    id: en.id,
    title: o.title || en.title,
    fromZero: o.fromZero?.length ? o.fromZero : en.fromZero,
    mindset: o.mindset || en.mindset,
    industry: o.industry?.length ? o.industry : en.industry,
  };
}

/** Every topic (in English-defined order), localized. */
export function allTopics(lang: Lang): TopicKnowledge[] {
  return TOPICS_EN.map((t) => getTopic(t.id, lang) as TopicKnowledge);
}

/** All stable topic ids, in order. */
export function topicIds(): string[] {
  return TOPICS_EN.map((t) => t.id);
}
