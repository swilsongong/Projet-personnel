/* ai.js — interactivity for Using AI Tools
   - Collapsible sections
   - Progress tracker (Step 1/4)
   - Expandable AI comparison cards
   - Listen buttons (Web Speech API) slow
   - Practice prompt buttons + copy + example responses
   - Print
   - Back/Next navigation between opened sections
*/

(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const stepEl = qs('#pathStep');

  // i18n for AI page (common UI strings)
  const I18N_AI = {
    en: {
      steps: ['Choosing Your AI', 'Installing', 'Practice', 'Safety & Help'],
      hint: 'Tap a section to open it. Use “Listen” if you prefer audio.',
      print: 'Print This Guide',
      nav: { back: 'Back', home: 'Home (Change Topic)', next: 'Next' },
      listen: 'Listen',
      voice: { hear: 'Hear Example', rec: 'Record (optional)' },
      copy: { copy: 'Copy', copied: 'Copied', select: 'Select and copy' },
    },
    fr: {
      steps: ['Choisir votre IA', 'Installation', 'Pratique', 'Sécurité & Aide'],
      hint: 'Touchez une section pour l’ouvrir. Utilisez « Écouter » si vous préférez l’audio.',
      print: 'Imprimer le guide',
      nav: { back: 'Retour', home: 'Accueil (Changer de sujet)', next: 'Suivant' },
      listen: 'Écouter',
      voice: { hear: 'Écouter un exemple', rec: 'Enregistrer (optionnel)' },
      copy: { copy: 'Copier', copied: 'Copié', select: 'Sélectionner et copier' },
    },
    zh: {
      steps: ['选择你的 AI', '安装', '练习', '安全与帮助'],
      hint: '点一个部分打开。如果喜欢音频，请用“朗读”。',
      print: '打印本指南',
      nav: { back: '返回', home: '首页（换主题）', next: '下一步' },
      listen: '朗读',
      voice: { hear: '示例朗读', rec: '录音（可选）' },
      copy: { copy: '复制', copied: '已复制', select: '选择并复制' },
    },
  };

  function currentLang(){
    return (window.AideI18n && window.AideI18n.getLang()) || (document.documentElement.getAttribute('lang')||'en');
  }

  function stepLabel(n){
    const t = I18N_AI[currentLang()] || I18N_AI.en;
    return `Step ${n}/4: ${t.steps[n-1]}`;
  }

  function applyCommonUI(){
    const t = I18N_AI[currentLang()] || I18N_AI.en;
    const hint = qs('#pathHint'); if(hint) hint.textContent = t.hint;
    const p = qs('#btnPrint'); if(p) p.textContent = t.print;
    // generic nav buttons on this page
    document.querySelectorAll('[data-prev]').forEach(b => b.textContent = t.nav.back);
    document.querySelectorAll('[data-home]').forEach(b => b.textContent = t.nav.home);
    document.querySelectorAll('[data-next]').forEach(b => b.textContent = t.nav.next);
    // listen buttons
    document.querySelectorAll('.listen-btn').forEach(b => { if(b.id !== 'btnListenAll') b.textContent = t.listen; });
  }

  // Page content i18n (long-form bodies)
  const I18N_AIX = {
    en: {
      titles: {
        s1: '1. What is AI?', s2: '2. Choose an AI assistant', s3: '3. Common installation problems', s4: '4. Practice: Try these AI prompts', s4b: '4b. Voice Practice: Try voice commands', s2b: '2b. Which AI is right for you? (Quick quiz)', s5: '5. Safety & Privacy Center', s6: '6. Getting help'
      },
      intro: {
        big: 'AI is like a helpful digital assistant on your phone or computer.',
        bullets: ['Answers questions anytime','Helps with writing and ideas','Translates languages','Remembers information for you (inside your chat)'],
        sr: 'AI is like a helpful digital assistant on your phone or computer. It can answer questions anytime, help with writing and ideas, translate languages, and remember information inside your chat.'
      },
      chooseIntro: 'Tap a card to see how to install it (📱 phone/tablet, 💻 computer).',
      heads: {
        chatgpt: { best: 'Questions & writing', free: '✓ Yes (with account)', ease: '🟢 Easy' },
        gemini: { best: 'Everyday questions', free: '✓ Yes', ease: '🟢 Easy' },
        copilot: { best: 'Computer help', free: '✓ Yes', ease: '🟡 Medium' },
        claude: { best: 'Long conversations', free: '✓ Yes (limited)', ease: '🟡 Medium' },
        perplexity: { best: 'Finding information', free: '✓ Yes', ease: '🟢 Easy' },
      },
      tools: {
        chatgpt: {
          h3: 'CHATGPT GUIDE',
          what: 'The most popular AI for conversation.',
          iosH4: '📱 iPhone / iPad',
          iosSteps: ['Open <strong>App Store</strong> (blue icon with “A”).','Tap <strong>Search</strong> (magnifying glass).','Type <strong>ChatGPT</strong>.','Tap <strong>Get</strong> then <strong>Install</strong>.','Open and tap <strong>Sign Up</strong>.'],
          andH4: '📱 Android Phone',
          andSteps: ['Open <strong>Play Store</strong> (colorful triangle).','Tap the search bar.','Type <strong>ChatGPT</strong>.','Tap <strong>Install</strong>.','Open and create an account.'],
          pcH4: '💻 Computer',
          pcSteps: ['Open a web browser (Chrome, Safari, Edge).','Go to: <code>chat.openai.com</code>','Click <strong>Sign up</strong>.','Follow the instructions.'],
          setupH4: 'First Time Setup',
          setupSteps: ['Create account (email needed).','Verify email (check your inbox).','Log in for first time.','Try your first question: <strong>“Hello!”</strong>'],
          safetyTitle: '⚠️ Safety Tips',
          safetyItems: ['Never share: passwords, credit card numbers, home address.','AI can make mistakes.','Good for: ideas, explanations, simple help.'],
          simH4: 'Interactive Phone Simulator: Installing an AI app',
          simP: 'Tap “Next” and follow the glowing highlight. You can switch tools (ChatGPT, Gemini, Copilot, Claude, Perplexity).',
          simLabel: 'Choose an AI tool:',
        },
        gemini: {
          h3: 'GOOGLE GEMINI GUIDE',
          what: 'Google’s AI — good for everyday questions.',
          iosH4: '📱 iPhone / iPad',
          iosSteps: ['App Store → Search <strong>Google Gemini</strong>','Install → Open','Sign in with Google account (optional)'],
          andH4: '📱 Android Phone',
          andP1: 'Often pre-installed. Check for <strong>Gemini</strong> or <strong>Google Assistant</strong>.',
          andP2: 'If not: Play Store → <strong>Google Gemini</strong> → Install',
          pcH4: '💻 Computer',
          pcSteps: ['Use Chrome (recommended).','Go to: <code>gemini.google.com</code>','Sign in with Google account.'],
          featH4: 'Special Features',
          featItems: ['✓ Can read text aloud (if you allow)','✓ Connects to Google services','✓ Voice commands: “Hey Google, …”'],
          practice: 'Practice: Try saying: <strong>“Hey Google, what’s the weather today?”</strong>',
        },
        copilot: {
          h3: 'MICROSOFT COPILOT GUIDE',
          what: 'Good for computer help and documents.',
          winH4: '💻 Windows Computer',
          winP1: 'Often already installed. Look for the Copilot icon on the taskbar (blue circle).',
          winP2: 'Or try: <strong>Windows key + C</strong> (if supported).',
          iosH4: '📱 iPhone / iPad',
          iosP: 'App Store → <strong>Microsoft Copilot</strong> → Install',
          andH4: '📱 Android Phone',
          andP: 'Play Store → <strong>Microsoft Copilot</strong> → Install',
          webH4: '💻 Web Browser',
          webP: 'Go to: <code>copilot.microsoft.com</code>',
          bestH4: 'Best Uses',
          bestItems: ['✓ “Help me write an email”','✓ “Explain this computer error”','✓ “Create a schedule for my week”'],
        },
        claude: {
          h3: 'CLAUDE (Anthropic) — Quick Guide',
          what: 'Great for long conversations and careful writing.',
          li: ['📱 App Store / Play Store: search <strong>Claude</strong>','💻 Website: <code>claude.ai</code>'],
        },
        perplexity: {
          h3: 'PERPLEXITY — Quick Guide',
          what: 'A search-style AI that can show sources for answers.',
          li: ['📱 App Store / Play Store: <strong>Perplexity AI</strong>','💻 Website: <code>perplexity.ai</code>','Tip: You can use the web version if you don’t want to create an account.'],
        },
      },
      trouble: {
        h2: 'Having Trouble Installing?',
        items: [
          ['❌ App Store asks for password','Solution: You may need your Apple ID password. Ask a family member to help.'],
          ['❌ Phone says “not enough space”','Solution: Delete old photos or apps you don’t use.'],
          ['❌ Can’t create account','Solution: Try a simpler password. Or ask family to help set it up.'],
          ['❌ Don’t want to use email','Solution: Some AIs work without an account (example: Perplexity web version).'],
        ],
        sr: 'Having trouble installing? If the App Store asks for a password, you may need your Apple ID password. If your phone says not enough space, delete old photos or apps. If you cannot create an account, try a simpler password or ask family to help. If you do not want to use email, use a web version like Perplexity.'
      },
      practice: {
        h2: 'Try These AI Prompts', big: 'Tap a button. Then copy the prompt into your AI app.',
        buttons: { recipe: '🍲 What’s a good recipe for chicken?', thanks: '🇫🇷 How do I say “thank you” in French?', birthday: '🎂 Write a birthday message for my granddaughter', microwave: '📘 Explain how a microwave works simply' },
        labels: { l1: '1) What to type', l2: '2) Example AI response', l3: '3) Now you try!', placeholder: 'Type your prompt here (or paste it).' }
      },
      voice: {
        title: '4b. Voice Practice: Try voice commands', big: 'Choose an assistant, listen to an example, then try saying it yourself. Recordings stay in your browser (not uploaded).', label: 'Assistant:', sr: 'This section lets you hear examples of voice commands and optionally record yourself. Change assistant with the menu. Use the play button to hear, the record button to try, and look for the volume meter and clarity feedback.', opts: ['Google (Gemini / Assistant)','Amazon Alexa','Apple Siri','ChatGPT (in-app voice)']
      },
      quiz: {
        title: '2b. Which AI is right for you? (Quick quiz)',
        q1: 'Question 1: What do you need most help with?',
        a1: ['A) Writing messages and emails','B) Answering quick questions','C) Computer problems','D) Just exploring technology'],
        q2: 'Question 2: What device do you use most?',
        a2: ['A) iPhone','B) Android phone','C) Computer','D) Tablet'],
        see: 'See Recommendation', open: 'Open the Guide', sr: 'Answer two quick questions to get a recommendation: ChatGPT for A, Google Gemini for B, Microsoft Copilot for C, or Perplexity for D.'
      },
      safety: {
        alwaysTitle: '🔴 ALWAYS REMEMBER',
        always: ['AI doesn’t know you personally.','Don’t believe everything AI says — check important facts.','Never share private information.','It’s okay to say “I don’t understand” and ask for help.'],
        goodBadTitle: '🔴 Good Questions vs. Bad Questions', good: ['“Recipe ideas for diabetes”','“How to video call my family”'], bad: ['“My credit card number is …”','“My home address is …”'], sr: 'Always remember: AI does not know you personally. Do not believe everything it says, check important facts. Never share private information. It is okay to say I do not understand and ask for help. Good questions include recipe ideas for diabetes and how to video call my family. Avoid sharing your credit card number or home address.'
      },
      help: {
        title: '6. Getting help', h2: 'Need Help Setting Up?', list: ['<strong>Family Assistance:</strong> “Show this to a family member.”','<strong>Community Help:</strong> Visit local library tech help hours.','<strong>Simple Alternative:</strong> Try Google search first — it can be easier.'],
        checklistTitle: 'Printable Checklist', checklist: ['Choose an AI tool','Install the app','Create account (if needed)','Try first question','Save login info safely'], bonus: { title: 'Bonus: Other AI tools', items: ['<strong>Claude:</strong> <code>claude.ai</code> (good for long conversations)','<strong>Perplexity:</strong> <code>perplexity.ai</code> (good for finding information)','<strong>Canadian examples:</strong> ADA (<code>ada.cx</code>) for health questions, RBC NOMI for RBC customers'] }, sr: 'Need help setting up? Ask a family member, visit a local library for tech help hours, or try a Google search first. Checklist: choose an AI tool, install the app, create an account if needed, try a first question, and save your login info safely.'
      },
    },
    fr: {
      titles: { s1: '1. Qu’est‑ce que l’IA ?', s2: '2. Choisir un assistant IA', s3: '3. Problèmes d’installation courants', s4: '4. Pratique : essayez ces invites IA', s4b: '4b. Pratique vocale : essayez des commandes', s2b: '2b. Quelle IA vous convient ? (Quiz rapide)', s5: '5. Sécurité & vie privée', s6: '6. Obtenir de l’aide' },
      intro: { big: 'L’IA est comme un <strong>assistant numérique</strong> utile sur votre téléphone ou ordinateur.', bullets: ['Répond aux questions à tout moment','Aide à écrire et à trouver des idées','Traduit des langues','Retient des infos <em>dans la conversation</em>'], sr: 'L’IA est comme un assistant numérique utile. Elle peut répondre, aider à écrire, traduire, et retenir dans la discussion.' },
      chooseIntro: 'Touchez une carte pour voir comment l’installer (📱 téléphone/tablette, 💻 ordinateur).',
      heads: { chatgpt: { best: 'Questions & écriture', free: '✓ Oui (avec compte)', ease: '🟢 Facile' }, gemini: { best: 'Questions du quotidien', free: '✓ Oui', ease: '🟢 Facile' }, copilot: { best: 'Aide informatique', free: '✓ Oui', ease: '🟡 Moyen' }, claude: { best: 'Longs échanges', free: '✓ Oui (limité)', ease: '🟡 Moyen' }, perplexity: { best: 'Trouver de l’information', free: '✓ Oui', ease: '🟢 Facile' } },
      tools: {
        chatgpt: { h3: 'GUIDE CHATGPT', what: 'L’IA de conversation la plus populaire.', iosH4: '📱 iPhone / iPad', iosSteps: ['Ouvrez l’<strong>App Store</strong>.','Touchez <strong>Rechercher</strong>.','Tapez <strong>ChatGPT</strong>.','Touchez <strong>Obtenir</strong> puis <strong>Installer</strong>.','Ouvrez et touchez <strong>Créer un compte</strong>.'], andH4: '📱 Téléphone Android', andSteps: ['Ouvrez le <strong>Play Store</strong>.','Touchez la barre de recherche.','Tapez <strong>ChatGPT</strong>.','Touchez <strong>Installer</strong>.','Ouvrez et créez un compte.'], pcH4: '💻 Ordinateur', pcSteps: ['Ouvrez un navigateur.','Allez sur : <code>chat.openai.com</code>','Cliquez <strong>Sign up</strong>.','Suivez les instructions.'], setupH4: 'Premiers réglages', setupSteps: ['Créer un compte (email).','Vérifier l’email.','Première connexion.','Essayez : <strong>« Bonjour ! »</strong>'], safetyTitle: '⚠️ Conseils de sécurité', safetyItems: ['Ne partagez jamais : mots de passe, carte bancaire, adresse.','L’IA peut se tromper.','Utile pour : idées, explications, aide simple.'], simH4: 'Simulateur téléphone : installer une app IA', simP: 'Touchez « Suivant ». Vous pouvez changer d’outil (ChatGPT, Gemini, Copilot, Claude, Perplexity).', simLabel: 'Choisir un outil :' },
        gemini: { h3: 'GUIDE GOOGLE GEMINI', what: 'L’IA de Google — très bien pour les questions du quotidien.', iosH4: '📱 iPhone / iPad', iosSteps: ['App Store → Rechercher <strong>Google Gemini</strong>','Installer → Ouvrir','Connexion Google (optionnel)'], andH4: '📱 Téléphone Android', andP1: 'Souvent déjà présent. Cherchez <strong>Gemini</strong> ou <strong>Assistant Google</strong>.', andP2: 'Sinon : Play Store → <strong>Google Gemini</strong> → Installer', pcH4: '💻 Ordinateur', pcSteps: ['Chrome recommandé.','Allez sur : <code>gemini.google.com</code>','Connectez‑vous.'], featH4: 'Fonctions', featItems: ['✓ Lecture à voix haute (si autorisée)','✓ Connexion aux services Google','✓ Commandes vocales : « Hey Google … »'], practice: 'Pratique : dites : <strong>« Hey Google, quel temps aujourd’hui ? »</strong>' },
        copilot: { h3: 'GUIDE MICROSOFT COPILOT', what: 'Bien pour l’aide informatique et les documents.', winH4: '💻 Ordinateur Windows', winP1: 'Souvent déjà installé (icône Copilot).', winP2: 'Ou essayez : <strong>Touche Windows + C</strong>.', iosH4: '📱 iPhone / iPad', iosP: 'App Store → <strong>Microsoft Copilot</strong> → Installer', andH4: '📱 Téléphone Android', andP: 'Play Store → <strong>Microsoft Copilot</strong> → Installer', webH4: '💻 Navigateur web', webP: 'Allez sur : <code>copilot.microsoft.com</code>', bestH4: 'Meilleurs usages', bestItems: ['✓ « Aide‑moi à écrire un email »','✓ « Explique cette erreur »','✓ « Crée un planning pour la semaine »'] },
        claude: { h3: 'CLAUDE (Anthropic) — Guide rapide', what: 'Excellent pour de longues conversations et une écriture soignée.', li: ['📱 App Store / Play Store : <strong>Claude</strong>','💻 Site : <code>claude.ai</code>'] },
        perplexity: { h3: 'PERPLEXITY — Guide rapide', what: 'IA de recherche qui montre ses sources.', li: ['📱 App Store / Play Store : <strong>Perplexity AI</strong>','💻 Site : <code>perplexity.ai</code>','Astuce : utilisez le web si vous ne voulez pas de compte.'] },
      },
      trouble: { h2: 'Difficultés d’installation ?', items: [['❌ L’App Store demande un mot de passe','Solution : c’est le mot de passe Apple ID. Demandez à un proche.'],['❌ Espace insuffisant','Solution : supprimez des photos/apps.'],['❌ Impossible de créer un compte','Solution : mot de passe plus simple ou aide familiale.'],['❌ Pas d’email','Solution : certaines IA fonctionnent sur le web (ex. Perplexity).']], sr: 'Si l’App Store demande un mot de passe, utilisez l’Apple ID. Si manque d’espace, supprimez des photos/apps. Sinon demandez de l’aide. Le web peut éviter le compte (Perplexity).' },
      practice: { h2: 'Essayez ces invites', big: 'Touchez un bouton puis copiez l’invite dans votre app IA.', buttons: { recipe: '🍲 Une bonne recette de poulet ?', thanks: '🇫🇷 Comment dire « merci » en français ?', birthday: '🎂 Un message d’anniversaire pour ma petite‑fille', microwave: '📘 Expliquer simplement le fonctionnement d’un micro‑ondes' }, labels: { l1: '1) À taper', l2: '2) Exemple de réponse', l3: '3) À vous !', placeholder: 'Tapez (ou collez) votre invite ici.' } },
      voice: { title: '4b. Pratique vocale : commandes', big: 'Choisissez un assistant, écoutez un exemple, puis essayez. Les enregistrements restent dans votre navigateur.', label: 'Assistant :', sr: 'Section pour écouter/essayer des commandes vocales.', opts: ['Google (Gemini / Assistant)','Amazon Alexa','Apple Siri','ChatGPT (voix intégrée)'] },
      quiz: { title: '2b. Quelle IA vous convient ? (Quiz rapide)', q1: 'Question 1 : Avec quoi avez‑vous le plus besoin d’aide ?', a1: ['A) Rédiger des messages/emails','B) Répondre à des questions rapides','C) Problèmes d’ordinateur','D) Explorer la technologie'], q2: 'Question 2 : Quel appareil utilisez‑vous le plus ?', a2: ['A) iPhone','B) Téléphone Android','C) Ordinateur','D) Tablette'], see: 'Voir la recommandation', open: 'Ouvrir le guide', sr: 'Deux réponses : ChatGPT (A), Google Gemini (B), Microsoft Copilot (C) ou Perplexity (D).' },
      safety: { alwaysTitle: '🔴 À TOUJOURS RETENIR', always: ['L’IA ne vous connaît pas personnellement.','Ne croyez pas tout : vérifiez les infos importantes.','Ne partagez pas d’infos privées.','Dites « Je ne comprends pas » et demandez de l’aide.'], goodBadTitle: '🔴 Bonnes vs mauvaises questions', good: ['« Recettes pour diabète »','« Comment appeler ma famille en vidéo »'], bad: ['« Mon numéro de carte… »','« Mon adresse… »'], sr: 'Rappelez‑vous : vérifiez les faits, ne partagez pas d’infos privées. Exemples de bonnes questions…' },
      help: { title: '6. Obtenir de l’aide', h2: 'Besoin d’aide pour l’installation ?', list: ['<strong>Aide familiale :</strong> « Montre ceci à un proche ».','<strong>Communauté :</strong> heures d’aide techno à la bibliothèque.','<strong>Plus simple :</strong> essayez d’abord une recherche Google.'], checklistTitle: 'Liste imprimable', checklist: ['Choisir un outil IA','Installer l’app','Créer un compte (si besoin)','Poser une première question','Garder les identifiants en sécurité'], bonus: { title: 'Bonus : autres IA', items: ['<strong>Claude :</strong> <code>claude.ai</code>','<strong>Perplexity :</strong> <code>perplexity.ai</code>','<strong>Exemples canadiens :</strong> ADA (<code>ada.cx</code>), RBC NOMI'] }, sr: 'Demandez à la famille, à la bibliothèque, ou commencez par Google. Liste : choisir, installer, créer, essayer, garder en sécurité.' },
    },
    zh: {
      titles: { s1: '1. 什么是 AI？', s2: '2. 选择一个 AI 助手', s3: '3. 常见安装问题', s4: '4. 练习：试试这些提示语', s4b: '4b. 语音练习：试着说出指令', s2b: '2b. 哪个 AI 适合你？（快速测验）', s5: '5. 安全与隐私中心', s6: '6. 获取帮助' },
      intro: { big: 'AI 就像手机或电脑里的<strong>贴心助理</strong>。', bullets: ['随时回答问题','帮你写作与出主意','可翻译语言','在对话里“记住”信息'], sr: 'AI 像一个数字助理：能回答问题、帮写作、翻译，并在聊天中记住信息。' },
      chooseIntro: '点开任意卡片查看安装方法（📱 手机/平板，💻 电脑）。',
      heads: { chatgpt: { best: '问答与写作', free: '✓ 是（需账号）', ease: '🟢 简单' }, gemini: { best: '日常问题', free: '✓ 是', ease: '🟢 简单' }, copilot: { best: '电脑帮助', free: '✓ 是', ease: '🟡 中等' }, claude: { best: '长对话', free: '✓ 是（有限）', ease: '🟡 中等' }, perplexity: { best: '找资料', free: '✓ 是', ease: '🟢 简单' } },
      tools: { chatgpt: { h3: 'CHATGPT 指南', what: '最流行的对话式 AI。', iosH4: '📱 iPhone / iPad', iosSteps: ['打开 <strong>App Store</strong>。','点<strong>搜索</strong>。','输入 <strong>ChatGPT</strong>。','点<strong>获取</strong>→<strong>安装</strong>。','打开并点<strong>注册</strong>。'], andH4: '📱 安卓手机', andSteps: ['打开 <strong>Play 商店</strong>。','点搜索栏。','输入 <strong>ChatGPT</strong>。','点 <strong>安装</strong>。','打开并创建账号。'], pcH4: '💻 电脑', pcSteps: ['打开浏览器','访问：<code>chat.openai.com</code>','点击 <strong>Sign up</strong>','按提示完成'], setupH4: '首次设置', setupSteps: ['创建账号（需要邮箱）','验证邮箱','首次登录','试着问：<strong>“你好！”</strong>'], safetyTitle: '⚠️ 安全提示', safetyItems: ['不要分享：密码、银行卡信息、家庭住址','AI 可能会出错','适合：出主意、解释说明、简单帮助'], simH4: '手机安装模拟器', simP: '点“下一步”跟着高亮提示；可切换工具（ChatGPT、Gemini、Copilot、Claude、Perplexity）。', simLabel: '选择 AI 工具：' }, gemini: { h3: 'GOOGLE GEMINI 指南', what: 'Google 的 AI，适合日常问题。', iosH4: '📱 iPhone / iPad', iosSteps: ['App Store 搜索 <strong>Google Gemini</strong>','安装 → 打开','可选：用 Google 账号登录'], andH4: '📱 安卓手机', andP1: '常已预装，找 <strong>Gemini</strong> 或 <strong>Google 助理</strong>。', andP2: '没有则 Play 商店 → <strong>Google Gemini</strong> → 安装', pcH4: '💻 电脑', pcSteps: ['建议用 Chrome','访问：<code>gemini.google.com</code>','用 Google 账号登录'], featH4: '特色功能', featItems: ['✓ 可朗读回答（需授权）','✓ 与 Google 服务联动','✓ 语音唤醒：“Hey Google …”'], practice: '练习：试着说：<strong>“Hey Google, 今天的天气？”</strong>' }, copilot: { h3: 'MICROSOFT COPILOT 指南', what: '擅长电脑帮助与文档。', winH4: '💻 Windows 电脑', winP1: '通常已内置（任务栏蓝色圆圈图标）。', winP2: '或试试：<strong>Win 键 + C</strong>。', iosH4: '📱 iPhone / iPad', iosP: 'App Store → <strong>Microsoft Copilot</strong> → 安装', andH4: '📱 安卓手机', andP: 'Play 商店 → <strong>Microsoft Copilot</strong> → 安装', webH4: '💻 浏览器', webP: '访问：<code>copilot.microsoft.com</code>', bestH4: '适合用途', bestItems: ['✓ “帮我写一封邮件”','✓ “解释这个电脑错误”','✓ “帮我制定每周计划”'] }, claude: { h3: 'CLAUDE — 速览', what: '适合长对话与认真写作。', li: ['📱 App Store / Play 商店：搜索 <strong>Claude</strong>','💻 网站：<code>claude.ai</code>'] }, perplexity: { h3: 'PERPLEXITY — 速览', what: '搜索风格的 AI，可展示信息来源。', li: ['📱 App Store / Play 商店：<strong>Perplexity AI</strong>','💻 网站：<code>perplexity.ai</code>','提示：不想注册可直接用网页版。'] } },
      trouble: { h2: '安装遇到问题？', items: [['❌ App Store 要求密码','解决：需要 Apple ID 密码；请家人协助。'],['❌ 存储空间不足','解决：删除旧照片或不用的应用。'],['❌ 无法创建账号','解决：换个简单些的密码，或请家人帮忙。'],['❌ 不想用邮箱','解决：有些 AI 可直接用网页（如 Perplexity）。']], sr: '安装问题：可能需要 Apple ID 密码；清理空间；设置简单密码；不想邮箱就用网页版本。' },
      practice: { h2: '试试这些提示语', big: '点按钮，然后把提示语复制到你的 AI 应用。', buttons: { recipe: '🍲 有什么简单的鸡肉菜谱？', thanks: '🇫🇷 “谢谢你”的法语怎么说？', birthday: '🎂 给外孙女写一段生日祝福', microwave: '📘 用简单的话解释微波炉怎么工作' }, labels: { l1: '1）输入内容', l2: '2）示例回答', l3: '3）轮到你试试', placeholder: '在此输入或粘贴你的提示语。' } },
      voice: { title: '4b. 语音练习：试着说指令', big: '选择一个助手，先听示例，再自己尝试。录音不会上传。', label: '助手：', sr: '这里可以听语音示例并可录音自测。', opts: ['Google（Gemini/Assistant）','Amazon Alexa','Apple Siri','ChatGPT（内置语音）'] },
      quiz: { title: '2b. 哪个 AI 适合你？（快速测验）', q1: '问题 1：你最需要哪方面的帮助？', a1: ['A) 写消息或邮件','B) 回答日常问题','C) 电脑问题','D) 想多了解科技'], q2: '问题 2：你最常用的设备？', a2: ['A) iPhone','B) 安卓手机','C) 电脑','D) 平板'], see: '查看推荐', open: '打开指南', sr: '两题得出推荐：A=ChatGPT，B=Google Gemini，C=Microsoft Copilot，D=Perplexity。' },
      safety: { alwaysTitle: '🔴 牢记', always: ['AI 并不了解你本人','重要信息要核实','不要分享隐私','不懂就问，没关系'], goodBadTitle: '🔴 好问题 vs 不该问', good: ['“糖尿病食谱建议”','“怎么视频联系家人”'], bad: ['“我的银行卡号是…”','“我的家庭住址是…”'], sr: '请牢记：核实信息，不要分享隐私。好的问题如食谱、视频通话；不要透露银行卡或住址。' },
      help: { title: '6. 获取帮助', h2: '需要安装帮助？', list: ['<strong>家人：</strong>给可信的家人看','<strong>社区：</strong>去图书馆参加科技帮助时间','<strong>更简单：</strong>先试试 Google 搜索'], checklistTitle: '可打印清单', checklist: ['选一个 AI 工具','安装应用','（如需）注册账号','试第一条问题','安全保存登录信息'], bonus: { title: '加分项：其它 AI', items: ['<strong>Claude：</strong> <code>claude.ai</code>','<strong>Perplexity：</strong> <code>perplexity.ai</code>','<strong>加拿大示例：</strong> ADA (<code>ada.cx</code>)、RBC NOMI'] }, sr: '请家人/社区协助，或先搜 Google。清单：选择、安装、注册、尝试、保存登录信息。' },
    },
  };

  function applyAiLang(){
    const lang = currentLang().startsWith('fr') ? 'fr' : (currentLang().startsWith('zh') ? 'zh' : 'en');
    if (lang === 'en') return; // Keep original English copy/layout from HTML
    const L = I18N_AIX[lang] || I18N_AIX.en;

    // Section titles
    const titles = qsa('.section__head .section__title');
    if (titles[0]) titles[0].textContent = L.titles.s1;
    if (titles[1]) titles[1].textContent = L.titles.s2;
    // Next ones are ordered later in DOM; find by index

    // Intro body
    const introBig = qs('.hero__text p.big'); if (introBig) introBig.innerHTML = L.intro.big;
    const introLis = qsa('.hero__text ul.big li'); introLis.forEach((li,i)=>{ if(L.intro.bullets[i]) li.textContent = L.intro.bullets[i]; });
    const srIntro = qs('#secIntro'); if (srIntro) srIntro.textContent = L.intro.sr;

    // Choose section intro
    const chooseP = qsa('.section')[1]?.querySelector('p.big'); if (chooseP) chooseP.textContent = L.chooseIntro;

    // Row heads: best/free/ease per tool
    const mapHeads = [
      ['chatgpt', L.heads.chatgpt],
      ['gemini', L.heads.gemini],
      ['copilot', L.heads.copilot],
      ['claude', L.heads.claude],
      ['perplexity', L.heads.perplexity],
    ];
    mapHeads.forEach(([key, txt]) => {
      const head = qs(`[data-expand="${key}"]`);
      if(!head) return;
      const best = qs('.ai-best', head); if (best) best.textContent = txt.best;
      const free = qs('.ai-free', head); if (free) free.textContent = txt.free;
      const ease = qs('.ai-ease', head); if (ease) ease.textContent = txt.ease;
    });

    // Tool bodies
    function setSteps(rootSel, steps){ const ol = qs(rootSel + ' ol.steps'); if(ol){ const lis=qsa('li', ol); lis.forEach((li,i)=>{ if(steps[i]) li.innerHTML = steps[i]; }); } }
    function setList(root, items){ const ul = qs(root + ' ul'); if(ul){ const lis=qsa('li', ul); lis.forEach((li,i)=>{ if(items[i]) li.innerHTML = items[i]; }); } }

    // ChatGPT
    const cg = L.tools.chatgpt; if (cg){
      const body = qs('#ai_chatgpt'); if (body){
        const h3 = qs('h3', body); if(h3) h3.textContent = cg.h3;
        const pWhat = qs('p', body); if(pWhat) pWhat.innerHTML = `<strong>What it is:</strong> ${cg.what}`;
        const plats = qsa('.platform', body);
        if(plats[0]){ const h=qs('h4', plats[0]); if(h) h.textContent = cg.iosH4; setSteps('#ai_chatgpt .platform:nth-of-type(1)', cg.iosSteps); }
        if(plats[1]){ const h=qs('h4', plats[1]); if(h) h.textContent = cg.andH4; setSteps('#ai_chatgpt .platform:nth-of-type(2)', cg.andSteps); }
        if(plats[2]){ const h=qs('h4', plats[2]); if(h) h.textContent = cg.pcH4; setSteps('#ai_chatgpt .platform:nth-of-type(3)', cg.pcSteps); }
        const setupH4 = qs('#ai_chatgpt h4:nth-of-type(4)'); if(setupH4) setupH4.textContent = cg.setupH4;
        const setupOl = qs('#ai_chatgpt h4:nth-of-type(4) + ol.steps'); if(setupOl){ const lis = qsa('li', setupOl); lis.forEach((li,i)=>{ if(cg.setupSteps[i]) li.innerHTML = cg.setupSteps[i]; }); }
        const warn = qs('#ai_chatgpt .warn'); if(warn){ const strong = qs('strong', warn); if(strong) strong.textContent = cg.safetyTitle; const items = qsa('ul li', warn); items.forEach((li,i)=>{ if(cg.safetyItems[i]) li.textContent = cg.safetyItems[i]; }); }
        const simHead = qs('#simwrap .simwrap__head h4'); if(simHead) simHead.textContent = cg.simH4;
        const simP = qs('#simwrap .simwrap__head p.detail'); if(simP) simP.textContent = cg.simP;
        const simLabel = qs('#simwrap label[for="simTool"]'); if(simLabel) simLabel.textContent = cg.simLabel;
      }
    }

    // Gemini
    const gg = L.tools.gemini; if (gg){ const body = qs('#ai_gemini'); if(body){ qs('h3', body).textContent = gg.h3; const p=qs('p', body); if(p) p.innerHTML = `<strong>What it is:</strong> ${gg.what}`; const plats=qsa('.platform', body); if(plats[0]){ qs('h4', plats[0]).textContent = gg.iosH4; setSteps('#ai_gemini .platform:nth-of-type(1)', gg.iosSteps);} if(plats[1]){ qs('h4', plats[1]).textContent = gg.andH4; const ps=qsa('p', plats[1]); if(ps[0]) ps[0].innerHTML = gg.andP1; if(ps[1]) ps[1].innerHTML = gg.andP2; } if(plats[2]){ qs('h4', plats[2]).textContent = gg.pcH4; setSteps('#ai_gemini .platform:nth-of-type(3)', gg.pcSteps);} const featH4 = qs('#ai_gemini h4:nth-of-type(4)'); if(featH4) featH4.textContent = gg.featH4; setList('#ai_gemini', gg.featItems); const prac = qs('#ai_gemini .practice'); if(prac) prac.innerHTML = gg.practice; } }

    // Copilot
    const cp = L.tools.copilot; if (cp){ const body = qs('#ai_copilot'); if(body){ qs('h3', body).textContent = cp.h3; const p=qs('p', body); if(p) p.innerHTML = `<strong>What it is:</strong> ${cp.what}`; const plats=qsa('.platform', body); if(plats[0]){ qs('h4', plats[0]).textContent = cp.winH4; const ps=qsa('p', plats[0]); if(ps[0]) ps[0].textContent = cp.winP1; if(ps[1]) ps[1].innerHTML = cp.winP2; } if(plats[1]){ qs('h4', plats[1]).textContent = cp.iosH4; const p1=qsa('p', plats[1])[0]; if(p1) p1.innerHTML = cp.iosP; } if(plats[2]){ qs('h4', plats[2]).textContent = cp.andH4; const p1=qsa('p', plats[2])[0]; if(p1) p1.innerHTML = cp.andP; } if(plats[3]){ qs('h4', plats[3]).textContent = cp.webH4; const p1=qsa('p', plats[3])[0]; if(p1) p1.innerHTML = cp.webP; } const bestH4 = qs('#ai_copilot h4:nth-of-type(5)'); if(bestH4) bestH4.textContent = cp.bestH4; setList('#ai_copilot', cp.bestItems); } }

    // Claude
    const cl = L.tools.claude; if(cl){ const body = qs('#ai_claude'); if(body){ qs('h3', body).textContent = cl.h3; const p=qs('p', body); if(p) p.innerHTML = `<strong>What it is:</strong> ${cl.what}`; setList('#ai_claude', cl.li); } }

    // Perplexity
    const px = L.tools.perplexity; if(px){ const body = qs('#ai_perplexity'); if(body){ qs('h3', body).textContent = px.h3; const p=qs('p', body); if(p) p.innerHTML = `<strong>What it is:</strong> ${px.what}`; setList('#ai_perplexity', px.li); } }

    // Section 3 Trouble
    const s3head = qsa('.section__head .section__title')[2]; if(s3head) s3head.textContent = L.titles.s3;
    const s3h2 = qs('#secTrouble')?.closest('.section__body')?.querySelector('h2'); if(s3h2) s3h2.textContent = L.trouble.h2;
    const problems = qsa('.section')[2]?.querySelectorAll('.problem'); if(problems && problems.length){ problems.forEach((div,i)=>{ const data = L.trouble.items[i]; if(!data) return; const q = qs('.problem__q', div); const a = qs('.problem__a', div); if(q) q.textContent = data[0]; if(a) a.textContent = data[1]; }); }
    const s3sr = qs('#secTrouble'); if(s3sr) s3sr.textContent = L.trouble.sr;

    // Section 4 Practice
    const s4head = qsa('.section__head .section__title')[3]; if(s4head) s4head.textContent = L.titles.s4;
    const s4h2 = qsa('.section')[3]?.querySelector('h2'); if(s4h2) s4h2.textContent = L.practice.h2;
    const s4big = qsa('.section')[3]?.querySelector('p.big'); if(s4big) s4big.textContent = L.practice.big;
    const btns = qsa('.prompt-grid .prompt');
    if(btns[0]) btns[0].textContent = L.practice.buttons.recipe;
    if(btns[1]) btns[1].textContent = L.practice.buttons.thanks;
    if(btns[2]) btns[2].textContent = L.practice.buttons.birthday;
    if(btns[3]) btns[3].textContent = L.practice.buttons.microwave;
    const labels = qsa('#practiceCard .label'); if(labels[0]) labels[0].textContent = L.practice.labels.l1; if(labels[1]) labels[1].textContent = L.practice.labels.l2; const l3=qs('#practiceCard .label:nth-of-type(3)'); if(l3) l3.textContent = L.practice.labels.l3; const ph = qs('#tryBox'); if(ph) ph.placeholder = L.practice.labels.placeholder;

    // Section 4b Voice
    const s4bhead = qsa('.section__head .section__title')[4]; if(s4bhead) s4bhead.textContent = L.titles.s4b;
    const s4bbig = qsa('.section')[4]?.querySelector('p.big'); if(s4bbig) s4bbig.textContent = L.voice.big;
    const voiceLabel = qs('label[for="voiceTool"]'); if(voiceLabel) voiceLabel.textContent = L.voice.label;
    const opts = qsa('#voiceTool option'); opts.forEach((o,i)=>{ if(L.voice.opts[i]) o.textContent = L.voice.opts[i]; });
    const s4bsr = qs('#secVoice'); if(s4bsr) s4bsr.textContent = L.voice.sr;

    // Section 2b Quiz
    const s2bhead = qsa('.section__head .section__title')[5]; if(s2bhead) s2bhead.textContent = L.titles.s2b;
    const qcards = qsa('#ai.html dummy'); // placeholder no-op
    const q1 = qs('#ai.html dummy2'); // no-op to avoid unused warnings
    const q1h3 = qsa('#tutorials h3'); // not used here
    const quizSec = qsa('.section')[5]; if(quizSec){ const h3s = quizSec.querySelectorAll('.card2 h3'); if(h3s[0]) h3s[0].textContent = L.quiz.q1; if(h3s[1]) h3s[1].textContent = L.quiz.q2; const a1 = quizSec.querySelectorAll('.card2:nth-of-type(1) .quiz-opt'); a1.forEach((el,i)=>{ if(L.quiz.a1[i]) el.lastChild.textContent = ' ' + L.quiz.a1[i]; }); const a2 = quizSec.querySelectorAll('.card2:nth-of-type(2) .quiz-opt'); a2.forEach((el,i)=>{ if(L.quiz.a2[i]) el.lastChild.textContent = ' ' + L.quiz.a2[i]; }); const see = qs('#btnAiReco'); if(see) see.textContent = L.quiz.see; const open = qs('#btnOpenGuide'); if(open) open.textContent = L.quiz.open; const sr = qs('#secReco'); if(sr) sr.textContent = L.quiz.sr; }

    // Section 5 Safety
    const s5head = qsa('.section__head .section__title')[6]; if(s5head) s5head.textContent = L.titles.s5;
    const always = qsa('.section')[6]; if(always){ const warn = always.querySelector('.warn.warn--red'); if(warn){ const strong = warn.querySelector('strong'); if(strong) strong.textContent = L.safety.alwaysTitle; const lis = warn.querySelectorAll('ol.steps li'); lis.forEach((li,i)=>{ if(L.safety.always[i]) li.textContent = L.safety.always[i]; }); }
      const gb = always.querySelectorAll('.warn.warn--red')[1]; if(gb){ const strong = gb.querySelector('strong'); if(strong) strong.textContent = L.safety.goodBadTitle; const leftLis = gb.querySelectorAll('.two > div:first-child ul li'); leftLis.forEach((li,i)=>{ if(L.safety.good[i]) li.textContent = L.safety.good[i]; }); const rightLis = gb.querySelectorAll('.two > div:last-child ul li'); rightLis.forEach((li,i)=>{ if(L.safety.bad[i]) li.textContent = L.safety.bad[i]; }); }
      const srs = qs('#secSafety'); if(srs) srs.textContent = L.safety.sr; }

    // Section 6 Help
    const s6head = qsa('.section__head .section__title')[7]; if(s6head) s6head.textContent = L.titles.s6;
    const h2 = qsa('.section')[7]?.querySelector('h2'); if(h2) h2.textContent = L.help.h2;
    const list = qsa('.section')[7]?.querySelectorAll('ul.big li'); list?.forEach((li,i)=>{ if(L.help.list[i]) li.innerHTML = L.help.list[i]; });
    const clH3 = qsa('.section')[7]?.querySelector('.card2 h3'); if(clH3) clH3.textContent = L.help.checklistTitle;
    const clLis = qsa('.section')[7]?.querySelectorAll('.card2 .checklist li label'); clLis?.forEach((lab,i)=>{ if(L.help.checklist[i]) lab.lastChild.textContent = ' ' + L.help.checklist[i]; });
    const bonusH3 = qsa('.section')[7]?.querySelector('.bonus h3'); if(bonusH3) bonusH3.textContent = L.help.bonus.title;
    const bonusLis = qsa('.section')[7]?.querySelectorAll('.bonus ul li'); bonusLis?.forEach((li,i)=>{ if(L.help.bonus.items[i]) li.innerHTML = L.help.bonus.items[i]; });
    const srsHelp = qs('#secHelp'); if(srsHelp) srsHelp.textContent = L.help.sr;
  }

  // Map sections to learning steps (1..4)
  function updateProgress() {
    // find the first opened (expanded) section that is visible on screen or last opened
    const openSections = qsa('.section').filter((s) => {
      const head = qs('[data-toggle]', s);
      return head?.getAttribute('aria-expanded') === 'true';
    });

    const current = openSections[openSections.length - 1] || qs('.section');
    const step = Number(current?.dataset.step || '1');
    const label = stepLabel(step);
    stepEl.textContent = label;
  }

  // Collapsible sections
  function toggleSection(section) {
    const head = qs('[data-toggle]', section);
    const body = qs('[data-body]', section);
    if (!head || !body) return;

    const open = head.getAttribute('aria-expanded') === 'true';
    head.setAttribute('aria-expanded', String(!open));
    qs('.section__chev', head).textContent = open ? '▸' : '▾';
    body.toggleAttribute('hidden', open);

    updateProgress();
  }

  // Expand AI tool rows
  function toggleTool(toolKey) {
    const body = qs('#ai_' + toolKey);
    const head = qs(`[data-expand="${toolKey}"]`);
    if (!body || !head) return;

    const open = head.getAttribute('aria-expanded') === 'true';
    head.setAttribute('aria-expanded', String(!open));
    body.toggleAttribute('hidden', open);
  }

  // Listen buttons
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    const lang = currentLang();
    u.lang = lang.startsWith('fr') ? 'fr-CA' : lang.startsWith('zh') ? 'zh-CN' : 'en-US';
    speechSynthesis.speak(u);
  }

  function getTextFor(selector) {
    const el = qs(selector);
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('button, svg, .diagram').forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  // Practice prompts (localized)
  const PROMPTS_I18N = {
    en: {
      recipe: { title: 'Recipe prompt', prompt: "What's a good recipe for chicken?", example: 'Example response: Try baked lemon-garlic chicken. Ingredients: chicken, lemon, garlic, olive oil, salt, pepper. Steps: heat oven 400°F, mix sauce, bake 25–35 minutes, check it is fully cooked. Ask your AI for exact steps for your oven and diet.' },
      thanks: { title: 'Translation prompt', prompt: "How do I say 'thank you' in French?", example: "Example response: 'Thank you' in French is 'merci'. A more polite version is 'merci beaucoup' (thank you very much)." },
      birthday: { title: 'Writing prompt', prompt: 'Write a birthday message for my granddaughter.', example: 'Example response: Happy Birthday! I am so proud of you. I hope your day is full of joy, cake, and fun. I love you very much.' },
      microwave: { title: 'Explanation prompt', prompt: 'Explain how a microwave works simply.', example: 'Example response: A microwave uses invisible waves to make water in food move and warm up. That movement creates heat, so the food gets hot.' },
    },
    fr: {
      recipe: { title: 'Invite : recette', prompt: 'Quelle est une bonne recette de poulet ?', example: 'Exemple : Poulet au citron et à l’ail au four. Ingrédients : poulet, citron, ail, huile d’olive, sel, poivre. Étapes : four 200°C, mélanger la sauce, cuire 25–35 min. Adaptez selon votre four/régime.' },
      thanks: { title: 'Invite : traduction', prompt: 'Comment dire « merci » en français ?', example: "Exemple : « Merci ». Plus poli : « Merci beaucoup »." },
      birthday: { title: 'Invite : rédaction', prompt: 'Écris un message d’anniversaire pour ma petite‑fille.', example: "Exemple : Joyeux anniversaire ! Je suis très fier/fière de toi. Que ta journée soit pleine de joie et de gâteaux. Je t’aime beaucoup." },
      microwave: { title: 'Invite : expliquer', prompt: 'Explique simplement comment fonctionne un micro‑ondes.', example: "Exemple : Le micro‑ondes fait bouger l’eau dans les aliments grâce à des ondes invisibles ; ce mouvement chauffe l’aliment." },
    },
    zh: {
      recipe: { title: '提示：菜谱', prompt: '有什么简单的鸡肉菜谱？', example: '示例：柠檬蒜香烤鸡。材料：鸡肉、柠檬、大蒜、橄榄油、盐、胡椒。做法：烤箱 200°C，调酱，烤 25–35 分钟，确保熟透。' },
      thanks: { title: '提示：翻译', prompt: '“谢谢你”用法语怎么说？', example: '示例：“谢谢”法语是 “merci”，更礼貌可说 “merci beaucoup”。' },
      birthday: { title: '提示：写作', prompt: '给外孙女写一段生日祝福。', example: '示例：生日快乐！我为你感到骄傲。愿你每天都开心，吃蛋糕也玩得尽兴。非常爱你。' },
      microwave: { title: '提示：解释', prompt: '用简单的话解释微波炉怎么工作。', example: '示例：微波让食物里的水分子运动并发热，因此食物被加热。' },
    },
  };
    recipe: {
      title: 'Recipe prompt',
      prompt: "What's a good recipe for chicken?",
      example:
        'Example response: Try baked lemon-garlic chicken. Ingredients: chicken, lemon, garlic, olive oil, salt, pepper. Steps: heat oven 400°F, mix sauce, bake 25–35 minutes, check it is fully cooked. Ask your AI for exact steps for your oven and diet.',
    },
    thanks: {
      title: 'Translation prompt',
      prompt: "How do I say 'thank you' in French?",
      example:
        "Example response: 'Thank you' in French is 'merci'. A more polite version is 'merci beaucoup' (thank you very much).",
    },
    birthday: {
      title: 'Writing prompt',
      prompt: 'Write a birthday message for my granddaughter.',
      example:
        'Example response: Happy Birthday! I am so proud of you. I hope your day is full of joy, cake, and fun. I love you very much.',
    },
    microwave: {
      title: 'Explanation prompt',
      prompt: 'Explain how a microwave works simply.',
      example:
        'Example response: A microwave uses invisible waves to make water in food move and warm up. That movement creates heat, so the food gets hot.',
    },
  };

  function openPractice(key) {
    const lang = currentLang().startsWith('fr') ? 'fr' : (currentLang().startsWith('zh') ? 'zh' : 'en');
    const p = PROMPTS_I18N[lang][key];
    if (!p) return;
    const card = qs('#practiceCard');
    card.removeAttribute('hidden');
    qs('#practiceTitle').textContent = p.title;
    qs('#promptText').textContent = p.prompt;
    qs('#exampleText').textContent = p.example;
    const box = qs('#tryBox');
    box.value = p.prompt;
    box.focus();
  }

  async function copyPrompt() {
    const text = qs('#promptText')?.textContent || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      qs('#btnCopy').textContent = (I18N_AI[currentLang()]||I18N_AI.en).copy.copied;
      setTimeout(() => (qs('#btnCopy').textContent = (I18N_AI[currentLang()]||I18N_AI.en).copy.copy), 1200);
    } catch {
      // Fallback: do nothing (user can select manually)
      qs('#btnCopy').textContent = (I18N_AI[currentLang()]||I18N_AI.en).copy.select;
      setTimeout(() => (qs('#btnCopy').textContent = (I18N_AI[currentLang()]||I18N_AI.en).copy.copy), 1600);
    }
  }

  // Simple Next/Back navigation between sections (learning path)
  const SECTION_ORDER = qsa('.section');
  let lastIndex = 0;

  function openSectionByIndex(i) {
    const s = SECTION_ORDER[i];
    if (!s) return;
    // open it
    const head = qs('[data-toggle]', s);
    const body = qs('[data-body]', s);
    if (head && body && head.getAttribute('aria-expanded') !== 'true') {
      head.setAttribute('aria-expanded', 'true');
      qs('.section__chev', head).textContent = '▾';
      body.removeAttribute('hidden');
    }
    s.scrollIntoView({ behavior: 'smooth', block: 'start' });
    lastIndex = i;
    updateProgress();
  }

  function nextSection() { openSectionByIndex(Math.min(SECTION_ORDER.length - 1, lastIndex + 1)); }
  function prevSection() { openSectionByIndex(Math.max(0, lastIndex - 1)); }
  function homeSection() { openSectionByIndex(0); }

  function wire() {
    // Collapsible section heads
    qsa('[data-toggle]').forEach((head) => {
      head.addEventListener('click', () => {
        const section = head.closest('.section');
        lastIndex = SECTION_ORDER.indexOf(section);
        toggleSection(section);
      });
    });

    // Expand tool rows
    qsa('[data-expand]').forEach((btn) => btn.addEventListener('click', () => toggleTool(btn.dataset.expand)));

    // Listen
    qsa('.listen-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sel = btn.getAttribute('data-listen');
        speak(getTextFor(sel));
      });
    });

    // Practice prompt buttons
    qsa('.prompt').forEach((b) => b.addEventListener('click', () => openPractice(b.dataset.prompt)));
    qs('#btnCopy').addEventListener('click', copyPrompt);

    // Apply page UI i18n once DOM is wired
    applyCommonUI();
    applyAiLang();
    window.addEventListener('aide:langChanged', () => { applyCommonUI(); applyAiLang(); });

    // Print
    qs('#btnPrint').addEventListener('click', () => window.print());

    // Nav rows
    qsa('[data-next]').forEach((b) => b.addEventListener('click', nextSection));
    qsa('[data-prev]').forEach((b) => b.addEventListener('click', prevSection));
    qsa('[data-home]').forEach((b) => b.addEventListener('click', homeSection));

    // Language buttons (placeholder behavior)
    qsa('.lang__btn').forEach((b) => {
      b.addEventListener('click', () => {
        qsa('.lang__btn').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
  }

  // Init: set initial open section indexes
  function initState() {
    // first section (intro) is open by default, set lastIndex=0
    lastIndex = 0;
    updateProgress();
  }

  // --- Phone simulator ---
  // The simulator is a visual, tap-through “storybook” of screens.
  // It uses simple HTML elements (placeholders) so beginners can edit easily.

  const sim = {
    toolSel: qs('#simTool'),
    canvas: qs('#simCanvas'),
    highlight: qs('#simHighlight'),
    title: qs('#simStepTitle'),
    text: qs('#simStepText'),
    prev: qs('#simPrev'),
    next: qs('#simNext'),
    dots: qs('#simDots'),
    whatIfList: qs('#simWhatIfList'),
    stepIndex: 0,
    tool: 'chatgpt',
  };

  // Each step:
  // - render(): draws the screen into sim.canvas
  // - highlightId: element id in the canvas to highlight
  // - whatIf: list of common problems and solutions
  const SIM_STEPS = {
    chatgpt: [
      {
        title: 'Step 1: Open the App Store',
        text: 'Tap the App Store icon. (We highlight it for you.)',
        render: () => renderHomeScreen({ tool: 'chatgpt' }),
        highlightId: 'hit_appstore',
        whatIf: [
          { q: 'I cannot find the App Store icon', a: 'Swipe down on the home screen and type “App Store” in Search.' },
          { q: 'My phone is Android', a: 'Use the Play Store instead. Switch tool steps above, or use the Android version of this guide.' },
        ],
      },
      {
        title: 'Step 2: Search “ChatGPT”',
        text: 'Tap the search bar. It already has “ChatGPT” typed to show what you should type.',
        render: () => renderStoreSearch({ query: 'ChatGPT', topLabel: 'App Store' }),
        highlightId: 'hit_search',
        whatIf: [
          { q: 'The keyboard does not appear', a: 'Tap once inside the search bar. If it still does not appear, close and reopen the App Store.' },
          { q: 'I see many results', a: 'Look for the official app name “ChatGPT”. Avoid ads that say “Sponsored”.' },
        ],
      },
      {
        title: 'Step 3: Tap “Get”',
        text: 'Tap the green Get button to install.',
        render: () => renderAppResult({ name: 'ChatGPT', publisher: 'OpenAI', buttonText: 'Get', pulse: true }),
        highlightId: 'hit_get',
        whatIf: [
          { q: 'It asks for a password', a: 'That is your Apple ID password. Ask a family member if you do not know it.' },
          { q: 'It says “Not enough storage”', a: 'Delete old photos/videos or unused apps, then try again.' },
        ],
      },
      {
        title: 'Step 4: Face ID / Touch ID',
        text: 'You may need to confirm with Face ID or Touch ID to install. Look at the phone, or place your finger on the sensor.',
        render: () => renderFaceIdPrompt(),
        highlightId: 'hit_faceid',
        whatIf: [
          { q: 'Face ID failed', a: 'Try again slowly. Make sure your face is in the camera view. If needed, enter your passcode.' },
          { q: 'I do not use Face ID / Touch ID', a: 'You can usually type your passcode or Apple ID password instead.' },
        ],
      },
      {
        title: 'Step 5: Open ChatGPT',
        text: 'When the app finishes installing, tap Open. You should see a welcome screen.',
        render: () => renderWelcome({ title: 'ChatGPT', subtitle: 'Welcome! Tap Sign Up or Log In.' }),
        highlightId: 'hit_open',
        whatIf: [
          { q: 'I cannot find the app after installing', a: 'Swipe down on the home screen and search “ChatGPT”.' },
          { q: 'It says “Sign in” and I do not have an account', a: 'Tap “Sign Up”. You may need an email address.' },
        ],
      },
    ],

    gemini: [
      {
        title: 'Step 1: Open your app store',
        text: 'On iPhone use the App Store. On Android use the Play Store.',
        render: () => renderHomeScreen({ tool: 'gemini' }),
        highlightId: 'hit_appstore',
        whatIf: [{ q: 'Gemini is already installed', a: 'Look for “Gemini” or “Google” app. You can open it directly.' }],
      },
      {
        title: 'Step 2: Search “Google Gemini”',
        text: 'Tap the search bar and type Google Gemini.',
        render: () => renderStoreSearch({ query: 'Google Gemini', topLabel: 'App Store / Play Store' }),
        highlightId: 'hit_search',
        whatIf: [{ q: 'It asks for Google sign-in', a: 'You can sign in with a Google account. Some features may require it.' }],
      },
      {
        title: 'Step 3: Install',
        text: 'Tap Install (or Get).',
        render: () => renderAppResult({ name: 'Google Gemini', publisher: 'Google', buttonText: 'Install', pulse: true }),
        highlightId: 'hit_get',
        whatIf: [{ q: 'I cannot install', a: 'Check Wi‑Fi, storage space, and restart your phone.' }],
      },
      {
        title: 'Step 4: Open',
        text: 'Tap Open and try your first question.',
        render: () => renderWelcome({ title: 'Gemini', subtitle: 'Try: “What’s the weather today?”' }),
        highlightId: 'hit_open',
        whatIf: [{ q: 'No microphone', a: 'If you want voice, allow microphone permission when asked.' }],
      },
    ],

    copilot: [
      {
        title: 'Step 1: Open the app store',
        text: 'Install Microsoft Copilot from your app store.',
        render: () => renderHomeScreen({ tool: 'copilot' }),
        highlightId: 'hit_appstore',
        whatIf: [{ q: 'On Windows it may already exist', a: 'On Windows you can also use Copilot in a web browser.' }],
      },
      {
        title: 'Step 2: Search “Microsoft Copilot”',
        text: 'Type Microsoft Copilot in search.',
        render: () => renderStoreSearch({ query: 'Microsoft Copilot', topLabel: 'App Store / Play Store' }),
        highlightId: 'hit_search',
        whatIf: [{ q: 'I see a different Copilot', a: 'Look for “Microsoft Copilot” by Microsoft Corporation.' }],
      },
      {
        title: 'Step 3: Install',
        text: 'Tap Install (or Get).',
        render: () => renderAppResult({ name: 'Microsoft Copilot', publisher: 'Microsoft', buttonText: 'Install', pulse: true }),
        highlightId: 'hit_get',
        whatIf: [{ q: 'It asks for a Microsoft account', a: 'You can sign in, or use the web version in a browser.' }],
      },
      {
        title: 'Step 4: Open',
        text: 'Tap Open and try: “Help me write an email.”',
        render: () => renderWelcome({ title: 'Copilot', subtitle: 'Try: “Help me write an email.”' }),
        highlightId: 'hit_open',
        whatIf: [{ q: 'It cannot answer', a: 'Check your internet connection and try again.' }],
      },
    ],

    claude: [
      {
        title: 'Step 1: Open the app store',
        text: 'Install Claude from your app store or use the website.',
        render: () => renderHomeScreen({ tool: 'claude' }),
        highlightId: 'hit_appstore',
        whatIf: [{ q: 'I prefer the website', a: 'Open a browser and go to claude.ai.' }],
      },
      {
        title: 'Step 2: Search “Claude”',
        text: 'Type Claude in search.',
        render: () => renderStoreSearch({ query: 'Claude', topLabel: 'App Store / Play Store' }),
        highlightId: 'hit_search',
        whatIf: [{ q: 'Many results', a: 'Pick the official Claude app. Avoid “Sponsored” ads.' }],
      },
      {
        title: 'Step 3: Install',
        text: 'Tap Install (or Get).',
        render: () => renderAppResult({ name: 'Claude', publisher: 'Anthropic', buttonText: 'Install', pulse: true }),
        highlightId: 'hit_get',
        whatIf: [{ q: 'No space', a: 'Delete unused apps or photos, then try again.' }],
      },
      {
        title: 'Step 4: Open',
        text: 'Tap Open. You may need to sign in.',
        render: () => renderWelcome({ title: 'Claude', subtitle: 'Welcome! Ask a question.' }),
        highlightId: 'hit_open',
        whatIf: [{ q: 'I do not want an account', a: 'Try a web AI that works without login (varies by service).' }],
      },
    ],

    perplexity: [
      {
        title: 'Step 1: Open the app store',
        text: 'Install Perplexity from your app store, or use the web version.',
        render: () => renderHomeScreen({ tool: 'perplexity' }),
        highlightId: 'hit_appstore',
        whatIf: [{ q: 'I do not want an account', a: 'Try the web version at perplexity.ai.' }],
      },
      {
        title: 'Step 2: Search “Perplexity AI”',
        text: 'Type Perplexity AI in search.',
        render: () => renderStoreSearch({ query: 'Perplexity AI', topLabel: 'App Store / Play Store' }),
        highlightId: 'hit_search',
        whatIf: [{ q: 'I see Perplexity Pro', a: 'You can start with the free version.' }],
      },
      {
        title: 'Step 3: Install',
        text: 'Tap Install (or Get).',
        render: () => renderAppResult({ name: 'Perplexity', publisher: 'Perplexity AI', buttonText: 'Install', pulse: true }),
        highlightId: 'hit_get',
        whatIf: [{ q: 'Install button is gray', a: 'Check Wi‑Fi and storage space.' }],
      },
      {
        title: 'Step 4: Open',
        text: 'Tap Open and try a search question. Look for sources.',
        render: () => renderWelcome({ title: 'Perplexity', subtitle: 'Ask a question. Look for sources.' }),
        highlightId: 'hit_open',
        whatIf: [{ q: 'Too many sources', a: 'Ask shorter questions, like “What is insulin?”' }],
      },
    ],
  };

  // --- Simulator render helpers (simple “fake screenshots”) ---
  function clearCanvas() {
    sim.canvas.innerHTML = '';
  }

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v);
    });
    children.forEach((c) => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  }

  function renderHomeScreen({ tool }) {
    clearCanvas();
    sim.canvas.appendChild(el('div', { class: 'screen-title', text: 'Home Screen' }));
    const grid = el('div', { class: 'icon-grid' });

    // App Store icon is the target for step 1
    const appStore = el('div', { class: 'appicon', id: 'hit_appstore' }, [
      el('div', { text: 'A' }),
      el('small', { text: 'App Store' }),
    ]);

    const filler = [
      el('div', { class: 'appicon' }, [el('div', { text: '📷' }), el('small', { text: 'Camera' })]),
      el('div', { class: 'appicon' }, [el('div', { text: '🧭' }), el('small', { text: 'Safari' })]),
      el('div', { class: 'appicon' }, [el('div', { text: '⚙️' }), el('small', { text: 'Settings' })]),
      el('div', { class: 'appicon' }, [el('div', { text: '💬' }), el('small', { text: 'Messages' })]),
      el('div', { class: 'appicon' }, [el('div', { text: '🗺️' }), el('small', { text: 'Maps' })]),
      el('div', { class: 'appicon' }, [el('div', { text: '🧠' }), el('small', { text: tool || 'AI' })]),
      el('div', { class: 'appicon' }, [el('div', { text: '📞' }), el('small', { text: 'Phone' })]),
    ];

    [appStore, ...filler].forEach((x) => grid.appendChild(x));
    sim.canvas.appendChild(grid);
  }

  function renderStoreSearch({ query, topLabel }) {
    clearCanvas();
    sim.canvas.appendChild(el('div', { class: 'screen-title', text: topLabel }));
    const bar = el('div', { class: 'searchbar', id: 'hit_search' }, [
      el('span', { text: '🔎' }),
      el('span', { text: query }),
      el('span', { class: 'muted', text: ' (typed for you)' }),
    ]);
    sim.canvas.appendChild(bar);

    const list = el('div', { class: 'list' });
    list.appendChild(el('div', { class: 'listitem' }, [el('div', { text: query }), el('div', { class: 'btn', text: 'Search' })]));
    list.appendChild(el('div', { class: 'listitem' }, [el('div', { text: query + ' (official)' }), el('div', { class: 'btn', text: 'View' })]));
    list.appendChild(el('div', { class: 'listitem' }, [el('div', { text: 'Other similar app (ad)' }), el('div', { class: 'btn', text: 'View' })]));
    sim.canvas.appendChild(list);
  }

  function renderAppResult({ name, publisher, buttonText, pulse }) {
    clearCanvas();
    sim.canvas.appendChild(el('div', { class: 'screen-title', text: 'App Details' }));
    const header = el('div', { class: 'row' }, [
      el('div', {}, [
        el('div', { text: name, class: 'ai-name' }),
        el('div', { text: publisher, class: 'muted' }),
      ]),
      el('button', { class: `btn get ${pulse ? 'pulse' : ''}`, id: 'hit_get', type: 'button' , text: buttonText }),
    ]);
    sim.canvas.appendChild(header);
    sim.canvas.appendChild(el('div', { class: 'diagram' }, [`[${name} screenshots here]` ]));
    sim.canvas.appendChild(el('div', { class: 'detail', text: 'Tip: choose the official app. Avoid “Sponsored” results.' }));
  }

  function renderFaceIdPrompt() {
    clearCanvas();
    sim.canvas.appendChild(el('div', { class: 'screen-title', text: 'Confirm Install' }));
    const modal = el('div', { class: 'modal', id: 'hit_faceid' }, [
      el('div', { class: 'modal-title', text: 'Face ID / Touch ID' }),
      el('div', { class: 'detail', text: 'Confirm to install. Look at your phone or use your fingerprint.' }),
      el('div', { class: 'row' }, [
        el('button', { class: 'btn', type: 'button', text: 'Cancel' }),
        el('button', { class: 'btn get', type: 'button', text: 'Confirm' }),
      ]),
    ]);
    sim.canvas.appendChild(modal);
  }

  function renderWelcome({ title, subtitle }) {
    clearCanvas();
    const wrap = el('div', { class: 'welcome' });
    wrap.appendChild(el('div', { text: '🤖', class: 'section__icon' }));
    wrap.appendChild(el('h3', { text: title }));
    wrap.appendChild(el('p', { text: subtitle, class: 'detail' }));

    const openBtn = el('button', { class: 'btn get pulse', id: 'hit_open', type: 'button', text: 'Open' });
    wrap.appendChild(openBtn);

    sim.canvas.appendChild(wrap);
  }

  function renderWhatIf(items) {
    sim.whatIfList.innerHTML = '';
    items.forEach((it) => {
      const row = el('div', { class: 'whatif-item' });
      const qBtn = el('button', { class: 'whatif-q', type: 'button' }, [
        el('span', { text: it.q }),
        el('span', { text: '▸', 'aria-hidden': 'true' }),
      ]);
      const ans = el('div', { class: 'whatif-a', hidden: '' , text: it.a });
      qBtn.addEventListener('click', () => {
        const open = !ans.hasAttribute('hidden');
        ans.toggleAttribute('hidden', open);
        qBtn.lastChild.textContent = open ? '▸' : '▾';
      });
      row.appendChild(qBtn);
      row.appendChild(ans);
      sim.whatIfList.appendChild(row);
    });
  }

  function placeHighlight(targetId) {
    const target = qs('#' + targetId, sim.canvas);
    if (!target) {
      sim.highlight.classList.remove('on');
      return;
    }
    const screenRect = sim.canvas.getBoundingClientRect();
    const r = target.getBoundingClientRect();

    // Position highlight relative to the screen
    const left = r.left - screenRect.left;
    const top = r.top - screenRect.top;

    sim.highlight.style.left = left + 'px';
    sim.highlight.style.top = top + 'px';
    sim.highlight.style.width = r.width + 'px';
    sim.highlight.style.height = r.height + 'px';
    sim.highlight.classList.add('on');
  }

  function renderDots(count, idx) {
    sim.dots.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.className = 'simdot' + (i === idx ? ' on' : '');
      d.title = `Step ${i + 1}`;
      d.addEventListener('click', () => {
        sim.stepIndex = i;
        renderSim();
      });
      sim.dots.appendChild(d);
    }
  }

  function renderSim() {
    if (!sim.canvas) return; // simulator not present (should not happen)
    const steps = SIM_STEPS[sim.tool] || SIM_STEPS.chatgpt;
    const s = steps[sim.stepIndex] || steps[0];

    s.render();
    sim.title.textContent = s.title;
    sim.text.textContent = s.text;
    renderDots(steps.length, sim.stepIndex);
    renderWhatIf(s.whatIf || []);

    // Delay highlight so layout is ready
    requestAnimationFrame(() => placeHighlight(s.highlightId));

    sim.prev.disabled = sim.stepIndex === 0;
    sim.next.textContent = sim.stepIndex === steps.length - 1 ? 'Restart' : 'Next';
  }

  function nextSim() {
    const steps = SIM_STEPS[sim.tool] || SIM_STEPS.chatgpt;
    if (sim.stepIndex >= steps.length - 1) {
      sim.stepIndex = 0;
    } else {
      sim.stepIndex += 1;
    }
    renderSim();
  }

  function prevSim() {
    sim.stepIndex = Math.max(0, sim.stepIndex - 1);
    renderSim();
  }

  function wireSim() {
    if (!sim.canvas) return;
    sim.toolSel?.addEventListener('change', () => {
      sim.tool = sim.toolSel.value;
      sim.stepIndex = 0;
      renderSim();
    });
    sim.prev?.addEventListener('click', prevSim);
    sim.next?.addEventListener('click', nextSim);

    // Let users tap the highlighted element to go to next step
    sim.canvas.addEventListener('click', () => nextSim());

    // Start
    sim.tool = sim.toolSel?.value || 'chatgpt';
    sim.stepIndex = 0;
    renderSim();
  }

  // --- Voice practice ---
  const voice = {
    toolSel: qs('#voiceTool'),
    list: qs('#voiceList'),
  };

  const VOICE_COMMANDS = {
    google: [
      {
        id: 'google_timer',
        title: 'Timer',
        text: 'Hey Google, set a timer for 10 minutes',
        tips: 'Say “Hey Google” first, then pause, then the request.',
      },
      {
        id: 'google_weather',
        title: 'Weather',
        text: "Hey Google, what's the weather today?",
        tips: 'Speak clearly: “what’s the weather today”.',
      },
    ],
    alexa: [
      {
        id: 'alexa_news',
        title: 'News',
        text: "Alexa, what's in the news today?",
        tips: 'Say “Alexa” first so it wakes up.',
      },
      {
        id: 'alexa_timer',
        title: 'Timer',
        text: 'Alexa, set a timer for 10 minutes',
        tips: 'If Alexa doesn’t hear you, speak closer or louder.',
      },
    ],
    siri: [
      {
        id: 'siri_call',
        title: 'Call family',
        text: 'Siri, call my daughter',
        tips: 'This works best if your daughter is saved in Contacts.',
      },
      {
        id: 'siri_timer',
        title: 'Timer',
        text: 'Siri, set a timer for 10 minutes',
        tips: 'You can also say: “Set a 10 minute timer”.',
      },
    ],
    chatgpt: [
      {
        id: 'chatgpt_translate',
        title: 'Translate',
        text: 'Translate this to French: Thank you for your help',
        tips: 'In ChatGPT voice mode, you usually don’t say a wake word.',
      },
      {
        id: 'chatgpt_explain',
        title: 'Explain simply',
        text: 'Explain how to use Wi‑Fi in simple steps',
        tips: 'If the answer is too long, say: “Shorter, please.”',
      },
    ],
  };

  function analyzeClarity({ peak, transcript, expected }) {
    // Very simple beginner-friendly “feedback”.
    // We cannot truly judge clarity without a real speech-to-text model.
    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    const t = norm(transcript);
    const e = norm(expected);

    const loudEnough = peak >= 0.18; // arbitrary threshold
    const quiet = peak < 0.08;

    const hasWakeWord = e.includes('hey google') ? t.includes('hey google') : e.includes('alexa') ? t.includes('alexa') : e.includes('siri') ? t.includes('siri') : true;

    let msg = '';
    if (quiet) msg += 'Too quiet. Try speaking a little louder. ';
    else if (!loudEnough) msg += 'A bit quiet. Move closer to the microphone. ';
    else msg += 'Volume looks good. ';

    if (!transcript) {
      msg += 'Tip: recording can work even if speech-to-text is not available in your browser.';
      return msg.trim();
    }

    if (!hasWakeWord) {
      msg += 'Try including the wake word at the start (for example “Hey Google”, “Alexa”, or “Siri”). ';
    }

    // Rough similarity: count shared words
    const tw = new Set(t.split(' ').filter(Boolean));
    const ew = new Set(e.split(' ').filter(Boolean));
    let shared = 0;
    ew.forEach((w) => { if (tw.has(w)) shared += 1; });
    const ratio = ew.size ? shared / ew.size : 0;

    if (ratio >= 0.75) msg += 'Nice! You said most of the words clearly.';
    else if (ratio >= 0.45) msg += 'Good try. Say it more slowly, one phrase at a time.';
    else msg += 'Try again slowly. Start with the wake word, then pause, then your request.';

    return msg.trim();
  }

  async function trySpeechToTextOnce(lang, seconds = 4) {
    // Optional: speech-to-text via Web Speech API (not supported in all browsers).
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return { transcript: '', ok: false };

    return new Promise((resolve) => {
      const rec = new SpeechRecognition();
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      let done = false;

      rec.onresult = (e) => {
        const t = e.results?.[0]?.[0]?.transcript || '';
        done = true;
        resolve({ transcript: t, ok: true });
      };
      rec.onerror = () => {
        if (!done) resolve({ transcript: '', ok: false });
      };
      rec.onend = () => {
        if (!done) resolve({ transcript: '', ok: false });
      };

      rec.start();
      setTimeout(() => {
        try { rec.stop(); } catch { /* ignore */ }
      }, seconds * 1000);
    });
  }

  async function recordAndMeasure({ seconds = 4, onMeter }) {
    // Optional recording: we measure volume for “clarity” feedback.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);

    let peak = 0;
    let raf = 0;
    const start = performance.now();

    function tick() {
      analyser.getByteTimeDomainData(data);
      // RMS volume from time-domain data
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      peak = Math.max(peak, rms);
      onMeter?.(Math.min(1, rms * 2.5));

      if (performance.now() - start < seconds * 1000) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    await new Promise((r) => setTimeout(r, seconds * 1000));

    cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
    try { await ctx.close(); } catch { /* ignore */ }

    return { peak };
  }

  function renderVoiceList(toolKey) {
    if (!voice.list) return;
    const cmds = VOICE_COMMANDS[toolKey] || [];
    voice.list.innerHTML = '';

    cmds.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'voicecard';

      const cmd = document.createElement('div');
      cmd.className = 'voicecmd';
      cmd.textContent = c.text;

      const tips = document.createElement('div');
      tips.className = 'voicestatus';
      tips.textContent = 'Tip: ' + c.tips;

      const actions = document.createElement('div');
      actions.className = 'voiceactions';

      const playBtn = document.createElement('button');
      playBtn.className = 'play';
      playBtn.type = 'button';
      playBtn.textContent = (I18N_AI[currentLang()]||I18N_AI.en).voice.hear;

      const recBtn = document.createElement('button');
      recBtn.className = 'mic';
      recBtn.type = 'button';
      recBtn.textContent = (I18N_AI[currentLang()]||I18N_AI.en).voice.rec;

      const meter = document.createElement('div');
      meter.className = 'meter';
      const fill = document.createElement('div');
      fill.className = 'meter__fill';
      meter.appendChild(fill);

      const transcript = document.createElement('div');
      transcript.className = 'transcript';
      transcript.textContent = '';

      const feedback = document.createElement('div');
      feedback.className = 'voicestatus';
      feedback.textContent = '';

      playBtn.addEventListener('click', () => {
        // Use Speech Synthesis to demonstrate how to say it slowly.
        speak(c.text);
      });

      recBtn.addEventListener('click', async () => {
        recBtn.disabled = true;
        recBtn.classList.add('rec');
        recBtn.textContent = 'Recording…';
        fill.style.width = '0%';
        transcript.textContent = '';
        feedback.textContent = '';

        try {
          // Try speech-to-text (optional)
          const lang = toolKey === 'siri' ? 'en-US' : toolKey === 'google' ? 'en-US' : 'en-US';
          const sttPromise = trySpeechToTextOnce(lang, 4);

          const { peak } = await recordAndMeasure({
            seconds: 4,
            onMeter: (v) => {
              fill.style.width = Math.round(v * 100) + '%';
            },
          });

          const stt = await sttPromise;
          if (stt.ok && stt.transcript) transcript.textContent = 'We heard: “' + stt.transcript + '”';
          else transcript.textContent = 'We heard: (speech-to-text not available on this device)';

          feedback.textContent = analyzeClarity({ peak, transcript: stt.transcript, expected: c.text });
        } catch (e) {
          feedback.textContent = 'Microphone permission was blocked. In your browser settings, allow microphone to record.';
        } finally {
          recBtn.disabled = false;
          recBtn.classList.remove('rec');
          recBtn.textContent = 'Record (optional)';
        }
      });

      actions.appendChild(playBtn);
      actions.appendChild(recBtn);
      actions.appendChild(meter);

      card.appendChild(cmd);
      card.appendChild(actions);
      card.appendChild(tips);
      card.appendChild(transcript);
      card.appendChild(feedback);

      voice.list.appendChild(card);
    });
  }

  function wireVoice() {
    if (!voice.toolSel || !voice.list) return;
    voice.toolSel.addEventListener('change', () => renderVoiceList(voice.toolSel.value));
    renderVoiceList(voice.toolSel.value);
  }

  // --- AI recommendation quiz ---
  const reco = {
    btn: qs('#btnAiReco'),
    out: qs('#aiRecoResult'),
    openBtn: qs('#btnOpenGuide'),
  };

  function computeRecommendation() {
    const a1 = qs('input[name="aiq1"]:checked')?.value;
    const a2 = qs('input[name="aiq2"]:checked')?.value;

    if (!a1 || !a2) {
      return { ok: false, message: 'Please answer both questions.' };
    }

    const counts = { A: 0, B: 0, C: 0, D: 0 };
    counts[a1] += 1;
    counts[a2] += 1;

    // Pick the highest. If tie, prefer Q1 (what they need help with).
    let top = a1;
    if (counts[a2] > counts[a1]) top = a2;

    if (top === 'A') return { ok: true, tool: 'chatgpt', title: 'Recommendation: ChatGPT', message: 'Best for writing messages and emails, and general conversation.' };
    if (top === 'B') return { ok: true, tool: 'gemini', title: 'Recommendation: Google Gemini', message: 'Best for everyday quick questions, especially if you already use Google.' };
    if (top === 'C') return { ok: true, tool: 'copilot', title: 'Recommendation: Microsoft Copilot', message: 'Best for computer help, Windows tips, and documents.' };
    return { ok: true, tool: 'perplexity', title: 'Recommendation: Perplexity', message: 'Simplest start for finding information and seeing sources.' };
  }

  function openRecommendedGuide(tool) {
    // Expand the tool row in Section 2 if it exists.
    const head = qs(`[data-expand="${tool}"]`);
    const body = qs('#ai_' + tool);
    if (head && body) {
      // ensure section 2 is open
      const section2 = head.closest('.section');
      const sh = qs('[data-toggle]', section2);
      const sb = qs('[data-body]', section2);
      if (sh && sb && sh.getAttribute('aria-expanded') !== 'true') {
        sh.setAttribute('aria-expanded', 'true');
        qs('.section__chev', sh).textContent = '▾';
        sb.removeAttribute('hidden');
      }

      head.setAttribute('aria-expanded', 'true');
      body.removeAttribute('hidden');
      body.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function wireReco() {
    if (!reco.btn || !reco.out || !reco.openBtn) return;

    reco.btn.addEventListener('click', () => {
      const r = computeRecommendation();
      reco.openBtn.setAttribute('hidden', '');
      if (!r.ok) {
        reco.out.textContent = r.message;
        return;
      }

      reco.out.innerHTML = `<strong>${r.title}</strong><br />${r.message}`;
      reco.openBtn.removeAttribute('hidden');
      reco.openBtn.onclick = () => openRecommendedGuide(r.tool);
    });
  }

  wire();
  initState();
  wireSim();
  wireVoice();
  wireReco();

  // Completion panel
  window.AideProgress?.attachCompletionPanel?.({ skillId: 'ai' });
})();
