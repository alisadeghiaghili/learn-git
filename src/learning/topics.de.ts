/** German knowledge base. Keyed by the same ids as topics.en.ts.
 *  Any entry (or field) left out falls back to the English source. */
import type { TopicKnowledge } from './types';

export const TOPICS_DE: Record<string, Partial<TopicKnowledge>> = {
  'three-area': {
    title: 'Das Drei-Bereiche-Modell',
    fromZero: [
      { level: 'Am Anfang', body: 'Denk an ein Buch auf dem Tisch (Arbeitsbaum), ein Tablett, auf dem du Seiten zum Absenden ordnest (Staging), und die gebundene Archivkopie (Repository).' },
      { level: 'Unter der Haube', body: 'Git verfolgt drei Orte zugleich: die Dateien auf der Festplatte, den Index (der Entwurf des nächsten Commits) und die gespeicherten Schnappschüsse. Jeder Befehl bewegt Inhalt zwischen diesen Bereichen.' },
      { level: 'In der Praxis', body: 'Fast jeder Git-Fehler ist ein Verwirrung darüber, *in welchem Bereich* du gerade schaust. Staging ist die bewusste Pause, die dir erlaubt, einen Commit zu formen.' },
    ],
    mindset: 'Nenne den Bereich, bevor du handelst: Ist das im Arbeitsbaum, im Index oder in einem Commit?',
    industry: ['`git status` ist die tägliche Karte aller drei Bereiche.', 'Das Prüfen von `git diff --staged` vor dem Commit ist ein professioneller Reflex.'],
  },
  init: {
    title: 'git init',
    fromZero: [
      { level: 'Am Anfang', body: 'Bevor Git etwas speichern kann, braucht es einen Ort für sein Gedächtnis. `git init` erstellt genau diesen Ort: das versteckte `.git`-Verzeichnis.' },
      { level: 'Unter der Haube', body: 'Es richtet den Objekt-Speicher, einen Anfangs-Branch (`main`) und ein `HEAD` ein, das darauf zeigt. Der Ordner ist jetzt ein Repository.' },
    ],
    mindset: 'Ein Repository, ein `.git`, eine Wurzel.',
    industry: ['Führe `git init` einmal in der Projektwurzel aus.', 'Vermeide verschachtelte Repos — Tooling und CI werden davon verwirrt.'],
  },
  gitignore: {
    title: '.gitignore',
    fromZero: [
      { level: 'Am Anfang', body: 'Manche Dateien sollten nie in der Historie landen: Build-Ausgaben, Secrets, geräteabhängige Einstellungen. `.gitignore` ist eine Liste dessen, was ignoriert wird.' },
      { level: 'Unter der Haube', body: 'Eine nicht verfolgte Datei, die zu einem Muster passt, verschwindet aus `git status` und kann nicht mehr hinzugefügt werden. Muster sind Pfade, Verzeichnisse oder Globs wie `*.log`.' },
      { level: 'In der Praxis', body: 'Ignorierregeln reisen mit dem Repo, damit das ganze Team dasselbe ignoriert. Schon verfolgte Dateien kann man nicht ignorieren — man muss sie erst aus dem Verfolgung nehmen.' },
    ],
    mindset: 'Was generiert oder geheim ist, wird ignoriert.',
    industry: ['Committe `.gitignore`, damit alle dasselbe ignorieren.', 'Secrets, die einmal committet wurden, müssen rotiert werden — nicht nur ignoriert.'],
  },
  'blobs-trees-commits': {
    title: 'Blobs, Trees und Commits',
    fromZero: [
      { level: 'Am Anfang', body: 'Git speichert Dateien nicht, wie du denkst. Der *Inhalt* einer Datei ist ein Blob; die Verzeichnisliste ist ein Tree; ein Commit zeigt auf einen Wurzel-Tree und seine Eltern.' },
      { level: 'Unter der Haube', body: 'Ein **Blob** ist nur Inhalt (ohne Namen). Ein **Tree** ordnet Namen Blobs oder Untertrees zu. Ein **Commit** = Wurzel-Tree + Eltern-Hashes + Autor + Nachricht. Committing erfasst den ganzen Tree, keine Diffs.' },
      { level: 'In der Praxis', body: 'Deshalb ist das Checkout eines Branchs schnell (Trees sind klein) und Git kann identischen Inhalt in der ganzen Historie deduplizieren.' },
    ],
    mindset: 'Ein Commit ist ein eingefrorener Tree, kein Haufen an Änderungen.',
    industry: ['`git cat-file -p <sha>` zeigt diese rohen Objekte an.', 'Content-Adressierung bedeutet, dass identische Bytes nur einmal gespeichert werden.'],
  },
  commit: {
    title: 'Commits sind Schnappschüsse',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Commit ist ein Foto des gesamten Projekts in einem Moment, plus eine Notiz und ein Zeiger auf das/die Foto(s) davor.' },
      { level: 'Unter der Haube', body: 'Weil jeder Commit einen kompletten Tree speichert, ist die Historie ein gerichteter Graph von Schnappschüssen, keine Liste von Diffs. Diffs werden erst berechnet, wenn du sie anfragst.' },
      { level: 'In der Praxis', body: 'Das ist der Grund, warum kleine, einzweckige Commits wertvoll sind: Jedes Foto ist für sich sinnvoll.' },
    ],
    mindset: 'Jeder Commit sollte als eigenständiger, korrekter Zustand Sinn ergeben.',
    industry: ['Eine logische Änderung pro Commit.', '`git log --oneline --graph --decorate`, um die Historie schnell zu lesen.'],
  },
  index: {
    title: 'Der Index (Staging-Bereich)',
    fromZero: [
      { level: 'Am Anfang', body: 'Der Index ist der Entwurf deines nächsten Commits. `git add` kopiert den aktuellen Inhalt einer Datei in den Entwurf; `git commit` versiegelt den Entwurf zu einem Commit.' },
      { level: 'Unter der Haube', body: 'Es ist eine Datei auf der Festplatte (`.git/index`), die einen Satz an Blobs hält. Er kann anderen Inhalt haben als sowohl der Arbeitsbaum als auch der letzte Commit — genau diese Lücke siehst du als gestuft vs. nicht gestuft.' },
      { level: 'In der Praxis', body: 'Staging ist, wie du einen unordentlichen Arbeitsbaum in saubere Commits teilst, ohne etwas auf der Festplatte zu ändern.' },
    ],
    mindset: 'Der Index ist „was ich gerade speichern werde“, nicht „was ich geändert habe“.',
    industry: ['`git add -p`, um Hunk für Hunk zu stufen.', 'Ein leerer Index-Diff bedeutet, der nächste Commit wäre leer.'],
  },
  head: {
    title: 'HEAD',
    fromZero: [
      { level: 'Am Anfang', body: 'HEAD ist ein Hinweisschild: „Hier bist du“. Meist zeigt es auf einen Branch, der wiederum auf einen Commit zeigt.' },
      { level: 'Unter der Haube', body: 'Die meisten Befehle lösen ihre Argumente relativ zu HEAD auf. Wenn HEAD direkt auf einen Commit zeigt statt auf einen Branch, bist du in einem *gelösten (detached)* Zustand.' },
      { level: 'In der Praxis', body: 'Ein gelöstes HEAD ist zum Prüfen alter Commits unbedenklich; committest du dort ohne Branch, geht die Arbeit leicht verloren.' },
    ],
    mindset: 'Verfolge die Kette: HEAD → Branch → Commit. Zeigt HEAD den Branch übersprungen, bist du gelöst.',
    industry: ['`git switch -c rescue` rettet Arbeit auf einem gelösten HEAD.', 'Gelöste Zustände sind bei bisect und Code-Review üblich.'],
  },
  'branch-pointer': {
    title: 'Branches sind bewegliche Zeiger',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Branch ist nur ein Name auf einem Commit. Sein Erstellen ist gratis; das Umschalten ändert, wo du arbeitest, nicht die Historie.' },
      { level: 'Unter der Haube', body: 'Ein Branch ist eine Datei mit einem Commit-Hash. Das Umschalten zeigt HEAD neu auf und schreibt den Arbeitsbaum auf den Tree dieses Commits um.' },
      { level: 'In der Praxis', body: 'Da Branches billig sind, legen Teams für jede Arbeitsportion einen kurzlebigen Branch an.' },
    ],
    mindset: 'Branches „enthalten“ keine Commits — Commits bilden den Graphen; Branches sind Labels darauf.',
    industry: ['Namen beschreiben die Arbeit: `feature/login`, `fix/null-check`.', 'Lösche einen Branch nach dem Merge; stale Branches laden zu Fehlern ein.'],
  },
  clone: {
    title: 'git clone',
    fromZero: [
      { level: 'Am Anfang', body: 'Um an einem geteilten Projekt mitzuwirken, ladest du eine Kopie herunter. `git clone` bringt das ganze Repository samt Historie in einem Schritt.' },
      { level: 'Unter der Haube', body: 'Es erstellt das lokale Repo, checkt den Default-Branch aus und benennt die Quelle `origin`, damit du später pushen/pullen kannst.' },
      { level: 'In der Praxis', body: 'Clone ist der Einstieg in nahezu jeden Team-Workflow.' },
    ],
    mindset: 'Ein Clone ist eine vollständige, lauffähige lokale Kopie mit vorkonfiguriertem `origin`.',
    industry: ['Clone pro Projekt in einen frischen Ordner.', '`--depth 1` lädt nur den letzten Commit für große Repos.'],
  },
  'fetch-vs-pull': {
    title: 'Fetch vs. Pull',
    fromZero: [
      { level: 'Am Anfang', body: 'Fetch heißt „zeig mir, was sich da draußen geändert hat“. Pull heißt „zeig mir, was sich geändert hat, und füge es ein“.' },
      { level: 'Unter der Haube', body: 'Fetch aktualisiert nur deine `origin/*`-Tracking-Refs — deine Branches und dein Arbeitsbaum bleiben unberührt. Pull = fetch + Integration (Merge oder Rebase).' },
      { level: 'In der Praxis', body: 'Erst fetchen, dann entscheiden. Blindes Pullen kann mit ungeplanten Merges überraschen.' },
    ],
    mindset: 'Fetch ist sicher und nur lesend; Pull ist eine Entscheidung mit Nebenwirkungen.',
    industry: ['`git fetch`, bevor du auf gemeinsamen Branches integrierst.', 'Teams scripten oft `pull --rebase` für Feature-Branches.'],
  },
  remote: {
    title: 'Remotes',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Remote ist ein Lesezeichen auf ein anderes Repository — meist ein gemeinsamer Server. `origin` ist die übliche Standardbenennung.' },
      { level: 'Unter der Haube', body: '`git remote` benennt eine URL. `push` lädt deine Commits dorthin hoch; `fetch` lädt dessen Refs als `origin/*`-Kopien herunter.' },
      { level: 'In der Praxis', body: 'Alles an Zusammenarbeit — PRs, Reviews, CI — hängt am Remote.' },
    ],
    mindset: 'Dein lokales Repo ist ein Sandkasten; das Remote ist die geteilte Wahrheit.',
    industry: ['`git remote add <name> <url>`, um ein zweites Remote hinzuzufügen (z. B. einen Mirror).', '`git remote -v`, um zu prüfen, wohin du pushen wirst.'],
  },

  status: {
    title: 'git status',
    fromZero: [
      { level: 'Am Anfang', body: 'Status ist die Karte. Er sagt dir, wo jede Datei steht: gestuft, geändert aber nicht gestuft, oder ganz unverfolgt.' },
      { level: 'Unter der Haube', body: 'Er vergleicht Arbeitsbaum, Index und HEAD und meldet die Unterschiede in jedem der drei Bereiche.' },
      { level: 'In der Praxis', body: 'Wenn du dich je verläufst, ist `git status` der erste Befehl, den du ausführst.' },
    ],
    mindset: 'Lies Status als drei Listen, nicht als einen Textklumpen.',
    industry: ['`git status -sb` für eine kompakte Branch- + Änderungs-Zusammenfassung.', 'Ein sauberer Status ist die Voraussetzung zum Umschalten zwischen Branches.'],
  },
  add: {
    title: 'git add (Staging)',
    fromZero: [
      { level: 'Am Anfang', body: '`git add` bewegt den aktuellen Inhalt einer Datei in den Staging-Entwurf, damit der nächste Commit sie enthält.' },
      { level: 'Unter der Haube', body: 'Es registriert den Blob der Datei im Index. `git add .` stuft alles; `git add <path>` einen Pfad; `git add -p` stuft Hunk für Hunk.' },
      { level: 'In der Praxis', body: 'Bewusstes Staging hält Commits reviewbar.' },
    ],
    mindset: 'Stufe nur die Änderung, die du committen willst.',
    industry: ['`git add -p` ist das Arbeitstier für saubere Commits.', 'Meide `git add .` in einem gemeinsamen Repo — es fängt auch mit, was du ausschließen wolltest.'],
  },
  'commit-message': {
    title: 'Commit-Nachrichten',
    fromZero: [
      { level: 'Am Anfang', body: 'Die Commit-Nachricht ist die Notiz auf deinem Foto. Sie sollte das *Warum* erklären, nicht nur die *Dateien*.' },
      { level: 'Unter der Haube', body: 'Sie wird im Commit-Objekt gespeichert. Die erste Zeile ist die Überschrift; eine Leerzeile, dann der Text — das ist die Konvention.' },
      { level: 'In der Praxis', body: 'Gute Nachrichten machen `git log` und `git blame` für jemanden in einigen Monaten lesbar.' },
    ],
    mindset: 'Schreibe für den Leser in der Zukunft, nicht für dich selbst im Moment.',
    industry: ['Conventional Commits: Präfixe `feat:`, `fix:`, `docs:`.', 'Strebe nach einer imperativen, einzeiligen Überschrift unter ~50 Zeichen.'],
  },
  'commit-convention': {
    title: 'Conventional Commits',
    fromZero: [
      { level: 'Am Anfang', body: 'Eine Konvention setzt ein kurzes Typ-Präfix auf jeden Commit — `feat:`, `fix:`, `refactor:` — damit die *Art* der Änderung auf einen Blick erkennbar ist.' },
      { level: 'Unter der Haube', body: 'Das Präfix ist nur eine Konvention, aber Tools können es parsen, um Changelogs und Versionen automatisch zu erzeugen.' },
      { level: 'In der Praxis', body: 'Viele Teams erzwingen es in CI. Es macht `git log` scannbar und automatisiert Releases.' },
    ],
    mindset: 'Das Typ-Präfix signalisiert die Absicht, noch bevor du die Worte liest.',
    industry: ['`conventional-changelog` / `standard-version` bauen darauf auf.', 'Reserviere `fix:` für Änderungen, die einen Bug beheben (auslöst oft Patch-Bumps).'],
  },
  'atomic-commits': {
    title: 'Atomare Commits',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Commit = eine logische Änderung. Wenn du einen Bugfix von einem Rename trennen kannst, dann tue es.' },
      { level: 'Unter der Haube', body: 'Kleinere, einzweckige Commits sind leichter zu reviewen, zu reverten und zu bisekten, weil jeder ein kohärenter, testbarer Zustand ist.' },
      { level: 'In der Praxis', body: 'Ein Reviewer sollte jeden Commit für sich verstehen und, falls nötig, zurückrollen können.' },
    ],
    mindset: 'Braucht ein Commit einen anderen Commit, um Sinn zu ergeben, teile es auf.',
    industry: ['`git add -p`, um eine Änderung, die viele Dateien betrifft, zu trennen.', 'Vermische nie einen Bugfix und ein Format-Sweeping in einem Commit.'],
  },
  amend: {
    title: 'git commit --amend',
    fromZero: [
      { level: 'Am Anfang', body: 'Amend schreibt den letzten Commit so um, dass er dein gerade gestuftes enthält, und lässt deine Nachricht ändern — an Ort und Stelle.' },
      { level: 'Unter der Haube', body: 'Es fügt keinen neuen Commit hinzu; es erzeugt einen neuen Commit, der die Spitze ersetzt, also bleibt die Zahl gleich und der Hash ändert sich.' },
      { level: 'In der Praxis', body: 'Top, um einen Tippfehler in einer Nachricht zu fixen oder eine übersehene Datei *vor* dem Push einzufalten.' },
    ],
    mindset: 'Amend ist ein Rewrite. Amende nie einen Commit, den jemand anderes gepullt hat.',
    industry: ['Nur sicher für ungepushte, lokale Commits.', 'Teams aktivieren oft `commit --amend`-Hooks, um ein `Signed-off-by` automatisch hinzuzufügen.'],
  },
  log: {
    title: 'git log (Historie lesen)',
    fromZero: [
      { level: 'Am Anfang', body: '`git log` durchläuft den Commit-Graphen von HEAD und druckt, was er findet. Es ist die Art, „wie sind wir hierher gekommen?“ zu fragen.' },
      { level: 'Unter der Haube', body: 'Es folgt den Eltern-Links. Flags formen die Ausgabe: `--oneline` komprimiert, `--graph` zeichnet die Branches, `--decorate` zeigt Branch-/Tag-Namen, `-p` zeigt Diffs.' },
      { level: 'In der Praxis', body: 'Historie lesen ist die Hälfte des Debuggens. Kannst du nicht beschreiben, was passierte, kannst du es nicht fixen.' },
    ],
    mindset: 'Das Log ist eine filterbare Zeitleiste, keine Wand aus Text.',
    industry: ['`git log --oneline --graph --decorate` ist der Standardbefehl.', 'Filtere mit `--author`, `--since` oder einem Pfad: `git log -- path/to/file`.'],
  },
  diff: {
    title: 'git diff (zwei Arten)',
    fromZero: [
      { level: 'Am Anfang', body: 'Diff zeigt Änderungen. Es gibt zwei: nicht gestuft (Arbeitsbaum vs. Index) und gestuft (Index vs. HEAD).' },
      { level: 'Unter der Haube', body: 'Einfaches `git diff` vergleicht Festplatte und Index. `git diff --staged` vergleicht Index und letzten Commit — also, was der nächste Commit enthalten würde.' },
      { level: 'In der Praxis', body: 'Das Reviewen von `--staged` ist das Tor vor dem Commit.' },
    ],
    mindset: 'Frag, welche zwei Bereiche du vergleichst, bevor du einem Diff vertraust.',
    industry: ['`git diff --staged` in der Pre-Commit-Checkliste.', '`git diff HEAD` zeigt alle Änderungen (gestuft + nicht gestuft) gegenüber dem letzten Commit.'],
  },
  show: {
    title: 'git show',
    fromZero: [
      { level: 'Am Anfang', body: '`git show` öffnet einen Commit vollständig: seine Nachricht, seine Eltern und die Änderungen, die er gemacht hat.' },
      { level: 'Unter der Haube', body: 'Standardmäßig HEAD. Gib ihm einen Hash, einen Branch oder ein Tag, um diese Ref zu inspizieren.' },
      { level: 'In der Praxis', body: 'Der schnellste Weg, exakt zu verstehen, was eine einzelne Änderung tat.' },
    ],
    mindset: 'Log listet; show erklärt einen Eintrag im Detail.',
    industry: ['`git show <sha>`, bevor du irgendetwas revertest oder cherry-pickst.', 'Kombiniere mit `-p`, um den vollen Patch zu sehen.'],
  },
  restore: {
    title: 'git restore',
    fromZero: [
      { level: 'Am Anfang', body: '`git restore` verwirft uncommitte Bearbeitung einer Datei und kopiert die gespeicherte Version darüber.' },
      { level: 'Unter der Haube', body: 'Es schreibt den Arbeitsbaum (und optional den Index) von einer gespeicherten Quelle — standardmäßig HEAD — um. Committetes bleibt unberührt.' },
      { level: 'In der Praxis', body: 'Das sichere „meine Bearbeitung rückgängig“ für Arbeit, die noch nicht committet ist.' },
    ],
    mindset: 'Restore wirft uncommittete Arbeit bewusst weg.',
    industry: ['`git restore <file>`, um eine Änderung aufzugeben.', '`git restore --staged <file>`, um zu entstufen, ohne die Bearbeitung zu verlieren.'],
  },
  rm: {
    title: 'git rm',
    fromZero: [
      { level: 'Am Anfang', body: 'Das Entfernen einer Datei ist eine Änderung, also muss sie committet werden. `git rm` entfernt die Datei *und* stuft die Löschung.' },
      { level: 'Unter der Haube', body: 'Es löscht den Pfad aus Arbeitsbaum und Index. Ein simples Dateisystem-`rm` würde Git glauben lassen, die Datei sollte noch da sein.' },
      { level: 'In der Praxis', body: 'Nutze es, wenn du Code entfernst, den du nicht mehr in der Historie willst.' },
    ],
    mindset: 'Wenn sie verfolgt wurde, entferne sie über Git, nicht nur das Dateisystem.',
    industry: ['`git rm <file>`, dann Commit.', '`git rm --cached <file>` behält die Datei auf der Festplatte, stellt aber die Verfolgung ein.'],
  },
  mv: {
    title: 'git mv (atomares Umbenennen)',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Umbenennen ist eigentlich zwei Änderungen: Der alte Pfad verschwindet, der neue erscheint. `git mv` tut beides und stuft das Ergebnis.' },
      { level: 'Unter der Haube', body: 'Es ist ein atomares „entfernen + hinzufügen“. Git kann das Umbenennen später in Diffs und Logs oft *erkennen*.' },
      { level: 'In der Praxis', body: 'Es hält die Historie ehrlich, wenn du Dateien umorganisierst.' },
    ],
    mindset: 'Ein Umbenennen ist Inhalt, der unter einem neuen Pfad weiterlebt — kein Löschen plus Anlegen.',
    industry: ['`git mv old new` für ein umbenanntes, verfolgtes File.', 'Rename-Erkennung ist standardmäßig an; ähnlicher Inhalt wird über den Rename verknüpft.'],
  },
  'rename-detection': {
    title: 'Rename-Erkennung',
    fromZero: [
      { level: 'Am Anfang', body: 'Git speichert „diese Datei wurde umbenannt“ nicht. Es vergleicht Inhalte und *rekonstruiert* ein Umbenennen, wenn der Inhalt einer Datei größtenteils auf einen neuen Pfad wanderte.' },
      { level: 'Unter der Haube', body: 'Beim Diffing passt Git gelöschte und hinzugefügte Blobs anhand ihrer Ähnlichkeit zusammen und meldet sie als Rename, wenn sie nahe genug sind.' },
      { level: 'In der Praxis', body: 'Deshalb erscheint eine nahezu identische Datei unter einem neuen Namen in `git log --follow` als „renamed“.' },
    ],
    mindset: 'Umbenennungen werden erkannt, nicht gespeichert — Inhalt-Ähnlichkeit ist der Beweis.',
    industry: ['`git log --follow <path>` verfolgt eine Datei über Umbenennungen hinweg.', 'Passe die Ähnlichkeitsschwelle bei Bedarf mit `diff.renames` an.'],
  },
  untracked: {
    title: 'Unverfolgte Dateien',
    fromZero: [
      { level: 'Am Anfang', body: 'Eine Datei, die Git nie `add`ed hat, ist unverfolgt: Sie liegt auf der Festplatte, ist aber für den Index und die Commits unsichtbar.' },
      { level: 'Unter der Haube', body: 'Unverfolgte Dateien erscheinen in `git status` unter „Untracked files“ und können gestuft (werden verfolgt) oder ignoriert werden.' },
      { level: 'In der Praxis', body: 'Verlassene unverfolgte Dateien sind, wie Secrets und generierte Dateien in ein Repo schlüpfen.' },
    ],
    mindset: 'Unverfolgt heißt „Git weiß noch nicht davon“.',
    industry: ['`git status` vor `git add .`, um Müll nicht mit einzusammeln.', 'Lösche oder ignoriere Dateien, mit denen du fertig bist.'],
  },

  'fast-forward': {
    title: 'Fast-Forward-Merge',
    fromZero: [
      { level: 'Am Anfang', body: 'Wenn ein Branch einfach nur weiter ist als der andere, schiebt der Merge nur den Zeiger voran. Es wird kein neuer Commit erzeugt.' },
      { level: 'Unter der Haube', body: 'Ein Fast-Forward ist möglich, wenn die Spitze des Ziel-Branches ein direkter Nachkomme der aktuellen Spitze ist. Git schiebt einfach den Zeiger weiter.' },
      { level: 'In der Praxis', body: 'Lineare Historie entsteht oft durch häufige Fast-Forwards.' },
    ],
    mindset: 'Fast-Forward = es gab keinen echten Merge, nur ein Nachholen.',
    industry: ['`git merge` tut das automatisch, wo es kann.', 'Teams, die ein lineares Log wollen, rebase- oder `--ff-only`.'],
  },
  'merge-commit': {
    title: 'Merge-Commit',
    fromZero: [
      { level: 'Am Anfang', body: 'Wenn beide Branches jeweils Commits gewonnen haben, erzeugt der Merge einen neuen Commit mit *zwei* Eltern, der sie wieder verbindet.' },
      { level: 'Unter der Haube', body: 'Der Merge-Commit hält beide Linien der Historie, damit nichts verloren geht und der Graph die Verzweigung und den erneuten Zusammenschluss zeigt.' },
      { level: 'In der Praxis', body: 'Commits mit zwei Eltern sind die visuelle Signatur einer echten Integration.' },
    ],
    mindset: 'Ein Merge-Commit ist eine „hier treffen sich diese zwei Linien“-Markierung.',
    industry: ['`--no-ff` erzwingt einen Merge-Commit, auch wenn ein Fast-Forward möglich wäre, um die Integration zu dokumentieren.', 'Reviewer sehen sich Merge-Commits an, um Feature-Grenzen zu erkennen.'],
  },
  conflict: {
    title: 'Merge-Konflikte',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Konflikt entsteht, wenn beide Seiten *denselben* Ort geändert haben. Git kann nicht für dich wählen, also stoppt es und fragt.' },
      { level: 'Unter der Haube', body: 'Der Index hält deine Version, deren Version und die gemeinsame Basis (Stufen 1/2/3). Du bearbeitest die Datei zu dem Inhalt, den du willst, und `git add`est sie.' },
      { level: 'In der Praxis', body: 'Konflikte sind normal, kein Fehlschlag. Die Disziplin liegt im bewussten Lösen.' },
    ],
    mindset: 'Ein Konflikt ist eine Entscheidung, kein Fehler — du triffst den Beschluss.',
    industry: ['Lies alle drei Versionen, bevor du wählst.', 'Nach dem Lösen `git status` und `git commit` ausführen, um den Merge abzuschließen.'],
  },
  'detached-head': {
    title: 'Gelöstes HEAD',
    fromZero: [
      { level: 'Am Anfang', body: 'Meist zeigt HEAD auf einen Branch. Checkst du einen rohen Commit-Hash aus, zeigt HEAD direkt auf diesen Commit — das ist „gelöst“.' },
      { level: 'Unter der Haube', body: 'Committen im gelösten Zustand erzeugt Commits, auf die kein Branch-Name zeigt, die also leicht verloren gehen, sobald du weitergehst.' },
      { level: 'In der Praxis', body: 'Ein gelöstes HEAD ist bei `git bisect` und beim Stöbern in Tags zu erwarten.' },
    ],
    mindset: 'Gelöst ist zum Umschauen unbedenklich; erstelle einen Branch, bevor du dort committest.',
    industry: ['`git switch -c rescue` sichert einen gelösten Commit auf einen Branch.', 'CI-Prüfer laufen häufig auf gelösten HEADs.'],
  },
  rebase: {
    title: 'Rebase',
    fromZero: [
      { level: 'Am Anfang', body: 'Rebase spielt deine Commits auf einer neueren Basis ab und erzeugt eine gerade Linie der Historie.' },
      { level: 'Unter der Haube', body: 'Es wendet jeden deiner Commits als neuen Commit (neue Hashes) auf der neuen Basis an. Die alten Commits sind nicht mehr auf dem Branch.' },
      { level: 'In der Praxis', body: 'Rebase ist großartig, um *eigene, ungepushte* Arbeit vor einer Review aufzuräumen.' },
    ],
    mindset: 'Rebase schreibt Historie um. Rebase nie einen Branch, den andere schon gepullt haben.',
    industry: ['Rebase-Feature-Branches, um aktuell mit main zu bleiben.', 'Teams verbieten oft das Rebasen publizierter/gemeinsamer Branches per Policy.'],
  },
  'rebase-conflict': {
    title: 'Rebase mit Konflikten',
    fromZero: [
      { level: 'Am Anfang', body: 'Rebase spielt Commit für Commit ab, daher kann ein Konflikt den Rebase in der Mitte pausieren. Du löst ihn und fährst fort.' },
      { level: 'Unter der Haube', body: 'Wenn ein abgespielter Commit in Konflikt gerät, stoppt Git. Du fixst die Datei, `git add`est sie und führst `git rebase --continue` aus (oder `--abort`, um abzubrechen).' },
      { level: 'In der Praxis', body: 'Wiederkehrende Rebase-Konflikte sind der Preis eines langlebigen Feature-Branches.' },
    ],
    mindset: 'Jede pausierte Konflikt ist ein Commit zur selben Zeit — kleiner als ein ganzer Merge-Konflikt.',
    industry: ['Halte Rebase-Konflikte klein, indem du oft rebasest.', '`git rebase --abort` bringt dich immer zurück zum Startpunkt.'],
  },
  squash: {
    title: 'Commits squashen',
    fromZero: [
      { level: 'Am Anfang', body: 'Squash faltet mehrere kleine Commits in einen zusammen. Meist geschieht das kurz vor oder während der Review.' },
      { level: 'Unter der Haube', body: 'Interaktiver Rebase (`git rebase -i`) listet deine Commits und lässt einige als `squash` oder `fixup` markieren, was deren Änderungen und Nachrichten kombiniert.' },
      { level: 'In der Praxis', body: 'Ein sauberer Einzel-Commit pro Feature ist in vielen Teams üblich, auch wenn die Arbeit in mehreren Schritten stattfand.' },
    ],
    mindset: 'Squash formt die Historie, die der Reviewer sieht, während deine Arbeitsschritte lokal bleiben.',
    industry: ['`git rebase -i` mit `squash`/`fixup` ist das Standardwerkzeug.', 'Bewahre das *Warum* in der squashed-Nachricht; lass sperrige Zwischenüberschriften fallen.'],
  },
  'cherry-pick': {
    title: 'Cherry-pick',
    fromZero: [
      { level: 'Am Anfang', body: 'Cherry-pick kopiert die Änderung eines bestimmten Commits als neuen Commit auf deinen aktuellen Branch.' },
      { level: 'Unter der Haube', body: 'Es wendet den Diff dieses Commits auf HEAD an und erzeugt einen neuen Commit (neuer Hash) mit gleichem Inhalt.' },
      { level: 'In der Praxis', body: 'Nützlich, um einen Hotfix auf einen Release-Branch zu portieren, ohne das ganze Feature zu mergen.' },
    ],
    mindset: 'Cherry-pick dupliziert eine Änderung; er bewegt das Original nicht.',
    industry: ['Cherry-pick-Bugfixes auf Maintenance-/Release-Branches.', 'Der duplizierte Inhalt muss abgeglichen werden, wenn beide Branches später mergen.'],
  },
  reflog: {
    title: 'Das Reflog',
    fromZero: [
      { level: 'Am Anfang', body: 'Jedes Mal, wenn HEAD sich bewegt, schreibt Git es in ein verstecktes lokales Log — das Reflog. Es ist dein Rückgängig-Gedächtnis für *dein* Repository.' },
      { level: 'Unter der Haube', body: 'Es protokolliert `HEAD@{n}`-Einträge: den Hash, auf den HEAD nach jeder Änderung zeigte. Verwaiste Commits sind meist hier noch erreichbar.' },
      { level: 'In der Praxis', body: 'Es ist das Sicherheitsnetz, das „ich habe zu weit zurückgesetzt“ wiederherstellbar macht.' },
    ],
    mindset: 'Wenn ein Commit verloren scheint, ist er fast sicher im Reflog.',
    industry: ['`git reflog`, dann `git switch -c rescue <sha>` zur Wiederherstellung.', 'Das Reflog ist nur lokal — es überlebt einen frischen Clone nicht.'],
  },
  'reflog-recovery': {
    title: 'Einen verlorenen Commit retten',
    fromZero: [
      { level: 'Am Anfang', body: 'Reset und Rebase *lösen* Commits von einem Branch, löschen sie aber nicht. Das Reflog zeigt noch auf sie, also kannst du einen zurückholen.' },
      { level: 'Unter der Haube', body: 'Finde den Hash des verlorenen Commits im Reflog, checke ihn aus (gelöst) und lege mit `git switch -c` einen Branch darauf.' },
      { level: 'In der Praxis', body: 'Dieses exakte Retten passiert jedem; das Wissen darüber nimmt die Panik.' },
    ],
    mindset: 'Ein Commit ist erst wirklich weg, wenn er von *jeder* Ref, inklusive Reflog, unerreichbar ist.',
    industry: ['Prüfe das Reflog, bevor du irgendetwas forczst.', 'Hole wieder, dann rebase/merge bei Bedarf, um ihn korrekt anzuwenden.'],
  },

  push: {
    title: 'git push',
    fromZero: [
      { level: 'Am Anfang', body: 'Push lädt deine Commits auf ein Remote hoch, damit andere sie erhalten können.' },
      { level: 'Unter der Haube', body: 'Es sendet die Commits, die dein Branch hat und das Remote nicht, und aktualisiert dessen Ref. Ein *Non-Fast-Forward*-Push (das Remote ist weiter) wird aus Sicherheitsgründen abgelehnt.' },
      { level: 'In der Praxis', body: 'Push ist der Moment, in dem lokale Arbeit geteilt wird.' },
    ],
    mindset: 'Nach einem Push ist der Commit nicht mehr nur deiner.',
    industry: ['Feature-Branches frei pushen; main nur nach Teamregeln.', 'Ein abgelehnter Push bedeutet, das Remote ist weiter — erst pullen oder rebase-ten.'],
  },
  upstream: {
    title: 'Upstream / Tracking',
    fromZero: [
      { level: 'Am Anfang', body: 'Upstream ist der Remote-Branch, den dein lokaler Branch „verfolgt“. Richte ihn einmal ein, dann wissen `git push` und `git pull` ohne Argumente, wohin sie sollen.' },
      { level: 'Unter der Haube', body: '`git push -u origin <branch>` legt die Tracking-Beziehung an. Danach nutzen `git push` und `git pull` ohne Argumente sie.' },
      { level: 'In der Praxis', body: 'Tracking-Branches machen den täglichen Push/Pull-Loop mühelos.' },
    ],
    mindset: 'Richte Upstream einmal pro Branch ein, dann tippe nie wieder jedes Mal das Remote.',
    industry: ['`git push -u origin <branch>` beim ersten Push.', '`git status` zeigt, wie weit du voraus/hinterher zu upstream bist.'],
  },
  'force-push': {
    title: 'Force-Push',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein normaler Push verweigert es, einen Remote-Branch zu überschreiben, der sich bewegt hat. Force-Push sagt „ja, ersetze ihn“ — gefährlich, weil er die überschriebenen Remote-Commits verwirft.' },
      { level: 'Unter der Haube', body: 'Nach einem Rebase oder Amend leitet deine Historie nicht mehr von der Remote-Spitze ab, also wird ein normaler Push abgelehnt. `--force` überschreibt; `--force-with-lease` überschreibt *nur, wenn* sich das Remote seit deinem letzten Fetch nicht geändert hat.' },
      { level: 'In der Praxis', body: 'Force-Push ist für deinen eigenen Feature-Branch nach einem Rebase legitim — und auf gemeinsamen Branches verboten.' },
    ],
    mindset: 'Force-Push schreibt geteilte Historie um. Besitze den Branch, oder force nicht.',
    industry: ['Bevorzuge `--force-with-lease` gegenüber `--force`.', 'Force-Push- nie `main`; hole mit Revert wieder.'],
  },
  'ref-spec': {
    title: 'Refspecs',
    fromZero: [
      { level: 'Am Anfang', body: 'Eine Refspec sagt „nimm diese Ref, setze sie dort ab“. In `git push origin feature:feature` ist der Teil nach dem Doppelpunkt der Zielname.' },
      { level: 'Unter der Haube', body: 'Push und Fetch verwenden `<src>:<dst>`-Abbildungen. Weglassen einer Seite bedeutet standardmäßig „gleicher Name“.' },
      { level: 'In der Praxis', body: 'Du tippst Refspecs selten, aber sie zu verstehen macht die `push`-Ausgabe verständlich.' },
    ],
    mindset: 'Eine Refspec ist eine Zuordnungsvorschrift, kein Dateipfad.',
    industry: ['`git push origin HEAD:refs/heads/feature` ist die explizite Form.', 'Fetch-Refspecs steuern, was `origin/*` trackt.'],
  },
  'pr-workflow': {
    title: 'Pull Requests / Review',
    fromZero: [
      { level: 'Am Anfang', body: 'Der moderne Workflow: branchen, committen, pushen und einen Pull Request (PR) öffnen, der bittet, deinen Branch nach Review in einen gemeinsamen zu mergen.' },
      { level: 'Unter der Haube', body: 'Der PR ist ein Diff zwischen zwei Branches plus ein Ort für Diskussion, Checks und Freigabe. Mergen ist einfach ein auf dem Remote ausgeführter Merge (oder Rebase).' },
      { level: 'In der Praxis', body: 'Der PR ist das Integrations-Tor — wo Review, CI und Policy aufeinandertreffen.' },
    ],
    mindset: 'Der PR ist eine reviewbare, rückholbare Einheit der Änderung.',
    industry: ['Halte PRs klein und fokussiert.', 'CI (Tests, Lint) läuft auf dem PR, bevor er mergen kann.'],
  },

  'reset-modes': {
    title: 'git reset (drei Modi)',
    fromZero: [
      { level: 'Am Anfang', body: 'Reset bewegt einen Branch-Zeiger zurück zu einem Commit. Was er mit *deiner übrigen Arbeit* tut, hängt vom Modus ab.' },
      { level: 'Unter der Haube', body: '`--soft`: bewegt den Branch, behält Index und Arbeitsbaum (Änderungen werden gestuft). `--mixed` (Standard): bewegt den Branch und setzt den Index zurück (Änderungen werden entstuft). `--hard`: bewegt den Branch und schreibt den Arbeitsbaum um (Änderungen sind weg).' },
      { level: 'In der Praxis', body: 'Reset schreibt lokale Historie um — gut für deine ungepushte Arbeit, nach einem Push gefährlich.' },
    ],
    mindset: 'Wähle den sanftesten Modus, der das Problem löst.',
    industry: ['`--soft`, um zu ent-committen und alles gestuft zu belassen.', '`--hard` ist destruktiv — erst `git status`.'],
  },
  'revert-vs-reset': {
    title: 'Revert vs. Reset',
    fromZero: [
      { level: 'Am Anfang', body: 'Beide rückgängig machen eine Änderung, aber auf entgegengesetzte Weise. Revert *fügt* einen neuen Commit hinzu, der den alten rückgängig macht. Reset *bewegt* einen Zeiger zurück.' },
      { level: 'Unter der Haube', body: 'Revert hält die Historie ehrlich und ist sicher für gemeinsame Branches. Reset schreibt Historie um und darf nicht auf Commits angewendet werden, die andere gepullt haben.' },
      { level: 'In der Praxis', body: 'Auf einem gemeinsamen main ist Revert der einzige sichere Rückgang.' },
    ],
    mindset: 'Geteilte Historie → Revert. Private, ungepushte Historie → Reset.',
    industry: ['`git revert <sha>`, um eine veröffentlichte Änderung sicher rückgängig zu machen.', 'Wenn ein Secret committet wurde: revert es *und* rotiere die Zugangsdaten.'],
  },
  stash: {
    title: 'git stash',
    fromZero: [
      { level: 'Am Anfang', body: 'Stash parkt deine uncommitten Änderungen vorübergehend, damit du auf einem sauberen Baum arbeiten kannst, und holt sie später zurück.' },
      { level: 'Unter der Haube', body: 'Es speichert einen Schnappschuss des Arbeitsbaums (und des Index) auf einem Stapel. `git stash pop` stellt den obersten wieder her und löscht ihn; `git stash list` zeigt den Stapel.' },
      { level: 'In der Praxis', body: 'Stash ist für eine fünfminütige Parkbank, nicht für langfristige Aufbewahrung.' },
    ],
    mindset: 'Stash ist vorübergehender Kontext — wende ihn bald an, sonst wird er vergessen.',
    industry: ['`git stash`, bevor du zum Untersuchen zwischen Branches wechselst.', 'Bleibt die Arbeit einen Tag, commite sie stattdessen auf einen WIP-Branch.'],
  },
  recovery: {
    title: 'Das Wiederherstellungs-Set',
    fromZero: [
      { level: 'Am Anfang', body: 'Verschiedene Fehler brauchen verschiedene Werkzeuge. Ordne das Werkzeug dem Fehler zu, und du verlierst selten Arbeit.' },
      { level: 'Unter der Haube', body: 'Falsche *Bearbeitung*? `git restore`. Falscher, *ungepushter* Commit? `git reset`. Falscher, *gepushter* Commit? `git revert`. Willst du Arbeit *parken*? `git stash`. Wirklich *verloren*? `git reflog`.' },
      { level: 'In der Praxis', body: 'Diese Zuordnung ist der Unterschied zwischen Panik und einer fünfminütigen Reparatur.' },
    ],
    mindset: 'Nenne den Fehler, dann wähle sein Werkzeug.',
    industry: ['Behalte `git status`, `git log --oneline --graph` und `git reflog` als deine drei Notfall-Befehle.'],
  },

  tag: {
    title: 'Tags',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Tag ist ein fester Name auf einem Commit. Branches bewegen sich; Tags tun es nicht.' },
      { level: 'Unter der Haube', body: 'Leichte Tags sind nur ein Name. Annotierte Tags (`-a`) speichern auch eine Nachricht, einen Autor und ein Datum — die, die du für Releases willst.' },
      { level: 'In der Praxis', body: 'Release-Pipelines und Rollbacks verweisen auf Tags, nicht auf Branch-Namen, weil ein Tag eine stabile Koordinate ist.' },
    ],
    mindset: 'Tagge genau den Commit, den du auslieferst, mit einer Annotation.',
    industry: ['`git tag -a v1.2.0 -m "..."` auf dem Release-Commit.', 'Tags explizit pushen: `git push origin v1.2.0`.'],
  },
  bisect: {
    title: 'git bisect',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Bug tauchte irgendwo in der Historie auf. Bisect führt eine binäre Suche über Commits, um den zu finden, der ihn einführte.' },
      { level: 'Unter der Haube', body: 'Du gibst ihm einen bekannten guten und einen bekannten schlechten Commit. Er checkt die Mitte aus, du sagst gut oder schlecht, und er halbiert den Bereich, bis ein Commit beschuldigt ist.' },
      { level: 'In der Praxis', body: '„Irgendwann in drei Monaten kaputt“ wird in wenigen Schritten zu „in Commit X kaputt“.' },
    ],
    mindset: 'Bisect ist eine geführte binäre Suche durch die Historie.',
    industry: ['`git bisect start`, `git bisect bad HEAD`, `git bisect good <old>`, dann `good`/`bad`.', 'Automatisiere mit `git bisect run <test-command>`.'],
  },
  blame: {
    title: 'git blame',
    fromZero: [
      { level: 'Am Anfang', body: 'Blame antwortet auf „wer hat diese Zeile zuletzt geändert, und wann?“ — zeilenweise für eine Datei.' },
      { level: 'Unter der Haube', body: 'Es ordnet jede aktuelle Zeile dem Commit zu, der sie zuletzt berührte, und folgt der Historie (inklusive Umbenennungen mit `--follow`).' },
      { level: 'In der Praxis', body: 'Nutze es, um die richtige Person oder den einführungs-Commit eines Bugs zu finden — nicht, um Schuld zu zuweisen.' },
    ],
    mindset: 'Blame ist ein Werkzeug zum Verstehen, nicht zum Schuldzuweisen.',
    industry: ['`git blame -L <start>,<end> <file>` für einen Zeilenbereich.', 'IDEs zeigen Inline-Blame für schnellen Kontext.'],
  },
  worktree: {
    title: 'git worktree',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Worktree lässt dich einen *zweiten* Branch in einem *zweiten* Ordner aus demselben Repository auschecken, ohne Stash oder Umschalten.' },
      { level: 'Unter der Haube', body: 'Es nutzt denselben `.git`-Objektspeicher, hat aber seinen eigenen Arbeitsbaum und Index, sodass zwei Branches gleichzeitig auf der Festplatte sein können.' },
      { level: 'In der Praxis', body: 'Nützlich für einen schnellen Hotfix, während du mitten in einem großen Feature steckst, ohne es zu stören.' },
    ],
    mindset: 'Ein Repo, mehrere Arbeitsbäume — jeder auf seinem Branch.',
    industry: ['`git worktree add ../hotfix -b hotfix`, um einen parallelen Baum zu öffnen.', 'Räume mit `git worktree remove` auf, wenn du fertig bist.'],
  },
  submodule: {
    title: 'Submodule',
    fromZero: [
      { level: 'Am Anfang', body: 'Ein Submodul bettet ein Repository in ein anderes ein, fest an einen bestimmten Commit. Es ist der Weg, eine geteilte Bibliothek in ihre eigene Historie zu halten und trotzdem einzubeziehen.' },
      { level: 'Unter der Haube', body: 'Das übergeordnete Repo speichert einen *Commit-Zeiger* (ein Gitlink), nicht die Inhalte des Submoduls. Du musst `git submodule update` ausführen, um den festgelegten Inhalt zu holen.' },
      { level: 'In der Praxis', body: 'Submodule sind mächtig, aber berüchtigt unhandlich; viele Teams ziehen bevorzugt Paketmanager vor.' },
    ],
    mindset: 'Ein Submodul ist ein festgelegter Commit-Zeiger, keine Dateikopie.',
    industry: ['`git submodule add <url>`, um eines einzubetten.', 'Locking: Das übergeordnete speichert den exakten Submodul-Commit, damit Builds reproduzierbar bleiben.'],
  },
  porcelain: {
    title: 'Porcelain vs. Plumbing',
    fromZero: [
      { level: 'Am Anfang', body: 'Git hat zwei Gesichter. „Porcelain“ sind die freundlichen, meinungsvollen Befehle des Alltags. „Plumbing“ sind die tiefen Objekt- und Ref-Operationen.' },
      { level: 'Unter der Haube', body: 'Porcelain (wie `git status`) ist für Menschen stabil. Plumbing (wie `git cat-file`, `git update-ref`) ist für Skripte stabil. Die zwei Ebenen erlauben Git, Interna zu ändern, ohne Skripte zu brechen.' },
      { level: 'In der Praxis', body: 'Skripte sollten porcelain-v2 oder Plumbing nutzen, nicht `git status`-Text raspeln.' },
    ],
    mindset: 'Porcelain für Menschen, Plumbing für Maschinen.',
    industry: ['`git log --porcelain` / `git status --porcelain` liefern maschinenlesbare Ausgabe.', 'Automatisierungs-Tools bauen auf Plumbing für Zuverlässigkeit.'],
  },
};
