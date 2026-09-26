/** Terminal input + history + output log. */

export interface TerminalHandles {
  root: HTMLElement;
  print: (text: string, kind?: TermLineKind) => void;
  clear: () => void;
  focus: () => void;
  onSubmit: (line: string) => void;
}

export type TermLineKind = 'cmd' | 'out' | 'err' | 'meta' | 'why' | 'ok';

export function createTerminal(
  parent: HTMLElement,
  onSubmit: (line: string) => void,
): TerminalHandles {
  const root = document.createElement('div');
  root.className = 'terminal-wrap';
  root.innerHTML = `
    <div class="terminal" data-term></div>
    <div class="term-input-row">
      <span class="term-prompt">learngit ›</span>
      <input class="term-input" type="text" spellcheck="false" autocomplete="off" placeholder="type a command… (help)" />
    </div>
  `;
  parent.appendChild(root);

  const term = root.querySelector('[data-term]') as HTMLElement;
  const input = root.querySelector('.term-input') as HTMLInputElement;
  const history: string[] = [];
  let histIdx = -1;

  function print(text: string, kind: TermLineKind = 'out'): void {
    const line = document.createElement('div');
    line.className = `term-line ${kind}`;
    line.textContent = text;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  }

  function clear(): void {
    term.innerHTML = '';
  }

  function focus(): void {
    input.focus();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const line = input.value;
      if (!line.trim()) return;
      history.push(line);
      histIdx = history.length;
      print(`learngit › ${line}`, 'cmd');
      input.value = '';
      onSubmit(line);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = history[histIdx] ?? '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx] ?? '';
      } else {
        histIdx = history.length;
        input.value = '';
      }
    }
  });

  root.addEventListener('click', () => focus());

  return {
    root,
    print,
    clear,
    focus,
    onSubmit,
  };
}
