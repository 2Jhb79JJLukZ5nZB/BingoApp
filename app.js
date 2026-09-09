"use strict";

const rulesView = document.querySelector("#rulesView");
const homeView = document.querySelector("#homeView");
const gameView = document.querySelector("#gameView");
const heritagePanel = document.querySelector("#heritagePanel");
const heritageEmpty = document.querySelector("#heritageEmpty");
const heritageCard = document.querySelector("#heritageCard");
const imageLayers = [...document.querySelectorAll(".heritage-image")];
const heritageRank = document.querySelector("#heritageRank");
const heritageName = document.querySelector("#heritageName");
const quizBox = document.querySelector("#quizBox");
const quizLabel = document.querySelector("#quizLabel");
const quizText = document.querySelector("#quizText");
const advanceHint = document.querySelector("#advanceHint");
const imageCredit = document.querySelector("#imageCredit");

let board = null;
let currentHeritage = null;
let stage = 0;
let imageRequest = 0;
let imageTimer = 0;
let currentImage = 0;
let activeLayer = 0;

function showOnly(view) {
  [rulesView, homeView, gameView].forEach((item) => { item.hidden = item !== view; });
}

function showGame() {
  showOnly(gameView);
  board ??= window.BingoApp.initializeBoard(document, {
    specialNumbers: window.WORLD_HERITAGES,
    onNumberAdded: (_number, heritage) => heritage && showHeritage(heritage),
  });
  document.querySelector("#numberInput").focus();
}

function imageSearchUrl(query) {
  const parameters = new URLSearchParams({
    action: "query", generator: "search", gsrsearch: query, gsrnamespace: "6", gsrlimit: "12",
    prop: "imageinfo", iiprop: "url", iiurlwidth: "1920", format: "json", origin: "*",
  });
  return `https://commons.wikimedia.org/w/api.php?${parameters}`;
}

async function fetchHeritageImages(heritage) {
  const title = encodeURIComponent(heritage.wikipedia);
  const [summaryResult, commonsResult] = await Promise.allSettled([
    fetch(`https://ja.wikipedia.org/api/rest_v1/page/summary/${title}`).then((response) => response.ok ? response.json() : Promise.reject()),
    fetch(imageSearchUrl(heritage.name)).then((response) => response.ok ? response.json() : Promise.reject()),
  ]);
  const summary = summaryResult.status === "fulfilled" ? summaryResult.value : null;
  const urls = [];
  if (summary?.originalimage?.source) urls.push(summary.originalimage.source);
  const pages = commonsResult.status === "fulfilled" ? Object.values(commonsResult.value.query?.pages || {}) : [];
  pages.forEach((page) => {
    const info = page.imageinfo?.[0];
    const url = info?.thumburl || info?.url;
    if (url && /\.(jpe?g|png|webp)(\?|$)/i.test(url) && !urls.includes(url)) urls.push(url);
  });
  return { urls: urls.slice(0, 5), credit: summary?.content_urls?.desktop?.page || `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(heritage.name)}&title=Special:MediaSearch&type=image` };
}

function setImage(url, heritage, immediate = false) {
  const nextLayer = immediate ? activeLayer : 1 - activeLayer;
  const layer = imageLayers[nextLayer];
  layer.classList.remove("is-active");
  layer.src = url;
  layer.alt = `${heritage.name}の写真`;
  const reveal = () => {
    if (!immediate) imageLayers[activeLayer].classList.remove("is-active");
    layer.classList.add("is-active");
    activeLayer = nextLayer;
  };
  layer.complete ? requestAnimationFrame(reveal) : layer.addEventListener("load", reveal, { once: true });
}

async function startImageShow(heritage, requestId) {
  clearInterval(imageTimer);
  try {
    const result = await fetchHeritageImages(heritage);
    if (requestId !== imageRequest || !result.urls.length) throw new Error();
    heritageCard.classList.remove("image-unavailable");
    imageCredit.href = result.credit;
    currentImage = 0;
    setImage(result.urls[0], heritage, true);
    if (result.urls.length > 1) {
      imageTimer = window.setInterval(() => {
        currentImage = (currentImage + 1) % result.urls.length;
        setImage(result.urls[currentImage], heritage);
      }, 5000);
    }
  } catch {
    if (requestId !== imageRequest) return;
    heritageCard.classList.add("image-unavailable");
    imageCredit.href = `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(heritage.name)}&title=Special:MediaSearch&type=image`;
  }
}

function showHeritage(heritage) {
  currentHeritage = heritage;
  stage = 0;
  heritageEmpty.hidden = true;
  heritageCard.hidden = false;
  heritageRank.textContent = `人気ランキング ${heritage.number}位`;
  heritageName.textContent = heritage.name;
  quizBox.hidden = true;
  advanceHint.textContent = "画面をクリック、またはキーを押してクイズを表示";
  heritageCard.classList.remove("show-quiz", "show-answer", "is-entering");
  void heritageCard.offsetWidth;
  heritageCard.classList.add("is-entering");
  imageLayers.forEach((layer) => { layer.classList.remove("is-active"); layer.removeAttribute("src"); });
  activeLayer = 0;
  startImageShow(heritage, ++imageRequest);
}

function advanceHeritage() {
  if (!currentHeritage || gameView.hidden) return;
  stage = Math.min(stage + 1, 2);
  quizBox.hidden = false;
  quizBox.classList.remove("animate-in");
  void quizBox.offsetWidth;
  quizBox.classList.add("animate-in");
  if (stage === 1) {
    quizLabel.textContent = "QUIZ";
    quizText.textContent = currentHeritage.quiz || "クイズは準備中です";
    advanceHint.textContent = "もう一度操作して答えを表示";
    heritageCard.classList.add("show-quiz");
    heritageCard.classList.remove("show-answer");
  } else {
    quizLabel.textContent = "ANSWER";
    quizText.textContent = currentHeritage.answer || "答えは準備中です";
    advanceHint.textContent = "";
    heritageCard.classList.add("show-answer");
  }
}

heritagePanel.addEventListener("click", (event) => { if (!event.target.closest("a")) advanceHeritage(); });
document.addEventListener("keydown", (event) => {
  if (!gameView.hidden && !event.target.matches("input, button")) advanceHeritage();
});
document.querySelector("#openMenu").addEventListener("click", () => showOnly(homeView));
document.querySelector("#openGame").addEventListener("click", showGame);

fetch(`https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent("マチュ・ピチュ")}`)
  .then((response) => response.json()).then((data) => { document.querySelector("#rulesImage").src = data.originalimage?.source || data.thumbnail?.source || ""; })
  .catch(() => {});
