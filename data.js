// ============================================================
// Japanese Trainer - data.js
// All static data: hiragana, katakana, phrases, curriculum,
// city vocab. No external dependencies.
// ============================================================

// --- Hiragana (46 base characters) -------------------------
const HIRAGANA = [
  { char: 'あ', romaji: 'a' },  { char: 'い', romaji: 'i' },  { char: 'う', romaji: 'u' },  { char: 'え', romaji: 'e' },  { char: 'お', romaji: 'o' },
  { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' },
  { char: 'さ', romaji: 'sa' }, { char: 'し', romaji: 'shi'},  { char: 'す', romaji: 'su' }, { char: 'せ', romaji: 'se' }, { char: 'そ', romaji: 'so' },
  { char: 'た', romaji: 'ta' }, { char: 'ち', romaji: 'chi'}, { char: 'つ', romaji: 'tsu'}, { char: 'て', romaji: 'te' }, { char: 'と', romaji: 'to' },
  { char: 'な', romaji: 'na' }, { char: 'に', romaji: 'ni' }, { char: 'ぬ', romaji: 'nu' }, { char: 'ね', romaji: 'ne' }, { char: 'の', romaji: 'no' },
  { char: 'は', romaji: 'ha' }, { char: 'ひ', romaji: 'hi' }, { char: 'ふ', romaji: 'fu' }, { char: 'へ', romaji: 'he' }, { char: 'ほ', romaji: 'ho' },
  { char: 'ま', romaji: 'ma' }, { char: 'み', romaji: 'mi' }, { char: 'む', romaji: 'mu' }, { char: 'め', romaji: 'me' }, { char: 'も', romaji: 'mo' },
  { char: 'や', romaji: 'ya' }, { char: 'ゆ', romaji: 'yu' }, { char: 'よ', romaji: 'yo' },
  { char: 'ら', romaji: 'ra' }, { char: 'り', romaji: 'ri' }, { char: 'る', romaji: 'ru' }, { char: 'れ', romaji: 're' }, { char: 'ろ', romaji: 'ro' },
  { char: 'わ', romaji: 'wa' }, { char: 'を', romaji: 'wo' },
  { char: 'ん', romaji: 'n' }
];

// --- Katakana (46 base characters) -------------------------
const KATAKANA = [
  { char: 'ア', romaji: 'a' },  { char: 'イ', romaji: 'i' },  { char: 'ウ', romaji: 'u' },  { char: 'エ', romaji: 'e' },  { char: 'オ', romaji: 'o' },
  { char: 'カ', romaji: 'ka' }, { char: 'キ', romaji: 'ki' }, { char: 'ク', romaji: 'ku' }, { char: 'ケ', romaji: 'ke' }, { char: 'コ', romaji: 'ko' },
  { char: 'サ', romaji: 'sa' }, { char: 'シ', romaji: 'shi'}, { char: 'ス', romaji: 'su' }, { char: 'セ', romaji: 'se' }, { char: 'ソ', romaji: 'so' },
  { char: 'タ', romaji: 'ta' }, { char: 'チ', romaji: 'chi'}, { char: 'ツ', romaji: 'tsu'}, { char: 'テ', romaji: 'te' }, { char: 'ト', romaji: 'to' },
  { char: 'ナ', romaji: 'na' }, { char: 'ニ', romaji: 'ni' }, { char: 'ヌ', romaji: 'nu' }, { char: 'ネ', romaji: 'ne' }, { char: 'ノ', romaji: 'no' },
  { char: 'ハ', romaji: 'ha' }, { char: 'ヒ', romaji: 'hi' }, { char: 'フ', romaji: 'fu' }, { char: 'ヘ', romaji: 'he' }, { char: 'ホ', romaji: 'ho' },
  { char: 'マ', romaji: 'ma' }, { char: 'ミ', romaji: 'mi' }, { char: 'ム', romaji: 'mu' }, { char: 'メ', romaji: 'me' }, { char: 'モ', romaji: 'mo' },
  { char: 'ヤ', romaji: 'ya' }, { char: 'ユ', romaji: 'yu' }, { char: 'ヨ', romaji: 'yo' },
  { char: 'ラ', romaji: 'ra' }, { char: 'リ', romaji: 'ri' }, { char: 'ル', romaji: 'ru' }, { char: 'レ', romaji: 're' }, { char: 'ロ', romaji: 'ro' },
  { char: 'ワ', romaji: 'wa' }, { char: 'ヲ', romaji: 'wo' },
  { char: 'ン', romaji: 'n' }
];

// --- Survival Phrases (50+) --------------------------------
// Categories: greetings, transport, food, shopping, emergency, directions, accommodation, numbers, time, polite
const PHRASES = [
  // Greetings
  { id: 'ph001', japanese: 'ありがとうございます', romaji: 'arigatou gozaimasu', english: 'Thank you very much', category: 'greetings', day: 1 },
  { id: 'ph002', japanese: 'すみません', romaji: 'sumimasen', english: 'Excuse me / I\'m sorry', category: 'greetings', day: 1 },
  { id: 'ph003', japanese: 'おはようございます', romaji: 'ohayou gozaimasu', english: 'Good morning', category: 'greetings', day: 1 },
  { id: 'ph004', japanese: 'こんにちは', romaji: 'konnichiwa', english: 'Hello / Good afternoon', category: 'greetings', day: 1 },
  { id: 'ph005', japanese: 'こんばんは', romaji: 'konbanwa', english: 'Good evening', category: 'greetings', day: 1 },
  { id: 'ph006', japanese: 'さようなら', romaji: 'sayounara', english: 'Goodbye', category: 'greetings', day: 1 },
  { id: 'ph007', japanese: 'はじめまして', romaji: 'hajimemashite', english: 'Nice to meet you (first time)', category: 'greetings', day: 1 },
  { id: 'ph008', japanese: 'よろしくおねがいします', romaji: 'yoroshiku onegaishimasu', english: 'Please treat me well / Nice to meet you', category: 'greetings', day: 1 },
  { id: 'ph009', japanese: 'おやすみなさい', romaji: 'oyasumi nasai', english: 'Good night', category: 'greetings', day: 1 },
  { id: 'ph010', japanese: 'いただきます', romaji: 'itadakimasu', english: 'Let\'s eat (said before meals)', category: 'greetings', day: 2 },

  // Transport
  { id: 'ph011', japanese: '〜はどこですか？', romaji: '〜wa doko desu ka?', english: 'Where is 〜?', category: 'transport', day: 3 },
  { id: 'ph012', japanese: '電車はどこですか？', romaji: 'densha wa doko desu ka?', english: 'Where is the train?', category: 'transport', day: 3 },
  { id: 'ph013', japanese: '〜まで、いくらですか？', romaji: '〜made, ikura desu ka?', english: 'How much to 〜?', category: 'transport', day: 3 },
  { id: 'ph014', japanese: 'つぎの電車は何時ですか？', romaji: 'tsugi no densha wa nanji desu ka?', english: 'What time is the next train?', category: 'transport', day: 3 },
  { id: 'ph015', japanese: '〜行きのきっぷを一枚ください', romaji: '〜yuki no kippu wo ichimai kudasai', english: 'One ticket to 〜, please', category: 'transport', day: 3 },
  { id: 'ph016', japanese: 'タクシーをよんでください', romaji: 'takushii wo yonde kudasai', english: 'Please call a taxi for me', category: 'transport', day: 3 },
  { id: 'ph017', japanese: 'バス停はどこですか？', romaji: 'basutei wa doko desu ka?', english: 'Where is the bus stop?', category: 'transport', day: 3 },
  { id: 'ph018', japanese: '空港へお願いします', romaji: 'kuukou e onegaishimasu', english: 'To the airport, please', category: 'transport', day: 3 },

  // Food & Restaurant
  { id: 'ph019', japanese: 'メニューをください', romaji: 'menyuu wo kudasai', english: 'Please give me the menu', category: 'food', day: 2 },
  { id: 'ph020', japanese: 'これをください', romaji: 'kore wo kudasai', english: 'I\'ll have this, please', category: 'food', day: 2 },
  { id: 'ph021', japanese: 'おすすめは何ですか？', romaji: 'osusume wa nan desu ka?', english: 'What do you recommend?', category: 'food', day: 2 },
  { id: 'ph022', japanese: 'おかいけいをください', romaji: 'okaikei wo kudasai', english: 'Check, please', category: 'food', day: 2 },
  { id: 'ph023', japanese: 'おいしい！', romaji: 'oishii!', english: 'Delicious!', category: 'food', day: 2 },
  { id: 'ph024', japanese: '水をください', romaji: 'mizu wo kudasai', english: 'Water, please', category: 'food', day: 2 },
  { id: 'ph025', japanese: 'アレルギーがあります', romaji: 'arerugii ga arimasu', english: 'I have an allergy', category: 'food', day: 2 },
  { id: 'ph026', japanese: 'ベジタリアンです', romaji: 'bejitarian desu', english: 'I am vegetarian', category: 'food', day: 2 },
  { id: 'ph027', japanese: '予約をしたいのですが', romaji: 'yoyaku wo shitai no desu ga', english: 'I\'d like to make a reservation', category: 'food', day: 4 },

  // Shopping
  { id: 'ph028', japanese: 'いくらですか？', romaji: 'ikura desu ka?', english: 'How much is it?', category: 'shopping', day: 4 },
  { id: 'ph029', japanese: 'これはなんですか？', romaji: 'kore wa nan desu ka?', english: 'What is this?', category: 'shopping', day: 4 },
  { id: 'ph030', japanese: 'もっとやすくなりますか？', romaji: 'motto yasuku narimasu ka?', english: 'Can you make it cheaper?', category: 'shopping', day: 4 },
  { id: 'ph031', japanese: 'これをください', romaji: 'kore wo kudasai', english: 'I\'ll take this', category: 'shopping', day: 4 },
  { id: 'ph032', japanese: 'クレジットカードはつかえますか？', romaji: 'kurejitto kaado wa tsukaemasu ka?', english: 'Can I use a credit card?', category: 'shopping', day: 4 },
  { id: 'ph033', japanese: 'ふくろはいりません', romaji: 'fukuro wa irimasen', english: 'I don\'t need a bag', category: 'shopping', day: 4 },
  { id: 'ph034', japanese: '〜はありますか？', romaji: '〜wa arimasu ka?', english: 'Do you have 〜?', category: 'shopping', day: 4 },
  { id: 'ph035', japanese: 'べつべつにおねがいします', romaji: 'betsubetsu ni onegaishimasu', english: 'Separate bills, please', category: 'shopping', day: 5 },

  // Emergency
  { id: 'ph036', japanese: 'たすけてください！', romaji: 'tasukete kudasai!', english: 'Please help me!', category: 'emergency', day: 5 },
  { id: 'ph037', japanese: '救急車をよんでください', romaji: 'kyuukyuusha wo yonde kudasai', english: 'Please call an ambulance', category: 'emergency', day: 5 },
  { id: 'ph038', japanese: '警察をよんでください', romaji: 'keisatsu wo yonde kudasai', english: 'Please call the police', category: 'emergency', day: 5 },
  { id: 'ph039', japanese: 'びょういんはどこですか？', romaji: 'byouin wa doko desu ka?', english: 'Where is the hospital?', category: 'emergency', day: 5 },
  { id: 'ph040', japanese: 'ぬすまれました', romaji: 'nusumaremashita', english: 'I was robbed', category: 'emergency', day: 5 },
  { id: 'ph041', japanese: 'にほんごがわかりません', romaji: 'nihongo ga wakarimasen', english: 'I don\'t understand Japanese', category: 'emergency', day: 1 },
  { id: 'ph042', japanese: 'えいごをはなせますか？', romaji: 'eigo wo hanasemasu ka?', english: 'Can you speak English?', category: 'emergency', day: 1 },

  // Directions
  { id: 'ph043', japanese: 'まっすぐいってください', romaji: 'massugu itte kudasai', english: 'Please go straight', category: 'directions', day: 6 },
  { id: 'ph044', japanese: 'みぎにまがってください', romaji: 'migi ni magatte kudasai', english: 'Please turn right', category: 'directions', day: 6 },
  { id: 'ph045', japanese: 'ひだりにまがってください', romaji: 'hidari ni magatte kudasai', english: 'Please turn left', category: 'directions', day: 6 },
  { id: 'ph046', japanese: 'ちかくにコンビニはありますか？', romaji: 'chikaku ni konbini wa arimasu ka?', english: 'Is there a convenience store nearby?', category: 'directions', day: 6 },
  { id: 'ph047', japanese: 'ちずをかいてもらえますか？', romaji: 'chizu wo kaite moraemasu ka?', english: 'Could you draw me a map?', category: 'directions', day: 6 },
  { id: 'ph048', japanese: 'とおいですか？', romaji: 'tooi desu ka?', english: 'Is it far?', category: 'directions', day: 6 },

  // Accommodation
  { id: 'ph049', japanese: 'チェックインしたいのですが', romaji: 'chekku in shitai no desu ga', english: 'I\'d like to check in', category: 'accommodation', day: 7 },
  { id: 'ph050', japanese: 'チェックアウトはなんじですか？', romaji: 'chekku auto wa nanji desu ka?', english: 'What time is check-out?', category: 'accommodation', day: 7 },
  { id: 'ph051', japanese: 'パスポートをみせてください', romaji: 'pasupooto wo misete kudasai', english: 'Please show me your passport', category: 'accommodation', day: 7 },
  { id: 'ph052', japanese: 'ルームサービスをおねがいします', romaji: 'ruumu saabisu wo onegaishimasu', english: 'Room service, please', category: 'accommodation', day: 7 },
  { id: 'ph053', japanese: 'ふとんがひつようです', romaji: 'futon ga hitsuyou desu', english: 'I need a futon', category: 'accommodation', day: 7 },
  { id: 'ph054', japanese: 'おふろはどこですか？', romaji: 'ofuro wa doko desu ka?', english: 'Where is the bath?', category: 'accommodation', day: 7 },

  // Numbers & Time
  { id: 'ph055', japanese: 'いち、に、さん', romaji: 'ichi, ni, san', english: 'One, two, three', category: 'numbers', day: 2 },
  { id: 'ph056', japanese: 'なんじですか？', romaji: 'nanji desu ka?', english: 'What time is it?', category: 'time', day: 2 },
  { id: 'ph057', japanese: 'ちょっとまってください', romaji: 'chotto matte kudasai', english: 'Please wait a moment', category: 'polite', day: 2 },
  { id: 'ph058', japanese: 'もういちどいってください', romaji: 'mou ichido itte kudasai', english: 'Please say that again', category: 'polite', day: 1 },
  { id: 'ph059', japanese: 'ゆっくりはなしてください', romaji: 'yukkuri hanashite kudasai', english: 'Please speak slowly', category: 'polite', day: 1 },
  { id: 'ph060', japanese: 'かいてもらえますか？', romaji: 'kaite moraemasu ka?', english: 'Could you write it down?', category: 'polite', day: 1 }
];

// --- 7-Day Curriculum --------------------------------------
const CURRICULUM = [
  {
    day: 1,
    title: 'Greetings & Survival Basics',
    titleJp: '挨拶と基本',
    description: 'Master essential greetings, polite expressions, and the phrases you\'ll need in the first hour of arriving in Japan.',
    topics: ['Greetings', 'Thank you / Sorry', 'Basic polite phrases', 'Getting help'],
    phraseIds: ['ph001','ph002','ph003','ph004','ph005','ph006','ph007','ph008','ph009','ph041','ph042','ph058','ph059','ph060'],
    kanaFocus: 'あいうえお (a-row)'
  },
  {
    day: 2,
    title: 'Food & Eating Out',
    titleJp: '食事',
    description: 'Order food confidently, understand menus, handle dietary needs, and enjoy the full Japanese dining experience.',
    topics: ['Restaurant phrases', 'Ordering food', 'Paying the bill', 'Dietary restrictions', 'Numbers 1-10'],
    phraseIds: ['ph010','ph019','ph020','ph021','ph022','ph023','ph024','ph025','ph026','ph055','ph056','ph057'],
    kanaFocus: 'かきくけこ (ka-row)'
  },
  {
    day: 3,
    title: 'Transport & Getting Around',
    titleJp: '交通',
    description: 'Navigate trains, buses, and taxis like a local. Buy tickets, ask for schedules, and find your platform.',
    topics: ['Train system', 'Buying tickets', 'Asking directions', 'Taxis', 'Bus stops'],
    phraseIds: ['ph011','ph012','ph013','ph014','ph015','ph016','ph017','ph018'],
    kanaFocus: 'さしすせそ たちつてと (sa/ta rows)'
  },
  {
    day: 4,
    title: 'Shopping & Money',
    titleJp: '買い物',
    description: 'Shop at markets, convenience stores, and boutiques. Ask prices, negotiate, and handle payments.',
    topics: ['Asking prices', 'Making purchases', 'Payment methods', 'Bargaining politely', 'Requesting items'],
    phraseIds: ['ph027','ph028','ph029','ph030','ph031','ph032','ph033','ph034'],
    kanaFocus: 'なにぬねの はひふへほ (na/ha rows)'
  },
  {
    day: 5,
    title: 'Emergencies & Safety',
    titleJp: '緊急',
    description: 'Handle unexpected situations: medical emergencies, theft, getting lost. Essential safety vocabulary.',
    topics: ['Medical emergencies', 'Calling police', 'Theft & loss', 'Finding hospitals', 'Separate bills'],
    phraseIds: ['ph035','ph036','ph037','ph038','ph039','ph040'],
    kanaFocus: 'まみむめも やゆよ (ma/ya rows)'
  },
  {
    day: 6,
    title: 'Directions & Exploring',
    titleJp: '方向',
    description: 'Explore neighborhoods confidently. Ask for and understand directions, find landmarks and amenities.',
    topics: ['Cardinal directions', 'Landmarks', 'Asking directions', 'Convenience stores', 'Maps'],
    phraseIds: ['ph043','ph044','ph045','ph046','ph047','ph048'],
    kanaFocus: 'らりるれろ わをん (ra/wa rows)'
  },
  {
    day: 7,
    title: 'Accommodation & Longer Stays',
    titleJp: '宿泊',
    description: 'Check in to hotels and ryokan, communicate with staff, and handle everything from futons to room service.',
    topics: ['Hotel check-in', 'Ryokan etiquette', 'Room requests', 'Check-out', 'Passport formalities'],
    phraseIds: ['ph049','ph050','ph051','ph052','ph053','ph054'],
    kanaFocus: 'Full katakana review'
  }
];

// --- City Vocabulary ----------------------------------------
const CITY_VOCAB = {
  tokyo: [
    { japanese: '渋谷', romaji: 'shibuya', english: 'Shibuya', category: 'neighborhood' },
    { japanese: '新宿', romaji: 'shinjuku', english: 'Shinjuku', category: 'neighborhood' },
    { japanese: '浅草', romaji: 'asakusa', english: 'Asakusa', category: 'neighborhood' },
    { japanese: '秋葉原', romaji: 'akihabara', english: 'Akihabara', category: 'neighborhood' },
    { japanese: '原宿', romaji: 'harajuku', english: 'Harajuku', category: 'neighborhood' },
    { japanese: '東京タワー', romaji: 'toukyou tawaa', english: 'Tokyo Tower', category: 'landmark' },
    { japanese: '皇居', romaji: 'koukyо', english: 'Imperial Palace', category: 'landmark' },
    { japanese: '銭湯', romaji: 'sentou', english: 'Public bath', category: 'facility' },
    { japanese: 'ラーメン', romaji: 'raamen', english: 'Ramen', category: 'food' },
    { japanese: 'もんじゃ焼き', romaji: 'monjayaki', english: 'Monja-yaki (Tokyo pancake)', category: 'food' },
    { japanese: '山手線', romaji: 'yamanotesen', english: 'Yamanote Line', category: 'transport' },
    { japanese: 'コンビニ', romaji: 'konbini', english: 'Convenience store', category: 'facility' }
  ],
  osaka: [
    { japanese: '道頓堀', romaji: 'doutombori', english: 'Dotonbori', category: 'neighborhood' },
    { japanese: '心斎橋', romaji: 'shinsaibashi', english: 'Shinsaibashi', category: 'neighborhood' },
    { japanese: '梅田', romaji: 'umeda', english: 'Umeda', category: 'neighborhood' },
    { japanese: '大阪城', romaji: 'oosakajou', english: 'Osaka Castle', category: 'landmark' },
    { japanese: 'たこ焼き', romaji: 'takoyaki', english: 'Takoyaki (octopus balls)', category: 'food' },
    { japanese: 'お好み焼き', romaji: 'okonomiyaki', english: 'Okonomiyaki', category: 'food' },
    { japanese: '串カツ', romaji: 'kushikatsu', english: 'Kushikatsu (skewered fried food)', category: 'food' },
    { japanese: '天神橋筋', romaji: 'tenjinbashisuji', english: 'Tenjinbashisuji Shopping Street', category: 'neighborhood' },
    { japanese: 'なんば', romaji: 'namba', english: 'Namba', category: 'neighborhood' },
    { japanese: 'ユニバーサル', romaji: 'yunibaaasaru', english: 'Universal Studios Japan', category: 'landmark' },
    { japanese: '商人', romaji: 'shounin', english: 'Merchant', category: 'culture' },
    { japanese: '食い倒れ', romaji: 'kuidaore', english: 'Eat until you drop (Osaka motto)', category: 'culture' }
  ],
  kyoto: [
    { japanese: '金閣寺', romaji: 'kinkakuji', english: 'Golden Pavilion', category: 'landmark' },
    { japanese: '清水寺', romaji: 'kiyomizudera', english: 'Kiyomizudera Temple', category: 'landmark' },
    { japanese: '嵐山', romaji: 'arashiyama', english: 'Arashiyama (bamboo grove)', category: 'neighborhood' },
    { japanese: '伏見稲荷', romaji: 'fushimiinari', english: 'Fushimi Inari Shrine', category: 'landmark' },
    { japanese: '祇園', romaji: 'gion', english: 'Gion (geisha district)', category: 'neighborhood' },
    { japanese: '抹茶', romaji: 'maccha', english: 'Matcha (powdered green tea)', category: 'food' },
    { japanese: '湯豆腐', romaji: 'yudoufu', english: 'Hot tofu (Kyoto specialty)', category: 'food' },
    { japanese: '着物', romaji: 'kimono', english: 'Kimono', category: 'culture' },
    { japanese: '舞妓', romaji: 'maiko', english: 'Maiko (apprentice geisha)', category: 'culture' },
    { japanese: '西陣織', romaji: 'nishijinori', english: 'Nishijin Weaving', category: 'culture' },
    { japanese: '二条城', romaji: 'nijoujo', english: 'Nijo Castle', category: 'landmark' },
    { japanese: '錦市場', romaji: 'nishikiichiba', english: 'Nishiki Market', category: 'facility' }
  ]
};

// --- Flashcard Categories (for deck selection) -------------
const DECK_CATEGORIES = [
  { id: 'hiragana',  label: 'ひらがな Hiragana', count: HIRAGANA.length },
  { id: 'katakana',  label: 'カタカナ Katakana', count: KATAKANA.length },
  { id: 'greetings', label: '挨拶 Greetings',    count: PHRASES.filter(p => p.category === 'greetings').length },
  { id: 'transport', label: '交通 Transport',     count: PHRASES.filter(p => p.category === 'transport').length },
  { id: 'food',      label: '食事 Food',          count: PHRASES.filter(p => p.category === 'food').length },
  { id: 'shopping',  label: '買い物 Shopping',    count: PHRASES.filter(p => p.category === 'shopping').length },
  { id: 'emergency', label: '緊急 Emergency',     count: PHRASES.filter(p => p.category === 'emergency').length },
  { id: 'directions',label: '方向 Directions',    count: PHRASES.filter(p => p.category === 'directions').length },
  { id: 'all',       label: 'すべて All Phrases', count: PHRASES.length }
];

// --- Phrase categories (for filtering in Reference view) ---
const PHRASE_CATEGORIES = [...new Set(PHRASES.map(p => p.category))];

// --- SM-2 Card Factory -------------------------------------
// Creates an SM-2 compatible card from any item.
// Card structure stored in localStorage under key 'jptrainer_cards'
function createCard(id, type) {
  return {
    id,
    type, // 'hiragana' | 'katakana' | 'phrase'
    interval: 0,       // days until next review
    repetitions: 0,    // number of successful reviews
    easeFactor: 2.5,   // SM-2 ease factor (starts at 2.5)
    nextReview: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    lastReview: null,
    totalReviews: 0,
    correctReviews: 0
  };
}
