/** Persian (فارسی) per-level text overrides.
 *
 * Each key is a `LevelDef.id`; anything not overridden here falls back to the
 * English inline text in `src/levels/index.ts`. Technical commands, flags and
 * literal commit-message phrases are kept in English on purpose — only the
 * prose is translated.
 */
import type { LevelOverrides } from './levels';

export const LEVELS_FA: LevelOverrides = {
  /* ───────────────────────────── BASICS ───────────────────────────── */

  'basics-init': {
    name: 'ساختن یک مخزن',
    objective: 'یک مخزن خالی گیت در دایرکتوری کاری بساز.',
    hint: 'دستور `git init` است. بعد اگر خواستی `git status` را چک کن.',
    fieldNotes: ['`git init` را یک‌بار برای ریشه‌ی هر پروژه اجرا کن. مخزنان تودرتو ابزارها و CI را گیج می‌کنند.'],
    startDialog: [
      {
        title: 'خوش آمدی به گیت',
        markdown:
          'گیت **اسنپ‌شات‌ها** را ردیابی می‌کند، نه تفاوت‌ها را. قبل از همه‌ی این‌ها به یک مخزن نیاز داری.\n\nاین مرحله یک دستور است: ساختن دایرکتوری `.git`.',
      },
    ],
  },

  'basics-add-commit': {
    name: 'آماده‌سازی و کامیت',
    objective: 'فایلِ جدید را آماده‌سازی کن و یک کامیت بساز که پیامش «add app» را ذکر کند.',
    hint: 'اول `git status`، بعد `git add src/app.py` (یا `.`)، بعد `git commit -m "add app"`.',
    fieldNotes: [
      'آماده‌سازی را عمداً و آگاهانه انجام بده. `git add .` در شروع پروژه خوب است؛ بعدا مسیرهای صریح یا `git add -p` را ترجیح بده.',
      'پیام‌های کامیت *چرایی* را توضیح می‌دهند. «add app» برای این تمرین کافی است — در کار واقعی یک جمله‌ی کامل بنویس.',
    ],
    startDialog: [
      {
        title: 'سه ناحیه',
        markdown:
          'یک فایل می‌تواند هم‌زمان در سه مکان زندگی کند:\n\n1. **درخت کار** — چیزی که ویرایش می‌کنی\n2. **آماده‌سازی (شاخص)** — پیش‌نویسِ کامیتِ بعدی\n3. **مخزن** — اسنپ‌شات‌های ماندگار\n\n`git add` محتوا را به شاخص منتقل می‌کند. `git commit` شاخص را در یک کامیت می‌سازد.',
      },
    ],
  },

  'core-commit-convention': {
    name: 'نوشتن یک پیام متعارف',
    objective: '`src/login.py` را اضافه کن و با یک پیام Conventional-Commits که با «feat: add login» شروع می‌شود، کامیتش کن.',
    hint: '`git add src/login.py`، `git commit -m "feat: add login"`.',
    fieldNotes: ['`feat:`، `fix:`، `docs:` — یک پیشوند کوتاهِ نوع، خواندن changelog و git-bisect را بسیار آسان‌تر می‌کند.'],
    startDialog: [
      {
        title: 'تعارف‌های پیام',
        markdown:
          'بسیاری از تیم‌ها از یک پیشوند مثل `feat:`، `fix:` یا `refactor:` استفاده می‌کنند.\nاین پیشوند *قصد* را نشان می‌دهد، نه فقط اینکه کدام فایل‌ها تغییر کرده‌اند.',
      },
    ],
  },

  'basics-edit-add-commit': {
    name: 'تغییر، آماده‌سازی، و کامیت دوباره',
    objective: 'README.md را ویرایش کن، آماده‌سازی‌اش کن و با پیامی که «update readme» دارد، کامیتش کن.',
    hint: 'برای کثیف‌کردن فایل از `edit README.md` استفاده کن، بعد `git add README.md` و `git commit -m "update readme"`.',
    fieldNotes: ['هرگز یک رفع‌باگ و یک رینوم را در یک کامیت قاطی نکن. قبل از کامیت `git diff --staged` را ببین.'],
    startDialog: [
      {
        title: 'دومین کامیت',
        markdown:
          'کامیتِ اول یک اسنپ‌شات است. وقتی فایلی را تغییر می‌دهی، درخت کار نسبت به HEAD **کثیف** می‌شود.\n\nدوباره آماده‌سازی و کامیت کن تا یک اسنپ‌شاتِ تازه بسازی. تاریخچه یک فهرستِ پیوسته از درخت‌هاست.',
      },
    ],
  },

  'core-amend': {
    name: 'ویرایشِ آخرین کامیت',
    objective: 'README.md را تغییر بده، آماده‌سازی‌اش کن و کامیتِ آخر را بازنویسی کن تا پیامش «improved» را شامل شود — بدون ساختن کامیتِ تازه.',
    hint: '`edit README.md`، `git add README.md`، `git commit --amend -m "improved readme"`.',
    fieldNotes: ['فقط کامیت‌هایی که هنوز پوش نشده‌اند را amend کن. وقتی کامیتی روی ریموتِ مشترک رفت، به‌جای بازنویسی از revert استفاده کن.'],
    startDialog: [
      {
        title: 'Amend',
        markdown:
          '`git commit --amend` تغییرِ آماده‌سازی‌شده‌ات را در کامیتِ **قبلی** جمع می‌کند: همان جایگاه، محتوای تازه، و به‌اختیار پیامِ تازه.\n\nتعداد کامیت‌ها همان می‌ماند — اسنپ‌شاتِ تازه‌ای روی آن نساختی.',
      },
    ],
  },

  'core-rm': {
    name: 'حذف یک فایل با گیت',
    objective: '`notes.txt` را با گیت حذف کن (حذف را ردیابی کن) و حذف را کامیت کن.',
    hint: '`git rm notes.txt`، بعد `git commit -m "remove notes"`.',
    fieldNotes: ['`git rm` فایل را حذف می‌کند و حذف را آماده‌سازی می‌کند. یک `rm` خالی از filesystem گیت را طوری جا می‌گذارد که فکر کند فایل باید هنوز آنجا باشد.'],
    startDialog: [
      {
        title: 'حذف‌ها هم تغییرند',
        markdown:
          'حذف کردن یک فایل هم یک تغییر است، پس باید مثل هر تغییر دیگری کامیت شود.\n`git rm` حذف را آماده‌سازی می‌کند تا کامیتِ بعدی آن را ثبت کند.',
      },
    ],
  },

  'core-mv': {
    name: 'رینوم یک فایل با git mv',
    objective: '`src/app.py` را با گیت به `src/main.py` رینوم کن تا رینوم ردیابی و آماده‌سازی شود.',
    hint: '`git mv src/app.py src/main.py`.',
    fieldNotes: ['`git mv` یک رینوم + آماده‌سازیِ اتمی است. گیت بعدا اغلب در `log`/`diff` رینوم را تشخیص می‌دهد.'],
    startDialog: [
      {
        title: 'رینوم اتمی',
        markdown:
          'رینوم کردن دو تغییر یک‌جا است: مسیرِ قدیمی از بین می‌رود و مسیرِ تازه ظاهر می‌شود.\n`git mv` هر دو را انجام می‌دهد و نتیجه را یک‌جا آماده‌سازی می‌کند.',
      },
    ],
  },

  'core-ignore': {
    name: 'نادیده‌گرفتن خروجی‌های build',
    objective: 'یک قانونِ نادیده‌گرفتن اضافه کن تا `build.log` نادیده گرفته شود و دیگر به‌عنوان فایلِ نامشخص ظاهر نشود.',
    hint: '`gitignore *.log` را اجرا کن، بعد `git status` را چک کن — build.log باید از لیستِ نامشخص ناپدید شده باشد.',
    fieldNotes: ['`.gitignore` را کامیت کن تا کل تیم همان خروجی‌ها را نادیده بگیرد. هرگز چیزی که واقعاً می‌خواهی ردیابی‌اش کنی را نادیده نگیر.'],
    startDialog: [
      {
        title: 'قوانین نادیده‌گرفتن',
        markdown:
          '`.gitignore` به گیت می‌گوید از مسیرهایی رد شود که نمی‌خواهی ردیابی شوند: خروجی build، رمزها، لاگ‌ها.\n\nفایل‌های نادیده‌گرفته‌شده از `git status` سادگی ناپدید می‌شوند.',
      },
    ],
  },

  'core-clone': {
    name: 'کلون کردن یک مخزنِ ریموت',
    objective: '`/tmp/repo.git` را کلون کن تا یک کپیِ محلی با تاریخچه و یک ریموت به نام `origin` داشته باشی.',
    hint: '`git clone /tmp/repo.git`.',
    fieldNotes: ['`git clone` قدمِ اولِ بیشترِ جریان‌های کار است. مخزن را می‌سازد، شاخه‌ی پیش‌فرض را check-out می‌کند و `origin` را تنظیم می‌کند.'],
    startDialog: [
      {
        title: 'شروع از مخزنِ کسی دیگر',
        markdown:
          '`git clone` یک مخزن را دانلود می‌کند، تاریخچه‌اش را محلی بازسازی می‌کند و `origin` را برایت تنظیم می‌کند.\n\nاین نقطه‌ی ورود به همکاری روی یک codebase مشترک است.',
      },
    ],
  },

  'basics-status-log': {
    name: 'خواندن status و log',
    objective: 'یک کامیت بساز که «checkpoint» را شامل شود، بعد تاریخچه را با git log ببین.',
    hint: 'یک فایل edit کن، `git add .`، `git commit -m "checkpoint"`، بعد `git log --oneline`.',
    fieldNotes: ['`git log --oneline --graph --decorate` راننده‌ی روزمره است. سه پرچم را خوب یاد بگیر.'],
    startDialog: [
      {
        title: 'status یک نقشه است، log یک خط زمانی',
        markdown:
          '`git status` به‌ت می‌گوید هر فایل در کدام‌یک از سه ناحیه نشسته است.\n`git log` از HEAD روی DAGِ کامیت‌ها قدم می‌زند.\n\nاین دو با هم جواب می‌دهند: *کجام و چطور اینجایم؟*',
      },
    ],
  },

  /* ───────────────────────────── DIFF & SHOW ───────────────────────────── */

  'diff-unstaged': {
    name: 'دیدن تغییراتِ آماده‌نشده',
    objective: 'config.yaml را edit کن و diffِ آماده‌نشده را نشان بده (هنوز کامیت نکن). فایل را کثیف بگذار.',
    hint: '`edit config.yaml` را اجرا کن، بعد `git diff`. آماده‌سازی یا کامیت نکن.',
    fieldNotes: ['`git diff` درخت کار در برابر شاخص است. `git diff --staged` شاخص در برابر HEAD. بدان کدام را داری می‌بینی.'],
    startDialog: [
      {
        title: 'دو diff',
        markdown:
          '- `git diff` — چیزی که تغییر دادی ولی **هنوز** آماده‌سازی نکرده‌ای\n- `git diff --staged` — چیزی که در **کامیتِ بعدی** می‌رود\n\nاین مرحله اولی را می‌خواهد، و درختِ کثیف در انتها.',
      },
    ],
  },

  'diff-staged': {
    name: 'آماده‌سازی و بعد inspect --staged',
    objective: 'src/app.py را edit کن، آماده‌سازی‌اش کن و diffِ آماده‌شده را ببین. کامیت نکن.',
    hint: '`edit src/app.py`، `git add src/app.py`، `git diff --staged`.',
    fieldNotes: ['`git diff --staged` دروازه‌ی review است. اگر آن خروجی اشتباه باشد، کامیت هم اشتباه خواهد بود.'],
    startDialog: [
      {
        title: 'شاخص یک پیش‌نویسِ کامیت است',
        markdown:
          'به‌محض `git add`، تغییر از `git diff` خارج و وارد `git diff --staged` می‌شود.\n\nهمین حرکت *نفسِ* ناحیه‌ی آماده‌سازی است.',
      },
    ],
  },

  'diff-restore': {
    name: 'پرت‌کردن یک ویرایشِ بد',
    objective: 'یک ویرایشِ بد روی README.md افتاده. آن را از HEAD برگردان تا درخت کار تمیز شود.',
    hint: 'فایل از قبل کثیف است. `git restore README.md` را اجرا کن.',
    fieldNotes: ['`git restore <file>` «واگردِ ویرایش‌هایم»ِ امن برای کارِ کامیت‌نشده است. اگر ممکن است بعدا به آن نیاز داشته باشی، stash کن.'],
    startDialog: [
      {
        title: 'پرت‌کردنِ عمدیِ کار',
        markdown:
          'ویرایش‌های کامیت‌نشده فقط در درخت کار زندگی می‌کنند. `git restore <path>` HEAD (یا شاخص) را دوباره روی فایل کپی می‌کند.\n\nکامیتی برای «واگرد کردن» وجود ندارد — هنوز چیزی ذخیره نشده.',
      },
    ],
  },

  'diff-show': {
    name: 'بازبینی یک کامیت با show',
    objective: 'تاریخچه را بخوان، بعد کامیتِ فعلی را با جزئیات با `git show` ببین.',
    hint: '`git log --oneline`، بعد `git show` (به‌طور پیش‌فرض HEAD).',
    fieldNotes: ['`git show <sha>` سریع‌ترین راه برای دیدن یک کامیت است: پیامش، والدانش و درختی که ساخته.'],
    startDialog: [
      {
        title: 'یک کامیت، کامل',
        markdown:
          '`git log` کامیت‌ها را لیست می‌کند؛ `git show` یکی را باز می‌کند و پیام، والدین و فایل‌هایی که ثبت کرده را چاپ می‌کند.\n\nبرای فهمیدن دقیق اینکه یک تغییر چه کرد، از آن استفاده کن.',
      },
    ],
  },

  /* ───────────────────────────── BRANCHING ───────────────────────────── */

  'branch-create': {
    name: 'ساختن یک شاخه‌ی feature',
    objective: 'یک شاخه به نام `feature` بساز (سوییچ به آن نکن).',
    hint: '`git branch feature` — لازم نیست هنوز سوییچ کنی.',
    fieldNotes: ['نام‌های شاخه کار را توصیف می‌کنند: `feature/login`، `fix/null-check`. نه `test2`.'],
    startDialog: [
      {
        title: 'شاخه‌ها اشاره‌گرند',
        markdown:
          'یک شاخه یک نامِ جابه‌جا‌شونده → هشِ یک کامیت است. ساختنش هیچ خرجی ندارد.\n\nوقتی branch می‌زنی گرافِ کامیت تغییر نمی‌کند؛ فقط برچسب عوض می‌شود.',
      },
    ],
  },

  'branch-switch': {
    name: 'سوییچ به feature و کامیت',
    objective: 'ساخت و سوییچ به `feature`، یک تغییر به src/app.py، و کامیت با «feature work».',
    hint: '`git switch -c feature`، `edit src/app.py`، `git add src/app.py`، `git commit -m "feature work"`.',
    fieldNotes: ['`git switch -c name` هم می‌سازد هم check-out می‌کند، یک‌جا. برای کار روزمره switch/restore را به checkout ترجیح بده.'],
    startDialog: [
      {
        title: 'HEAD با تو حرکت می‌کند',
        markdown:
          'وقتی بین شاخه‌ها سوییچ می‌کنی، HEAD دوباره اشاره می‌کند و درخت کار به درختِ آن کامیت بازنویسی می‌شود.\n\nکامیت‌های تازه فقط اشاره‌گرِ *شاخه‌ی فعلی* را جلو می‌برند.',
      },
    ],
  },

  'branch-merge-ff': {
    name: 'ادغامِ fast-forward',
    objective: 'روی `feature` کامیت «ship feature» کن. سوییچ به main و merge کردن feature (fast-forward کافی است).',
    hint: 'اول روی feature کامیت کن، بعد `git switch main` و `git merge feature`.',
    fieldNotes: ['Fast-forward تمیز است ولی نشانِ «این یک feature بود» را از بین می‌برد. وقتی تیم حباب‌های merge می‌خواهد، --no-ff استفاده کن.'],
    startDialog: [
      {
        title: 'Fast-forward',
        markdown:
          'اگر `main` از زمان branch زدن `feature` حرکت نکرده باشد، merge فقط اشاره‌گرِ `main` را جلو می‌لغزد.\n\nکامیتِ merge نداریم. تاریخچه خطی می‌ماند.',
      },
    ],
  },

  'branch-merge-commit': {
    name: 'کامیتِ merge واقعی',
    objective: 'روی `hotfix` کامیت «hotfix ready» کن، بعد روی main کامیت «main work»، بعد hotfix را در main merge کن.',
    hint: 'قبل از آنکه merge یک کامیتِ merge بسازد، به دو کامیتِ مستقل (یکی در هر شاخه) نیاز داری.',
    fieldNotes: ['وقتی هر دو طرف حرکت کرده باشند، merge دو والد را ثبت می‌کند. این بازگشت DAG است — نه یک شکست.'],
    startDialog: [
      {
        title: 'وقتی fast-forward ممکن نیست',
        markdown:
          'اگر `main` بعد از ساختن شاخه جلو رفته باشد، merge یک **کامیتِ merge** با دو والد می‌سازد.\n\nهر دو خطِ تاریخچه همچنان قابل دسترس می‌مانند.',
      },
    ],
  },

  'branch-detached': {
    name: 'بازیابیِ HEAD جدا',
    objective:
      'کامیتِ قبلی را با هش check-out کن (HEAD جدا)، بعد یک شاخه به نام `rescue` بساز و سوییچش کن تا کار گم نشود.',
    hint: '`git log --oneline` برای دیدن هش‌ها، `git switch <old-hash>`، بعد `git switch -c rescue`.',
    fieldNotes: [
      'HEAD جدا برای بازبینی بی‌ضرر است. اگر آنجا کامیت کنی، فوراً یک شاخه بساز وگرنه آن کامیت فقط از طریق reflog قابل دسترس خواهد بود.',
      '`git switch -c rescue` از یک HEAD جدا، بازیابیِ استاندارد است.',
    ],
    startDialog: [
      {
        title: 'HEAD می‌تواند به یک کامیت اشاره کند',
        markdown:
          'عادی‌تر HEAD به یک **شاخه** اشاره می‌کند. هشِ خام را check-out کنی، HEAD **جدا** (detached) می‌شود.\n\nکامیت‌های تازه هنوز کار می‌کنند — اما هیچ اسمی به آن‌ها اشاره نمی‌کند. قبل از رفتن یک شاخه بساز.',
      },
    ],
  },

  /* ───────────────────────────── REMOTES ───────────────────────────── */

  'remote-add-push': {
    name: 'اضافه‌کردن ریموت و پوش',
    objective: 'یک ریموت به نام `origin` با هر URL اضافه کن، بعد main را پوش کن و اپ‌ستریم را تنظیم کن.',
    hint: '`git remote add origin /tmp/remote.git`، بعد `git push -u origin main`.',
    fieldNotes: ['`git push -u origin main` یک‌بار در هر شاخه. بعد از آن، `git push` خالی کافی است.'],
    startDialog: [
      {
        title: 'ریموت‌ها URLِ نام‌دارند',
        markdown:
          'یک ریموت فقط یک نشانک برای یک مخزنِ دیگر است. `push` کامیت‌ها را آپلود می‌کند؛ `fetch` refها را دانلود می‌کند.\n\n`-u` اپ‌ستریم را ثبت می‌کند تا دستوراتِ بعدی به پارامتر نیازی نداشته باشند.',
      },
    ],
  },

  'remote-pull': {
    name: 'فتچ و پول',
    objective: 'ریموت `origin` را تنظیم کن، یک‌بار پوش کن، بعد `git pull` را دست‌کم یک‌بار اجرا کن.',
    hint: 'اول push -u تا pull بداند به کجا برود، بعد `git pull`.',
    fieldNotes: ['وقتی خواستی ببینی، fetch. وقتی خواستی ادغام کنی، pull. این‌ها یک دستور نیستند.'],
    startDialog: [
      {
        title: 'Fetch در برابر pull',
        markdown:
          '`git fetch` فقط refهای پیگیری‌شونده‌ی `origin/*` را به‌روز می‌کند — شاخه‌هایت حرکت نمی‌کنند.\n`git pull` = fetch + ادغام.\n\nاین مرحله می‌خواهد هر دو را حس کنی.',
      },
    ],
  },

  'remote-force-push': {
    name: 'فورس‌پوش کردن یک شاخه‌ی بازنویسی‌شده',
    objective:
      'تاریخچه‌ی محلی را بازنویسی کردی، پس نوکِ ریموت دیگر مطابق نیست. پوشِ معمولی رد می‌شود — `origin main` را فورس‌پوش کن تا آن را بازنویسی کنی.',
    hint: '`git push --force origin main` (یک `git push` ساده به‌عنوان non-fast-forward رد می‌شود).',
    fieldNotes: [
      'فقط شاخه‌هایی که مال خودت‌اند را فورس‌پوش کن. `--force-with-lease` اگر ریموت از آخرین fetch تو حرکت کرده باشد، رد می‌کند — ترجیحش بده.',
      'هرگز یک mainِ مشترک را فورس‌پوش نکن: کامیت‌های بقیه را پاک خواهی کرد.',
    ],
    startDialog: [
      {
        title: 'شاخه‌های دوشاخه‌شده',
        markdown:
          'بعد از rebase یا amend، تاریخچه‌ی محلی‌ات از نوکِ ریموت نازل نمی‌شود. گیت یک پوشِ معمولی را رد می‌کند تا از نابودکردنِ خاموشِ کارِ ریموت جلوگیری کند.\n\nفورس‌پوش ریموت را **بازنویسی** می‌کند — فقط وقتی مطمئن باشی امن است.',
      },
    ],
  },

  /* ───────────────────────────── UNDO ───────────────────────────── */

  'undo-soft': {
    name: 'واگردِ softِ آخرین کامیت',
    objective: 'آخرین کامیت را واگرد کن اما تغییراتش را آماده‌سازی‌شده نگه دار (`git reset --soft HEAD~1`).',
    hint: 'کامیتی با «oops» از قبل وجود دارد. `git reset --soft HEAD~1` را اجرا کن.',
    fieldNotes: ['--soft واگردِ مؤدبانه است: اشاره‌گرِ شاخه عقب می‌رود، شاخص و درخت کار کار را نگه می‌دارند.'],
    startDialog: [
      {
        title: 'حالت‌های reset',
        markdown:
          '| حالت | شاخه | شاخص | درخت کار |\n|------|--------|-------|----------|\n| --soft | حرکت می‌کند | نگه می‌ماند | نگه می‌ماند |\n| --mixed | حرکت می‌کند | بازنشانی | نگه می‌ماند |\n| --hard | حرکت می‌کند | بازنشانی | بازنشانی |\n\nبا --soft شروع کن.',
      },
    ],
  },

  'undo-reset-mixed': {
    name: 'واگردِ mixed: آماده‌نشده‌سازی، نگه‌داشتنِ ویرایش',
    objective: 'آخرین کامیت را با `--mixed` واگرد کن: تغییرات از شاخص خارج می‌شوند اما به‌صورت ویرایشِ کامیت‌نشده در درخت کار می‌مانند.',
    hint: '`git reset --mixed HEAD~1` را اجرا کن. فایل کثیف می‌شود اما آماده‌سازی نمی‌شود.',
    fieldNotes: ['--mixed حالتِ پیش‌فرض است. راهِ مؤدبانه‌ی «واگردِ کامیت» است، در حالی که کار را نگه می‌داری تا انتخابی دوباره‌اش آماده‌سازی کنی.'],
    startDialog: [
      {
        title: 'Mixed در برابر soft',
        markdown:
          'هر دو شاخه را یک کامیت عقب می‌برند.\n- `--soft` تغییرات را **آماده‌سازی‌شده** نگه می‌دارد\n- `--mixed` آن‌ها را آماده‌نشده می‌کند ولی ویرایش‌ها را روی دیسک نگه می‌دارد\n\nاین مرحله رفتارِ mixed را می‌خواهد.',
      },
    ],
  },

  'undo-reset-hard': {
    name: 'واگردِ hard: پرت‌کردنِ کامیت',
    objective: 'آخرین کامیت **و** تغییراتش را با `--hard` دور بریز و درخت کار را تمیز بگذار.',
    hint: '`git reset --hard HEAD~1` را اجرا کن. درخت بعد از آن باید تمیز باشد.',
    fieldNotes: ['--hard ویرانگر است: کارِ کامیت‌نشده از بین می‌رود. اول `git status`. روی شاخه‌های مشترک از revert بهتر است.'],
    startDialog: [
      {
        title: 'واگردِ سنگین',
        markdown:
          '`--hard` شاخه را عقب می‌برد **و** درخت کار را مطابق بازنویسی می‌کند و کامیت و ویرایش‌هایش را دور می‌ریزد.\n\nبرای رهاکردنِ کاری که مطمئن هستی، از آن استفاده کن.',
      },
    ],
  },

  'undo-revert': {
    name: 'واگردِ یک کامیتِ منتشرشده',
    objective: 'HEAD را با پیامی که «Revert» دارد revert کن (reset نکن).',
    hint: '`git revert HEAD` — اینجا از reset استفاده نکن.',
    fieldNotes: ['روی شاخه‌های مشترک، revert تنها واگردِ امن است. reset تاریخچه‌ای را بازنویسی می‌کند که بقیه قبلی pull کرده‌اند.'],
    startDialog: [
      {
        title: 'Revert یک کامیت اضافه می‌کند',
        markdown:
          'Revert یک کامیتِ تازه می‌سازد که معکوسِ یک کامیتِ قدیمی است.\n\nتاریخچه صادق می‌ماند. همکارانی که قبلی pull کرده‌اند نمی‌شکنند.',
      },
    ],
  },

  'undo-stash': {
    name: 'استش کردنِ کارِ کثیف',
    objective: 'تغییراتِ کامیت‌نشده‌ات را stash کن تا درخت تمیز شود.',
    hint: 'درخت کثیف است. `git stash` (یا `git stash push`) را اجرا کن.',
    fieldNotes: ['Stash یک پارکینگ است، نه یک شاخه. اگر یک روز قرار است بماند، به‌جایش به یک شاخه‌ی WIP کامیت کن.'],
    startDialog: [
      {
        title: 'Stash',
        markdown:
          '`git stash` تغییراتِ کامیت‌نشده را در یک پشته‌ی پنهان جمع می‌کند و درخت را تمیز می‌کند.\n`git stash pop` برمی‌گرداند و آن ورودی را حذف می‌کند.',
      },
    ],
  },

  'recover-reflog': {
    name: 'نجاتِ یک کامیتِ گم‌شده با reflog',
    objective:
      'کامیتی reset شده و حالا یتیم (orphan) است. آن را در reflog پیدا کن، check-outش کن و روی یک شاخه به نام `rescue` بگذار.',
    hint: '`git reflog` برای پیداکردنِ هش «lost work»، `git switch <hash>`، بعد `git switch -c rescue`.',
    fieldNotes: [
      'تقریباً هر کامیتِ «گم‌شده» هنوز در `.git/logs/HEAD` است. reflog تورِ ایمنیِ توست.',
      'با `git switch -c rescue <sha>` نجاتش بده — لحظه‌ای که یک شاخه به آن اشاره کند، دیگر یتیم نیست.',
    ],
    startDialog: [
      {
        title: 'reflog تورِ ایمنیِ توست',
        markdown:
          'کامیتی که هیچ شاخه‌ای به آن اشاره نمی‌کند **یتیم** است — نهایتاً توسط garbage-collect حذف می‌شود.\n\nاما گیت هر حرکتِ HEAD را در reflog ثبت می‌کند، پس همیشه می‌توانی هشِ گم‌شده را check-out کنی و یک شاخه به آن بدهی.',
      },
    ],
  },

  /* ───────────────────────────── HISTORY CRAFT ───────────────────────────── */

  'hist-tag': {
    name: 'تگ کردنِ یک ریلیز',
    objective: 'یک تگِ annotation به نام `v1.0.0` بساز.',
    hint: '`git tag -a v1.0.0 -m "release"`',
    fieldNotes: ['برای ریلیزها تگِ annotation. تگهای lightweight فقط برای کتابتِ محلی خوب‌اند.'],
    startDialog: [
      {
        title: 'تگ‌ها حرکت نمی‌کنند',
        markdown:
          'شاخه‌ها وقتی کامیت می‌کنی حرکت می‌کنند. تگ‌ها مختصاتِ ثابت‌اند.\n\nخطِ تولیدِ ship و rollback باید به تگ‌ها اشاره کنند، نه به نامِ شاخه‌ها.',
      },
    ],
  },

  'hist-cherry-pick': {
    name: 'چری‌پیک کردنِ یک رفع‌باگ',
    objective: 'سوییچ به main و چری‌پیک کردنِ کامیتی که پیامش «fix crash» را دارد.',
    hint: 'هش را با `git log --oneline` پیدا کن، سوییچ به main، `git cherry-pick <hash>`.',
    fieldNotes: ['Cherry-pick یک تغییر را کپی می‌کند. برای رفع‌باگ خوب است؛ اما محتوای تاریخچه را بین شاخه‌ها دوشاخه می‌کند.'],
    startDialog: [
      {
        title: 'Cherry-pick',
        markdown:
          'تغییرِ یک کامیت را روی HEADِ فعلی به‌صورت یک کامیت **تازه** (هش تازه) کپی می‌کند.\n\nوقتی به یک patch نیاز داری بدون اینکه کل شاخه را بگیری، استفاده کن.',
      },
    ],
  },

  'hist-merge-conflict': {
    name: 'حل کردنِ یک تعارضِ merge',
    objective:
      '`feature` را در main merge کن. روی config.yaml تعارض می‌دهد — فایل را edit کن، آماده‌سازی‌اش کن، بعد merge را کامیت کن.',
    hint: '`git merge feature` → تعارض. بعد `edit config.yaml`، `git add config.yaml`، `git commit -m "Merge branch feature"`.',
    fieldNotes: [
      'فایلِ تعارضیافته را باز کن، محتوای درست را انتخاب کن، `git add`، `git commit`. مگر اینکه واقعاً بخواهی کار را رها کنی، merge را reset نکن.',
      'بعد از حل، `git log --oneline --graph` را اجرا کن — باید یک کامیتِ merge با دو والد ببینی.',
    ],
    startDialog: [
      {
        title: 'تعارض عادی است',
        markdown:
          'وقتی هر دو شاخه **همان hunk** را تغییر داده باشند، گیت نمی‌تواند برنده را انتخاب کند.\n\n1. `git status` نشان می‌دهد `both modified`\n2. فایل را به محتوایی که می‌خواهی edit کن\n3. مسیر را `git add` کن (علامتِ حل شد)\n4. `git commit` merge را ثبت می‌کند',
      },
    ],
  },

  'hist-rebase': {
    name: 'ریبیسِ feature روی main',
    objective: 'در حالی که روی `feature` هستی، بعد از حرکتِ main، rebase روی `main` کن.',
    hint: 'روی feature بمان، `git rebase main` را اجرا کن.',
    fieldNotes: ['کارِ feature که پوش نشده را rebase کن. هرگز شاخه‌ای را که بقیه روی آن کار کرده‌اند rebase نکن.'],
    startDialog: [
      {
        title: 'Rebase',
        markdown:
          'Rebase کامیت‌هایت را روی یک پایه‌ی تازه پخش (replay) می‌کند و **هش‌های تازه** تولید می‌کند.\n\nتاریخچه خطی به نظر می‌رسد. هزینه‌اش: گذشته‌ی بازنویسی‌شده.',
      },
    ],
  },

  'hist-delete-branch': {
    name: 'حذفِ یک شاخه‌ی mergeشده',
    objective: '`cleanup` را در main merge کن (fast-forward کافی است) و شاخه‌ی `cleanup` را حذف کن.',
    hint: 'سوییچ به main، merge کن cleanup، بعد `git branch -d cleanup`.',
    fieldNotes: ['بعد از merge شاخه‌ها را حذف کن. نام‌های شاخه‌ی کهنه همین‌جور که آدم اشتباه چیزی را check-out می‌کند می‌شود.'],
    startDialog: [
      {
        title: 'پاکسازی',
        markdown:
          'اشاره‌گرِ یک شاخه‌ی mergeشده وزنه‌ی مرده است. `git branch -d` برچسب را حذف می‌کند — کامیت‌ها همچنان از main قابل دسترس می‌مانند.',
      },
    ],
  },

  /* ───────────────────────────── FIELD PRACTICE ───────────────────────────── */

  'camp-full-flow': {
    name: 'شاخه‌ی feature → آماده‌ی PR',
    objective:
      'از یک mainِ تمیز: `feature/login` را بساز، روی آن «add login» را کامیت کن، با اپ‌ستریم به origin پوش کن، به main برگرد.',
    hint: 'git switch -c feature/login → edit → add → commit -m "add login" → git push -u origin feature/login → git switch main',
    fieldNotes: [
      'این حلقه‌ی روزمره است. اگر بدون فکر بتوانی انجامش بدهی، آماده‌ی جریان‌های code review هستی.',
      'شاخه‌ی feature را پوش کن، نه main. PR دروازه‌ی ادغام است.',
    ],
    startDialog: [
      {
        title: 'دریلِ میدانی',
        markdown:
          'یک شاخه‌ی featureِ **آماده‌ی PR** تولید کن:\n\n1. Branch از main\n2. یک کامیت منطقی\n3. پوش با اپ‌ستریم\n4. برگشتن به mainِ تمیز\n\nمیان‌بُری ندارد. این همان جریانِ واقعی است.',
      },
    ],
  },

  'camp-recover': {
    name: 'بازیابی از یک کامیتِ بد',
    objective: 'عمداً یک رمز را کامیت کردی («oops secrets»). آن را revert کن تا پیامِ HEAD شامل «Revert» شود و تاریخچه حفظ شود.',
    hint: '`git revert HEAD`. از reset --hard استفاده نکن.',
    fieldNotes: ['رمزی که در یک کامیت رفته حتی بعد از reset هم به‌خطا رفته — اعتبارنامه را عوض کن. Revert + rotate.'],
    startDialog: [
      {
        title: 'دریلِ حادثه',
        markdown:
          'یک کامیتِ بد روی main افتاده است. **revert** (حفظِ تاریخچه) را ترجیح بده بر reset (بازنویسی).\n\nبعد از آن: رمزِ نشتی‌کرده را عوض کن. آن کامیت هنوز در object store است.',
      },
    ],
  },
};
