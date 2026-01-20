/* bank.js — Online Banking guide interactions
   - Collapsible sections
   - Optional read-aloud for warnings
   - Checklist persistence (localStorage)
   - Spot-the-scam quiz
   - Print: quick sheet or full
*/

(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // i18n for this page (checklist + buttons)
  const I18N_BANK = {
    en: {
      checks: [
        'I have activated online banking with my bank.',
        'My online banking password is strong and written down safely at home.',
        'I know how to check my balance.',
        "I have saved my bank's real customer service number in my phone.",
        'I know NOT to click email links for banking.',
        'I have logged out of all banking sessions on shared devices.',
      ],
      printQuick: 'Print Quick Start Sheet',
      printAll: 'Print Full Guide',
      ttsLang: 'en-US',
    },
    fr: {
      checks: [
        "J’ai activé les services bancaires en ligne avec ma banque.",
        "Mon mot de passe bancaire est fort et noté en sécurité à la maison.",
        "Je sais comment consulter mon solde.",
        "J’ai enregistré dans mon téléphone le vrai numéro du service à la clientèle de ma banque.",
        "Je sais qu’il ne faut PAS cliquer sur des liens d’email pour la banque.",
        "Je me suis déconnecté de toutes les sessions sur les appareils partagés.",
      ],
      printQuick: 'Imprimer la fiche rapide',
      printAll: 'Imprimer le guide complet',
      ttsLang: 'fr-CA',
    },
    zh: {
      checks: [
        '我已在银行开通了网上银行。',
        '我的网银密码足够强并安全地记在家里的本子上。',
        '我知道如何查看账户余额。',
        '我已把银行客服的官方电话存入手机。',
        '我知道不要点邮件里的银行登录链接。',
        '在共用设备上我已退出所有网银登录。',
      ],
      printQuick: '打印速查单',
      printAll: '打印完整指南',
      ttsLang: 'zh-CN',
    },
  };
  function curLang(){ return (window.AideI18n?.getLang?.()) || (document.documentElement.getAttribute('lang')||'en'); }
  function TB(){ return I18N_BANK[curLang()] || I18N_BANK.en; }

  // Content translations
  const I18N_BANKX = {
    en: {
      brandSubtitle: 'Online Banking',
      pageTitle: 'Online Banking: Safe, Simple, and From Home',
      pageSubtitle: 'Learn to manage your money securely without going to the bank.',
      eduNote: 'Education only: this guide does not connect to any real bank accounts.',
      parts: {
        benefits: 'Part 1: Why Online Banking? (The Benefits)',
        setup: 'Part 2: Getting Started Safely',
        tutorials: 'Part 3: Tutorials (Common Tasks)',
        security: 'Part 4: The Most Important Part — Security',
        habits: 'Part 5: Staying Safe Online (Good Habits)',
        wrong: 'Part 6: What To Do If Something Goes Wrong',
        practice: 'Part 7: Practice & Checklists',
        help: 'Part 8: Getting Help',
      },
      benefits: {
        h2: 'It Makes Life Easier',
        cards: [
          ['24/7 Access', 'Check balance or pay bills any time.'],
          ['From Your Home', 'No travel, no lines, no bad weather.'],
          ['See Everything Clearly', 'Transactions in one list.'],
          ['Fast & Automatic', 'Pay in seconds. Set automatic payments.'],
          ['On Your Phone', 'Deposit cheques by taking a picture.'],
        ],
        quick: 'Quick note: You are in control. You choose what to do and when.',
      },
      setup: {
        h2: 'Setting Up Your Online Banking',
        step1: 'Step 1: Getting Your Access',
        step1List: [
          '<strong>You will need:</strong> your debit card and the secret password/PIN provided by your bank.',
          '<strong>How to start:</strong> you must call your bank or visit a branch to activate online banking.',
        ],
        warn1Title: 'Most important safety step:',
        warn1: 'Activate online banking only through your bank’s official phone number or in-person branch.',
        step2: 'Step 2: Logging In For The First Time',
        step2List: [
          'Open your bank’s <strong>official app</strong> or go to their <strong>official website</strong>.',
          'Enter your <strong>client card number</strong> (on your debit card).',
          'Enter the password/PIN the bank gave you.',
          'Create a new <strong>strong online banking password</strong>.',
          'Optional: set up <strong>Face ID / Touch ID</strong> for easier logins.',
        ],
        warn2Title: 'CRITICAL REMINDER',
        warn2List: [
          'The bank will never call or email to ask for your password.',
          'Your online banking password is different from your debit card PIN.',
          'Write your password in a private notebook at home. Do not label it “bank password”.',
        ],
        pace: 'Slow pace tip: Do one tutorial per week until you feel comfortable.',
      },
      tutorials: {
        detail: 'These are generic steps. Your bank may look a little different. Look for similar words.',
        h3: [
          '1) How to Check Your Balance',
          '2) How to Pay a Bill (Hydro‑Québec, phone, etc.)',
          '3) How to Send an Interac e‑Transfer',
          '4) How to Deposit a Cheque With Your Phone',
        ],
        tipEtf: 'Tip: Use a question only the recipient knows. Do not share the answer publicly.',
      },
      security: {
        h2: 'Protecting Your Money is Job #1',
        do: 'DO: Use a strong unique password (example: BlueSky$2024!).',
        never: 'NEVER: share passwords, PINs, or click banking links in emails/texts.',
        r1: 'Rule 1: Passwords are keys to your house',
        r1List: ['DO use upper/lowercase, numbers, symbols.', 'DO NOT use birthdays, pet names, or “password123”.', 'DO NOT reuse your email/Facebook password.'],
        r2: 'Rule 2: Remember passwords (safely)',
        r2List: ['Option A (recommended): a password manager (like iPhone Keychain or Chrome).', 'Option B: a private notebook at home. Don’t label it “Bank Password”. Use a clue only you understand.'],
        r3: 'Rule 3: Recognize scams (phishing)',
        golden: 'GOLDEN RULE: Never click a link in an email/text to log into your bank. Always type the bank website yourself or open the official app.',
        scamExamples: ['Scam email: “Urgent! Your account is locked. Click here.” → Delete.', 'Scam call: “We need your password to verify.” → Hang up.'],
      },
      habits: { steps: ['Keep software updated (updates fix security holes).', 'Use secure Wi‑Fi: home Wi‑Fi or mobile data only. Never public Wi‑Fi.', 'Log out when finished (don’t just close the window).', 'Check statements monthly.', 'Turn on 2‑Factor Authentication if offered.'] },
      wrong: {
        title: 'Don’t panic. Take these steps.',
        items: ['Forgot password: use “Forgot Password” on the official login page.', 'Unknown transaction: call your bank’s fraud department immediately (number on debit card).', 'Clicked a bad link: change password immediately, then call your bank.', 'Locked out: call customer service. They will verify your identity.'],
      },
      practice: {
        safetyH3: 'My Banking Safety Checklist',
        simH3: 'Interactive Practice (Simulated Safe Environment)',
        simNote: 'This is a fake practice screen. It does not log in anywhere.',
        loginTitle: 'Practice Login Page',
        clientCard: 'Client Card Number',
        password: 'Password',
        loginBtn: 'Log In (Practice)',
        safeSign: 'Safe sign: You opened your bank app or typed the bank website yourself.',
        dangerSign: 'Danger sign: A pop‑up says “Account locked — click here.”',
      },
      help: {
        list: ['Family: ask a trusted child/grandchild to sit with you.', 'Your bank: book an appointment for a tutorial.', 'Community centers: libraries and seniors’ centers may offer workshops.'],
        note: 'Online banking is a powerful tool for independence. By following these safety rules, you can enjoy its convenience with confidence. Take it one step at a time. You\'ve got this.',
      },
      bottom: { apps: 'Useful Apps', tips: 'Tips & Tricks' },
    },
    fr: {
      brandSubtitle: 'Banque en ligne',
      pageTitle: 'Banque en ligne : sûre, simple et à la maison',
      pageSubtitle: 'Apprenez à gérer votre argent en sécurité, sans vous déplacer.',
      eduNote: 'À des fins pédagogiques : ce guide ne se connecte à aucun vrai compte bancaire.',
      parts: {
        benefits: 'Partie 1 : Pourquoi la banque en ligne ? (Avantages)',
        setup: 'Partie 2 : Bien démarrer en sécurité',
        tutorials: 'Partie 3 : Tutoriels (tâches courantes)',
        security: 'Partie 4 : Le plus important — la sécurité',
        habits: 'Partie 5 : Rester en sécurité (bonnes habitudes)',
        wrong: 'Partie 6 : Que faire en cas de problème',
        practice: 'Partie 7 : Pratique & listes',
        help: 'Partie 8 : Obtenir de l’aide',
      },
      benefits: {
        h2: 'Ça vous simplifie la vie',
        cards: [
          ['Accès 24/7', 'Consultez le solde/payer à tout moment.'],
          ['Depuis votre domicile', 'Pas de déplacement, pas d’attente, pas de mauvais temps.'],
          ['Tout clair et regroupé', 'Opérations dans une seule liste.'],
          ['Rapide & automatique', 'Paiement en secondes, prélèvements automatiques.'],
          ['Sur votre téléphone', 'Déposez des chèques en photo.'],
        ],
        quick: 'Note : c’est vous qui décidez quoi faire et quand.',
      },
      setup: {
        h2: 'Configurer votre banque en ligne',
        step1: 'Étape 1 : Obtenir vos accès',
        step1List: [
          'Il faut : votre carte de débit et le mot de passe/NIP fourni par votre banque.',
          'Comment démarrer : appelez votre banque ou visitez une succursale pour activer la banque en ligne.',
        ],
        warn1Title: 'Étape de sécurité la plus importante :',
        warn1: 'Activez uniquement via le numéro officiel de votre banque ou en succursale.',
        step2: 'Étape 2 : Première connexion',
        step2List: [
          'Ouvrez l’<strong>application officielle</strong> ou le <strong>site officiel</strong> de votre banque.',
          'Entrez votre <strong>numéro de carte client</strong> (sur la carte de débit).',
          'Entrez le mot de passe/NIP fourni par la banque.',
          'Créez un <strong>mot de passe fort</strong> pour la banque en ligne.',
          'Optionnel : activez <strong>Face ID / Touch ID</strong>.',
        ],
        warn2Title: 'RAPPEL CRITIQUE',
        warn2List: [
          'La banque ne demande jamais votre mot de passe par appel ou email.',
          'Le mot de passe de banque en ligne est différent du NIP de carte de débit.',
          'Notez le mot de passe dans un cahier privé à la maison. Ne le nommez pas « mot de passe banque ».',
        ],
        pace: 'Allure lente : faites un tutoriel par semaine jusqu’à être à l’aise.',
      },
      tutorials: {
        detail: 'Étapes génériques : votre banque peut être un peu différente. Cherchez des mots semblables.',
        h3: [
          '1) Consulter votre solde',
          '2) Payer une facture (Hydro‑Québec, téléphone, etc.)',
          '3) Envoyer un Virement Interac',
          '4) Déposer un chèque avec le téléphone',
        ],
        tipEtf: 'Astuce : utilisez une question que seul le destinataire connaît. Ne partagez pas la réponse.',
      },
      security: {
        h2: 'Protéger votre argent est la priorité n° 1',
        do: 'À FAIRE : mot de passe fort et unique (ex. : BlueSky$2024!).',
        never: 'À NE PAS FAIRE : partager mots de passe/NIP ou cliquer des liens bancaires dans emails/SMS.',
        r1: 'Règle 1 : les mots de passe sont les clés de votre maison',
        r1List: ['Utilisez majuscules/minuscules, chiffres, symboles.', 'Pas d’anniversaire, nom d’animal, « password123 ».', 'Ne réutilisez pas le mot de passe de votre email/Facebook.'],
        r2: 'Règle 2 : mémoriser (en sécurité)',
        r2List: ['Option A (recommandé) : gestionnaire de mots de passe (Trousseau iPhone, Chrome).', 'Option B : cahier privé à la maison. Ne l’intitulez pas « mot de passe banque ». Indice que vous seul comprenez.'],
        r3: 'Règle 3 : reconnaître les arnaques (hameçonnage)',
        golden: 'RÈGLE D’OR : ne cliquez jamais un lien d’email/SMS pour vous connecter. Tapez vous‑même le site ou utilisez l’app officielle.',
        scamExamples: ['Email frauduleux : « Urgent ! Compte bloqué. Cliquez ici. » → Supprimez.', 'Appel frauduleux : « Nous avons besoin de votre mot de passe. » → Raccrochez.'],
      },
      habits: { steps: ['Maintenez vos logiciels à jour.', 'Wi‑Fi sécurisé : maison ou données mobiles. Jamais de Wi‑Fi public.', 'Déconnectez‑vous après usage (ne fermez pas seulement la fenêtre).', 'Vérifiez vos relevés chaque mois.', 'Activez l’authentification à deux facteurs si possible.'] },
      wrong: {
        title: 'Ne paniquez pas. Faites ceci :',
        items: ['Mot de passe oublié : « Mot de passe oublié » sur la page de connexion officielle.', 'Opération inconnue : appelez la cellule antifraude (numéro sur la carte).', 'Lien suspect cliqué : changez le mot de passe immédiatement puis appelez la banque.', 'Compte verrouillé : appelez le service clientèle (vérification d’identité).'],
      },
      practice: {
        safetyH3: 'Ma liste de sécurité bancaire',
        simH3: 'Pratique interactive (environnement simulé)',
        simNote: 'Écran d’exercice fictif : aucune connexion réelle.',
        loginTitle: 'Page de connexion (pratique)',
        clientCard: 'Numéro de carte client',
        password: 'Mot de passe',
        loginBtn: 'Se connecter (pratique)',
        safeSign: 'Signe de sécurité : vous avez ouvert l’app ou tapé vous‑même le site.',
        dangerSign: 'Signe de danger : « Compte bloqué — cliquez ici ».',
      },
      help: {
        list: ['Famille : demandez à un proche de s’asseoir avec vous.', 'Votre banque : prenez un rendez‑vous pour un tutoriel.', 'Centres communautaires : bibliothèques et centres pour aînés.'],
        note: 'La banque en ligne donne de l’autonomie. En suivant ces règles, profitez‑en en confiance. Avancez étape par étape : vous en êtes capable.',
      },
      bottom: { apps: 'Applications utiles', tips: 'Astuces & conseils' },
    },
    zh: {
      brandSubtitle: '网上银行',
      pageTitle: '网上银行：安全、简单、在家完成',
      pageSubtitle: '学会在不去银行的情况下安全管理你的资金。',
      eduNote: '仅供学习：本指南不会连接任何真实银行账户。',
      parts: {
        benefits: '第 1 部分：为什么用网银（好处）',
        setup: '第 2 部分：安全开始',
        tutorials: '第 3 部分：教程（常用操作）',
        security: '第 4 部分：最重要——安全',
        habits: '第 5 部分：上网安全好习惯',
        wrong: '第 6 部分：出问题时怎么办',
        practice: '第 7 部分：练习与清单',
        help: '第 8 部分：获取帮助',
      },
      benefits: {
        h2: '让生活更轻松',
        cards: [
          ['全天候 24/7', '随时查余额、付账单。'],
          ['在家就能办', '不用出门、不用排队、不怕坏天气。'],
          ['一目了然', '所有交易一张清单看到。'],
          ['快捷自动', '几秒内完成；可设置自动付款。'],
          ['用手机也行', '拍照即可存入支票。'],
        ],
        quick: '小提示：你自己做主，按自己的节奏来。',
      },
      setup: {
        h2: '设置你的网上银行',
        step1: '第一步：获取访问权限',
        step1List: ['需要：借记卡 + 银行提供的临时密码/NIP。', '开始方式：致电银行或到网点开通网银。'],
        warn1Title: '最重要的安全步骤：',
        warn1: '只通过银行的官方电话或柜台开通网银。',
        step2: '第二步：首次登录',
        step2List: ['打开银行<Strong>官方 App</Strong>或<Strong>官方网站</Strong>。', '输入<Strong>客户卡号</Strong>（借记卡上的号码）。', '输入银行提供的密码/NIP。', '创建一个<Strong>强密码</Strong>用于网银。', '可选：开启 <Strong>Face ID / Touch ID</Strong>。'],
        warn2Title: '重要提醒',
        warn2List: ['银行不会通过电话或邮件索要密码。', '网银密码与借记卡 NIP 不同。', '把密码记在家里的私人笔记本里，不要写“银行密码”。'],
        pace: '慢速建议：每周完成一个小教程，逐步熟悉。',
      },
      tutorials: {
        detail: '以下为通用步骤：不同银行界面略有不同，注意相似词语。',
        h3: ['1）查看账户余额', '2）支付账单（如 Hydro‑Québec、电话等）', '3）发送 Interac 转账', '4）用手机存入支票'],
        tipEtf: '提示：设置只有收款人知道的问题；不要公开答案。',
      },
      security: {
        h2: '保护你的钱是头等大事',
        do: '请务必：使用强且唯一的密码（例：BlueSky$2024!）。',
        never: '绝不要：分享密码/NIP，或点击邮件/短信中的银行链接。',
        r1: '规则 1：密码就像家的钥匙',
        r1List: ['使用大小写、数字和符号。', '不要用生日、宠物名或“password123”。', '不要和邮箱/社交的密码重复。'],
        r2: '规则 2：安全地记住密码',
        r2List: ['方案 A（推荐）：密码管理器（iPhone 钥匙串或 Chrome）。', '方案 B：家中私密本子。不要写“银行密码”，写只有你懂的提示。'],
        r3: '规则 3：识别骗局（钓鱼）',
        golden: '黄金法则：不要点邮件/短信里的登录链接。自己输入银行网址或打开官方 App。',
        scamExamples: ['诈骗邮件：“紧急！账户被锁，请点击。”→ 删除。', '诈骗来电：“需要你的密码核对。”→ 直接挂断。'],
      },
      habits: { steps: ['保持系统和应用更新。', '使用安全 Wi‑Fi：家用或移动数据；不要用公共 Wi‑Fi。', '完成后要退出登录（别只关窗口）。', '每月核对账单。', '尽量开启两步验证。'] },
      wrong: {
        title: '别慌，按下面做：',
        items: ['忘记密码：在官网登录页点“忘记密码”。', '发现陌生交易：马上拨打银行卡背面的反欺诈电话。', '点了可疑链接：立即改密码，然后联系银行。', '被锁定：联系客服，按要求核验身份。'],
      },
      practice: {
        safetyH3: '我的银行安全清单',
        simH3: '互动练习（模拟环境）',
        simNote: '练习页面是假的，不会登录任何网站。',
        loginTitle: '练习登录页面',
        clientCard: '客户卡号',
        password: '密码',
        loginBtn: '登录（练习）',
        safeSign: '安全标志：你是自己打开银行 App 或输入网址的。',
        dangerSign: '危险标志：弹窗 “账户被锁——点此”。',
      },
      help: {
        list: ['家人：请可信的子女/孙辈在旁协助。', '银行：可预约网点做演示教学。', '社区：图书馆/老年中心常有课程。'],
        note: '网银能带来自主与方便。遵守安全规则，你可以放心使用。一步步来，你一定能行。',
      },
      bottom: { apps: '常用应用', tips: '贴士与妙招' },
    },
  };
  function TX(){ const l = curLang(); return I18N_BANKX[l] || I18N_BANKX.en; }

  const STORAGE = {
    checklist: 'bank_checklist',
  };

  function toggleSection(section) {
    const head = qs('[data-toggle]', section);
    const body = qs('[data-body]', section);
    if (!head || !body) return;
    const open = head.getAttribute('aria-expanded') === 'true';
    head.setAttribute('aria-expanded', String(!open));
    qs('.section__chev', head).textContent = open ? '▸' : '▾';
    body.toggleAttribute('hidden', open);
  }

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.85;
  u.lang = TB().ttsLang;
  speechSynthesis.speak(u);
}

  function textFor(selector) {
    const el = qs(selector);
    if (!el) return '';
    return el.textContent.replace(/\s+/g, ' ').trim();
  }

  // Checklist
