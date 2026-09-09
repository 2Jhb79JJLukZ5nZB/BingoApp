"use strict";

window.WORLD_HERITAGES = [
  {
    number: 98, name: "法隆寺", wikipedia: "法隆寺", imageQuery: "intitle:Horyuji OR intitle:\"Horyu-ji\"",
    quiz: "法隆寺がある都道府県はどこ？\n① 京都府\n② 奈良県\n③ 大阪府", answer: "② 奈良県",
  },
  {
    number: 72, name: "屋久島", wikipedia: "屋久島", imageQuery: "intitle:Yakushima",
    quiz: "屋久島の森が舞台のモデルの一つになったとされる映画は？\n① 『もののけ姫』\n② 『となりのトトロ』\n③ 『千と千尋の神隠し』", answer: "① 『もののけ姫』",
  },
  {
    number: 38, name: "ヴェルサイユ宮殿", wikipedia: "ヴェルサイユ宮殿", imageQuery: "intitle:Versailles palace",
    quiz: "ヴェルサイユ宮殿を大規模に造営したフランス国王は？\n① ルイ14世\n② ナポレオン1世\n③ シャルル10世", answer: "① ルイ14世",
  },
  {
    number: 42, name: "軍艦島", wikipedia: "端島 (長崎県)", imageQuery: "intitle:Hashima island",
    quiz: "軍艦島でかつて採掘されていたものは？\n① 鉄鉱石\n② 石炭\n③ 金", answer: "② 石炭",
  },
  {
    number: 48, name: "ピサの斜塔", wikipedia: "ピサの斜塔", imageQuery: "intitle:\"Leaning Tower of Pisa\"",
    quiz: "ピサの斜塔が傾いている主な理由は？\n① 建設中に強い風が吹いたから\n② 地盤が軟弱だったから\n③ 建設後に地震で傾いたから", answer: "② 地盤が軟弱だったから",
  },
  {
    number: 78, name: "バーミヤン渓谷の文化的景観と古代遺跡群", wikipedia: "バーミヤン渓谷の文化的景観と古代遺跡群", imageQuery: "intitle:Bamiyan OR intitle:Bamyan",
    quiz: "バーミヤン遺跡を象徴する彫刻は何？\n① 仏像\n② キリスト像\n③ ファラオ像", answer: "① 仏像",
  },
  {
    number: 34, name: "モスクワのクレムリンと赤の広場", wikipedia: "赤の広場", imageQuery: "intitle:\"Red Square\" Moscow OR intitle:Kremlin Moscow",
    quiz: "「赤の広場」の「赤」という名前の由来は？\n① 多くの建造物が赤色だったこと\n② 「美しい」という意味を持つ古いロシア語\n③ 赤い花がたくさん咲いていたこと", answer: "② 「美しい」という意味を持つ古いロシア語",
  },
  {
    number: 14, name: "コロッセオ", wikipedia: "コロッセオ", imageQuery: "intitle:Colosseum Rome",
    quiz: "古代ローマ時代、コロッセオで主に行われたものは？\n① 剣闘士の試合\n② 国王の戴冠式\n③ オリンピック", answer: "① 剣闘士の試合",
  },
  {
    number: 2, name: "ケルン大聖堂", wikipedia: "ケルン大聖堂", imageQuery: "intitle:\"Cologne Cathedral\"",
    quiz: "ケルン大聖堂がある国は？\n① フランス\n② ドイツ\n③ イタリア", answer: "② ドイツ",
  },
  {
    number: 7, name: "サグラダ・ファミリア", wikipedia: "サグラダ・ファミリア", imageQuery: "intitle:\"Sagrada Familia\" Barcelona facade",
    quiz: "サグラダ・ファミリアの設計で知られる建築家は？\n① ル・コルビュジエ\n② アントニ・ガウディ\n③ フランク・ロイド・ライト", answer: "② アントニ・ガウディ",
  },
  {
    number: 10, name: "パリのセーヌ河岸", wikipedia: "パリのセーヌ河岸", imageQuery: "intitle:Seine Paris",
    quiz: "パリのセーヌ河岸にあるエッフェル塔の現在の高さは？\n① 約230m\n② 約330m\n③ 約430m", answer: "② 約330m",
  },
  {
    number: 77, name: "富士山", wikipedia: "富士山", imageQuery: "intitle:\"Mount Fuji\"",
    quiz: "富士山がまたがっている2つの県は？\n① 山梨県と静岡県\n② 長野県と岐阜県\n③ 静岡県と愛知県", answer: "① 山梨県と静岡県",
  },
  {
    number: 24, name: "マチュ・ピチュ", wikipedia: "マチュ・ピチュ", imageQuery: "intitle:\"Machu Picchu\"",
    quiz: "マチュ・ピチュを築いた文明は？\n① マヤ文明\n② インカ文明\n③ エジプト文明", answer: "② インカ文明",
  },
  {
    number: 15, name: "グランド・キャニオン国立公園", wikipedia: "グランド・キャニオン国立公園", imageQuery: "intitle:\"Grand Canyon\"",
    quiz: "グランド・キャニオンが現在のような深い谷になった主な理由は？\n① 川の流れによって岩が削られたから\n② 火山が噴火したから\n③ 隕石が衝突したから", answer: "① 川の流れによって岩が削られたから",
  },
  {
    number: 96, name: "清水寺", wikipedia: "清水寺", imageQuery: "intitle:Kiyomizu-dera",
    quiz: "清水寺がある都市は？\n① 奈良市\n② 京都市\n③ 鎌倉市", answer: "② 京都市",
  },
  {
    number: 4, name: "自由の女神", wikipedia: "自由の女神像 (ニューヨーク)", imageQuery: "intitle:\"Statue of Liberty\"",
    quiz: "自由の女神像の、地面からたいまつの先端までの高さは約何m？\n① 約46m\n② 約63m\n③ 約93m", answer: "③ 約93m",
  },
  {
    number: 3, name: "イエローストーン国立公園", wikipedia: "イエローストーン国立公園", imageQuery: "intitle:Yellowstone",
    quiz: "イエローストーン国立公園が世界で初めて指定されたものは？\n① 国立公園\n② 世界遺産\n③ 自然保護区", answer: "① 国立公園",
  },
  {
    number: 9, name: "アルベロベッロのトゥルッリ", wikipedia: "アルベロベッロ", imageQuery: "intitle:Alberobello trulli",
    quiz: "トゥルッリは主に何を使って造られているでしょう？\n① 石\n② 木材\n③ レンガ", answer: "① 石",
  },
  {
    number: 8, name: "モン・サン・ミッシェル", wikipedia: "モン・サン＝ミシェル", imageQuery: "intitle:\"Mont Saint-Michel\"",
    quiz: "モン・サン・ミッシェルの頂上付近に建てられているものは何？\n① 王宮\n② 修道院\n③ 天文台", answer: "② 修道院",
  },
  {
    number: 63, name: "厳島神社", wikipedia: "厳島神社", imageQuery: "intitle:\"Itsukushima Shrine\" Miyajima",
    quiz: "厳島神社の大鳥居は満潮時にどのように見える？\n① 森の中に立って見える\n② 海に浮かんで見える\n③ 山頂に立って見える", answer: "② 海に浮かんで見える",
  },
  {
    number: 23, name: "イグアスの滝", wikipedia: "イグアスの滝", imageQuery: "intitle:Iguazu falls OR intitle:Iguaçu falls",
    quiz: "イグアスの滝がまたがる2つの国は？\n① ブラジルとアルゼンチン\n② ペルーとボリビア\n③ チリとアルゼンチン", answer: "① ブラジルとアルゼンチン",
  },
  {
    number: 25, name: "ギザのピラミッド", wikipedia: "メンフィスとその墓地遺跡", imageQuery: "intitle:Giza pyramid",
    quiz: "ギザの大ピラミッドは、およそ何年前に造られた？\n① 約1,500年前\n② 約3,000年前\n③ 約4,500年前", answer: "③ 約4,500年前",
  },
];
