/** Knowledge-base types.
 *
 * A `TopicKnowledge` is the "from zero → industry" lesson for one Git idea.
 * `fromZero` is an escalating explanation (analogy → mechanism → usage → reality),
 * `mindset` is the mental model to keep, and `industry` is how it is used in production.
 *
 * Reuses the 24 existing concept ids (three-area, commit, …) so level `learning`
 * chips map straight onto topics, plus new ids for topics that had no concept yet.
 */

/** One escalating step in a from-zero explanation. */
export interface FromZeroStep {
  /** Short stage label, e.g. "Start here", "Under the hood", "In the real world". */
  level: string;
  body: string;
}

export interface TopicKnowledge {
  /** Stable id — matches a concept id or a new slug. */
  id: string;
  title: string;
  /** Escalating from-zero explanation, typically 3–5 steps. */
  fromZero: FromZeroStep[];
  /** The single mental model a working engineer should hold. */
  mindset: string;
  /** Production practices — "how this is used in industry". */
  industry: string[];
}
