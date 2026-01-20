/* tips.js — Tips & Tricks interactions (multilingual: en, fr, zh)
   - Tip of the day (random, per-language)
   - Save favorite tips (localStorage)
   - Quote carousel
   - Listen to page (speech synthesis)
   - Print
   - Full i18n for headings, lists, buttons
*/

(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const els = {
    brandSubtitle: qs('#brandSubtitle'),
    pageTitle: qs('#pageTitle'),
    pageSubtitle: qs('#pageSubtitle'),

    tipTitle: qs('#tipOfDayTitle'),
    tipBox: qs('#tipOfDay'),

    h2_mindset: qs('#h2_mindset'),
    h3_mindset: qs('#h3_mindset'),
    list_mindset: qs('#list_mindset'),

    h2_practical: qs('#h2_practical'),
    h3_practical: qs('#h3_practical'),
    list_practical: qs('#list_practical'),

    h2_organized: qs('#h2_organized'),
    h3_organized: qs('#h3_organized'),
    list_organized: qs('#list_organized'),

    h2_montreal: qs('#h2_montreal'),
    h3_montreal: qs('#h3_montreal'),
    list_montreal: qs('#list_montreal'),

    h2_wellness: qs('#h2_wellness'),
    h3_wellness: qs('#h3_wellness'),
    list_wellness: qs('#list_wellness'),

    h2_frustrated: qs('#h2_frustrated'),
    h3_frustrated: qs('#h3_frustrated'),
    list_frustrated: qs('#list_frustrated'),

    h2_quotes: qs('#h2_quotes'),
    quote: qs('#quoteBox'),

    finalTitle: qs('#finalTitle'),
    finalBody: qs('#finalBody'),
    finalNote: qs('#finalNote'),

    navBack: qs('#navBack'),
    navHome: qs('#navHome'),

    // Buttons
    btnNew: qs('#btnNewTip'),
    btnSave: qs('#btnSaveTip'),
    btnCopy: qs('#btnCopyTip'),
    btnListenAll: qs('#btnListenAll'),
    btnPrint: qs('#btnPrintTips'),
    btnViewFav: qs('#btnViewFav'),

    qPrev: qs('#quotePrev'),
    qNext: qs('#quoteNext'),
  };

  const STORAGE = {
    fav: 'tips_favorites',
    lastTipPrefix: 'tips_last_tip_', // + lang
  };

  const I18N = {
    en: {
      brandSubtitle: 'Tips & Tricks for Daily Life',
      pageTitle: 'Tips & Tricks for Your Daily Life',
      pageSubtitle: 'Helpful advice to feel more confident and comfortable.',

      buttons: {
        listenAll: 'Listen to This Page',
        printTips: 'Print These Tips',
        viewFav: 'My Favorite Tips',
        newTip: 'New Tip',
        saveTip: 'Save My Favorite Tip',
        copyTip: 'Copy Tip',
        quotePrev: 'Back',
        quoteNext: 'Next',
      },

      tipOfDay: '💡 Tip of the Day',

      sections: {
        mindset: {
          h2: '1. Your Mindset: The Most Important Tool',
          h3: 'Be Kind to Yourself',
          items: [
            '🕐 Take Your Time: Technology is not a race. Pause, breathe, and try again.',
            '❓ Ask for Help: “Could you please show me how to do this one time?”',
            "😊 Don’t Be Afraid of Mistakes: You usually cannot break your phone by clicking the wrong button.",
            '🎯 Celebrate Small Wins: One small step is still progress.',
          ],
        },
        practical: {
          h2: '2. Practical Tech Tips',
          h3: 'Little Tricks That Make a Big Difference',
          items: [
            '🔍 Make Text Bigger: Phone: Settings → Display → Font Size. Computer: Ctrl/Cmd + + to zoom.',
            '🎧 Use Voice Commands: “Hey Siri” / “Ok Google” → “Call my daughter” or “Set a timer for 10 minutes.”',
            '📸 Take Photos of Important Things: medication list, doctor instructions, Wi‑Fi password. Make an album “Important Info”.',
            '🔋 Save Battery: Use Low Power Mode; close unused apps.',
          ],
        },
        organized: {
          h2: '3. Staying Safe & Organized',
          h3: 'A Little Planning Prevents Problems',
          items: [
            '🗝️ The One Notebook Method: keep one notebook for instructions, questions, and password hints.',
            '📞 Create an “ICE” contact: add a family member as “ICE”.',
            '🛒 Tech‑Free Backups: keep key phone numbers on paper at home.',
          ],
        },
        montreal: {
          h2: '4. Navigating Montreal & Community',
          h3: 'Life in the City',
          items: [
            '🚌 Bus Driver Help: “Can you tell me when we get to [Street Name]?”',
            '🏥 Medical Appointments: ask if they have a translator.',
            '📚 Free Community Resources: libraries and CLSCs can help you find services.',
            '🌤️ Weather Wisdom: check the weather before going out. Layers are your friend.',
          ],
        },
        wellness: {
          h2: '5. Health & Wellness',
          h3: 'Looking After Yourself',
          items: [
            '💊 Medication Management: use a weekly pill organizer. Pair pills with morning tea.',
            '🧘 Simple Exercises: stretch daily; march in place during TV commercials.',
            '🧠 Brain Games: puzzles, cards, or one new word per day.',
            '👥 Stay Connected: message one person each day, even just hello.',
          ],
        },
        frustrated: {
          h2: '6. When You Feel Frustrated…',
          h3: 'It’s Okay to Take a Break',
          items: [
            '⏳ The 15‑Minute Rule: put it down, breathe, tea break, then return.',
            '🧹 Simplify: find one way that works for you and stick to it.',
            '❤️ Remember Your “Why”: photos, family calls, independence — keep the reason in mind.',
          ],
        },
        quotesTitle: '7. Words of Encouragement',
      },

      final: {
        title: 'Final Tip: You Are Not Alone',
        body:
          'This whole city is full of people learning new things every day. You have a community in this app, your family, and Montreal. Be proud of every new thing you try.',
        note: 'Have a great tip that helped you? Share it with a friend today!',
      },

      nav: { back: 'Back', home: 'Home' },

      listenIntro: 'Tips and tricks for your daily life. Helpful advice to feel more confident and comfortable.',
      listenFinal: 'Final tip: you are not alone. Be proud of every new thing you try.',

      emptyFav: 'No favorites yet. Tap “Save My Favorite Tip”.',
      copiedTip: 'Tip copied (if possible):',

      tips: [
        '🕐 Take your time. Technology is not a race.',
        '❓ Asking for help is a sign of strength.',
        '😊 Mistakes are how we learn. You usually cannot break your phone by tapping the wrong button.',
        '🎯 Celebrate small wins. One new skill starts with one small step.',
        '🔍 Make text bigger: Phone Settings → Display → Font Size. Computer: Ctrl/Cmd + +',
        '🎧 Use voice commands: “Hey Siri” or “Ok Google”. Try “Set a timer for 10 minutes.”',
        '📸 Take photos of important info: medication list, Wi‑Fi password, doctor instructions.',
        '🔋 Save battery: Low Power Mode when out. Close unused apps.',
        '🗝️ One notebook method: keep notes for steps, questions, and password hints.',
        '📞 Add an ICE contact (In Case of Emergency).',
        '🛒 Tech-free backup: keep important phone numbers on paper at home.',
        '🚌 Ask bus drivers for help: “Can you tell me when we get to [Street Name]?”',
        '📚 Libraries and CLSCs can help you find services and workshops.',
        '🌤️ Montreal weather changes quickly. Layers are your friend.',
        '💊 Pair medication with a daily habit (like morning tea).',
        '🧠 Learn one new word per day in French or English.',
        '👥 Stay connected: message one person each day, even just hello.',
        '⏳ The 15-minute rule: take a short break when frustrated and try again.',
        '🧹 Simplify: pick one way to do a task and stick to it.',
        '❤️ Remember your “why”: family, photos, independence.',
      ],

      quotes: [
        '“I learned to video call last year. Now I see my great-granddaughter in Vancouver every week. It was worth every bit of struggle.” – Mrs. Li, 78',
        '“My grandson showed me how to order groceries online. I have not carried heavy bags in the snow since. A game-changer!” – Mr. Chen, 81',
        '“I was afraid to touch the computer. Now I listen to my hometown radio station online every day. You can teach an old dog new tricks!” – Mr. Singh, 76',
      ],
    },

    fr: {
      brandSubtitle: 'Conseils pour la vie quotidienne',
      pageTitle: 'Astuces et conseils pour votre quotidien',
      pageSubtitle: 'Des idées pour vous sentir plus confiant(e) et à l’aise.',

      buttons: {
        listenAll: 'Écouter la page',
        printTips: 'Imprimer ces conseils',
        viewFav: 'Mes conseils favoris',
        newTip: 'Nouveau conseil',
        saveTip: 'Enregistrer comme favori',
        copyTip: 'Copier le conseil',
        quotePrev: 'Précédent',
        quoteNext: 'Suivant',
      },

      tipOfDay: '💡 Conseil du jour',

      sections: {
        mindset: {
          h2: '1. Votre état d’esprit : l’outil le plus important',
          h3: 'Soyez bienveillant(e) avec vous‑même',
          items: [
            '🕐 Prenez votre temps : la technologie n’est pas une course. Pause, respirez, réessayez.',
            '❓ Demandez de l’aide : « Pouvez‑vous me montrer une fois comment faire ? »',
            '😊 N’ayez pas peur des erreurs : on ne casse pas son téléphone en appuyant sur le mauvais bouton.',
            '🎯 Célébrez les petites victoires : un petit pas est déjà un progrès.',
          ],
        },
        practical: {
          h2: '2. Conseils pratiques',
          h3: 'De petites astuces qui changent tout',
          items: [
            '🔍 Agrandir le texte : Téléphone → Réglages → Affichage → Taille du texte. Ordinateur : Ctrl/Cmd + + pour zoomer.',
            '🎧 Commandes vocales : « Dis Siri » / « Ok Google » → « Appelle ma fille », « Mets un minuteur de 10 minutes ».',
            '📸 Photographiez l’important : liste de médicaments, consignes du médecin, mot de passe Wi‑Fi. Créez un album « Infos importantes ».',
            '🔋 Économisez la batterie : mode économie d’énergie ; fermez les apps inutilisées.',
          ],
        },
        organized: {
          h2: '3. Rester en sécurité et organisé(e)',
          h3: 'Un peu de préparation évite des soucis',
          items: [
            '🗝️ Un seul cahier : étapes, questions et indices de mot de passe au même endroit.',
            '📞 Contact « ICE » : ajoutez un proche sous « ICE » (In Case of Emergency).',
            '🛒 Sauvegarde sans technologie : numéros importants sur papier à la maison.',
          ],
        },
        montreal: {
          h2: '4. Se déplacer à Montréal & communauté',
          h3: 'La vie en ville',
          items: [
            '🚌 Demandez au chauffeur : « Pouvez‑vous me dire quand on arrive à [nom de rue] ? »',
            '🏥 Rendez‑vous médicaux : demandez s’il y a un interprète.',
            '📚 Ressources gratuites : bibliothèques et CLSC peuvent vous orienter.',
            '🌤️ Météo : vérifiez avant de sortir. Superposez les couches.',
          ],
        },
        wellness: {
          h2: '5. Santé et bien‑être',
          h3: 'Prendre soin de soi',
          items: [
            '💊 Médicaments : pilulier hebdomadaire ; associez la prise avec le thé du matin.',
            '🧘 Exercices simples : étirez‑vous chaque jour ; marchez sur place pendant la publicité.',
            '🧠 Cerveau actif : puzzles, cartes, ou un mot nouveau par jour.',
            '👥 Restez en lien : écrivez à une personne par jour, même juste « bonjour ».',
          ],
        },
        frustrated: {
          h2: '6. Quand vous êtes frustré(e)…',
          h3: 'C’est normal de faire une pause',
          items: [
            '⏳ Règle des 15 minutes : posez‑le, respirez, thé, puis revenez.',
            '🧹 Simplifier : trouvez une méthode qui marche pour vous et gardez‑la.',
            '❤️ Votre « pourquoi » : photos, appels à la famille, autonomie — gardez‑le en tête.',
          ],
        },
        quotesTitle: '7. Mots d’encouragement',
      },

      final: {
        title: 'Dernier conseil : vous n’êtes pas seul(e)',
        body:
          'Toute la ville apprend de nouvelles choses chaque jour. Vous avez une communauté dans cette application, votre famille et Montréal. Soyez fier(ère) de chaque nouveauté que vous essayez.',
        note: 'Vous avez un bon conseil ? Partagez‑le avec un ami aujourd’hui !',
      },

      nav: { back: 'Retour', home: 'Accueil' },

      listenIntro: 'Astuces pour la vie quotidienne. Des idées pour être plus à l’aise et confiant(e).',
      listenFinal: 'Dernier conseil : vous n’êtes pas seul(e). Soyez fier(ère) de chaque essai.',

      emptyFav: 'Aucun favori pour l’instant. Touchez « Enregistrer comme favori ».',
      copiedTip: 'Conseil copié (si possible) :',

      tips: [
        '🕐 Prenez votre temps. La technologie n’est pas une course.',
        '❓ Demander de l’aide est une force.',
        '😊 Les erreurs font apprendre. En général, on ne casse pas son téléphone en appuyant au mauvais endroit.',
        '🎯 Célébrez les petites victoires. Un pas après l’autre.',
        '🔍 Agrandissez le texte : Réglages → Affichage → Taille du texte. Sur ordinateur : Ctrl/Cmd + +',
        '🎧 Utilisez la voix : « Dis Siri » / « Ok Google ». Essayez « Mets un minuteur de 10 minutes ».',
        '📸 Photographiez l’important : médicaments, Wi‑Fi, consignes du médecin.',
        '🔋 Mode économie d’énergie à l’extérieur ; fermez les apps inutilisées.',
        '🗝️ Un cahier unique pour étapes, questions et indices.',
        '📞 Ajoutez un contact ICE (In Case of Emergency).',
        '🛒 Numéros importants aussi sur papier à la maison.',
        '🚌 Demandez au chauffeur du bus de vous prévenir pour l’arrêt.',
        '📚 Bibliothèques et CLSC : ressources et ateliers.',
        '🌤️ La météo change vite à Montréal. Superposez les couches.',
        '💊 Associez vos médicaments à une habitude quotidienne.',
        '🧠 Un mot nouveau par jour en français ou en anglais.',
        '👥 Envoyez un message par jour, même « bonjour ».',
        '⏳ Faites une pause quand c’est frustrant, puis réessayez.',
        '🧹 Simplifiez : gardez une méthode qui marche.',
        '❤️ Rappelez‑vous votre « pourquoi » : famille, photos, autonomie.',
      ],

      quotes: [
        '« J’ai appris l’appel vidéo l’an dernier. Maintenant je vois mon arrière‑petite‑fille à Vancouver chaque semaine. Ça valait l’effort. » – Mme Li, 78 ans',
        '« Mon petit‑fils m’a montré comment commander l’épicerie en ligne. Fini les sacs lourds dans la neige. Un vrai changement ! » – M. Chen, 81 ans',
        '« J’avais peur de toucher l’ordinateur. Maintenant j’écoute ma radio du pays en ligne tous les jours. On peut apprendre à tout âge ! » – M. Singh, 76 ans',
      ],
    },

    zh: {
      brandSubtitle: '生活贴士与妙招',
      pageTitle: '你的日常生活贴士与妙招',
      pageSubtitle: '让你更自信、更舒适的一些建议。',

      buttons: {
        listenAll: '朗读本页',
        printTips: '打印这些贴士',
        viewFav: '我的收藏',
        newTip: '换一个贴士',
        saveTip: '收藏此贴士',
        copyTip: '复制贴士',
        quotePrev: '上一条',
        quoteNext: '下一条',
      },

      tipOfDay: '💡 今日贴士',

      sections: {
        mindset: {
          h2: '1. 心态：最重要的工具',
          h3: '善待自己',
          items: [
            '🕐 慢慢来：学习科技不是比赛。停一停，深呼吸，再试一次。',
            '❓ 需要时就求助：“可以请你示范一次怎么做吗？”',
            '😊 不要害怕犯错：一般按错按钮不会把手机弄坏。',
            '🎯 庆祝小进步：一步也是进步。',
          ],
        },
        practical: {
          h2: '2. 实用科技小技巧',
          h3: '小窍门带来大不同',
          items: [
            '🔍 放大文字：手机 → 设置 → 显示 → 字体大小。电脑：Ctrl/Cmd + + 放大。',
            '🎧 使用语音指令：“嘿 Siri”/“Ok Google”→“给我女儿打电话”“设置10分钟计时器”。',
            '📸 拍下重要信息：药物清单、医生说明、Wi‑Fi 密码。建一个“重要信息”相册。',
            '🔋 省电：开启低电量模式；关闭不用的应用。',
          ],
        },
        organized: {
          h2: '3. 安全与条理',
          h3: '一点准备，避免麻烦',
          items: [
            '🗝️ 一本笔记法：把步骤、问题和密码提示写在同一本笔记本。',
            '📞 建立“ICE”联系人：把家人加为“ICE”（紧急联系人）。',
            '🛒 无技术备份：把重要电话号码写在家里的纸上。',
          ],
        },
        montreal: {
          h2: '4. 在蒙特利尔出行与社区',
          h3: '城市生活',
          items: [
            '🚌 向公交司机求助：“到[街道名]时请提醒我。”',
            '🏥 就医预约：询问是否提供口译。',
            '📚 免费社区资源：图书馆和 CLSC 可帮助你找到服务。',
            '🌤️ 天气提醒：出门前先看天气，分层穿衣更合适。',
          ],
        },
        wellness: {
          h2: '5. 健康与身心',
          h3: '照顾好自己',
          items: [
            '💊 药物管理：用每周分格药盒；把吃药和早茶绑定。',
            '🧘 简单运动：每天拉伸；广告时原地踏步。',
            '🧠 大脑训练：拼图、纸牌，或每天学一个新词。',
            '👥 保持联系：每天给一人发个消息，哪怕只是问好。',
          ],
        },
        frustrated: {
          h2: '6. 当你感到沮丧时…',
          h3: '允许自己休息一下',
          items: [
            '⏳ 15 分钟原则：先放下，深呼吸，喝口茶，再回来。',
            '🧹 简化：选择一个适合你的做法并坚持。',
            '❤️ 记住你的“为什么”：照片、与家人通话、独立——牢记心中。',
          ],
        },
        quotesTitle: '7. 鼓励的话',
      },

      final: {
        title: '最后的提醒：你并不孤单',
        body:
          '整座城市每天都有很多人在学习新东西。你在这个应用、在家庭、在蒙特利尔都有社区支持。为你的每一次尝试感到自豪。',
        note: '有好贴士吗？今天就分享给朋友！',
      },

      nav: { back: '返回', home: '首页' },

      listenIntro: '生活贴士与妙招。帮助你更自信、更舒适。',
      listenFinal: '最后：你并不孤单。为每一个新的尝试感到自豪。',

      emptyFav: '还没有收藏。点“收藏此贴士”。',
      copiedTip: '已复制（若允许）：',

      tips: [
        '🕐 慢慢来。学习科技不是比赛。',
        '❓ 需要时寻求帮助是力量。',
        '😊 错误帮助我们学习。一般按错按钮不会把手机弄坏。',
        '🎯 庆祝小成果。一步一步来。',
        '🔍 放大文字：设置→显示→字体大小。电脑：Ctrl/Cmd + +',
        '🎧 用“嘿 Siri”或“Ok Google”。试试“设置10分钟计时器”。',
        '📸 拍下重要信息：药物清单、Wi‑Fi 密码、就医说明。',
        '🔋 省电模式；关闭不用的应用。',
        '🗝️ 一本笔记记录步骤、问题、密码提示。',
        '📞 添加 ICE 紧急联系人。',
        '🛒 重要号码也写在家里的纸上。',
        '🚌 到站求助司机提醒。',
        '📚 图书馆和 CLSC 可提供资源与活动。',
        '🌤️ 蒙特利尔天气多变，注意分层穿衣。',
        '💊 吃药与日常习惯绑定。',
        '🧠 每天学一个新词（法语或英语）。',
        '👥 每天与一人打个招呼。',
        '⏳ 沮丧时休息一下再继续。',
        '🧹 简化流程，坚持一种方法。',
        '❤️ 记住你的初心：家人、照片、独立。',
      ],

      quotes: [
        '“我去年学会了视频通话。现在每周都能见到温哥华的曾孙女。每一点努力都值得。” — 李太太，78 岁',
        '“我孙子教我网上买菜。从此冬天再也不用拎沉重的袋子。改变很大！” — 陈先生，81 岁',
        '“我以前不敢碰电脑。现在每天都能在网上听家乡的电台。任何年龄都能学会新本领！” — 辛格先生，76 岁',
      ],
    },
  };

  let currentLang = localStorage.getItem('preferred-language') || 'en';
  let QUOTES = I18N.en.quotes.slice();

  function setLangButtons(lang) {
    qsa('.lang__btn').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  function renderList(ul, items) {
    ul.innerHTML = '';
    items.forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      ul.appendChild(li);
    });
  }

  function applyLang(lang) {
    const t = I18N[lang] || I18N.en;
    currentLang = lang;
    localStorage.setItem('preferred-language', lang);
    setLangButtons(lang);

    // Top labels
    els.brandSubtitle.textContent = t.brandSubtitle;
    els.pageTitle.textContent = t.pageTitle;
    els.pageSubtitle.textContent = t.pageSubtitle;

    // Buttons
    els.btnListenAll.textContent = t.buttons.listenAll;
    els.btnPrint.textContent = t.buttons.printTips;
    els.btnViewFav.textContent = t.buttons.viewFav;
    els.btnNew.textContent = t.buttons.newTip;
    els.btnSave.textContent = t.buttons.saveTip;
    els.btnCopy.textContent = t.buttons.copyTip;
    els.qPrev.textContent = t.buttons.quotePrev;
    els.qNext.textContent = t.buttons.quoteNext;

    // Tip section
    els.tipTitle.textContent = t.tipOfDay;

    // Sections
    els.h2_mindset.textContent = t.sections.mindset.h2;
    els.h3_mindset.textContent = t.sections.mindset.h3;
    renderList(els.list_mindset, t.sections.mindset.items);

    els.h2_practical.textContent = t.sections.practical.h2;
    els.h3_practical.textContent = t.sections.practical.h3;
    renderList(els.list_practical, t.sections.practical.items);

    els.h2_organized.textContent = t.sections.organized.h2;
    els.h3_organized.textContent = t.sections.organized.h3;
    renderList(els.list_organized, t.sections.organized.items);

    els.h2_montreal.textContent = t.sections.montreal.h2;
    els.h3_montreal.textContent = t.sections.montreal.h3;
    renderList(els.list_montreal, t.sections.montreal.items);

    els.h2_wellness.textContent = t.sections.wellness.h2;
    els.h3_wellness.textContent = t.sections.wellness.h3;
    renderList(els.list_wellness, t.sections.wellness.items);

    els.h2_frustrated.textContent = t.sections.frustrated.h2;
    els.h3_frustrated.textContent = t.sections.frustrated.h3;
    renderList(els.list_frustrated, t.sections.frustrated.items);

    els.h2_quotes.textContent = t.sections.quotesTitle;

    // Final block
    els.finalTitle.textContent = t.final.title;
    els.finalBody.textContent = t.final.body;
    els.finalNote.textContent = t.final.note;

    // Bottom nav
    els.navBack.textContent = t.nav.back;
    els.navHome.textContent = t.nav.home;

    // Quotes list for carousel
    QUOTES = t.quotes.slice();
    quoteIdx = 0;
    renderQuote();

    // Reset tip of day for this language (use saved tip if any)
    loadTip();
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.lang = currentLang.startsWith('fr') ? 'fr-CA' : currentLang.startsWith('zh') ? 'zh-CN' : 'en-US';
    speechSynthesis.speak(u);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function setTip(text) {
    els.tipBox.textContent = text;
    localStorage.setItem(STORAGE.lastTipPrefix + currentLang, text);
  }

  function loadTip() {
    const t = I18N[currentLang] || I18N.en;
    const key = STORAGE.lastTipPrefix + currentLang;
    const last = localStorage.getItem(key);
    if (last) setTip(last);
    else setTip(pick(t.tips));
  }

  function getFav() {
    return JSON.parse(localStorage.getItem(STORAGE.fav) || '[]');
  }

  function saveFav(text) {
    const fav = getFav();
    if (!fav.includes(text)) {
      fav.push(text);
      localStorage.setItem(STORAGE.fav, JSON.stringify(fav));
    }
  }

  function showFav() {
    const t = I18N[currentLang] || I18N.en;
    const fav = getFav();
    alert(fav.length ? fav.join('\n\n') : t.emptyFav);
  }

  let quoteIdx = 0;
  function renderQuote() {
    els.quote.textContent = QUOTES[quoteIdx] || '';
  }

  function listenPage() {
    const t = I18N[currentLang] || I18N.en;
    const sections = [
      els.h2_mindset.textContent + '. ' + els.h3_mindset.textContent + '. ' + qsa('#list_mindset li').map(li => li.textContent).join(' '),
      els.h2_practical.textContent + '. ' + els.h3_practical.textContent + '. ' + qsa('#list_practical li').map(li => li.textContent).join(' '),
      els.h2_organized.textContent + '. ' + els.h3_organized.textContent + '. ' + qsa('#list_organized li').map(li => li.textContent).join(' '),
      els.h2_montreal.textContent + '. ' + els.h3_montreal.textContent + '. ' + qsa('#list_montreal li').map(li => li.textContent).join(' '),
      els.h2_wellness.textContent + '. ' + els.h3_wellness.textContent + '. ' + qsa('#list_wellness li').map(li => li.textContent).join(' '),
      els.h2_frustrated.textContent + '. ' + els.h3_frustrated.textContent + '. ' + qsa('#list_frustrated li').map(li => li.textContent).join(' '),
    ];
    const all = [
      t.listenIntro,
      els.tipBox.textContent,
      ...sections,
      t.listenFinal,
    ].join(' ');
    speak(all);
  }

  function copyTip() {
    const t = I18N[currentLang] || I18N.en;
    const text = els.tipBox.textContent;
    navigator.clipboard?.writeText(text).catch(() => {});
    alert(t.copiedTip + '\n\n' + text);
  }

  function wire() {
    // Core buttons
    els.btnNew.addEventListener('click', () => {
      const t = I18N[currentLang] || I18N.en;
      setTip(pick(t.tips));
    });
    els.btnSave.addEventListener('click', () => {
      saveFav(els.tipBox.textContent);
      // reuse copiedTip prefix for brevity in alert; or keep silent
      // Keeping a simple confirmation without localization overhead
      // If needed, add a localized string later
      // eslint-disable-next-line no-alert
      alert('✓');
    });
    els.btnCopy.addEventListener('click', copyTip);

    els.btnListenAll.addEventListener('click', listenPage);
    els.btnPrint.addEventListener('click', () => window.print());
    els.btnViewFav.addEventListener('click', showFav);

    // Quote carousel
    els.qPrev.addEventListener('click', () => {
      quoteIdx = (quoteIdx - 1 + QUOTES.length) % QUOTES.length;
      renderQuote();
    });
    els.qNext.addEventListener('click', () => {
      quoteIdx = (quoteIdx + 1) % QUOTES.length;
      renderQuote();
    });

    // Language switching
    qsa('.lang__btn').forEach((b) => {
      b.addEventListener('click', () => applyLang(b.dataset.lang));
    });
  }

  // Init
  wire();
  applyLang(currentLang);
  // Re-apply when global language changes
  window.addEventListener('aide:langChanged', (e) => applyLang(e.detail?.lang || currentLang));
})();
