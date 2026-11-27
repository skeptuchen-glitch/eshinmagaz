/* =================== «ШПИЛЬ ЕШКИ»: РОГАЛИК НА 60 ЭТАЖЕЙ =================== */
(() => {
  const SAVE_KEY = 'eshka_spire_v1';
  const MAX_FLOOR = 60;
  const MAX_SKILLS = 7;
  const MAX_LVL = 5;
  const MAX_POTS = 4;

  /* ---------- данные ---------- */
  const ACTS = [
    { n: 'склад «ешки»', ic: 'warehouse' },
    { n: 'подпольный цех', ic: 'science' },
    { n: 'клиника «молекулы»', ic: 'local_hospital' },
    { n: 'маркетплейс', ic: 'shopping_cart' },
    { n: 'служба контроля', ic: 'policy' },
    { n: 'реактор синтеза', ic: 'bolt' }
  ];

  // intents: a=удар, h=тяжёлый, m=серия, d=щит, p=яд, w=слабость, b=ярость, s=лечение, x=вытяжка
  const ARCH = {
    bruiser: ['a', 'a', 'h'],
    poisoner: ['p', 'a', 'a', 'w'],
    swarm: ['m', 'a', 'm'],
    tank: ['d', 'a', 'd', 'h'],
    vamp: ['x', 'a', 'x'],
    buffer: ['b', 'a', 'a', 'h'],
    mender: ['a', 's', 'a', 'h']
  };

  // [имя, иконка, архетип, множитель хп, множитель атаки]
  const FOES = [
    {
      norm: [['курьер-новичок', 'directions_run', 'bruiser', 1, 1], ['складская крыса', 'pest_control_rodent', 'swarm', .8, .9], ['сторож', 'security', 'tank', 1.2, .9], ['коробочный голем', 'inventory_2', 'bruiser', 1.3, 1]],
      elite: [['бригадир погрузчика', 'forklift', 'buffer', 1.9, 1.15], ['охранник «сот»', 'local_police', 'tank', 2, 1.1]],
      boss: ['директор склада', 'badge', ['a', 'd', 'h', 'b', 'm', 'h']]
    },
    {
      norm: [['химик-самоучка', 'science', 'poisoner', 1, 1], ['колба-мутант', 'bug_report', 'swarm', .9, 1], ['варщик', 'local_fire_department', 'bruiser', 1.1, 1.05], ['паровая тварь', 'cloud', 'vamp', 1, 1]],
      elite: [['мастер реторты', 'biotech', 'poisoner', 2, 1.2], ['теневой отк', 'visibility_off', 'buffer', 1.9, 1.15]],
      boss: ['король «сот»', 'hub', ['p', 'a', 'w', 'h', 'x', 'm']]
    },
    {
      norm: [['санитар', 'medical_services', 'bruiser', 1.1, 1], ['дрон-уборщик', 'smart_toy', 'swarm', .9, 1], ['манекен-пациент', 'accessibility_new', 'tank', 1.3, .95], ['ординатор', 'stethoscope', 'mender', 1.1, 1]],
      elite: [['заведующий отделением', 'groups', 'mender', 2.1, 1.15], ['хирург-автомат', 'precision_manufacturing', 'swarm', 1.8, 1.3]],
      boss: ['главврач', 'health_and_safety', ['a', 's', 'h', 'p', 'a', 'x', 'b']]
    },
    {
      norm: [['бот-отзывщик', 'rate_review', 'poisoner', 1, 1.05], ['сборщик заказов', 'local_shipping', 'bruiser', 1.2, 1], ['скидочный гоблин', 'sell', 'vamp', 1.1, 1.05], ['рекламный баннер', 'campaign', 'buffer', 1.2, 1]],
      elite: [['алгоритм рекомендаций', 'psychology', 'buffer', 2.1, 1.2], ['модератор бана', 'block', 'tank', 2.2, 1.15]],
      boss: ['директор маркетплейса', 'storefront', ['b', 'a', 'm', 'd', 'h', 'w', 'x']]
    },
    {
      norm: [['инспектор', 'badge', 'bruiser', 1.2, 1.05], ['проверяющий', 'fact_check', 'poisoner', 1.1, 1.05], ['пломбировщик', 'lock', 'tank', 1.4, 1], ['юрист', 'gavel', 'mender', 1.2, 1.05]],
      elite: [['прокурор', 'balance', 'buffer', 2.2, 1.25], ['штрафной автомат', 'point_of_sale', 'swarm', 2, 1.3]],
      boss: ['генеральный инспектор', 'policy', ['h', 'd', 'a', 'p', 'b', 'm', 'h']]
    },
    {
      norm: [['капсул-кракен', 'set_meal', 'swarm', 1.2, 1.1], ['плазма-спрайт', 'flare', 'vamp', 1.1, 1.1], ['страж формул', 'shield', 'tank', 1.5, 1.05], ['дубль-игрок', 'content_copy', 'buffer', 1.3, 1.1]],
      elite: [['архитектор-прототип', 'architecture', 'buffer', 2.3, 1.3], ['чёрный провизор', 'skull', 'poisoner', 2.2, 1.3]],
      boss: ['архитектор «ешки»', 'deployed_code', ['a', 'b', 'h', 'p', 'm', 'd', 'x', 'h']]
    }
  ];

  // навыки: cost=энергия, cd=перезарядка, v(L)=значение
  const SK = {
    strike: { n: 'удар', ic: 'swords', cost: 1, cd: 0, desc: L => `урон ${7 + 3 * L}` },
    guard: { n: 'щит', ic: 'shield', cost: 1, cd: 0, desc: L => `защита ${6 + 3 * L}` },
    heavy: { n: 'тяжёлый удар', ic: 'gavel', cost: 2, cd: 0, desc: L => `урон ${16 + 6 * L}` },
    flurry: { n: 'серия', ic: 'bolt', cost: 1, cd: 0, desc: L => `3 удара по ${2 + L + 1}` },
    venom: { n: 'яд', ic: 'bubble_chart', cost: 1, cd: 0, desc: L => `яд +${4 + 2 * L}` },
    bash: { n: 'оглушение', ic: 'sports_mma', cost: 2, cd: 3, desc: L => `урон ${8 + 3 * L} и враг пропускает ход` },
    drain: { n: 'вытяжка', ic: 'bloodtype', cost: 2, cd: 0, desc: L => `урон ${10 + 3 * L}, лечит половину` },
    brace: { n: 'крепость', ic: 'castle', cost: 2, cd: 0, desc: L => `защита ${16 + 6 * L}` },
    adren: { n: 'адреналин', ic: 'vaccines', cost: 0, cd: 2, desc: L => `−${Math.max(1, 5 - L)} хп, +2 энергии` },
    weaken: { n: 'ослабление', ic: 'trending_down', cost: 1, cd: 0, desc: L => `слабость врагу ${2 + (L >= 3 ? 1 : 0)} хода, урон ${3 * L}` },
    counter: { n: 'контратака', ic: 'replay', cost: 1, cd: 0, desc: L => `защита 3, шипы ${5 + 2 * L} на ход` },
    finisher: { n: 'добивание', ic: 'flag', cost: 2, cd: 0, desc: L => `урон ${12 + 4 * L}, ×2 если у врага < 35% хп` },
    rage: { n: 'ярость', ic: 'whatshot', cost: 1, cd: 0, desc: L => `+${3 + L} к урону до конца боя` },
    cleanse: { n: 'очищение', ic: 'cleaning_services', cost: 1, cd: 0, desc: L => `снять яд и слабость, +${6 + 3 * L} хп` },
    pierce: { n: 'пробой', ic: 'adjust', cost: 1, cd: 0, desc: L => `урон ${6 + 2 * L} сквозь защиту` },
    barrage: { n: 'шквал', ic: 'rocket_launch', cost: 3, cd: 0, desc: L => `5 ударов по ${3 + L}` },
    bulwark: { n: 'ответный щит', ic: 'security', cost: 1, cd: 0, desc: L => `защита ${4 + 2 * L} + бонус урона` },
    overload: { n: 'перегрузка', ic: 'electric_bolt', cost: 2, cd: 0, desc: L => `яд врага ×2 (до ${10 + 6 * L}) и урон ${4 * L}` },
    regen: { n: 'регенерация', ic: 'healing', cost: 2, cd: 3, desc: L => `лечение ${12 + 5 * L}` },
    execute: { n: 'казнь', ic: 'skull', cost: 3, cd: 2, desc: L => `урон ${30 + 10 * L}` },
    sting: { n: 'жало', ic: 'colorize', cost: 0, cd: 1, desc: L => `урон ${3 + L}` }
  };
  const SK_POOL = Object.keys(SK);

  const RELICS = {
    amulet: { n: 'амулет жизни', ic: 'favorite', d: '+20 макс. хп', price: 90 },
    whet: { n: 'точило', ic: 'hardware', d: '+2 к урону навыков', price: 110 },
    battery: { n: 'батарея', ic: 'battery_charging_full', d: '+1 энергия каждый ход', price: 190, rare: 1 },
    thorn: { n: 'бронепластина', ic: 'shield', d: '6 защиты в начале боя', price: 70 },
    vampire: { n: 'клык', ic: 'bloodtype', d: '+5 хп после каждого боя', price: 100 },
    purse: { n: 'тугой кошелёк', ic: 'savings', d: '+25% золота', price: 80 },
    potbelt: { n: 'пояс зелий', ic: 'science', d: '+1 слот зелий и 1 лечебное зелье', price: 85 },
    lucky: { n: 'счастливая монета', ic: 'paid', d: '+15% шанс крита (×1.5)', price: 100 },
    toxic: { n: 'ядовитый флакон', ic: 'bubble_chart', d: '+2 ко всему яду', price: 95 },
    iron: { n: 'железная воля', ic: 'fitness_center', d: 'половина защиты переносится', price: 130 },
    last: { n: 'второй шанс', ic: 'restart_alt', d: 'один раз спасает от смерти (30% хп)', price: 170, rare: 1 },
    blood: { n: 'кровавый обряд', ic: 'water_drop', d: '+4 урона при хп ниже 50%', price: 90 },
    scholar: { n: 'свиток знаний', ic: 'menu_book', d: '4 варианта награды вместо 3', price: 120 },
    merchant: { n: 'печать купца', ic: 'sell', d: 'скидка 25% в лавках', price: 100 },
    cannon: { n: 'первый залп', ic: 'bolt', d: '+10 к первому удару в бою', price: 90 },
    calm: { n: 'ромашковый чай', ic: 'emoji_food_beverage', d: '+2 хп в начале хода', price: 100 },
    greed: { n: 'жадность', ic: 'currency_exchange', d: '+6 золота за каждого врага', price: 80 },
    fort: { n: 'бастион', ic: 'castle', d: '+3 защиты в начале хода', price: 100 },
    mirror: { n: 'зеркальце', ic: 'flip', d: 'враги получают 3 урона за каждый свой удар', price: 130 },
    crown: { n: 'корона башни', ic: 'workspace_premium', d: '+1 к урону за каждые 10 этажей', price: 220, rare: 1 }
  };
  const RELIC_IDS = Object.keys(RELICS);

  const POTS = {
    heal: { n: 'зелье лечения', ic: 'healing', d: 'лечит 35% макс. хп' },
    energy: { n: 'зелье бодрости', ic: 'bolt', d: '+2 энергии сейчас' },
    bomb: { n: 'бомба-капсула', ic: 'explosion', d: 'урон по врагу' }
  };

  const CLASSES = {
    pro: { n: 'провизор', ic: 'science', d: 'яды и хитрые приёмы. старт: удар, щит, яд', skills: ['strike', 'guard', 'venom'], hp: 0, gold: 0, cost: 0 },
    cur: { n: 'курьер', ic: 'directions_run', d: 'быстрые серии ударов, больше золота. старт: удар, серия, щит', skills: ['strike', 'flurry', 'guard'], hp: -6, gold: 40, pots: 1, cost: 120 },
    ins: { n: 'инспектор', ic: 'policy', d: 'крепкая защита и оглушение. старт: удар, крепость, оглушение', skills: ['strike', 'brace', 'bash'], hp: 24, gold: 0, cost: 220 }
  };

  const META = [
    { id: 'hp', n: 'закалка', ic: 'favorite', d: '+8 макс. хп в начале похода', max: 10, base: 20, step: 18 },
    { id: 'atk', n: 'острый ум', ic: 'swords', d: '+1 к урону навыков', max: 10, base: 30, step: 28 },
    { id: 'gold', n: 'стартовый капитал', ic: 'savings', d: '+20 золота в начале', max: 8, base: 15, step: 14 },
    { id: 'pot', n: 'аптечка', ic: 'healing', d: '+1 лечебное зелье в начале', max: 3, base: 40, step: 60 },
    { id: 'crit', n: 'меткость', ic: 'adjust', d: '+3% шанс крита', max: 10, base: 25, step: 22 },
    { id: 'heal', n: 'привал', ic: 'local_hotel', d: '+5% лечения на отдыхе', max: 6, base: 25, step: 25 },
    { id: 'ess', n: 'коллекционер', ic: 'diamond', d: '+10% эссенции за поход', max: 10, base: 40, step: 40 },
    { id: 'energy', n: 'второе дыхание', ic: 'bolt', d: '+1 энергия каждый ход', max: 1, base: 600, step: 0 }
  ];

  const ASC_TXT = ['обычный режим', 'вознесение 1: враги +10%', 'вознесение 2: враги +20%', 'вознесение 3: враги +30%', 'вознесение 4: враги +40%', 'вознесение 5: враги +50%'];

  const ACHS = [
    { id: 'f10', n: 'первый босс', d: 'дойти до 10 этажа', ess: 20, ok: s => s.best >= 10 },
    { id: 'f20', n: 'подпольщик', d: 'дойти до 20 этажа', ess: 30, ok: s => s.best >= 20 },
    { id: 'f30', n: 'за полпути', d: 'дойти до 30 этажа', ess: 50, ok: s => s.best >= 30 },
    { id: 'f45', n: 'почти у вершины', d: 'дойти до 45 этажа', ess: 80, ok: s => s.best >= 45 },
    { id: 'win', n: 'покоритель шпиля', d: 'победить на 60 этаже', ess: 150, ok: s => s.wins >= 1 },
    { id: 'k100', n: 'сотня', d: 'победить 100 врагов', ess: 30, ok: s => s.kills >= 100 },
    { id: 'k500', n: 'истребитель', d: 'победить 500 врагов', ess: 80, ok: s => s.kills >= 500 },
    { id: 'rel5', n: 'коллекционер реликвий', d: '5 реликвий за один поход', ess: 40, ok: s => s.maxRel >= 5 },
    { id: 'allcls', n: 'мастер ролей', d: 'победить всеми тремя классами', ess: 200, ok: s => Object.keys(s.winCls || {}).length >= 3 },
    { id: 'asc3', n: 'на пределе', d: 'победить на вознесении 3+', ess: 200, ok: s => s.ascWin >= 3 },
    { id: 'runs10', n: 'упорный', d: '10 походов', ess: 40, ok: s => s.runs >= 10 }
  ];

  /* ---------- события ---------- */
  const EVENTS = [
    {
      t: 'забытый ящик', ic: 'inventory_2', x: 'в углу стоит опечатанный ящик «ешки». замок ржавый.',
      o: [
        { t: 'взломать', rnd: [{ p: .55, fx: { gold: 60 }, m: 'внутри пачка денег! +60 золота' }, { p: .45, fx: { hp: -12 }, m: 'ловушка! −12 хп' }] },
        { t: 'пройти мимо', fx: {}, m: 'ты решаешь не рисковать' }
      ]
    },
    {
      t: 'странствующий провизор', ic: 'person', x: 'старик в белом халате предлагает обмен.',
      o: [
        { t: 'купить настойку (30 зол.)', req: { gold: 30 }, fx: { gold: -30, pot: 'heal' }, m: 'получено зелье лечения' },
        { t: 'отдать 10 макс. хп за реликвию', req: { maxHp: 40 }, fx: { maxHp: -10, relic: 1 }, m: 'старик передаёт реликвию' },
        { t: 'отказаться', fx: {}, m: 'провизор пожимает плечами' }
      ]
    },
    {
      t: 'алтарь формулы', ic: 'auto_awesome', x: 'на стене светится формула. она требует жертвы.',
      o: [
        { t: 'пожертвовать 15% хп: улучшить навык', fx: { hpPct: -15, upg: 1 }, m: 'навык стал сильнее' },
        { t: 'помолиться', rnd: [{ p: .5, fx: { maxHp: 8, hp: 8 }, m: 'формула благосклонна: +8 макс. хп' }, { p: .5, fx: {}, m: 'ничего не происходит' }] }
      ]
    },
    {
      t: 'сломанный автомат', ic: 'point_of_sale', x: 'автомат с капсулами мигает и жуёт монеты.',
      o: [
        { t: 'вставить 20 золота', req: { gold: 20 }, rnd: [{ p: .25, fx: { gold: -20, relic: 1 }, m: 'джекпот: реликвия!' }, { p: .45, fx: { gold: 40 }, m: 'выпала горсть монет (+40 − 20)' }, { p: .3, fx: { gold: -20 }, m: 'автомат сожрал монету' }] },
        { t: 'ударить по корпусу', fx: { hp: -6, gold: 30 }, m: '−6 хп, но вывалилось 30 золота' }
      ]
    },
    {
      t: 'подпольный бой', ic: 'sports_mma', x: 'зрители шумят. тебя зовут на арену.',
      o: [
        { t: 'принять вызов (элитный бой)', fx: { fight: 'elite' }, m: '' },
        { t: 'уйти', fx: {}, m: 'ты проскальзываешь мимо толпы' }
      ]
    },
    {
      t: 'зеркало дубликатов', ic: 'flip', x: 'в зеркале видна улучшенная версия тебя.',
      o: [
        { t: 'взять силу отражения', fx: { upg: 1 }, m: 'один навык улучшен' },
        { t: 'разбить зеркало (+25 зол.)', fx: { gold: 25 }, m: 'осколки превращаются в монеты' }
      ]
    },
    {
      t: 'тихая аптека', ic: 'local_pharmacy', x: 'полки почти пусты, но кое-что осталось.',
      o: [
        { t: 'отдохнуть (+25% хп)', fx: { hpPct: 25 }, m: 'стало лучше' },
        { t: 'купить 2 зелья (45 зол.)', req: { gold: 45 }, fx: { gold: -45, pot: 'heal', pot2: 'energy' }, m: 'взял лечение и бодрость' }
      ]
    },
    {
      t: 'ловушка контроля', ic: 'policy', x: 'инспектор перегораживает коридор: «штраф или проверка».',
      o: [
        { t: 'заплатить 25 золота', req: { gold: 25 }, fx: { gold: -25 }, m: 'штраф оплачен' },
        { t: 'принять бой', fx: { fight: 'normal' }, m: '' }
      ]
    },
    {
      t: 'пакет с логотипом', ic: 'shopping_bag', x: 'кто-то оставил пакет с логотипом «ешки».',
      o: [
        { t: 'забрать', fx: { gold: 20, pot: 'bomb' }, m: 'внутри бомба-капсула и 20 золота' }
      ]
    },
    {
      t: 'чёрный рынок', ic: 'storefront', x: 'шёпот из тени: «хочешь товар, которого нет на полках?»',
      o: [
        { t: 'зайти в лавку', fx: { shop: 1 }, m: '' },
        { t: 'не связываться', fx: {}, m: 'ты уходишь' }
      ]
    },
    {
      t: 'обрушение', ic: 'warning', x: 'потолок трещит. нужно решать быстро.',
      o: [
        { t: 'пробежать (50% −14 хп)', rnd: [{ p: .5, fx: { gold: 25 }, m: 'ты проскочил и нашёл 25 золота' }, { p: .5, fx: { hp: -14 }, m: 'обломок задел: −14 хп' }] },
        { t: 'переждать', fx: { hp: -4 }, m: 'пыль в лёгких: −4 хп' }
      ]
    },
    {
      t: 'тайный склад реликвий', ic: 'diamond', x: 'за фальшстеной — сейф. нужен код.',
      o: [
        { t: 'подобрать код (интеллект)', rnd: [{ p: .4, fx: { relic: 1 }, m: 'сейф открыт: реликвия!' }, { p: .6, fx: { hp: -10 }, m: 'сработала сигнализация: −10 хп' }] },
        { t: 'забрать только золото (+35)', fx: { gold: 35 }, m: 'ты берёшь деньги из кассы' }
      ]
    }
  ];

  /* ---------- состояние ---------- */
  const defSave = () => ({
    ess: 0, best: 0, runs: 0, wins: 0, kills: 0, maxRel: 0, ascWin: 0, ascUnlocked: 0,
    meta: {}, classes: { pro: true }, cls: 'pro', asc: 0, tab: 'run',
    winCls: {}, ach: {}, relicsSeen: {}, lastDaily: '', run: null, lastResult: null
  });
  let S = load();
  let msgs = []; // короткие сообщения
  let upgMode = null; // { back: 'rest' | 'event' | 'reward' }

  function load() {
    const d = defSave();
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        return { ...d, ...p, meta: p.meta || {}, classes: { pro: true, ...(p.classes || {}) }, winCls: p.winCls || {}, ach: p.ach || {}, relicsSeen: p.relicsSeen || {} };
      }
    } catch (e) {}
    return d;
  }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }

  const B = () => window.ESHKA_BRIDGE || {
    getCoins: () => 0, addCoins: () => 0, spendCoins: () => false, snack: () => {}, hap: () => {}, esc: s => String(s ?? ''), refreshHub: () => {}
  };
  const esc = s => B().esc(s);
  const rnd = n => Math.floor(Math.random() * n);
  const pick = arr => arr[rnd(arr.length)];
  const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = rnd(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const ml = id => S.meta[id] || 0;
  const R = id => (S.run && S.run.relics.includes(id)) ? 1 : 0;
  const actOf = fl => Math.min(6, Math.ceil(fl / 10));

  /* ---------- забег ---------- */
  function maxPots(run) { return MAX_POTS + (run.relics.includes('potbelt') ? 1 : 0); }

  function startRun() {
    const c = CLASSES[S.cls];
    const maxHp = 80 + c.hp + ml('hp') * 8;
    const run = {
      cls: S.cls, asc: Math.min(S.asc, S.ascUnlocked), floor: 1, hp: maxHp, maxHp,
      gold: 25 + c.gold + ml('gold') * 20, skills: c.skills.map(id => ({ id, lv: 1 })),
      relics: [], pots: { heal: (c.pots || 0) + ml('pot'), energy: 0, bomb: 0 },
      phase: 'map', opts: [], fight: null, reward: null, shop: null, ev: null, note: '',
      kills: 0, bosses: 0, lastUsed: false, potsUsed: 0, peakGold: 0
    };
    S.run = run;
    run.opts = genRooms(run);
    S.runs++;
    persist();
  }

  function genRooms(run) {
    const f = run.floor;
    if (f % 10 === 0) return [{ type: 'boss' }];
    if (f % 10 === 9) {
      const o = [{ type: 'rest' }, { type: 'fight' }];
      if (f > 15) o.push({ type: 'shop' });
      return o;
    }
    const n = f < 3 ? 2 : 3;
    const out = [];
    const used = {};
    let tries = 0;
    while (out.length < n && tries++ < 30) {
      const r = Math.random();
      let t;
      if (r < .5) t = 'fight';
      else if (r < .64 && f >= 4) t = 'elite';
      else if (r < .75) t = 'event';
      else if (r < .85) t = 'rest';
      else if (r < .94) t = 'shop';
      else t = 'treasure';
      if (t !== 'fight' && used[t]) continue;
      if (t === 'shop' && f < 3) continue;
      used[t] = true;
      out.push({ type: t });
    }
    if (!out.length) out.push({ type: 'fight' });
    if (!out.some(o => o.type === 'fight' || o.type === 'elite') && f < 9) out[0] = { type: 'fight' };
    return out;
  }

  /* ---------- враги ---------- */
  function mkEnemy(run, kind) {
    const f = run.floor, a = actOf(f), F = FOES[a - 1];
    let name, ic, pat, hpM = 1, atM = 1;
    if (kind === 'boss') {
      name = F.boss[0]; ic = F.boss[1]; pat = F.boss[2].slice(); hpM = (a === 1 ? 2.4 : 3.3 + (a - 1) * .15); atM = (a === 1 ? 1 : 1.1);
    } else {
      const d = kind === 'elite' ? pick(F.elite) : pick(F.norm);
      name = d[0]; ic = d[1]; pat = ARCH[d[2]].slice(); hpM = d[3]; atM = d[4];
    }
    const ascM = 1 + run.asc * .1;
    const hp = Math.round((14 + f * 5.2) * hpM * ascM);
    return { name, ic, kind, pat, i: 0, hp, maxHp: hp, atk: (3.6 + f * .72) * atM * ascM, block: 0, psn: 0, weak: 0, stun: 0, rage: 0, ph2: false };
  }

  function intentOf(e) { return e.pat[e.i % e.pat.length]; }
  function intentVal(e) {
    let a = e.atk * (1 + e.rage * .15) * (e.weak > 0 ? .65 : 1);
    if (e.ph2) a *= 1.25;
    return Math.max(1, Math.round(a));
  }

  function startFight(kind) {
    const run = S.run;
    const e = mkEnemy(run, kind);
    const f = {
      e, turn: 1, en: baseEnergy(), block: 0, thorns: 0, pw: 0, ppsn: 0, bonus: 0, first: true, cds: {}, log: [], crit: false
    };
    if (R('thorn')) f.block += 6;
    run.fight = f;
    run.phase = 'fight';
    f.log.push(`${e.name} преграждает путь`);
    beginTurn(f, true);
  }

  function baseEnergy() { return 3 + ml('energy') + R('battery'); }

  function beginTurn(f, first) {
    const run = S.run;
    if (!first) {
      f.en = baseEnergy();
      const keep = R('iron') ? Math.floor(f.block / 2) : 0;
      f.block = keep;
      f.thorns = 0;
      for (const k of Object.keys(f.cds)) if (f.cds[k] > 0) f.cds[k]--;
      if (f.ppsn > 0) { run.hp -= f.ppsn; f.log.push(`яд: −${f.ppsn} хп`); f.ppsn = Math.max(0, f.ppsn - 1); }
      if (f.pw > 0) f.pw--;
    } else f.en = baseEnergy();
    if (R('calm')) run.hp = Math.min(run.maxHp, run.hp + 2);
    if (R('fort')) f.block += 3;
    if (run.hp <= 0) checkDeath();
  }

  function dmgToEnemy(f, base, o = {}) {
    const run = S.run, e = f.e;
    let d = base + f.bonus + ml('atk') + R('whet') * 2 + R('crown') * Math.floor(run.floor / 10);
    if (R('blood') && run.hp < run.maxHp * .5) d += 4;
    if (f.first && R('cannon') && !o.noFirst) { d += 10; f.first = false; }
    if (f.pw > 0) d = Math.round(d * .75);
    if (Math.random() < .03 * ml('crit') + R('lucky') * .15) { d = Math.round(d * 1.5); f.crit = true; }
    d = Math.max(1, d);
    return hitEnemy(f, d, o.pierce);
  }
  function hitEnemy(f, d, pierce) {
    const e = f.e;
    if (!pierce && e.block > 0) { const ab = Math.min(e.block, d); e.block -= ab; d -= ab; }
    e.hp -= d;
    return d;
  }
  function healPlayer(n) { const run = S.run; run.hp = Math.min(run.maxHp, run.hp + Math.round(n)); }

  function useSkill(idx) {
    const run = S.run, f = run.fight;
    if (!f || run.phase !== 'fight') return;
    const sk = run.skills[idx]; if (!sk) return;
    const def = SK[sk.id], L = sk.lv;
    if ((f.cds[sk.id] || 0) > 0 || f.en < def.cost) return;
    const e = f.e;
    f.en -= def.cost; f.crit = false;
    let txt = '';
    const T = R('toxic') * 2;
    switch (sk.id) {
      case 'strike': txt = `удар: −${dmgToEnemy(f, 7 + 3 * L)}`; break;
      case 'guard': f.block += 6 + 3 * L; txt = `защита +${6 + 3 * L}`; break;
      case 'heavy': txt = `тяжёлый удар: −${dmgToEnemy(f, 16 + 6 * L)}`; break;
      case 'flurry': { let s = 0; for (let i = 0; i < 3; i++) s += dmgToEnemy(f, 3 + L, { noFirst: i > 0 }); txt = `серия: −${s}`; break; }
      case 'venom': e.psn += 4 + 2 * L + T; txt = `яд врагу +${4 + 2 * L + T}`; break;
      case 'bash': txt = `оглушение: −${dmgToEnemy(f, 8 + 3 * L)}`; e.stun = 1; break;
      case 'drain': { const d = dmgToEnemy(f, 10 + 3 * L); healPlayer(d / 2); txt = `вытяжка: −${d}, +${Math.round(d / 2)} хп`; break; }
      case 'brace': f.block += 16 + 6 * L; txt = `крепость +${16 + 6 * L}`; break;
      case 'adren': run.hp -= Math.max(1, 5 - L); f.en += 2; txt = `адреналин: +2 энергии`; break;
      case 'weaken': { const d = dmgToEnemy(f, 3 * L); e.weak = Math.max(e.weak, 2 + (L >= 3 ? 1 : 0)); txt = `враг ослаблен, −${d}`; break; }
      case 'counter': f.block += 3; f.thorns = Math.max(f.thorns, 5 + 2 * L); txt = `шипы ${5 + 2 * L} на ход`; break;
      case 'finisher': { let b = 12 + 4 * L; if (e.hp < e.maxHp * .35) b *= 2; txt = `добивание: −${dmgToEnemy(f, b)}`; break; }
      case 'rage': f.bonus += 3 + L; txt = `ярость: +${3 + L} урона`; break;
      case 'cleanse': f.ppsn = 0; f.pw = 0; healPlayer(6 + 3 * L); txt = `очищение, +${6 + 3 * L} хп`; break;
      case 'pierce': txt = `пробой: −${dmgToEnemy(f, 6 + 2 * L, { pierce: true })}`; break;
      case 'barrage': { let s = 0; for (let i = 0; i < 5; i++) s += dmgToEnemy(f, 3 + L, { noFirst: i > 0 }); txt = `шквал: −${s}`; break; }
      case 'bulwark': f.block += 4 + 2 * L + f.bonus; txt = `ответный щит +${4 + 2 * L + f.bonus}`; break;
      case 'overload': { e.psn = Math.min(10 + 6 * L, e.psn * 2); const d = dmgToEnemy(f, 4 * L); txt = `перегрузка: яд ${e.psn}, −${d}`; break; }
      case 'regen': healPlayer(12 + 5 * L); txt = `регенерация +${12 + 5 * L}`; break;
      case 'execute': txt = `казнь: −${dmgToEnemy(f, 30 + 10 * L)}`; break;
      case 'sting': txt = `жало: −${dmgToEnemy(f, 3 + L)}`; break;
    }
    if (def.cd) f.cds[sk.id] = def.cd + 1;
    f.log.push(txt + (f.crit ? ' (крит!)' : ''));
    if (f.log.length > 5) f.log.shift();
    afterPlayerAction();
  }

  function usePot(id) {
    const run = S.run, f = run.fight;
    if (!f || run.phase !== 'fight' || !(run.pots[id] > 0)) return;
    run.pots[id]--; run.potsUsed++;
    if (id === 'heal') { healPlayer(run.maxHp * .35); f.log.push('зелье: +35% хп'); }
    else if (id === 'energy') { f.en += 2; f.log.push('зелье бодрости: +2 энергии'); }
    else if (id === 'bomb') { const d = hitEnemy(f, 25 + run.floor * 2, true); f.log.push(`бомба: −${d}`); }
    if (f.log.length > 5) f.log.shift();
    afterPlayerAction();
  }

  function afterPlayerAction() {
    const f = S.run.fight;
    if (f.e.hp <= 0) return winFight();
    persist();
  }

  function endTurn() {
    const run = S.run, f = run.fight;
    if (!f || run.phase !== 'fight') return;
    const e = f.e;
    // яд на враге
    if (e.psn > 0) { e.hp -= e.psn; f.log.push(`яд: враг −${e.psn}`); e.psn = Math.max(0, e.psn - 1); if (e.hp <= 0) return winFight(); }
    e.block = 0;
    if (e.stun > 0) { e.stun--; f.log.push(`${e.name} оглушён и пропускает ход`); e.i++; }
    else enemyAct(f);
    if (f.log.length > 5) f.log = f.log.slice(-5);
    if (e.weak > 0) e.weak--;
    if (run.hp <= 0 && checkDeath()) return;
    if (e.hp <= 0) return winFight();
    // фаза 2 босса
    if (e.kind === 'boss' && !e.ph2 && e.hp < e.maxHp * .5) { e.ph2 = true; f.log.push(`${e.name} в ярости! урон +25%`); }
    f.turn++;
    if (f.turn >= 12) { e.rage++; if (f.turn === 12) f.log.push(`${e.name} теряет терпение: урон растёт`); }
    beginTurn(f, false);
    persist();
  }

  function takeHit(f, raw, hits = 1) {
    const run = S.run, e = f.e;
    for (let i = 0; i < hits; i++) {
      let d = raw;
      if (f.block > 0) { const ab = Math.min(f.block, d); f.block -= ab; d -= ab; }
      run.hp -= d;
      if (f.thorns > 0) { e.hp -= f.thorns; }
      if (R('mirror')) e.hp -= 3;
    }
  }

  function enemyAct(f) {
    const run = S.run, e = f.e, it = intentOf(e), v = intentVal(e);
    switch (it) {
      case 'a': takeHit(f, v); f.log.push(`${e.name} бьёт на ${v}`); break;
      case 'h': { const d = Math.round(v * 1.8); takeHit(f, d); f.log.push(`${e.name}: мощный удар ${d}`); break; }
      case 'm': { const d = Math.max(1, Math.round(v * .5)); takeHit(f, d, 3); f.log.push(`${e.name}: серия 3×${d}`); break; }
      case 'd': e.block += Math.round(v * 1.6) + 4; f.log.push(`${e.name} ставит защиту`); break;
      case 'p': f.ppsn += 2 + Math.floor(run.floor / 12); takeHit(f, Math.round(v * .5)); f.log.push(`${e.name} травит тебя`); break;
      case 'w': f.pw = 2; takeHit(f, Math.round(v * .6)); f.log.push(`${e.name} ослабляет тебя`); break;
      case 'b': e.rage++; takeHit(f, Math.round(v * .5)); f.log.push(`${e.name} звереет`); break;
      case 's': { const h = Math.round(e.maxHp * .12); e.hp = Math.min(e.maxHp, e.hp + h); takeHit(f, Math.round(v * .5)); f.log.push(`${e.name} лечится на ${h}`); break; }
      case 'x': { const before = run.hp; takeHit(f, Math.round(v * .9)); const dealt = Math.max(0, before - run.hp); e.hp = Math.min(e.maxHp, e.hp + Math.round(dealt / 2)); f.log.push(`${e.name} высасывает ${dealt}`); break; }
    }
    e.i++;
  }

  function checkDeath() {
    const run = S.run;
    if (run.hp > 0) return false;
    if (R('last') && !run.lastUsed) {
      run.lastUsed = true; run.hp = Math.round(run.maxHp * .3);
      if (run.fight) run.fight.log.push('«второй шанс» спасает тебя!');
      return false;
    }
    finishRun(false);
    return true;
  }

  function goldGain(run, base) {
    return Math.round(base * (1 + R('purse') * .25)) + R('greed') * 6;
  }

  function winFight() {
    const run = S.run, f = run.fight, e = f.e;
    run.kills++; S.kills++;
    const kind = e.kind;
    if (kind === 'boss') run.bosses++;
    const g = goldGain(run, (8 + run.floor * 1.3) * (kind === 'elite' ? 2 : kind === 'boss' ? 4 : 1) + rnd(8));
    run.gold += g;
    if (R('vampire')) healPlayer(5);
    if (kind === 'boss' && run.floor >= MAX_FLOOR) { run.fight = null; return finishRun(true); }
    run.reward = { gold: g, kind, opts: genRewards(run, kind), msg: '' };
    run.fight = null;
    run.phase = 'reward';
    persist();
  }

  function genRewards(run, kind) {
    const pool = [];
    const have = run.skills.map(s => s.id);
    const newSk = shuffle(SK_POOL.filter(id => !have.includes(id)));
    const n = R('scholar') ? 4 : 3;
    if (run.skills.length < MAX_SKILLS) for (const id of newSk.slice(0, 2)) pool.push({ t: 'skill', id });
    const upgr = run.skills.filter(s => s.lv < MAX_LVL);
    if (upgr.length) pool.push({ t: 'upg', id: pick(upgr).id });
    pool.push({ t: 'maxhp', v: 6 + Math.floor(run.floor / 15) });
    pool.push({ t: 'heal', v: 30 });
    const relicChance = kind === 'boss' ? 1 : kind === 'elite' ? .6 : .1;
    const rel = RELIC_IDS.filter(id => !run.relics.includes(id));
    if (rel.length && Math.random() < relicChance) pool.push({ t: 'relic', id: pick(rel) });
    if (kind !== 'normal') pool.push({ t: 'pot', id: pick(['heal', 'energy', 'bomb']) });
    const base = shuffle(pool);
    // реликвия всегда в списке, если выпала
    const out = [];
    const rl = base.find(x => x.t === 'relic'); if (rl) out.push(rl);
    for (const x of base) { if (out.length >= n) break; if (x !== rl) out.push(x); }
    return out;
  }

  function addRelic(id) {
    const run = S.run;
    if (!id || run.relics.includes(id)) return false;
    run.relics.push(id);
    S.relicsSeen[id] = true;
    if (id === 'amulet') { run.maxHp += 20; run.hp += 20; }
    if (id === 'potbelt') run.pots.heal++;
    S.maxRel = Math.max(S.maxRel, run.relics.length);
    return true;
  }

  function addPot(id) {
    const run = S.run;
    const tot = run.pots.heal + run.pots.energy + run.pots.bomb;
    if (tot >= maxPots(run)) return false;
    run.pots[id]++;
    return true;
  }

  function claimReward(i) {
    const run = S.run, rw = run.reward; if (!rw) return;
    const o = rw.opts[i]; if (!o) return;
    if (o.t === 'skill') { if (run.skills.length >= MAX_SKILLS) return; run.skills.push({ id: o.id, lv: 1 }); }
    else if (o.t === 'upg') { const s = run.skills.find(x => x.id === o.id); if (s && s.lv < MAX_LVL) s.lv++; }
    else if (o.t === 'maxhp') { run.maxHp += o.v; run.hp += o.v; }
    else if (o.t === 'heal') healPlayer(run.maxHp * o.v / 100);
    else if (o.t === 'relic') addRelic(o.id);
    else if (o.t === 'pot') { if (!addPot(o.id)) { run.gold += 20; B().snack('слоты зелий заняты: +20 золота'); } }
    run.reward = null;
    nextFloor();
  }
  function skipReward() {
    const run = S.run; if (!run.reward) return;
    run.gold += 15; run.reward = null; nextFloor();
  }

  function nextFloor() {
    const run = S.run;
    run.floor++;
    run.peakGold = Math.max(run.peakGold, run.gold);
    if (run.floor > MAX_FLOOR) return finishRun(true);
    if (run.floor === 1 + actOf(run.floor) * 10 - 10 && run.floor > 1) {
      // новый акт: лёгкое лечение
      healPlayer(run.maxHp * .15);
      run.note = `акт ${actOf(run.floor)}: ${ACTS[actOf(run.floor) - 1].n} (+15% хп)`;
    } else run.note = '';
    run.phase = 'map';
    run.opts = genRooms(run);
    run.ev = null; run.shop = null; run.reward = null;
    persist();
  }

  /* ---------- комнаты ---------- */
  function enterRoom(i) {
    const run = S.run; if (run.phase !== 'map') return;
    const o = run.opts[i]; if (!o) return;
    switch (o.type) {
      case 'fight': startFight('normal'); break;
      case 'elite': startFight('elite'); break;
      case 'boss': startFight('boss'); break;
      case 'rest': run.phase = 'rest'; break;
      case 'shop': openShop(1); break;
      case 'treasure': {
        const g = goldGain(run, 25 + run.floor * 1.5);
        run.gold += g;
        const rel = RELIC_IDS.filter(id => !run.relics.includes(id) && !RELICS[id].rare);
        let msg = `в сундуке ${g} золота`;
        if (rel.length && Math.random() < .5) { const r = pick(rel); addRelic(r); msg += ` и реликвия «${RELICS[r].n}»`; }
        run.phase = 'event'; run.ev = { t: 'сундук', ic: 'redeem', x: msg, o: [], done: true, res: '' };
        break;
      }
      case 'event': {
        const ev = pick(EVENTS);
        run.phase = 'event'; run.ev = { idx: EVENTS.indexOf(ev), t: ev.t, ic: ev.ic, x: ev.x, done: false, res: '' };
        break;
      }
    }
    persist();
  }

  function evOpt(i) {
    const run = S.run, ev = run.ev; if (!ev || ev.done) return;
    const def = EVENTS[ev.idx], o = def.o[i]; if (!o) return;
    if (o.req) {
      if (o.req.gold && run.gold < o.req.gold) return B().snack('не хватает золота');
      if (o.req.maxHp && run.maxHp < o.req.maxHp) return B().snack('слишком мало макс. хп');
    }
    let fx = o.fx, m = o.m;
    if (o.rnd) {
      let r = Math.random(), acc = 0, ch = o.rnd[o.rnd.length - 1];
      for (const c of o.rnd) { acc += c.p; if (r < acc) { ch = c; break; } }
      fx = ch.fx; m = ch.m;
    }
    ev.res = m || '';
    const parts = applyFx(fx || {});
    if (run.hp <= 0 && checkDeath()) return;
    if (parts.fight) { run.ev = null; return startFight(parts.fight); }
    if (parts.shop) { run.ev = null; return openShop(.8); }
    if (parts.upg) { upgMode = { back: 'event' }; ev.res += ' · выбери навык'; run.phase = 'upgrade'; ev.done = true; persist(); return; }
    ev.done = true;
    persist();
  }

  function applyFx(fx) {
    const run = S.run, out = {};
    if (fx.gold) run.gold = Math.max(0, run.gold + fx.gold);
    if (fx.hp) { run.hp += fx.hp; if (fx.hp > 0) run.hp = Math.min(run.hp, run.maxHp); }
    if (fx.hpPct) { if (fx.hpPct > 0) healPlayer(run.maxHp * fx.hpPct / 100); else run.hp -= Math.round(run.maxHp * -fx.hpPct / 100); }
    if (fx.maxHp) { run.maxHp = Math.max(10, run.maxHp + fx.maxHp); run.hp = Math.min(run.hp, run.maxHp); }
    if (fx.pot && !addPot(fx.pot)) run.gold += 15;
    if (fx.pot2 && !addPot(fx.pot2)) run.gold += 15;
    if (fx.relic) {
      const rel = RELIC_IDS.filter(id => !run.relics.includes(id));
      if (rel.length) { const r = pick(rel); addRelic(r); run.ev && (run.ev.res += ` «${RELICS[r].n}»`); } else run.gold += 50;
    }
    if (fx.upg) out.upg = true;
    if (fx.fight) out.fight = fx.fight;
    if (fx.shop) out.shop = true;
    return out;
  }

  function leaveEvent() {
    const run = S.run; if (!run.ev || !run.ev.done) return;
    nextFloor();
  }

  function rest(kind) {
    const run = S.run; if (run.phase !== 'rest') return;
    if (kind === 'heal') {
      healPlayer(run.maxHp * (.3 + ml('heal') * .05));
      nextFloor();
    } else if (kind === 'upg') {
      if (!run.skills.some(s => s.lv < MAX_LVL)) return B().snack('все навыки на максимуме');
      upgMode = { back: 'rest' }; run.phase = 'upgrade';
    }
    persist();
  }

  function doUpgrade(id) {
    const run = S.run; if (run.phase !== 'upgrade') return;
    const s = run.skills.find(x => x.id === id);
    if (!s || s.lv >= MAX_LVL) return;
    if (upgMode && upgMode.back === 'shop') {
      const price = upgMode.price;
      if (run.gold < price) return B().snack('не хватает золота');
      run.gold -= price;
      s.lv++;
      run.phase = 'shop'; upgMode = null; persist(); return;
    }
    s.lv++;
    const back = upgMode && upgMode.back;
    upgMode = null;
    if (back === 'event') { run.phase = 'event'; persist(); return; }
    nextFloor();
  }

  function cancelUpgrade() {
    const run = S.run;
    if (upgMode && upgMode.back === 'shop') { run.phase = 'shop'; upgMode = null; persist(); }
  }

  /* ---------- лавка ---------- */
  function openShop(disc) {
    const run = S.run;
    const price = n => Math.round(n * disc * (R('merchant') ? .75 : 1) * (1 + run.floor / 60));
    const items = [];
    const have = run.skills.map(s => s.id);
    if (run.skills.length < MAX_SKILLS) {
      for (const id of shuffle(SK_POOL.filter(x => !have.includes(x))).slice(0, 2)) items.push({ t: 'skill', id, p: price(55), sold: false });
    }
    const rel = shuffle(RELIC_IDS.filter(id => !run.relics.includes(id))).slice(0, 2);
    for (const id of rel) items.push({ t: 'relic', id, p: price(RELICS[id].price), sold: false });
    items.push({ t: 'pot', id: 'heal', p: price(28), sold: false });
    items.push({ t: 'pot', id: pick(['energy', 'bomb']), p: price(35), sold: false });
    items.push({ t: 'heal', p: price(40), sold: false });
    items.push({ t: 'upg', p: price(75), sold: false });
    run.shop = { items };
    run.phase = 'shop';
    persist();
  }

  function buy(i) {
    const run = S.run, it = run.shop && run.shop.items[i];
    if (!it || it.sold) return;
    if (run.gold < it.p) return B().snack('не хватает золота');
    if (it.t === 'skill') { if (run.skills.length >= MAX_SKILLS) return B().snack('навыки заполнены'); run.skills.push({ id: it.id, lv: 1 }); }
    else if (it.t === 'relic') addRelic(it.id);
    else if (it.t === 'pot') { if (!addPot(it.id)) return B().snack('слоты зелий заняты'); }
    else if (it.t === 'heal') { if (run.hp >= run.maxHp) return B().snack('хп и так полное'); healPlayer(run.maxHp * .3); }
    else if (it.t === 'upg') {
      if (!run.skills.some(s => s.lv < MAX_LVL)) return B().snack('все навыки на максимуме');
      upgMode = { back: 'shop', price: it.p }; run.phase = 'upgrade'; it.sold = true; persist(); return;
    }
    run.gold -= it.p; it.sold = true;
    persist();
  }
  function leaveShop() { const run = S.run; if (run.phase === 'shop') nextFloor(); }

  /* ---------- итоги ---------- */
  function finishRun(win) {
    const run = S.run;
    const floors = win ? MAX_FLOOR : Math.max(0, run.floor - 1);
    let ess = floors * 2 + run.kills + run.bosses * 15 + (win ? 150 + run.asc * 30 : 0);
    ess = Math.round(ess * (1 + ml('ess') * .1) * (1 + run.asc * .2));
    const coins = Math.round(floors * 4 + run.bosses * 40 + (win ? 400 : 0));
    S.ess += ess;
    if (coins > 0) B().addCoins(coins);
    S.best = Math.max(S.best, floors);
    if (win) {
      S.wins++; S.winCls[run.cls] = true;
      S.ascWin = Math.max(S.ascWin, run.asc);
      if (run.asc >= S.ascUnlocked && S.ascUnlocked < 5) S.ascUnlocked = run.asc + 1;
      if (S.ascUnlocked < 1) S.ascUnlocked = 1;
    }
    S.maxRel = Math.max(S.maxRel, run.relics.length);
    const got = checkAchs();
    S.lastResult = { win, floors, kills: run.kills, bosses: run.bosses, ess, coins, cls: run.cls, relics: run.relics.slice(), ach: got };
    S.run = null;
    run.phase = 'over';
    upgMode = null;
    persist();
  }

  function checkAchs() {
    const got = [];
    for (const a of ACHS) {
      if (!S.ach[a.id] && a.ok(S)) { S.ach[a.id] = true; S.ess += a.ess; got.push(`${a.n} (+${a.ess})`); }
    }
    return got;
  }

  function buyMeta(id) {
    const m = META.find(x => x.id === id); if (!m) return;
    const lv = ml(id);
    if (lv >= m.max) return;
    const cost = m.base + m.step * lv;
    if (S.ess < cost) return B().snack(`не хватает эссенции (${cost})`);
    S.ess -= cost; S.meta[id] = lv + 1; persist();
  }
  function unlockClass(id) {
    const c = CLASSES[id];
    if (!c || S.classes[id]) return;
    if (S.ess < c.cost) return B().snack(`нужно ${c.cost} эссенции`);
    S.ess -= c.cost; S.classes[id] = true; S.cls = id; persist();
  }

  function dailyGift() {
    const today = new Date().toISOString().slice(0, 10);
    if (S.lastDaily === today) return false;
    S.lastDaily = today;
    S.ess += 12;
    B().addCoins(30);
    persist();
    B().snack('дар шпиля: +12 эссенции и +30 🪙');
    return true;
  }

  /* ---------- UI ---------- */
  function injectStyles() {
    if (document.getElementById('sp-styles')) return;
    const st = document.createElement('style');
    st.id = 'sp-styles';
    st.textContent = `
      .sp-wrap{display:grid;gap:12px}
      .sp-pills{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:0 16px}
      .sp-pill{padding:9px 4px;border-radius:18px;background:var(--md-sys-color-surface-container-highest);text-align:center}
      .sp-pill small{display:block;font:700 10px/13px var(--font);color:var(--md-sys-color-primary)}
      .sp-pill b{display:block;margin-top:2px;font:800 13px/17px var(--font)}
      .sp-seg{display:grid;grid-template-columns:repeat(3,1fr);margin:0 16px;padding:4px;border-radius:24px;background:var(--md-sys-color-surface-container-high);gap:3px}
      .sp-seg button{position:relative;height:38px;border-radius:20px;font:700 12px/15px var(--font);color:var(--md-sys-color-on-surface-variant);overflow:hidden}
      .sp-seg button.on{background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container)}
      .sp-box{margin:0 16px;padding:16px;border-radius:26px;background:var(--md-sys-color-surface-container-high);display:grid;gap:10px}
      .sp-box h3{margin:0;font:800 16px/22px var(--font)}
      .sp-box p{margin:0;font:500 13px/18px var(--font);opacity:.85}
      .sp-list{display:grid;gap:8px;padding:0 16px}
      .sp-card{position:relative;padding:13px 14px;border-radius:20px;background:var(--md-sys-color-surface-container-high);display:flex;align-items:center;gap:12px;text-align:left;overflow:hidden;width:100%}
      .sp-card.on{box-shadow:inset 0 0 0 2px var(--md-sys-color-primary)}
      .sp-card.off{opacity:.45;pointer-events:none}
      .sp-card.gold{background:var(--md-sys-color-tertiary-container);color:var(--md-sys-color-on-tertiary-container)}
      .sp-card.bad{background:var(--md-sys-color-error-container);color:var(--md-sys-color-on-error-container)}
      .sp-ic{flex:none;width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,currentColor 13%,transparent)}
      .sp-t{flex:1;min-width:0}
      .sp-t b{display:block;font:800 14px/19px var(--font)}
      .sp-t small{display:block;margin-top:1px;font:500 12px/16px var(--font);opacity:.82}
      .sp-badge{flex:none;font:800 12px/16px var(--font);padding:4px 9px;border-radius:12px;background:color-mix(in srgb,currentColor 14%,transparent)}
      .sp-btn{position:relative;height:46px;padding:0 18px;border-radius:23px;background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);font:800 14px/18px var(--font);display:inline-flex;align-items:center;justify-content:center;gap:8px;overflow:hidden}
      .sp-btn.sec{background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container)}
      .sp-btn.off{opacity:.42;pointer-events:none}
      .sp-btn:active,.sp-card:active{transform:scale(.97)}
      .sp-bar{height:10px;border-radius:5px;background:color-mix(in srgb,currentColor 16%,transparent);overflow:hidden}
      .sp-foe .sp-bar{color:var(--md-sys-color-error)}
      .sp-box .sp-bar{color:var(--md-sys-color-primary)}
      .sp-bar i{display:block;height:100%;border-radius:5px;background:currentColor;transition:width .25s}
      .sp-foe{margin:0 16px;padding:16px;border-radius:26px;background:var(--md-sys-color-surface-container-high);display:grid;gap:10px}
      .sp-foe.boss{box-shadow:inset 0 0 0 2px var(--md-sys-color-error)}
      .sp-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .sp-int{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:14px;background:var(--md-sys-color-error-container);color:var(--md-sys-color-on-error-container);font:800 13px/17px var(--font)}
      .sp-skills{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px}
      .sp-sk{position:relative;padding:11px 12px;border-radius:18px;background:var(--md-sys-color-surface-container-highest);text-align:left;overflow:hidden;display:grid;gap:2px}
      .sp-sk b{font:800 13px/17px var(--font);display:flex;justify-content:space-between;gap:6px}
      .sp-sk small{font:500 11px/15px var(--font);opacity:.82}
      .sp-sk.off{opacity:.4;pointer-events:none}
      .sp-sk .en{color:var(--md-sys-color-primary)}
      .sp-log{margin:0 16px;padding:10px 14px;border-radius:16px;background:var(--md-sys-color-surface-container-highest);font:600 12px/17px var(--font);min-height:40px}
      .sp-dots{display:flex;gap:4px}
      .sp-dots i{width:14px;height:14px;border-radius:50%;background:var(--md-sys-color-primary)}
      .sp-dots i.x{background:color-mix(in srgb,currentColor 20%,transparent)}
      .sp-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .sp-chips{display:flex;flex-wrap:wrap;gap:6px}
      .sp-chip{padding:5px 10px;border-radius:12px;background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container);font:700 11px/15px var(--font);display:inline-flex;gap:4px;align-items:center}
      .sp-act{padding:0 16px;display:flex;gap:8px;flex-wrap:wrap}
      .sp-act .sp-btn{flex:1}
    `;
    document.head.appendChild(st);
  }

  const mi = n => `<md-icon>${n}</md-icon>`;
  const bar = (v, m) => `<div class="sp-bar"><i style="width:${Math.max(0, Math.min(100, v / m * 100))}%"></i></div>`;

  function topPills(run) {
    if (run) {
      return `<div class="sp-pills">
        <div class="sp-pill"><small>этаж</small><b>${run.floor}/${MAX_FLOOR}</b></div>
        <div class="sp-pill"><small>здоровье</small><b>${Math.max(0, run.hp)}/${run.maxHp}</b></div>
        <div class="sp-pill"><small>золото</small><b>${run.gold}</b></div>
        <div class="sp-pill"><small>акт</small><b>${actOf(run.floor)}/6</b></div>
      </div>`;
    }
    return `<div class="sp-pills">
      <div class="sp-pill"><small>эссенция</small><b>${S.ess}</b></div>
      <div class="sp-pill"><small>рекорд</small><b>${S.best}</b></div>
      <div class="sp-pill"><small>победы</small><b>${S.wins}</b></div>
      <div class="sp-pill"><small>походы</small><b>${S.runs}</b></div>
    </div>`;
  }

  function relicChips(run) {
    if (!run.relics.length) return '';
    return `<div class="sp-chips" style="padding:0 16px">${run.relics.map(id => `<span class="sp-chip" title="${esc(RELICS[id].d)}">${mi(RELICS[id].ic)}${esc(RELICS[id].n)}</span>`).join('')}</div>`;
  }

  function skillDesc(id, lv) { return SK[id].desc(lv); }

  function renderMenu() {
    const last = S.lastResult;
    let out = '';
    if (last) {
      out += `<div class="sp-box ${last.win ? '' : ''}">
        <h3>${last.win ? 'победа! шпиль покорён' : 'поход закончился'}</h3>
        <p>${esc(CLASSES[last.cls].n)} · этажей ${last.floors} · врагов ${last.kills} · боссов ${last.bosses}<br>награда: +${last.ess} эссенции${last.coins ? ` и +${last.coins} 🪙 в магазин игр` : ''}</p>
        ${last.ach && last.ach.length ? `<p>достижения: ${esc(last.ach.join(', '))}</p>` : ''}
        <div class="sp-act"><button class="sp-btn sec" data-sp-clear="1"><md-ripple></md-ripple>понятно</button></div>
      </div>`;
    }
    out += `<div class="sp-box"><h3>выбери героя</h3><div class="sp-list" style="padding:0">`;
    for (const id of Object.keys(CLASSES)) {
      const c = CLASSES[id], own = !!S.classes[id];
      out += `<button class="sp-card${S.cls === id && own ? ' on' : ''}" data-sp-cls="${id}"><md-ripple></md-ripple>
        <span class="sp-ic">${mi(c.ic)}</span>
        <span class="sp-t"><b>${esc(c.n)}</b><small>${esc(c.d)}</small></span>
        <span class="sp-badge">${own ? (S.cls === id ? 'выбран' : 'выбрать') : `${c.cost} эсс.`}</span>
      </button>`;
    }
    out += `</div></div>`;
    const maxAsc = Math.min(5, S.ascUnlocked);
    out += `<div class="sp-box"><h3>сложность</h3><p>${ASC_TXT[Math.min(S.asc, maxAsc)]}${maxAsc === 0 ? '<br>победи шпиль, чтобы открыть вознесения (больше награды)' : ''}</p>
      <div class="sp-act">
        <button class="sp-btn sec ${maxAsc === 0 ? 'off' : ''}" data-sp-asc="-1"><md-ripple></md-ripple>${mi('remove')}</button>
        <button class="sp-btn sec ${maxAsc === 0 ? 'off' : ''}" data-sp-asc="1"><md-ripple></md-ripple>${mi('add')}</button>
      </div></div>`;
    out += `<div class="sp-act"><button class="sp-btn" data-sp-start="1"><md-ripple></md-ripple>${mi('play_arrow')}начать поход (60 этажей)</button></div>`;
    out += `<div class="sp-box"><h3>как играть</h3><p>каждый ход у тебя есть энергия: трать её на навыки. над врагом виден его следующий ход. после боя выбираешь награду: новые навыки, улучшения, реликвии. на каждом десятом этаже ждёт босс. погибнешь — но эссенция останется, и ты станешь сильнее в следующем походе.</p></div>`;
    return out;
  }

  function renderMap(run) {
    const a = ACTS[actOf(run.floor) - 1];
    const names = { fight: ['бой', 'swords', 'обычный противник'], elite: ['элитный бой', 'skull', 'сильнее, но лучше награда'], rest: ['привал', 'local_hotel', 'лечение или улучшение навыка'], shop: ['лавка', 'storefront', 'покупка навыков и реликвий'], event: ['событие', 'help', 'случайная встреча'], treasure: ['сокровище', 'redeem', 'золото и шанс реликвии'], boss: ['босс акта', 'crown', 'сложный бой с двумя фазами'] };
    let h = `<div class="sp-box"><h3>${mi(a.ic)} ${esc(a.n)} · этаж ${run.floor}</h3>${run.note ? `<p>${esc(run.note)}</p>` : '<p>выбери, куда идти дальше</p>'}</div>`;
    h += `<div class="sp-list">${run.opts.map((o, i) => {
      const n = names[o.type];
      const cls = o.type === 'boss' ? 'bad' : o.type === 'elite' ? 'gold' : '';
      return `<button class="sp-card ${cls}" data-sp-room="${i}"><md-ripple></md-ripple><span class="sp-ic">${mi(n[1])}</span><span class="sp-t"><b>${n[0]}</b><small>${n[2]}</small></span>${mi('chevron_right')}</button>`;
    }).join('')}</div>`;
    h += renderBuild(run);
    return h;
  }

  function renderBuild(run) {
    const potsTot = run.pots.heal + run.pots.energy + run.pots.bomb;
    return `${relicChips(run)}
      <div class="sp-box"><h3>твои навыки (${run.skills.length}/${MAX_SKILLS})</h3>
        ${run.skills.map(s => `<div class="sp-row"><span>${esc(SK[s.id].n)} · ур. ${s.lv}</span><small style="opacity:.8">${esc(skillDesc(s.id, s.lv))}</small></div>`).join('')}
        <p>зелья ${potsTot}/${maxPots(run)}: лечение ${run.pots.heal}, бодрость ${run.pots.energy}, бомбы ${run.pots.bomb}</p>
      </div>
      <div class="sp-act"><button class="sp-btn sec" data-sp-quit="1"><md-ripple></md-ripple>${mi('flag')}сдаться и забрать награду</button></div>`;
  }

  function renderFight(run) {
    const f = run.fight, e = f.e, it = intentOf(e), v = intentVal(e);
    const itTxt = {
      a: [`удар ${v}`, 'swords'], h: [`мощный удар ${Math.round(v * 1.8)}`, 'gavel'], m: [`серия 3×${Math.max(1, Math.round(v * .5))}`, 'bolt'],
      d: ['защита', 'shield'], p: ['яд и удар', 'bubble_chart'], w: ['слабость и удар', 'trending_down'], b: ['ярость', 'whatshot'], s: ['лечение', 'healing'], x: [`вытяжка ${Math.round(v * .9)}`, 'bloodtype']
    }[it];
    const stateE = [e.psn ? `яд ${e.psn}` : '', e.weak ? `слаб ${e.weak}` : '', e.block ? `защита ${e.block}` : '', e.rage ? `ярость ${e.rage}` : '', e.stun ? 'оглушён' : '', e.ph2 ? 'фаза 2' : ''].filter(Boolean);
    const stateP = [f.block ? `защита ${f.block}` : '', f.ppsn ? `яд ${f.ppsn}` : '', f.pw ? `слабость ${f.pw}` : '', f.thorns ? `шипы ${f.thorns}` : '', f.bonus ? `+${f.bonus} урон` : ''].filter(Boolean);
    let h = `<div class="sp-foe${e.kind === 'boss' ? ' boss' : ''}">
      <div class="sp-row"><b style="font:800 17px/22px var(--font)">${mi(e.ic)} ${esc(e.name)}${e.kind === 'elite' ? ' ★' : ''}${e.kind === 'boss' ? ' ♛' : ''}</b><span>${Math.max(0, e.hp)}/${e.maxHp}</span></div>
      ${bar(e.hp, e.maxHp)}
      <div class="sp-row"><span class="sp-int">${mi(itTxt[1])}${esc(itTxt[0])}</span><small>${esc(stateE.join(' · '))}</small></div>
    </div>`;
    h += `<div class="sp-box">
      <div class="sp-row"><b>ты · ${Math.max(0, run.hp)}/${run.maxHp} хп</b><span class="sp-dots">${Array.from({ length: Math.max(f.en, baseEnergy()) }, (_, i) => `<i class="${i < f.en ? '' : 'x'}"></i>`).join('')}</span></div>
      ${bar(run.hp, run.maxHp)}
      <small>${esc(stateP.join(' · ') || 'без эффектов')} · ход ${f.turn}</small>
    </div>`;
    h += `<div class="sp-skills">${run.skills.map((s, i) => {
      const d = SK[s.id], cd = f.cds[s.id] || 0;
      const off = cd > 0 || f.en < d.cost;
      return `<button class="sp-sk${off ? ' off' : ''}" data-sp-skill="${i}"><md-ripple></md-ripple><b><span>${mi(d.ic)} ${esc(d.n)}</span><span class="en">${d.cost}⚡</span></b><small>${esc(d.desc(s.lv))} · ур.${s.lv}${cd > 0 ? ` · пауза ${cd}` : ''}</small></button>`;
    }).join('')}</div>`;
    const pots = Object.keys(POTS).filter(id => run.pots[id] > 0);
    h += `<div class="sp-act">${pots.map(id => `<button class="sp-btn sec" data-sp-pot="${id}"><md-ripple></md-ripple>${mi(POTS[id].ic)}${esc(POTS[id].n.split(' ')[1] || POTS[id].n)} ×${run.pots[id]}</button>`).join('')}
      <button class="sp-btn" data-sp-end="1"><md-ripple></md-ripple>${mi('skip_next')}закончить ход</button></div>`;
    h += `<div class="sp-log">${f.log.slice(-4).map(esc).join('<br>')}</div>`;
    h += relicChips(run);
    return h;
  }

  function rewardCard(o, run, idx) {
    let ic, t, d, cls = '';
    if (o.t === 'skill') { ic = SK[o.id].ic; t = `новый навык: ${SK[o.id].n}`; d = `${SK[o.id].cost}⚡ · ${SK[o.id].desc(1)}`; }
    else if (o.t === 'upg') { const s = run.skills.find(x => x.id === o.id); ic = 'upgrade'; t = `улучшить: ${SK[o.id].n}`; d = `ур. ${s.lv} → ${s.lv + 1}: ${SK[o.id].desc(s.lv + 1)}`; }
    else if (o.t === 'maxhp') { ic = 'favorite'; t = `+${o.v} макс. хп`; d = 'навсегда на этот поход'; }
    else if (o.t === 'heal') { ic = 'healing'; t = `лечение ${o.v}%`; d = 'восстановить здоровье'; }
    else if (o.t === 'relic') { ic = RELICS[o.id].ic; t = `реликвия: ${RELICS[o.id].n}`; d = RELICS[o.id].d; cls = 'gold'; }
    else { ic = POTS[o.id].ic; t = POTS[o.id].n; d = POTS[o.id].d; }
    return `<button class="sp-card ${cls}" data-sp-rw="${idx}"><md-ripple></md-ripple><span class="sp-ic">${mi(ic)}</span><span class="sp-t"><b>${esc(t)}</b><small>${esc(d)}</small></span></button>`;
  }

  function renderReward(run) {
    const rw = run.reward;
    return `<div class="sp-box"><h3>победа! +${rw.gold} золота</h3><p>выбери одну награду</p></div>
      <div class="sp-list">${rw.opts.map((o, i) => rewardCard(o, run, i)).join('')}</div>
      <div class="sp-act"><button class="sp-btn sec" data-sp-skip="1"><md-ripple></md-ripple>пропустить (+15 золота)</button></div>${renderBuild(run)}`;
  }

  function renderRest(run) {
    const pct = 30 + ml('heal') * 5;
    return `<div class="sp-box"><h3>${mi('local_hotel')} привал</h3><p>можно отдохнуть или потренироваться</p></div>
      <div class="sp-list">
        <button class="sp-card" data-sp-rest="heal"><md-ripple></md-ripple><span class="sp-ic">${mi('healing')}</span><span class="sp-t"><b>отдохнуть</b><small>+${pct}% макс. хп</small></span></button>
        <button class="sp-card" data-sp-rest="upg"><md-ripple></md-ripple><span class="sp-ic">${mi('upgrade')}</span><span class="sp-t"><b>тренировка</b><small>улучшить один навык</small></span></button>
      </div>${renderBuild(run)}`;
  }

  function renderUpgrade(run) {
    const price = upgMode && upgMode.back === 'shop' ? ` за ${upgMode.price} золота` : '';
    return `<div class="sp-box"><h3>выбери навык для улучшения${price}</h3></div>
      <div class="sp-list">${run.skills.map(s => `<button class="sp-card ${s.lv >= MAX_LVL ? 'off' : ''}" data-sp-upg="${s.id}"><md-ripple></md-ripple><span class="sp-ic">${mi(SK[s.id].ic)}</span><span class="sp-t"><b>${esc(SK[s.id].n)} · ур. ${s.lv}</b><small>${s.lv >= MAX_LVL ? 'максимум' : `ур. ${s.lv + 1}: ${esc(SK[s.id].desc(s.lv + 1))}`}</small></span></button>`).join('')}</div>
      ${upgMode && upgMode.back === 'shop' ? `<div class="sp-act"><button class="sp-btn sec" data-sp-cancelupg="1"><md-ripple></md-ripple>назад</button></div>` : ''}`;
  }

  function renderShop(run) {
    return `<div class="sp-box"><h3>${mi('storefront')} лавка</h3><p>золото: ${run.gold}</p></div>
      <div class="sp-list">${run.shop.items.map((it, i) => {
        let ic, t, d;
        if (it.t === 'skill') { ic = SK[it.id].ic; t = `навык: ${SK[it.id].n}`; d = SK[it.id].desc(1); }
        else if (it.t === 'relic') { ic = RELICS[it.id].ic; t = `реликвия: ${RELICS[it.id].n}`; d = RELICS[it.id].d; }
        else if (it.t === 'pot') { ic = POTS[it.id].ic; t = POTS[it.id].n; d = POTS[it.id].d; }
        else if (it.t === 'heal') { ic = 'healing'; t = 'перевязка'; d = 'лечит 30% макс. хп'; }
        else { ic = 'upgrade'; t = 'мастерская'; d = 'улучшить навык на уровень'; }
        const off = it.sold || run.gold < it.p;
        return `<button class="sp-card ${it.sold ? 'off' : off ? 'off' : ''}" data-sp-buy="${i}"><md-ripple></md-ripple><span class="sp-ic">${mi(ic)}</span><span class="sp-t"><b>${esc(t)}</b><small>${esc(d)}</small></span><span class="sp-badge">${it.sold ? 'продано' : it.p + ' зол.'}</span></button>`;
      }).join('')}</div>
      <div class="sp-act"><button class="sp-btn" data-sp-leave="shop"><md-ripple></md-ripple>${mi('arrow_forward')}уйти</button></div>${renderBuild(run)}`;
  }

  function renderEvent(run) {
    const ev = run.ev, def = ev.idx != null ? EVENTS[ev.idx] : null;
    let h = `<div class="sp-box"><h3>${mi(ev.ic)} ${esc(ev.t)}</h3><p>${esc(ev.x)}</p>${ev.res ? `<p><b>${esc(ev.res)}</b></p>` : ''}</div>`;
    if (!ev.done && def) {
      h += `<div class="sp-list">${def.o.map((o, i) => {
        const bad = o.req && ((o.req.gold && run.gold < o.req.gold) || (o.req.maxHp && run.maxHp < o.req.maxHp));
        return `<button class="sp-card ${bad ? 'off' : ''}" data-sp-ev="${i}"><md-ripple></md-ripple><span class="sp-t"><b>${esc(o.t)}</b></span></button>`;
      }).join('')}</div>`;
    } else {
      h += `<div class="sp-act"><button class="sp-btn" data-sp-leave="ev"><md-ripple></md-ripple>${mi('arrow_forward')}дальше</button></div>`;
    }
    return h + renderBuild(run);
  }

  function renderUpgrades() {
    let h = `<div class="sp-box"><h3>постоянные улучшения</h3><p>эссенция: ${S.ess}. покупки действуют во всех будущих походах</p></div><div class="sp-list">`;
    for (const m of META) {
      const lv = ml(m.id), maxed = lv >= m.max, cost = m.base + m.step * lv;
      h += `<button class="sp-card ${maxed || S.ess < cost ? 'off' : ''}" data-sp-meta="${m.id}"><md-ripple></md-ripple><span class="sp-ic">${mi(m.ic)}</span><span class="sp-t"><b>${esc(m.n)} · ${lv}/${m.max}</b><small>${esc(m.d)}</small></span><span class="sp-badge">${maxed ? 'макс' : cost}</span></button>`;
    }
    return h + '</div>';
  }

  function renderChronicle() {
    const rel = RELIC_IDS.map(id => `<span class="sp-chip" style="${S.relicsSeen[id] ? '' : 'opacity:.4'}">${mi(S.relicsSeen[id] ? RELICS[id].ic : 'help')}${S.relicsSeen[id] ? esc(RELICS[id].n) : '???'}</span>`).join('');
    let h = `<div class="sp-box"><h3>летопись</h3><p>походов ${S.runs} · побед ${S.wins} · врагов ${S.kills} · лучший этаж ${S.best}</p></div>
      <div class="sp-box"><h3>реликвии (${Object.keys(S.relicsSeen).length}/${RELIC_IDS.length})</h3><div class="sp-chips">${rel}</div></div>
      <div class="sp-list">`;
    for (const a of ACHS) {
      const done = !!S.ach[a.id];
      h += `<div class="sp-card ${done ? 'on' : ''}"><span class="sp-ic">${mi(done ? 'task_alt' : 'radio_button_unchecked')}</span><span class="sp-t"><b>${esc(a.n)}</b><small>${esc(a.d)}</small></span><span class="sp-badge">+${a.ess}</span></div>`;
    }
    return h + '</div>';
  }

  function render(subChipsHtml, animCls = '') {
    injectStyles();
    dailyGift();
    const run = S.run;
    let inner;
    if (S.tab === 'up') inner = renderUpgrades();
    else if (S.tab === 'chron') inner = renderChronicle();
    else if (!run) inner = renderMenu();
    else if (run.phase === 'fight') inner = renderFight(run);
    else if (run.phase === 'reward') inner = renderReward(run);
    else if (run.phase === 'rest') inner = renderRest(run);
    else if (run.phase === 'upgrade') inner = renderUpgrade(run);
    else if (run.phase === 'shop') inner = renderShop(run);
    else if (run.phase === 'event') inner = renderEvent(run);
    else inner = renderMap(run);
    return `<div class="g-wrap${animCls}" id="sp-root"><div class="sp-wrap">
      ${subChipsHtml}
      ${topPills(S.tab === 'run' ? run : null)}
      <div class="sp-seg">
        <button class="${S.tab === 'run' ? 'on' : ''}" data-sp-tab="run"><md-ripple></md-ripple>поход</button>
        <button class="${S.tab === 'up' ? 'on' : ''}" data-sp-tab="up"><md-ripple></md-ripple>улучшения</button>
        <button class="${S.tab === 'chron' ? 'on' : ''}" data-sp-tab="chron"><md-ripple></md-ripple>летопись</button>
      </div>
      ${inner}
    </div></div>`;
  }

  /* ---------- клики ---------- */
  function repaint() { B().refreshHub(); }

  function handleClick(e) {
    if (!e.target.closest('#sp-root')) return false;
    const q = a => e.target.closest(`[data-sp-${a}]`);
    let el;
    const ok = () => { B().hap(); };
    if ((el = q('tab'))) { ok(); S.tab = el.dataset.spTab; persist(); repaint(); return true; }
    if ((el = q('cls'))) {
      ok(); const id = el.dataset.spCls;
      if (S.classes[id]) { S.cls = id; persist(); } else unlockClass(id);
      repaint(); return true;
    }
    if ((el = q('asc'))) {
      ok(); const mx = Math.min(5, S.ascUnlocked);
      S.asc = Math.max(0, Math.min(mx, S.asc + (+el.dataset.spAsc))); persist(); repaint(); return true;
    }
    if (q('start')) { B().hap('impact'); S.lastResult = null; startRun(); repaint(); return true; }
    if (q('clear')) { ok(); S.lastResult = null; persist(); repaint(); return true; }
    if ((el = q('meta'))) { ok(); buyMeta(el.dataset.spMeta); repaint(); return true; }

    if (!S.run) return true;
    if ((el = q('room'))) { B().hap('impact'); enterRoom(+el.dataset.spRoom); repaint(); return true; }
    if ((el = q('skill'))) { B().hap('impact'); useSkill(+el.dataset.spSkill); repaint(); return true; }
    if ((el = q('pot'))) { ok(); usePot(el.dataset.spPot); repaint(); return true; }
    if (q('end')) { ok(); endTurn(); repaint(); return true; }
    if ((el = q('rw'))) { ok(); claimReward(+el.dataset.spRw); repaint(); return true; }
    if (q('skip')) { ok(); skipReward(); repaint(); return true; }
    if ((el = q('rest'))) { ok(); rest(el.dataset.spRest); repaint(); return true; }
    if ((el = q('upg'))) { ok(); doUpgrade(el.dataset.spUpg); repaint(); return true; }
    if (q('cancelupg')) { ok(); cancelUpgrade(); repaint(); return true; }
    if ((el = q('buy'))) { ok(); buy(+el.dataset.spBuy); repaint(); return true; }
    if ((el = q('leave'))) { ok(); if (el.dataset.spLeave === 'shop') leaveShop(); else leaveEvent(); repaint(); return true; }
    if ((el = q('ev'))) { ok(); evOpt(+el.dataset.spEv); repaint(); return true; }
    if (q('quit')) {
      ok();
      if (quitArmed) { quitArmed = false; finishRun(false); } else { quitArmed = true; B().snack('нажми ещё раз, чтобы сдаться'); setTimeout(() => { quitArmed = false; }, 4000); }
      repaint(); return true;
    }
    return true;
  }
  let quitArmed = false;

  function stopTimers() {}
  function getHubBadge() { return S.run ? `этаж ${S.run.floor}` : `рекорд ${S.best}`; }

  window.SPIRE_GAME = {
    render, handleClick, stopTimers, getHubBadge,
    _t: { get S() { return S; }, MAX_FLOOR }
  };
})();
