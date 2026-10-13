import './style.css';
import { App } from './ui/app';
import { allLevels } from './levels';
import { showModal, renderMarkdown } from './ui/dialog';
import { COFFEE_BUTTON_HTML } from './ui/share';
import { initLang, getLang } from './i18n/lang';
import { ui } from './i18n/ui';

// Apply the persisted language (and RTL for Persian) before first paint.
initLang();

const root = document.querySelector('#app');
if (!root) throw new Error('#app root missing');

const app = new App(root as HTMLElement);

const params = new URLSearchParams(window.location.search);
if (!params.has('NODEMO')) {
  const w = ui(getLang()).welcome;
  showModal({
    title: w.title,
    titleHtml: w.titleHtml,
    bodyHtml: renderMarkdown(
      [
        w.intro,
        '',
        w.board,
        '',
        w.tracks.join('\n'),
        '',
        w.meta,
        '',
        w.levelsCount(allLevels.length),
        '',
        w.what,
        w.whatBody,
        '',
        w.publisher,
        w.publisherBody,
        '',
        COFFEE_BUTTON_HTML,
        '',
      ].join('\n'),
    ),
    actions: [
      {
        label: w.sandbox,
        className: 'ghost',
        onClick: () => undefined,
      },
      {
        label: w.openLevels,
        className: 'primary',
        onClick: () => {
          const btn = document.querySelector<HTMLButtonElement>('[data-action="levels"]');
          btn?.click();
        },
      },
    ],
  });
}

// expose for debugging in console
(window as unknown as { learnGitApp: App }).learnGitApp = app;
