import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const source = await fs.readFile(path.join(root, "heritages.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const allHeritages = context.window.WORLD_HERITAGES;
const requestedNumbers = process.argv.slice(2).map(Number).filter(Number.isFinite);
const heritages = requestedNumbers.length
  ? allHeritages.filter((heritage) => requestedNumbers.includes(heritage.number))
  : allHeritages;

const outputRoot = path.join(root, "pictures");
const rejectPattern = /(\b(map|karte|locator|location.?map|site.?plan|floor.?plan|diagram|chart|mapa|topograph|boundary|boundaries|route|relief.?map|atlas|sketch|drawing|road|street|highway|path|trail|parking|station|airport|sign|signboard|construction|scaffold|restoration|model|miniature|replica|souvenir|museum|restaurant|cafe|shop|lodge|cabin|lobby|veranda|survey|manuscript|record|bequest|politician|visit|painting|artwork|interchange|service.?counter|railway|train|aircraft|airplane|ferry|vehicle|police|water.?tap|padlocks?|barge|covid|mask|caution|information.?center|sterilization|memorial.?plaque|inscription|people|menschen|details?|close.?ups?|pillars?|stairs?|doors?|interiors?|kitchens?|rooms?|sculptures?|cemetery|bus|boats?|llama|candles?|votive|sheep|hotel|office|campus|housing)\b|地図|位置図|案内図|配置図|平面図|路線図|道路|街路|参道|遊歩道|登山道|駐車場|駅前|空港|案内板|標識|看板|工事|修復中|模型|レプリカ|博物館|飲食店|売店|訪問|絵画|古文書|鉄道|列車|飛行機|フェリー|人物|室内|墓地)/i;

const heritageRejectPatterns = new Map([
  [2, /(richensa|figures|statue|nave)/i],
  [3, /(berann|fort yellowstone)/i],
  [7, /(murillo|pajarito|porto alegre|espelmes|house|march 2015-10a|columns|cripta|crypt|ceiling|sketch)/i],
  [8, /(passerelle|pont-|chapelle|water|police|sheeps|gezicht|fassade giebel)/i],
  [10, /(optique|gezich|padlock|barge)/i],
  [15, /(yellowstone|horse.?shoe|railway)/i],
  [24, /llama/i],
  [38, /(kitchen|room|sculpture|chapel)/i],
  [48, /(ships|animals|monsters|capital|bell|wall)/i],
  [63, /(interior|entrance)/i],
  [72, /(suginoya|beach|lighthouse)/i],
  [96, /(cemetery|ladies|wedding)/i],
  [98, /(ibaraki|daigo|horyujimae|kotsu|covid|mask|caution|information.?center|treasures|天蓋|金堂所在)/i],
]);

const requiredPatterns = new Map([
  [98, /(horyu|法隆寺)/i],
  [72, /(yakushima|屋久島).*(forest|sugi|cedar|moss)|(forest|sugi|cedar|moss).*(yakushima|屋久島)/i],
  [38, /versailles/i],
  [42, /(hashima|gunkanjima|軍艦島|端島)/i],
  [48, /pisa/i],
  [78, /(bamiyan|bamyan).*(buddha|niche|valley|landscape|archaeological)|(buddha|niche|valley|landscape|archaeological).*(bamiyan|bamyan)/i],
  [34, /(red square|kremlin|кремл)/i],
  [14, /(colosseum|colosseo)/i],
  [2, /(cologne cathedral|kölner dom|koelner dom)/i],
  [7, /sagrada fam[ií]lia/i],
  [10, /(seine|セーヌ)/i],
  [77, /(mount fuji|富士山)/i],
  [24, /machu picchu/i],
  [15, /grand canyon/i],
  [96, /(kiyomizu|清水寺)/i],
  [4, /statue of liberty/i],
  [3, /yellowstone/i],
  [9, /(alberobello|trulli)/i],
  [8, /mont[ -]saint[ -]michel/i],
  [63, /(itsukushima|miyajima|厳島)/i],
  [23, /(iguazu|iguassu|iguaçu|cataratas)/i],
  [25, /(giza|ギザ).*(pyramid|sphinx)|(pyramid|sphinx).*(giza|ギザ)/i],
]);

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ");
}

function suitable(page, heritage) {
  const info = page.imageinfo?.[0];
  if (!info || info.mime !== "image/jpeg" || info.width < 2400 || info.height < 1350) return false;
  const ratio = info.width / info.height;
  if (ratio < 1.25 || ratio > 2.4) return false;
  const metadata = info.extmetadata || {};
  const searchable = [
    page.title,
    info.url,
    metadata.ObjectName?.value,
    metadata.ImageDescription?.value,
    metadata.Categories?.value,
  ].map(stripHtml).join(" ");
  const heritageReject = heritageRejectPatterns.get(heritage.number);
  return !rejectPattern.test(searchable)
    && !heritageReject?.test(page.title || "")
    && requiredPatterns.get(heritage.number)?.test(page.title || "");
}

async function search(query, offset) {
  const parameters = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "50",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1920",
    format: "json",
    origin: "*",
  });
  if (offset) parameters.set("gsroffset", String(offset));
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await wait(1200);
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${parameters}`, {
      headers: { "User-Agent": "WorldHeritageBingo/1.0 (GitHub Pages educational project)" },
    });
    if (response.ok) {
      const json = await response.json();
      return Object.values(json.query?.pages || {});
    }
    if (response.status !== 429) throw new Error(`Wikimedia API: ${response.status}`);
    const retryAfter = Number(response.headers.get("retry-after")) || 15;
    await wait(retryAfter * 1000);
  }
  throw new Error("Wikimedia API: retry limit reached");
}

async function download(url, destination) {
  const response = await fetch(url, {
    headers: { "User-Agent": "WorldHeritageBingo/1.0 (GitHub Pages educational project)" },
  });
  if (!response.ok) throw new Error(`Image download: ${response.status}`);
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

await fs.mkdir(outputRoot, { recursive: true });
const manifestContext = { window: {} };
try {
  vm.runInNewContext(await fs.readFile(path.join(outputRoot, "manifest.js"), "utf8"), manifestContext);
} catch {}
const manifest = manifestContext.window.HERITAGE_IMAGES || {};
let credits = [];
try {
  credits = JSON.parse(await fs.readFile(path.join(outputRoot, "credits.json"), "utf8"));
} catch {}
const refreshedNumbers = new Set(heritages.map((heritage) => heritage.number));
credits = credits.filter((credit) => !refreshedNumbers.has(credit.number));

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

for (const heritage of heritages) {
  const candidates = new Map();
  const queries = [heritage.imageQuery, heritage.name].filter(Boolean);
  for (const query of queries) {
    for (const offset of [0, 50, 100, 150, 200, 250, 300, 350, 400, 450]) {
      const pages = await search(query, offset);
      for (const page of pages) {
        if (suitable(page, heritage)) candidates.set(page.title, page);
      }
      if (candidates.size >= 10) break;
    }
    if (candidates.size >= 10) break;
  }
  const selected = [...candidates.values()].slice(0, 10);
  if (selected.length < 10) throw new Error(`${heritage.number} ${heritage.name}: suitable images ${selected.length}/10`);

  const folderName = String(heritage.number).padStart(3, "0");
  const folder = path.join(outputRoot, folderName);
  await fs.mkdir(folder, { recursive: true });
  manifest[heritage.number] = [];

  for (const [index, page] of selected.entries()) {
    const info = page.imageinfo[0];
    const fileName = `${String(index + 1).padStart(2, "0")}.jpg`;
    const relativePath = `pictures/${folderName}/${fileName}`;
    await download(info.thumburl || info.url, path.join(folder, fileName));
    const sourceUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replaceAll(" ", "_"))}`;
    manifest[heritage.number].push({ url: relativePath, source: sourceUrl });
    credits.push({
      number: heritage.number,
      heritage: heritage.name,
      file: relativePath,
      title: page.title,
      source: sourceUrl,
      creator: stripHtml(info.extmetadata?.Artist?.value || ""),
      license: stripHtml(info.extmetadata?.LicenseShortName?.value || info.extmetadata?.UsageTerms?.value || ""),
    });
  }
  process.stdout.write(`${heritage.number} ${heritage.name}: 10 images\n`);
}

await fs.writeFile(
  path.join(outputRoot, "manifest.js"),
  `"use strict";\nwindow.HERITAGE_IMAGES = ${JSON.stringify(manifest, null, 2)};\n`,
  "utf8",
);
await fs.writeFile(path.join(outputRoot, "credits.json"), `${JSON.stringify(credits, null, 2)}\n`, "utf8");
