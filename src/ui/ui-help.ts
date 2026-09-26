/** Sticky solution checklist helper. */

import type { SolutionStepStatus } from '../engine/types';

export function buildSolutionStatus(
  solution: string[],
  commandHistory: string[],
): SolutionStepStatus[] {
  const hist = commandHistory.slice();
  return solution.map((cmd) => {
    const optional = cmd.startsWith('git log') || cmd.startsWith('git status') || cmd === 'help' || cmd.startsWith('git diff');
    let done = false;
    for (let i = 0; i < hist.length; i++) {
      if (normalize(hist[i]) === normalize(cmd) || hist[i].startsWith(cmd) || normalize(hist[i]).startsWith(normalize(cmd))) {
        done = true;
        hist.splice(i, 1);
        break;
      }
    }
    return {
      command: cmd,
      done,
      note: optional ? 'optional inspect' : 'required',
      optional,
    };
  });
}

function normalize(cmd: string): string {
  return cmd.trim().replace(/\s+/g, ' ');
}
