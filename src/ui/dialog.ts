/** Minimal modal + markdown renderer. */

export interface ModalAction {
  label: string;
  className?: string;
  onClick?: () => void;
}

export interface ModalOptions {
  title: string;
  bodyHtml: string;
  actions?: ModalAction[];
  onClose?: () => void;
}

export function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const html: string[] = [];
  let inCode = false;
  let inTable = false;
  let list: string[] = [];

  const flushList = () => {
    if (list.length) {
      html.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`);
      list = [];
    }
  };
  const flushTable = () => {
    if (inTable) {
      html.push('</tbody></table>');
      inTable = false;
    }
  };

  for (const raw of lines) {
    const line = raw;
    if (line.startsWith('```')) {
      flushList();
      flushTable();
      if (inCode) {
        html.push('</pre>');
        inCode = false;
      } else {
        html.push('<pre>');
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      html.push(escapeHtml(line) + '\n');
      continue;
    }
    if (/^\|/.test(line)) {
      flushList();
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((c, i, arr) => !(i === 0 && c === '') && !(i === arr.length - 1 && c === ''));
      if (!inTable) {
        html.push(`<table><tbody>`);
        inTable = true;
        html.push(`<tr>${cells.map((c) => `<th>${inline(c)}</th>`).join('')}</tr>`);
      } else if (/^[\s|:-]+$/.test(line)) {
        // separator — skip
      } else {
        html.push(`<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`);
      }
      continue;
    }
    flushTable();

    if (/^#{1,3}\s/.test(line)) {
      flushList();
      const level = line.match(/^#+/)![0].length;
      html.push(`<h${level + 2}>${inline(line.replace(/^#+\s*/, ''))}</h${level + 2}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      list.push(line.replace(/^\d+\.\s+/, ''));
      continue;
    }
    if (line.trim() === '') {
      flushList();
      continue;
    }
    flushList();
    // Allow raw HTML blocks (coffee button, anchors) through unescaped.
    if (/^\s*<(a|img|div|span|button)\b/i.test(line)) {
      html.push(line);
      continue;
    }
    html.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  flushTable();
  if (inCode) html.push('</pre>');
  return html.join('');
}

function inline(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C084FC">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface ModalHandle {
  el: HTMLElement;
  close: () => void;
}

export function showModal(opts: ModalOptions): ModalHandle {
  const existing = document.querySelector('.modal-backdrop');
  existing?.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<h2></h2><div class="slides"></div><div class="modal-actions"></div>`;
  modal.querySelector('h2')!.textContent = opts.title;
  modal.querySelector('.slides')!.innerHTML = opts.bodyHtml;

  const actions = modal.querySelector('.modal-actions')!;
  const close = () => {
    backdrop.remove();
    opts.onClose?.();
  };
  for (const a of opts.actions ?? [{ label: 'Close', className: 'primary', onClick: () => undefined }]) {
    const btn = document.createElement('button');
    btn.textContent = a.label;
    if (a.className) btn.className = a.className;
    btn.addEventListener('click', () => {
      close();
      a.onClick?.();
    });
    actions.appendChild(btn);
  }

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  return { el: modal, close };
}
