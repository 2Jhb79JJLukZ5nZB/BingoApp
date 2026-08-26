"use strict";

const STORAGE_KEY = "bingo-called-numbers-v1";
const MIN_NUMBER = 1;
const MAX_NUMBER = 75;

const bingoDialog = document.querySelector("#bingoDialog");
const openAppButton = document.querySelector("#openApp");
const closeAppButton = document.querySelector("#closeApp");
const numberForm = document.querySelector("#numberForm");
const numberInput = document.querySelector("#numberInput");
const numberGrid = document.querySelector("#numberGrid");
const numberArea = document.querySelector("#numberArea");
const emptyState = document.querySelector("#emptyState");
const numberCount = document.querySelector("#numberCount");
const homeCount = document.querySelector("#homeCount");
const formMessage = document.querySelector("#formMessage");

let calledNumbers = loadNumbers();

function loadNumbers() {
  try {
    const storedValue = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

    if (!Array.isArray(storedValue)) {
      return [];
    }

    return [...new Set(storedValue)].filter(
      (value) => Number.isInteger(value) && value >= MIN_NUMBER && value <= MAX_NUMBER,
    );
  } catch {
    return [];
  }
}

function saveNumbers() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calledNumbers));
  } catch {
    showMessage("このブラウザーでは番号を保存できません。", "error");
  }
}

function getBingoLetter(number) {
  return "BINGO"[Math.floor((number - 1) / 15)];
}

function getAccentColor(number) {
  const colors = ["#6fa0ff", "#69d2a0", "#ffd166", "#ff8d68", "#c995ff"];
  return colors[Math.floor((number - 1) / 15)];
}

function createNumberCard(number) {
  const card = document.createElement("article");
  card.className = "number-card";
  card.style.setProperty("--accent", getAccentColor(number));

  const letter = document.createElement("span");
  letter.className = "number-card__letter";
  letter.textContent = getBingoLetter(number);

  const value = document.createElement("span");
  value.className = "number-card__value";
  value.textContent = String(number);

  const removeButton = document.createElement("button");
  removeButton.className = "remove-button";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `${number}番を削除`);
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => removeNumber(number));

  card.append(letter, value, removeButton);
  return card;
}

function renderNumbers() {
  numberGrid.replaceChildren(...calledNumbers.map(createNumberCard));
  emptyState.hidden = calledNumbers.length > 0;
  numberCount.textContent = String(calledNumbers.length);
  homeCount.textContent = `${calledNumbers.length}個`;
}

function showMessage(message, type = "error") {
  formMessage.textContent = message;
  formMessage.classList.toggle("is-success", type === "success");
}

function addNumber(number) {
  if (!Number.isInteger(number) || number < MIN_NUMBER || number > MAX_NUMBER) {
    showMessage(`${MIN_NUMBER}〜${MAX_NUMBER}の整数を入力してください。`);
    return;
  }

  if (calledNumbers.includes(number)) {
    showMessage(`${number}番はすでに追加されています。`);
    return;
  }

  calledNumbers.push(number);
  saveNumbers();
  renderNumbers();
  showMessage(`${number}番を追加しました。`, "success");
  numberInput.value = "";
  numberInput.focus();

  requestAnimationFrame(() => {
    numberArea.scrollTo({ top: numberArea.scrollHeight, behavior: "smooth" });
  });
}

function removeNumber(number) {
  calledNumbers = calledNumbers.filter((value) => value !== number);
  saveNumbers();
  renderNumbers();
  showMessage(`${number}番を削除しました。`, "success");
  numberInput.focus();
}

openAppButton.addEventListener("click", () => {
  bingoDialog.showModal();
  showMessage("");
  window.setTimeout(() => numberInput.focus(), 80);
});

closeAppButton.addEventListener("click", () => bingoDialog.close());

bingoDialog.addEventListener("click", (event) => {
  if (event.target === bingoDialog) {
    bingoDialog.close();
  }
});

numberForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addNumber(Number(numberInput.value));
});

numberInput.addEventListener("input", () => showMessage(""));

renderNumbers();
