/** German (Deutsch) per-level text overrides.
 *
 * Each key is a `LevelDef.id`; anything not overridden here falls back to the
 * English inline text in `src/levels/index.ts`. Technical commands, flags and
 * literal commit-message phrases are kept in English on purpose — only the
 * prose is translated.
 */
import type { LevelOverrides } from './levels';

export const LEVELS_DE: LevelOverrides = {
  /* ───────────────────────────── BASICS ───────────────────────────── */

  'basics-init': {
    name: 'Ein Repository initialisieren',
    objective: 'Erstelle ein leeres Git-Repository im Arbeitsverzeichnis.',
    hint: 'Der Befehl ist `git init`. Prüfe danach bei Bedarf `git status`.',
    fieldNotes: ['Führe `git init` einmal pro Projektstamm aus. Verschachtelte Repositories verwirren Tooling und CI.'],
    startDialog: [
      {
        title: 'Willkommen bei Git',
        markdown:
          'Git verwaltet **Snapshots**, keine Diffs. Beidem voraus brauchst du ein Repository.\n\nDieses Level ist ein Befehl: das `.git`-Verzeichnis anlegen.',
      },
    ],
  },

  'basics-add-commit': {
    name: 'Stufen und committen',
    objective: 'Stufe die neue Datei und erstelle einen Commit, dessen Nachricht „add app" erwähnt.',
    hint: 'Versuche `git status`, dann `git add src/app.py` (oder `.`), dann `git commit -m "add app"`.',
    fieldNotes: [
      'Stufe bewusst. `git add .` ist am Projektanfang in Ordnung; später lieber explizite Pfade oder `git add -p`.',
      'Commit-Nachrichten erklären das *Warum*. „add app" reicht für diese Übung — im echten Arbeitsalltag ein vollständiger Satz.',
    ],
    startDialog: [
      {
        title: 'Drei Bereiche',
        markdown:
          'Eine Datei kann gleichzeitig an drei Orten leben:\n\n1. **Arbeitsbaum** — was du bearbeitest\n2. **Staging (Index)** — Entwurf des nächsten Commits\n3. **Repository** — dauerhafte Snapshots\n\n`git add` schiebt Inhalte in den Index. `git commit` verfestigt den Index zu einem Commit.',
      },
    ],
  },

  'core-commit-convention': {
    name: 'Eine konventionelle Nachricht schreiben',
    objective:
      'Füge `src/login.py` hinzu und commite es mit einer Conventional-Commits-Nachricht, die mit „feat: add login" beginnt.',
    hint: '`git add src/login.py`, `git commit -m "feat: add login"`.',
    fieldNotes: ['`feat:`, `fix:`, `docs:` — ein kurzes Typ-Präfix macht Changelogs und git-bisect viel leichter lesbar.'],
    startDialog: [
      {
        title: 'Nachricht-Konventionen',
        markdown:
          'Viele Teams nutzen ein Präfix wie `feat:`, `fix:`, `refactor:`.\nEs signalisiert die *Absicht*, nicht nur, welche Dateien sich geändert haben.',
      },
    ],
  },

  'basics-edit-add-commit': {
    name: 'Ändern, stufen, erneut committen',
    objective:
      'Bearbeite README.md, stufe es und commite mit einer Nachricht, die „update readme" enthält.',
    hint:
      'Benutze `edit README.md`, um die Datei zu ändern, dann `git add README.md` und `git commit -m "update readme"`.',
    fieldNotes: ['Mische einen Bugfix und eine Umbenennung nie in einem Commit. Prüfe `git diff --staged` vor dem Commit.'],
    startDialog: [
      {
        title: 'Der zweite Commit',
        markdown:
          'Dein erster Commit ist ein Snapshot. Wenn du eine Datei änderst, ist der Arbeitsbaum relativ zu HEAD **dreckig**.\n\nStufe erneut und commite, um einen neuen Snapshot zu erzeugen. Die Historie ist eine verkettete Liste von Bäumen.',
      },
    ],
  },

  'core-amend': {
    name: 'Den letzten Commit ändern (amend)',
    objective:
      'Ändere README.md, stufe es und schreibe den letzten Commit so um, dass seine Nachricht „improved" enthält — ohne neuen Commit.',
    hint: '`edit README.md`, `git add README.md`, `git commit --amend -m "improved readme"`.',
    fieldNotes: ['Nur ungepushte Commits amenden. Sobald ein Commit auf einem geteilten Remote liegt, lieber reverten als umschreiben.'],
    startDialog: [
      {
        title: 'Amend',
        markdown:
          '`git commit --amend` faltet deine gestufte Änderung in den **vorherigen** Commit: gleicher Platz, neuer Inhalt, optional neue Nachricht.\n\nDie Commit-Anzahl bleibt gleich — du hast keinen neuen Snapshot oben drauf erzeugt.',
      },
    ],
  },

  'core-rm': {
    name: 'Eine Datei mit Git löschen',
    objective: 'Lösche `notes.txt` unter Git (das Entfernen tracken) und commite das Entfernen.',
    hint: '`git rm notes.txt`, dann `git commit -m "remove notes"`.',
    fieldNotes: ['`git rm` entfernt die Datei und stuft das Entfernen. Ein einfaches `rm` aus dem Dateisystem lässt Git glauben, die Datei sollte noch da sein.'],
    startDialog: [
      {
        title: 'Löschungen sind auch Änderungen',
        markdown:
          'Eine Datei zu entfernen ist eine Änderung, also muss es wie jede andere committet werden.\n`git rm` stuft das Entfernen, damit der nächste Commit es festhält.',
      },
    ],
  },

  'core-mv': {
    name: 'Eine Datei mit git mv umbenennen',
    objective: 'Benenne `src/app.py` mit Git in `src/main.py` um, sodass die Umbenennung getrackt und gestuft ist.',
    hint: '`git mv src/app.py src/main.py`.',
    fieldNotes: ['`git mv` ist eine atomare Umbenennung + Stufung. Git erkennt die Umbenennung später oft in `log`/`diff`.'],
    startDialog: [
      {
        title: 'Atomare Umbenennung',
        markdown:
          'Umbenennen ist zwei Änderungen auf einmal: der alte Pfad verschwindet, der neue erscheint.\n`git mv` erledigt beides und stuft das Ergebnis in einem Schritt.',
      },
    ],
  },

  'core-ignore': {
    name: 'Build-Artefakte ignorieren',
    objective: 'Füge eine Ignorier-Regel hinzu, damit `build.log` ignoriert und nicht mehr als ungeprüfte Datei erscheint.',
    hint: 'Führe `gitignore *.log` aus, dann prüfe `git status` — build.log sollte aus „ungeprüft" verschwunden sein.',
    fieldNotes: ['Commite `.gitignore`, damit das ganze Team dieselben Artefakte ignoriert. Ignoriere nie etwas, das du eigentlich tracken willst.'],
    startDialog: [
      {
        title: 'Ignorier-Regeln',
        markdown:
          '`.gitignore` sagt Git, an Pfade vorbei zu schauen, die du nicht tracken willst: Build-Ausgabe, Secrets, Logs.\n\nIgnorierte Dateien verschwinden einfach aus `git status`.',
      },
    ],
  },

  'core-clone': {
    name: 'Ein Remote-Repository klonen',
    objective: 'Klone `/tmp/repo.git`, um eine lokale Kopie mit Historie und einem Remote `origin` zu bekommen.',
    hint: '`git clone /tmp/repo.git`.',
    fieldNotes: ['`git clone` ist der erste Schritt der meisten Workflows. Es erstellt das Repository, checked den Default-Branch aus und richtet `origin` ein.'],
    startDialog: [
      {
        title: 'Von jemandes anderem Repo starten',
        markdown:
          '`git clone` lädt ein Repository herunter, baut dessen Historie lokal nach und konfiguriert `origin` für dich.\n\nEs ist der Einstieg, um an einer geteilten Codebase mitzuarbeiten.',
      },
    ],
  },

  'basics-status-log': {
    name: 'Status und Log lesen',
    objective: 'Erstelle einen Commit, der „checkpoint" enthält, und untersuche dann die Historie mit git log.',
    hint: 'Bearbeite eine Datei, `git add .`, `git commit -m "checkpoint"`, dann `git log --oneline`.',
    fieldNotes: ['`git log --oneline --graph --decorate` ist der tägliche Fahrer. Lerne drei Flags gut kennen.'],
    startDialog: [
      {
        title: 'Status ist eine Karte, Log eine Zeitachse',
        markdown:
          '`git status` zeigt, in welchem der drei Bereiche jede Datei liegt.\n`git log` folgt der Commit-DAG ab HEAD.\n\nGemeinsam beantworten sie: *wo bin ich und wie bin ich hierhergekommen?*',
      },
    ],
  },

  /* ───────────────────────────── DIFF & SHOW ───────────────────────────── */

  'diff-unstaged': {
    name: 'Nicht gestufte Änderungen ansehen',
    objective: 'Bearbeite config.yaml und zeige den nicht gestuften Diff (noch nicht committen). Lass die Datei dreckig.',
    hint: 'Führe `edit config.yaml` aus, dann `git diff`. Nicht stufen oder committen.',
    fieldNotes: ['`git diff` ist Arbeitsbaum vs Index. `git diff --staged` ist Index vs HEAD. Wisse, welches du gerade ansiehst.'],
    startDialog: [
      {
        title: 'Zwei Diffs',
        markdown:
          '- `git diff` — was du geändert, aber **nicht** gestuft hast\n- `git diff --staged` — was in den **nächsten Commit** geht\n\nDieses Level will das erste und einen dreckigen Baum am Ende.',
      },
    ],
  },

  'diff-staged': {
    name: 'Stufen, dann --staged prüfen',
    objective: 'Bearbeite src/app.py, stufe es und prüfe den gestuften Diff. Nicht committen.',
    hint: '`edit src/app.py`, `git add src/app.py`, `git diff --staged`.',
    fieldNotes: ['`git diff --staged` ist das Review-Tor. Ist diese Ausgabe falsch, ist auch der Commit falsch.'],
    startDialog: [
      {
        title: 'Der Index ist ein Entwurfs-Commit',
        markdown:
          'Sobald du `git add` ausführst, verlässt die Änderung `git diff` und tritt in `git diff --staged` ein.\n\nDiese Bewegung *ist* der Staging-Bereich.',
      },
    ],
  },

  'diff-restore': {
    name: 'Eine schlechte Änderung verwerfen',
    objective: 'Eine schlechte Änderung liegt auf README.md. Stelle sie aus HEAD wieder her, damit der Baum sauber ist.',
    hint: 'Die Datei ist bereits dreckig. Führe `git restore README.md` aus.',
    fieldNotes: ['`git restore <file>` ist das sichere „meine Änderungen rückgängig" für nicht committetes. Stash, wenn du sie später vielleicht brauchst.'],
    startDialog: [
      {
        title: 'Arbeit bewusst wegwerfen',
        markdown:
          'Nicht committete Änderungen leben nur im Arbeitsbaum. `git restore <path>` kopiert HEAD (oder den Index) wieder über die Datei.\n\nEs gibt keinen Commit zum „Rückgängigmachen" — noch wurde nichts gespeichert.',
      },
    ],
  },

  'diff-show': {
    name: 'Einen Commit mit show prüfen',
    objective: 'Lies die Historie, dann untersuche den aktuellen Commit im Detail mit `git show`.',
    hint: '`git log --oneline`, dann `git show` (standardmäßig HEAD).',
    fieldNotes: ['`git show <sha>` ist der schnellste Weg, einen Commit zu sehen: seine Nachricht, seine Eltern und den Baum, den er produzierte.'],
    startDialog: [
      {
        title: 'Ein Commit, vollständig',
        markdown:
          '`git log` listet Commits; `git show` öffnet einen und gibt seine Nachricht, Eltern und die festgehaltenen Dateien aus.\n\nNütze es, um genau zu verstehen, was eine Änderung getan hat.',
      },
    ],
  },

  /* ───────────────────────────── BRANCHING ───────────────────────────── */

  'branch-create': {
    name: 'Einen Feature-Branch erstellen',
    objective: 'Erstelle einen Branch namens `feature` (nicht wechseln).',
    hint: '`git branch feature` — du musst noch nicht wechseln.',
    fieldNotes: ['Branch-Namen beschreiben Arbeit: `feature/login`, `fix/null-check`. Nicht `test2`.'],
    startDialog: [
      {
        title: 'Branches sind Pointer',
        markdown:
          'Ein Branch ist ein bewegbarer Name → Commit-Hash. Erstellen kostet nichts.\n\nDer Commit-Graph ändert sich beim Branching nicht; nur das Label.',
      },
    ],
  },

  'branch-switch': {
    name: 'Zu feature wechseln und committen',
    objective: 'Erstelle und wechsle zu `feature`, füge eine Änderung zu src/app.py hinzu und commite mit „feature work".',
    hint: '`git switch -c feature`, `edit src/app.py`, `git add src/app.py`, `git commit -m "feature work"`.',
    fieldNotes: ['`git switch -c name` erstellt und checked in einem Schritt aus. Für die tägliche Arbeit switch/restore bevorzugt über checkout.'],
    startDialog: [
      {
        title: 'HEAD bewegt sich mit dir',
        markdown:
          'Wenn du Branches wechselst, zeigt HEAD neu und der Arbeitsbaum wird auf den Baum dieses Commits umgeschrieben.\n\nNeue Commits bewegen nur den Pointer des *aktuellen* Branches.',
      },
    ],
  },

  'branch-merge-ff': {
    name: 'Fast-forward-Merge',
    objective: 'Commite auf `feature` „ship feature". Wechsle zu main und merge feature (Fast-forward ist ok).',
    hint: 'Commite zuerst auf feature, dann `git switch main` und `git merge feature`.',
    fieldNotes: ['Fast-forward ist sauber, verliert aber den „das war ein Feature"-Marker. Nutze --no-ff, wenn das Team Merge-Bubbles will.'],
    startDialog: [
      {
        title: 'Fast-forward',
        markdown:
          'Wenn `main` seit dem Branching von `feature` nicht bewegt wurde, rutscht der Merge einfach den `main`-Pointer vor.\n\nKein Merge-Commit. Die Historie bleibt linear.',
      },
    ],
  },

  'branch-merge-commit': {
    name: 'Echter Merge-Commit',
    objective: 'Commite „hotfix ready" auf `hotfix`, dann „main work" auf main, dann merge hotfix in main.',
    hint: 'Du brauchst zwei unabhängige Commits (einer pro Branch), bevor der Merge einen Merge-Commit erzeugt.',
    fieldNotes: ['Wenn beide Seiten sich bewegt haben, hält der Merge zwei Eltern fest. Das ist die DAG, die sich wieder vereint — kein Fehler.'],
    startDialog: [
      {
        title: 'Wenn Fast-forward unmöglich ist',
        markdown:
          'Wenn `main` nach dem Erstellen des Branches vorangekommen ist, erzeugt der Merge einen **Merge-Commit** mit zwei Eltern.\n\nBeide Historiegelassen bleiben erreichbar.',
      },
    ],
  },

  'branch-detached': {
    name: 'Gelöstes HEAD wiederherstellen',
    objective:
      'Check den vorherigen Commit per Hash aus (gelöstes HEAD), dann erstelle und wechsle zu einem Branch namens `rescue`, damit die Arbeit nicht verloren geht.',
    hint: '`git log --oneline` für Hashes, `git switch <old-hash>`, dann `git switch -c rescue`.',
    fieldNotes: [
      'Gelöstes HEAD ist für Inspektion unbedenklich. Committest du dort, sofort einen Branch anlegen, sonst ist der Commit nur via Reflog erreichbar.',
      '`git switch -c rescue` von gelöstem HEAD ist die Standard-Wiederherstellung.',
    ],
    startDialog: [
      {
        title: 'HEAD kann auf einen Commit zeigen',
        markdown:
          'Normalerweise zeigt HEAD auf einen **Branch**. Checkedst du einen rohen Hash aus, wird HEAD **gelöst**.\n\nNeue Commits funktionieren noch — aber nichts Benanntes zeigt darauf. Lege einen Branch an, bevor du gehst.',
      },
    ],
  },

  /* ───────────────────────────── REMOTES ───────────────────────────── */

  'remote-add-push': {
    name: 'Remote hinzufügen und pushen',
    objective: 'Füge ein Remote namens `origin` mit beliebiger URL hinzu, dann pushe main und setze Upstream.',
    hint: '`git remote add origin /tmp/remote.git`, dann `git push -u origin main`.',
    fieldNotes: ['`git push -u origin main` einmal pro Branch. Danach reicht nacktes `git push`.'],
    startDialog: [
      {
        title: 'Remotes sind benannte URLs',
        markdown:
          'Ein Remote ist nur ein Lesezeichen für ein anderes Repository. `push` lädt Commits hoch; `fetch` lädt Refs herunter.\n\n`-u` merkt sich den Upstream, damit spätere Befehle keine Argumente brauchen.',
      },
    ],
  },

  'remote-pull': {
    name: 'Fetch und pull',
    objective: 'Konfiguriere das Remote `origin`, pushe einmal, dann führe `git pull` mindestens einmal aus.',
    hint: 'Zuerst push -u, damit pull weiß, wohin, dann `git pull`.',
    fieldNotes: ['Fetch, wenn du inspizieren willst. Pull, wenn du integrieren willst. Das sind nicht derselbe Befehl.'],
    startDialog: [
      {
        title: 'Fetch vs pull',
        markdown:
          '`git fetch` aktualisiert nur die `origin/*`-Tracking-Refs — deine Branches bewegen sich nicht.\n`git pull` = fetch + integrieren.\n\nDieses Level will, dass du beides fühlst.',
      },
    ],
  },

  'remote-force-push': {
    name: 'Einen umgeschriebenen Branch force-pushen',
    objective:
      'Du hast lokale Historie umgeschrieben, also stimmt die Remote-Spitze nicht mehr. Ein normaler Push wird abgewiesen — force-push `origin main`, um sie zu überschreiben.',
    hint: '`git push --force origin main` (ein einfacher `git push` wird als non-fast-forward abgewiesen).',
    fieldNotes: [
      'Force-push nur Branches, die dir gehören. `--force-with-lease` lehnt ab, wenn sich das Remote seit deinem letzten fetch wieder bewegt hat — bevorzugt.',
      'Force-push niemals einen geteilten main: Du würdest Commits anderer löschen.',
    ],
    startDialog: [
      {
        title: 'Divergierte Branches',
        markdown:
          'Nach Rebase oder Amend leitet sich deine lokale Historie nicht von der Remote-Spitze ab. Git weist einen normalen Push ab, um ferngesteuerte Arbeit nicht still zu zerstören.\n\nForce push **überschreibt** das Remote — nur sicher, wenn du sicher bist.',
      },
    ],
  },

  /* ───────────────────────────── UNDO ───────────────────────────── */

  'undo-soft': {
    name: 'Letzten Commit soft zurücksetzen',
    objective: 'Mache den letzten Commit rückgängig, halte seine Änderungen aber gestuft (`git reset --soft HEAD~1`).',
    hint: 'Es gibt bereits einen Commit mit „oops". Führe `git reset --soft HEAD~1` aus.',
    fieldNotes: ['--soft ist das höfliche Rückgängig: der Branch-Pointer geht zurück, Index und Arbeitsbaum halten die Arbeit.'],
    startDialog: [
      {
        title: 'Reset-Modi',
        markdown:
          '| Modus | Branch | Index | Arbeitsbaum |\n|------|--------|-------|----------|\n| --soft | bewegt sich | behalten | behalten |\n| --mixed | bewegt sich | zurückgesetzt | behalten |\n| --hard | bewegt sich | zurückgesetzt | zurückgesetzt |\n\nFange mit --soft an.',
      },
    ],
  },

  'undo-reset-mixed': {
    name: 'Mixed-Reset: entstuft, Änderungen behalten',
    objective:
      'Mache den letzten Commit mit `--mixed` rückgängig: die Änderungen verlassen den Index, bleiben aber im Arbeitsbaum als nicht committierte Änderungen.',
    hint: 'Führe `git reset --mixed HEAD~1` aus. Die Datei wird dreckig, aber nicht gestuft.',
    fieldNotes: ['--mixed ist der Standardmodus. Es ist die höfliche Art zu „de-committen", während du deine Arbeit behältst, um sie gezielt neu zu stufen.'],
    startDialog: [
      {
        title: 'Mixed vs soft',
        markdown:
          'Beide bewegen den Branch einen Commit zurück.\n- `--soft` hält die Änderungen **gestuft**\n- `--mixed` entstuft sie, behält aber die Änderungen auf der Platte\n\nDieses Level will das mixed-Verhalten.',
      },
    ],
  },

  'undo-reset-hard': {
    name: 'Hard-Reset: den Commit verwerfen',
    objective: 'Werfe den letzten Commit **und** seine Änderungen mit `--hard` weg und lass den Arbeitsbaum sauber.',
    hint: 'Führe `git reset --hard HEAD~1` aus. Der Baum sollte danach sauber sein.',
    fieldNotes: ['--hard ist destruktiv: nicht committete Arbeit ist weg. Erst `git status`. Auf geteilten Branches lieber revert.'],
    startDialog: [
      {
        title: 'Das schwere Rückgängig',
        markdown:
          '`--hard` bewegt den Branch zurück **und** schreibt den Arbeitsbaum passend um und wirft den Commit und seine Änderungen weg.\n\nNutz es, um Arbeit zu verwerfen, der du sicher bist.',
      },
    ],
  },

  'undo-revert': {
    name: 'Einen veröffentlichten Commit reverten',
    objective: 'Revert HEAD mit einer Nachricht, die „Revert" enthält (kein reset).',
    hint: '`git revert HEAD` — nutze hier nicht reset.',
    fieldNotes: ['Auf geteilten Branches ist revert das einzige sichere Rückgängig. Reset schreibt Historie um, die andere bereits gepullt haben.'],
    startDialog: [
      {
        title: 'Revert fügt einen Commit hinzu',
        markdown:
          'Revert erzeugt einen neuen Commit, der das Inverse eines alten ist.\n\nDie Historie bleibt wahr. Mitwirkende, die bereits gepullt haben, brechen nicht.',
      },
    ],
  },

  'undo-stash': {
    name: 'Dreckige Arbeit stashed',
    objective: 'Stash deine nicht committierten Änderungen, damit der Baum sauber ist.',
    hint: 'Der Baum ist dreckig. Führe `git stash` (oder `git stash push`) aus.',
    fieldNotes: ['Stash ist ein Parkplatz, kein Branch. Wenn er einen Tag liegen bleibt, lieber einen WIP-Branch committen.'],
    startDialog: [
      {
        title: 'Stash',
        markdown:
          '`git stash` packt nicht committierte Änderungen in einen verborgenen Stapel und reinigt den Baum.\n`git stash pop` stellt wieder her und entfernt den Eintrag.',
      },
    ],
  },

  'recover-reflog': {
    name: 'Einen verlorenen Commit via Reflog retten',
    objective: 'Ein Commit wurde zurückgesetzt und ist jetzt verwaist. Finde ihn im Reflog, checke ihn aus und lege ihn auf einen Branch namens `rescue`.',
    hint: '`git reflog` für den „lost work"-Hash, `git switch <hash>`, dann `git switch -c rescue`.',
    fieldNotes: [
      'Fast jeder „verlorene" Commit steckt noch in `.git/logs/HEAD`. Das Reflog ist dein Sicherheitsnetz.',
      'Rette mit `git switch -c rescue <sha>` — im Moment, wo ein Branch darauf zeigt, ist er nicht mehr verwaist.',
    ],
    startDialog: [
      {
        title: 'Das Reflog ist dein Sicherheitsnetz',
        markdown:
          'Ein Commit, auf den kein Branch zeigt, ist **verwaist** — er wird irgendwann aufgeräumt.\n\nGit verzeichnet aber jeden HEAD-Vorgang im Reflog, also kannst du den verlorenen Hash jederzeit auschecken und ihm einen Branch geben.',
      },
    ],
  },

  /* ───────────────────────────── HISTORY CRAFT ───────────────────────────── */

  'hist-tag': {
    name: 'Einen Release taggen',
    objective: 'Erstelle einen annotierten Tag namens `v1.0.0`.',
    hint: '`git tag -a v1.0.0 -m "release"`.',
    fieldNotes: ['Annotierte Tags für Releases. Lightweight-Tags sind nur für lokale Buchhaltung.'],
    startDialog: [
      {
        title: 'Tags bewegen sich nicht',
        markdown:
          'Branches bewegen sich, wenn du committest. Tags sind feste Koordinaten.\n\nShip-Pipelines und Rollbacks sollten auf Tags verweisen, nicht auf Branch-Namen.',
      },
    ],
  },

  'hist-cherry-pick': {
    name: 'Einen Fix cherry-picken',
    objective: 'Wechsle zu main und cherry-picke den Commit, dessen Nachricht „fix crash" enthält.',
    hint: 'Finde den Hash mit `git log --oneline`, wechsle zu main, `git cherry-pick <hash>`.',
    fieldNotes: ['Cherry-pick dupliziert eine Änderung. Gut für Hotfixes; es forkt den Historie-Inhalt über Branches.'],
    startDialog: [
      {
        title: 'Cherry-pick',
        markdown:
          'Kopiere die Änderung eines Commits auf den aktuellen HEAD als **neuen** Commit (neuer Hash).\n\nNutze es, wenn du ein Patch brauchst, ohne den ganzen Branch zu nehmen.',
      },
    ],
  },

  'hist-merge-conflict': {
    name: 'Einen Merge-Konflikt lösen',
    objective:
      'Merge `feature` in main. Er wird auf config.yaml kollidieren — bearbeite die Datei, stufe sie, dann commite den Merge.',
    hint: '`git merge feature` → Konflikt. Dann `edit config.yaml`, `git add config.yaml`, `git commit -m "Merge branch feature"`.',
    fieldNotes: [
      'Öffne die kollidierte Datei, wähle den richtigen Inhalt, `git add`, `git commit`. Setze den Merge nicht zurück, es sei denn, du willst die Arbeit aufgeben.',
      'Nach dem Lösen führe `git log --oneline --graph` aus — du solltest einen Merge-Commit mit zwei Eltern sehen.',
    ],
    startDialog: [
      {
        title: 'Konflikte sind normal',
        markdown:
          'Wenn beide Branches dasselbe **Hunk** geändert haben, kann Git keinen Gewinner wählen.\n\n1. `git status` zeigt `both modified`\n2. Bearbeite die Datei zum gewünschten Inhalt\n3. `git add` den Pfad (markiert gelöst)\n4. `git commit` hält den Merge fest',
      },
    ],
  },

  'hist-rebase': {
    name: 'Feature auf main rebase',
    objective: 'Während du auf `feature` bist, rebase nach einem main-Vorsprung auf `main`.',
    hint: 'Bleib auf feature, führe `git rebase main` aus.',
    fieldNotes: ['Rebase ungepushte Feature-Arbeit. Nie einen Branch rebasen, auf dem andere bereits Arbeit aufbauen.'],
    startDialog: [
      {
        title: 'Rebase',
        markdown:
          'Rebase spielt deine Commits auf einer neuen Basis ab und erzeugt **neue Hashes**.\n\nDie Historie wirkt linear. Der Preis: umgeschriebene Vergangenheit.',
      },
    ],
  },

  'hist-delete-branch': {
    name: 'Einen gemergten Branch löschen',
    objective: 'Merge `cleanup` in main (fast-forward ok) und lösche den Branch `cleanup`.',
    hint: 'Wechsle zu main, merge cleanup, dann `git branch -d cleanup`.',
    fieldNotes: ['Lösche Branches nach dem Merge. Veraltete Branch-Namen sind, wie Leute das Falsche auschecken.'],
    startDialog: [
      {
        title: 'Aufräumen',
        markdown:
          'Ein gemergter Branch-Pointer ist unnötiger Ballast. `git branch -d` entfernt das Label — die Commits bleiben von main erreichbar.',
      },
    ],
  },

  /* ───────────────────────────── FIELD PRACTICE ───────────────────────────── */

  'camp-full-flow': {
    name: 'Feature-Branch → PR-fertig',
    objective:
      'Von sauberem main: `feature/login` erstellen, „add login" darauf committen, mit Upstream nach origin pushen, zurück zu main.',
    hint: 'git switch -c feature/login → edit → add → commit -m "add login" → git push -u origin feature/login → git switch main',
    fieldNotes: [
      'Das ist die tägliche Schleife. Kannst du sie ohne Nachdenken, bist du bereit für Code-Review-Workflows.',
      'Pushe den Feature-Branch, nicht main. Der PR ist das Integrationstor.',
    ],
    startDialog: [
      {
        title: 'Praxis-Drill',
        markdown:
          'Erzeuge einen **PR-fertigen** Feature-Branch:\n\n1. Branch von main\n2. Ein logischer Commit\n3. Push mit Upstream\n4. Zurück zu sauberem main\n\nKeine Abkürzungen. Das ist der echte Workflow.',
      },
    ],
  },

  'camp-recover': {
    name: 'Von einem schlechten Commit erholen',
    objective:
      'Du hast aus Versehen Secrets committiert („oops secrets"). Revert es, damit die HEAD-Nachricht „Revert" enthält und die Historie erhalten bleibt.',
    hint: '`git revert HEAD`. Nicht reset --hard.',
    fieldNotes: ['Secrets in einem Commit sind auch nach reset kompromittiert — das Credential neu ausstellen. Revert + rotate.'],
    startDialog: [
      {
        title: 'Incident-Drill',
        markdown:
          'Ein schlechter Commit liegt schon auf main. Bevorzuge **revert** (behält Historie) vor reset (umschreibt).\n\nDanach: das geleakte Secret neu ausstellen. Der Commit ist noch im Object-Store.',
      },
    ],
  },
};
