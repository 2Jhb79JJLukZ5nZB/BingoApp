"use strict";

const homeView = document.querySelector("#homeView");
const gameView = document.querySelector("#gameView");
const heritagePanel = document.querySelector("#heritagePanel");
const heritageEmpty = document.querySelector("#heritageEmpty");
const heritageCard = document.querySelector("#heritageCard");
const heritageImage = document.querySelector("#heritageImage");
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

function showGame() {
  homeView.hidden = true;
  gameView.hidden = false;
  board ??= window.BingoApp.initializeBoard(document, {
    specialNumbers: window.WORLD_HERITAGES,
    onNumberAdded: (_number, heritage) => heritage && showHeritage(heritage),
  });
  document.querySelector("#numberInput").focus();
}

async function loadWikipediaImage(heritage, requestId) {
  const title = encodeURIComponent(heritage.wikipedia);
  try {
    const response = await fetch(`https://ja.wikipedia.org/api/rest_v1/page/summary/${title}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("image not found");
    const data = await response.json();
    if (requestId !== imageRequest) return;
    const image = data.originalimage?.source || data.thumbnail?.source;
    if (!image) throw new Error("image not found");
    heritageImage.src = image;
    heritageImage.alt = `${heritage.name}の写真`;
    imageCredit.href = data.content_urls?.desktop?.page || `https://ja.wikipedia.org/wiki/${title}`;
    heritageCard.classList.remove("image-unavailable");
  } catch {
    if (requestId !== imageRequest) return;
    heritageImage.removeAttribute("src");
    heritageImage.alt = "画像を読み込めませんでした";
    imageCredit.href = `https://commons.wikimedia.org/w/index.php?search=${title}&title=Special:MediaSearch&type=image`;
    heritageCard.classList.add("image-unavailable");
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
  heritageCard.classList.remove("show-quiz", "show-answer");
  heritageImage.removeAttribute("src");
  loadWikipediaImage(heritage, ++imageRequest);
}

function advanceHeritage() {
  if (!currentHeritage || gameView.hidden) return;
  stage = Math.min(stage + 1, 2);
  quizBox.hidden = false;
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

heritagePanel.addEventListener("click", (event) => {
  if (!event.target.closest("button, a")) advanceHeritage();
});
document.addEventListener("keydown", (event) => {
  if (!gameView.hidden && !event.target.matches("input, button")) advanceHeritage();
});
document.querySelector("#openGame").addEventListener("click", showGame);
