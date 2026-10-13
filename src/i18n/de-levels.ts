/** German localized copy for all LearnGit levels. */

import type { LevelCopy } from './types';

export const deLevels: Record<string, LevelCopy> = {
  'basics-init': {
    seriesTitle: 'Grundlagen',
    name: 'Repository initialisieren',
    objective: 'Erstelle ein leeres Git-Repository im aktuellen Verzeichnis.',
    learning: ['Drei-Bereiche-Modell', 'Aufbau von .git', 'HEAD-Zeiger'],
    fieldNotes: ['Führe git init nur einmal im Projektstamm aus. Verschachtelte Repos verwirren CI-Tools.'],
    startDialog: [
      {
        title: 'Willkommen bei Git',
        markdown:
          'Git verfolgt Schnappschüsse, keine Diffs. Bevor du beginnst, benötigst du ein Repository.\n\nDieser Level benötigt einen Befehl: Erstelle das `.git`-Verzeichnis.',
      },
    ],
  },
  'basics-add-commit': {
    seriesTitle: 'Grundlagen',
    name: 'Bereitstellen und committen',
    objective: 'Stelle die neue Datei bereit und erstelle einen Commit mit der Nachricht "add app".',
    learning: ['Drei-Bereiche-Modell', 'Staging-Bereich (Index)', 'Commit als Schnappschuss'],
    fieldNotes: ['Stelle Änderungen gezielt bereit. `git add .` ist zu Beginn in Ordnung; später `git add -p` bevorzugen.'],
    startDialog: [
      {
        title: 'Drei Bereiche',
        markdown:
          'Eine Datei kann gleichzeitig in drei Bereichen existieren:\n\n1. **Arbeitsverzeichnis (Working Tree)**\n2. **Staging-Bereich (Index)**\n3. **Repository**',
      },
    ],
  },
};
