"use strict";

const rulesView = document.querySelector("#rulesView");
const homeView = document.querySelector("#homeView");
const timerView = document.querySelector("#timerView");
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
const timerBackgroundLayers = [...document.querySelectorAll(".timer-background-image")];

const HERITAGE_IMAGE_POSITIONS = new Map([
  [2, "50% 42%"], [3, "50% 50%"], [4, "50% 32%"], [7, "50% 42%"],
  [8, "50% 50%"], [9, "50% 50%"], [10, "50% 45%"], [14, "50% 48%"],
  [15, "50% 50%"], [23, "50% 50%"], [24, "50% 50%"], [25, "50% 52%"],
  [34, "50% 44%"], [38, "50% 50%"], [42, "50% 50%"], [48, "50% 38%"],
  [63, "50% 50%"], [72, "50% 50%"], [77, "50% 44%"], [78, "50% 50%"],
  [96, "50% 44%"], [98, "50% 48%"],
]);

let board = null;
let currentHeritage = null;
let stage = 0;
let quizBoxWidth = 0;
let imageRequest = 0;
let imageTimer = 0;
let currentImage = 0;
let activeLayer = 0;
let countdownTimer = 0;
let countdownTarget = null;
let timerImageTimer = 0;
let timerImageRequest = 0;
let timerImageIndex = 0;
let activeTimerLayer = 0;

function showOnly(view) {
  [rulesView, homeView, timerView, gameView].forEach((item) => { item.hidden = item !== view; });
}

function tokyoParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function targetFromTokyoTime(value) {
  const [hour, minute, second = 0] = value.split(":").map(Number);
  const now = new Date();
  const today = tokyoParts(now);
  let target = new Date(Date.UTC(Number(today.year), Number(today.month) - 1, Number(today.day), hour - 9, minute, second));
  if (target <= now) target = new Date(target.getTime() + 24 * 60 * 60 * 1000);
  return target;
}

function updateCountdown() {
  const remaining = countdownTarget - new Date();
  if (remaining <= 0) {
    clearInterval(countdownTimer);
    clearInterval(timerImageTimer);
    document.querySelector("#countdownText").textContent = "00:00";
    showOnly(rulesView);
    return;
  }
  const totalSeconds = Math.ceil(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  document.querySelector("#countdownText").textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function setTimerBackground(url, immediate = false) {
  const nextLayer = immediate ? activeTimerLayer : 1 - activeTimerLayer;
  const layer = timerBackgroundLayers[nextLayer];
  layer.classList.remove("is-active");
  layer.src = url;
  const reveal = () => {
    if (!immediate) timerBackgroundLayers[activeTimerLayer].classList.remove("is-active");
    layer.classList.add("is-active");
    activeTimerLayer = nextLayer;
  };
  layer.complete ? requestAnimationFrame(reveal) : layer.addEventListener("load", reveal, { once: true });
}

async function startTimerBackground() {
  const requestId = ++timerImageRequest;
  clearInterval(timerImageTimer);
  const featuredNumbers = [24, 2, 77, 23, 8];
  const featured = featuredNumbers.map((number) => window.WORLD_HERITAGES.find((item) => item.number === number));
  const results = await Promise.allSettled(featured.map(fetchHeritageImages));
  if (requestId !== timerImageRequest || timerView.hidden) return;
  const urls = results.flatMap((result) => result.status === "fulfilled" ? result.value.images.slice(0, 1).map((image) => image.url) : []);
  if (!urls.length) return;
  timerImageIndex = 0;
  setTimerBackground(urls[0], true);
  if (urls.length > 1) {
    timerImageTimer = window.setInterval(() => {
      timerImageIndex = (timerImageIndex + 1) % urls.length;
      setTimerBackground(urls[timerImageIndex]);
    }, 5000);
  }
}

function showTimer() {
  const input = document.querySelector("#startTimeInput");
  if (!input.value) { input.focus(); return; }
  countdownTarget = targetFromTokyoTime(input.value);
  document.querySelector("#startTimeText").textContent = input.value;
  showOnly(timerView);
  clearInterval(countdownTimer);
  updateCountdown();
  countdownTimer = window.setInterval(updateCountdown, 1000);
  startTimerBackground();
}

function showGame() {
  showOnly(gameView);
  board ??= window.BingoApp.initializeBoard(document, {
    specialNumbers: window.WORLD_HERITAGES,
    onNumberAdded: (_number, heritage) => heritage ? showHeritage(heritage) : clearHeritage(),
    onAllCleared: clearHeritage,
  });
  document.querySelector("#numberInput").focus();
}

function clearHeritage() {
  currentHeritage = null;
  stage = 0;
  imageRequest += 1;
  clearInterval(imageTimer);
  heritageCard.hidden = true;
  heritageEmpty.hidden = false;
  quizBox.hidden = true;
  quizBoxWidth = 0;
  quizBox.style.width = "";
  heritageCard.classList.remove("show-quiz", "show-answer", "is-entering", "image-unavailable");
  imageLayers.forEach((layer) => {
    layer.classList.remove("is-active");
    layer.removeAttribute("src");
  });
  imageCredit.removeAttribute("href");
}

function preloadImages(images) {
  return Promise.all(images.map((item) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(item);
    image.onerror = () => resolve(null);
    image.src = item.url;
  }))).then((results) => results.filter(Boolean));
}

async function fetchHeritageImages(heritage) {
  return { images: window.HERITAGE_IMAGES?.[heritage.number] || [] };
}