let CHECKS = TB().checks.slice();

function renderChecklist() {
  const list = qs('#bankChecklist');
  if (!list) return;
  const saved = JSON.parse(localStorage.getItem(STORAGE.checklist) || '[]');

  // refresh localized texts
  CHECKS = TB().checks.slice();

  list.innerHTML = '';
  CHECKS.forEach((t, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<label><input type="checkbox" /> ${t}</label>`;
      const cb = qs('input', li);
      cb.checked = Boolean(saved[i]);
      cb.addEventListener('change', () => {
        const arr = JSON.parse(localStorage.getItem(STORAGE.checklist) || '[]');
        arr[i] = cb.checked;
        localStorage.setItem(STORAGE.checklist, JSON.stringify(arr));
      });
      list.appendChild(li);
    });
  }

  // Scam quiz
  const SCAMS = [
    {
      title: 'Email example 1',
      body: 'URGENT: Your account is locked. Click here to verify your password immediately.',
      correct: 'scam',
      explain: 'Real banks do not ask you to click links or provide passwords by email.',
    },
    {
      title: 'Email example 2',
      body: 'Your monthly statement is ready. Please open your banking app to view it.',
      correct: 'safe',
      explain: 'This one does not ask for passwords or links. Still: open your app yourself.',
    },
    {
      title: 'Text message example',
      body: 'Bank Alert: Suspicious activity. Tap this link to login now: http://example-login-now.com',
      correct: 'scam',
      explain: 'Never tap links to login. Type your bank website yourself or use the official app.',
    },
  ];

  function renderScamQuiz() {
    const box = qs('#scamQuiz');
    if (!box) return;
    box.innerHTML = '';

    const correctFlags = Array.from({ length: SCAMS.length }).map(() => false);

    SCAMS.forEach((q, idx) => {
      const div = document.createElement('div');
      div.className = 'quizQ';
      div.innerHTML = `
        <div class="label">${q.title}</div>
        <div class="simbox" style="margin:0.4rem 0;">${q.body}</div>
        <label class="quizOpt"><input type="radio" name="q${idx}" value="safe" /> ✅ Safe</label>
        <label class="quizOpt"><input type="radio" name="q${idx}" value="scam" /> 🔴 Scam</label>
        <div class="quizFb" id="fb${idx}" aria-live="polite"></div>
        <button class="pill" type="button" data-check="${idx}">Check</button>
      `;

      qs(`[data-check="${idx}"]`, div).addEventListener('click', () => {
        const chosen = qs(`input[name="q${idx}"]:checked`, div)?.value;
        const fb = qs('#fb' + idx, div);
        if (!chosen) {
          fb.textContent = 'Please choose an answer.';
          fb.style.color = 'var(--muted)';
          return;
        }
        if (chosen === q.correct) {
          fb.textContent = '✅ Correct. ' + q.explain;
          fb.style.color = 'var(--accent-strong)';
          correctFlags[idx] = true;

          // If user got all scam questions correct at least once, mark safety quiz complete.
          if (correctFlags.every(Boolean)) {
            window.AideProgress?.markSafetyQuizComplete('bank_scam');
            window.AideProgress?.celebrate?.();
          }
        } else {
          fb.textContent = '❌ Not quite. ' + q.explain;
          fb.style.color = '#b00020';
        }
      });

      box.appendChild(div);
    });
  }

  // Print
  function printQuick() {
    document.body.classList.add('print-quick');
    window.print();
    setTimeout(() => document.body.classList.remove('print-quick'), 300);
  }

function applyBankLang(){
  const lang = (window.AideI18n?.getLang?.()) || (document.documentElement.getAttribute('lang')||'en');
  const t = TB();
  const isEN = String(lang).toLowerCase().startsWith('en');
  if (isEN) {
    // Keep original English layout/text; only update buttons and common UI; re-render checklist
    const q = qs('#btnPrintQuick'); if(q) q.textContent = t.printQuick;
    const a = qs('#btnPrintAll'); if(a) a.textContent = t.printAll;
    window.AideI18n?.applyCommonUI?.();
    renderChecklist();
    return;
  }
  const x = TX();

  // Topbar/toolbar
  const brandSub = qs('.brand__subtitle'); if (brandSub) brandSub.textContent = x.brandSubtitle;
  const title = qs('.pathbar .title'); if (title) title.textContent = x.pageTitle;
  const subtitle = qs('.pathbar .subtitle'); if (subtitle) subtitle.textContent = x.pageSubtitle;
  const note = qs('.pathbar .note'); if (note) note.textContent = x.eduNote;

  // Section head titles
  const map = [
    ['#benefits .section__title', x.parts.benefits],
    ['#setup .section__title', x.parts.setup],
    ['#tutorials .section__title', x.parts.tutorials],
    ['#security .section__title', x.parts.security],
    ['#habits .section__title', x.parts.habits],
    ['#wrong .section__title', x.parts.wrong],
    ['#practice .section__title', x.parts.practice],
    ['#help .section__title', x.parts.help],
  ];
  map.forEach(([sel, val]) => { const el = qs(sel); if (el) el.textContent = val; });

  // Benefits
  if (qs('#benefits h2')) qs('#benefits h2').textContent = x.benefits.h2;
  const cards = qsa('#benefits .benefit');
  cards.forEach((c, i) => {
    const t = x.benefits.cards[i]; if (!t) return;
    const bt = qs('.btitle', c); const bd = qs('.detail', c);
    if (bt) bt.textContent = t[0]; if (bd) bd.textContent = t[1];
  });
  const bq = qs('#benefits .detail'); if (bq) bq.textContent = x.benefits.quick;

  // Setup
  if (qs('#setup h2')) qs('#setup h2').textContent = x.setup.h2;
  const s1 = qs('#setup article:nth-of-type(1)');
  if (s1) {
    const h3 = qs('h3', s1); if (h3) h3.textContent = x.setup.step1;
    const lis = qsa('ul li', s1); lis.forEach((li,i)=>{ if(x.setup.step1List[i]) li.innerHTML = x.setup.step1List[i]; });
    const warn = qs('.warn', s1); if (warn) { warn.innerHTML = `<strong>⚠️ ${x.setup.warn1Title}</strong> ${x.setup.warn1}`; }
    const sr = qs('#warnActivate'); if (sr) sr.textContent = x.setup.warn1;
  }
  const s2 = qs('#setup article:nth-of-type(2)');
  if (s2) {
    const h3 = qs('h3', s2); if (h3) h3.textContent = x.setup.step2;
    const lis = qsa('ol.steps li', s2); lis.forEach((li,i)=>{ if(x.setup.step2List[i]) li.innerHTML = x.setup.step2List[i]; });
    const warn = qs('.warn', s2); if (warn) {
      const list = x.setup.warn2List.map(s=>`<li>${s}</li>`).join('');
      warn.innerHTML = `<strong>⚠️ ${x.setup.warn2Title}</strong><ul>${list}</ul>`;
    }
    const sr = qs('#warnCritical'); if (sr) sr.textContent = `${x.setup.warn2Title}: ${x.setup.warn2List.join(' ')}`;
  }
  const pace = qs('#setup .pace'); if (pace) pace.textContent = x.setup.pace;

  // Tutorials
  const td = qs('#tutorials p.detail'); if (td) td.textContent = x.tutorials.detail;
  const th3 = qsa('#tutorials .task h3'); th3.forEach((h,i)=>{ if(x.tutorials.h3[i]) h.textContent = x.tutorials.h3[i]; });
  const tipEtf = qs('#tutorials .task:nth-of-type(3) .warn'); if (tipEtf) tipEtf.textContent = `🟡 ${x.tutorials.tipEtf}`;

  // Security
  const sh2 = qs('#security h2'); if (sh2) sh2.textContent = x.security.h2;
  const doDiv = qs('#security .safe'); if (doDiv) doDiv.innerHTML = `🟢 ${x.security.do}`;
  const nvDiv = qs('#security .danger'); if (nvDiv) nvDiv.textContent = `🔴 ${x.security.never}`;
  const r1 = qs('#security .card2:nth-of-type(1)'); if (r1) { qs('h3', r1).textContent = x.security.r1; const lis=qsa('ul li', r1); lis.forEach((li,i)=>{ if(x.security.r1List[i]) li.textContent = x.security.r1List[i]; }); }
  const r2 = qs('#security .card2:nth-of-type(2)'); if (r2) { qs('h3', r2).textContent = x.security.r2; const lis=qsa('ul li', r2); lis.forEach((li,i)=>{ if(x.security.r2List[i]) li.textContent = x.security.r2List[i]; }); }
  const r3 = qs('#security .card2:nth-of-type(3)'); if (r3) {
    qs('h3', r3).textContent = x.security.r3;
    const dang = qs('.danger', r3); if (dang) { dang.innerHTML = `🔴 ${x.security.golden}`; }
    const lis=qsa('ul li', r3); lis.forEach((li,i)=>{ if(x.security.scamExamples[i]) li.textContent = x.security.scamExamples[i]; });
    const sr = qs('#warnGolden'); if (sr) sr.textContent = x.security.golden;
  }

  // Habits
  const hlis = qsa('#habits ol.steps li'); hlis.forEach((li,i)=>{ if(x.habits.steps[i]) li.textContent = x.habits.steps[i]; });

  // Wrong
  const wt = qs('#wrong h3'); if (wt) wt.textContent = x.wrong.title;
  const wlis = qsa('#wrong ul li'); wlis.forEach((li,i)=>{ if(x.wrong.items[i]) li.textContent = x.wrong.items[i]; });

  // Practice
  const chkH3 = qs('#practice h3'); if (chkH3) chkH3.textContent = x.practice.safetyH3;
  const simH3 = qs('#practice .card2:nth-of-type(2) h3'); if (simH3) simH3.textContent = x.practice.simH3;
  const simNote = qs('#practice .card2:nth-of-type(2) p.detail'); if (simNote) simNote.textContent = x.practice.simNote;
  const loginTitle = qs('#practice .simtitle'); if (loginTitle) loginTitle.textContent = x.practice.loginTitle;
  const labels = qsa('#practiceLogin .label'); if (labels[0]) labels[0].textContent = x.practice.clientCard; if (labels[1]) labels[1].textContent = x.practice.password;
  const loginBtn = qs('#practiceLogin button.pill.primary'); if (loginBtn) loginBtn.textContent = x.practice.loginBtn;
  const safeSign = qs('#practiceLogin .safe'); if (safeSign) safeSign.textContent = `🟢 ${x.practice.safeSign}`;
  const dangerSign = qs('#practiceLogin .danger'); if (dangerSign) dangerSign.textContent = `🔴 ${x.practice.dangerSign}`;

  // Help
  const hList = qsa('#help ul li'); hList.forEach((li,i)=>{ if(x.help.list[i]) li.innerHTML = x.help.list[i]; });
  const hNote = qs('#help .note.big'); if (hNote) hNote.textContent = x.help.note;

  // Bottom links
  const bottom = qsa('nav.bottom-nav a');
  if (bottom[2]) bottom[2].textContent = x.bottom.apps;
  if (bottom[3]) bottom[3].textContent = x.bottom.tips;

  // Buttons
  const q = qs('#btnPrintQuick'); if(q) q.textContent = t.printQuick;
  const a = qs('#btnPrintAll'); if(a) a.textContent = t.printAll;

  // Re-apply common UI (Listen/Print labels etc.)
  window.AideI18n?.applyCommonUI?.();

  // Re-render checklist (localized)
  renderChecklist();
}

function wire() {
  // Collapsible sections
    qsa('[data-toggle]').forEach((head) => head.addEventListener('click', () => toggleSection(head.closest('.section'))));

    // Warning listen buttons
    qsa('.listen-btn').forEach((b) => {
      b.addEventListener('click', () => {
        const sel = b.getAttribute('data-listen');
        speak(textFor(sel));
      });
    });

    // Print
    qs('#btnPrintQuick')?.addEventListener('click', printQuick);
    qs('#btnPrintAll')?.addEventListener('click', () => window.print());

    // Language selector placeholder
    qsa('.lang__btn').forEach((b) => {
      b.addEventListener('click', () => {
        qsa('.lang__btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
  }

wire();
renderChecklist();
renderScamQuiz();
applyBankLang();
window.addEventListener('aide:langChanged', applyBankLang);

// Completion panel
window.AideProgress?.attachCompletionPanel?.({ skillId: 'bank' });
})();