function setImage(item, heritage, immediate = false) {
  const nextLayer = immediate ? activeLayer : 1 - activeLayer;
  const layer = imageLayers[nextLayer];
  layer.classList.remove("is-active");
  layer.src = item.url;
  layer.alt = `${heritage.name}の写真`;
  layer.style.objectPosition = HERITAGE_IMAGE_POSITIONS.get(heritage.number) || "50% 50%";
  imageCredit.href = item.source;
  const reveal = () => {
    if (!immediate) imageLayers[activeLayer].classList.remove("is-active");
    layer.classList.add("is-active");
    activeLayer = nextLayer;
    if (immediate) heritageCard.classList.add("is-entering");
  };
  layer.complete ? requestAnimationFrame(reveal) : layer.addEventListener("load", reveal, { once: true });
}

async function startImageShow(heritage, requestId) {
  clearInterval(imageTimer);
  try {
    const result = await fetchHeritageImages(heritage);
    if (requestId !== imageRequest || !result.images.length) throw new Error();
    const loadedImages = await preloadImages(result.images);
    if (requestId !== imageRequest || !loadedImages.length) throw new Error();
    heritageCard.classList.remove("image-unavailable");
    currentImage = 0;
    setImage(loadedImages[0], heritage, true);
    if (loadedImages.length > 1) {
      imageTimer = window.setInterval(() => {
        currentImage = (currentImage + 1) % loadedImages.length;
        setImage(loadedImages[currentImage], heritage);
      }, 5000);
    }
  } catch {
    if (requestId !== imageRequest) return;
    heritageCard.classList.add("image-unavailable");
    heritageCard.classList.add("is-entering");
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
  requestAnimationFrame(fitHeritageName);
  quizBox.hidden = true;
  quizBoxWidth = 0;
  quizBox.style.width = "";
  advanceHint.textContent = "画面をクリック、またはキーを押してクイズを表示";
  heritageCard.classList.remove("show-quiz", "show-answer", "is-entering");
  void heritageCard.offsetWidth;
  imageLayers.forEach((layer) => { layer.classList.remove("is-active"); layer.removeAttribute("src"); });
  activeLayer = 0;
  startImageShow(heritage, ++imageRequest);
}

function fitHeritageName() {
  const availableWidth = heritageName.clientWidth;
  if (!availableWidth) return;

  heritageName.style.fontSize = "";
  const defaultSize = Number.parseFloat(getComputedStyle(heritageName).fontSize);
  if (heritageName.scrollWidth <= availableWidth) return;

  const fittedSize = Math.max(24, Math.floor(defaultSize * availableWidth / heritageName.scrollWidth));
  heritageName.style.fontSize = `${fittedSize}px`;
}

function fitQuizLines() {
  const availableWidth = quizText.clientWidth;
  if (!availableWidth) return;

  quizText.querySelectorAll(".quiz-line").forEach((line) => {
    line.style.fontSize = "";
    const defaultSize = Number.parseFloat(getComputedStyle(line).fontSize);
    if (line.scrollWidth <= availableWidth) return;

    const fittedSize = Math.max(16, Math.floor(defaultSize * availableWidth / line.scrollWidth));
    line.style.fontSize = `${fittedSize}px`;
  });
}

function renderQuizText(value) {
  const lines = String(value).split("\n").filter(Boolean);
  const elements = lines.map((text, index) => {
    const line = document.createElement("span");
    line.className = `quiz-line${index === 0 ? " quiz-line--question" : ""}`;
    line.textContent = text;
    return line;
  });
  quizText.replaceChildren(...elements);
  fitQuizLines();
}

function lockQuizBoxWidth() {
  quizBox.style.width = "";
  fitQuizLines();
  quizBoxWidth = Math.ceil(quizBox.getBoundingClientRect().width);
  quizBox.style.width = `${quizBoxWidth}px`;
}

function advanceHeritage() {
  if (!currentHeritage || gameView.hidden || stage >= 2) return;
  stage = Math.min(stage + 1, 2);
  quizBox.hidden = false;
  quizBox.classList.remove("animate-in");
  void quizBox.offsetWidth;
  quizBox.classList.add("animate-in");
  if (stage === 1) {
    quizLabel.textContent = "QUIZ";
    renderQuizText(currentHeritage.quiz || "クイズは準備中です");
    lockQuizBoxWidth();
    advanceHint.textContent = "もう一度操作して答えを表示";
    heritageCard.classList.add("show-quiz");
    heritageCard.classList.remove("show-answer");
  } else {
    quizLabel.textContent = "ANSWER";
    renderQuizText(currentHeritage.answer || "答えは準備中です");
    advanceHint.textContent = "";
    heritageCard.classList.add("show-answer");
  }
}

window.addEventListener("resize", () => requestAnimationFrame(() => {
  fitHeritageName();
  if (stage === 1) lockQuizBoxWidth();
  else fitQuizLines();
}));

heritagePanel.addEventListener("click", (event) => { if (!event.target.closest("a")) advanceHeritage(); });
document.addEventListener("keydown", (event) => {
  if (!gameView.hidden && !event.target.matches("input, button")) advanceHeritage();
});
document.querySelector("#openRules").addEventListener("click", () => showOnly(rulesView));
document.querySelector("#openTimer").addEventListener("click", showTimer);
document.querySelector("#timerStartGame").addEventListener("click", () => {
  clearInterval(countdownTimer);
  clearInterval(timerImageTimer);
  timerImageRequest += 1;
  showOnly(rulesView);
});
document.querySelector("#startGame").addEventListener("click", showGame);

{
  const later = new Date(Date.now() + 10 * 60 * 1000);
  const parts = tokyoParts(later);
  document.querySelector("#startTimeInput").value = `${parts.hour}:${parts.minute}:00`;
}

document.querySelector("#rulesImage").src = window.HERITAGE_IMAGES?.[24]?.[0]?.url || "";
