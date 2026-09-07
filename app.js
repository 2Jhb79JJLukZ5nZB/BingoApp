"use strict";
const config = window.BINGO_CONFIG;
const SPECIAL_KEY = "bingo-special-numbers-v1";
const views = { home: document.querySelector("#homeView"), register: document.querySelector("#registerView"), game: document.querySelector("#gameView") };
const slidesFrame = document.querySelector("#slidesFrame");
const registrationList = document.querySelector("#registrationList");
const registerForm = document.querySelector("#registerForm");
const syncStatus = document.querySelector("#syncStatus");
let registrations = loadRegistrations();
let board = null;

function loadRegistrations() {
  try {
    const value = JSON.parse(localStorage.getItem(SPECIAL_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}
function saveRegistrations() {
  localStorage.setItem(SPECIAL_KEY, JSON.stringify(registrations));
  board?.setSpecialNumbers(registrations);
}
function showView(name) {
  Object.entries(views).forEach(([key, element]) => { element.hidden = key !== name; });
  if (name === "game") {
    slidesFrame.src = config.slidesUrl;
    board ??= window.BingoApp.initializeBoard(document, {
      specialNumbers: registrations,
      onNumberAdded: handleCalledNumber,
      onNumberRemoved: (number) => sendUpdate({ action: "uncall", number })
    });
  }
  if (name === "register") renderRegistrations();
}
function slideUrl(slide) {
  const separator = config.slidesUrl.includes("?") ? "&" : "?";
  return `${config.slidesUrl}${separator}slide=${encodeURIComponent(slide)}&t=${Date.now()}`;
}
function handleCalledNumber(number, special) {
  sendUpdate({ action: "call", number });
  if (special) slidesFrame.src = slideUrl(special.slide);
}
async function sendUpdate(payload) {
  if (!config.appsScriptUrl) return false;
  try {
    const result = await requestJsonp(payload);
    return result.ok === true;
  } catch {
    syncStatus.textContent = "スプレッドシートに接続できません。Apps Scriptの公開設定を確認してください。";
    return false;
  }
}
function requestJsonp(parameters = {}) {
  return new Promise((resolve, reject) => {
    const callback = "bingoSync" + Date.now() + Math.floor(Math.random() * 10000);
    const script = document.createElement("script");
    const query = new URLSearchParams({ ...parameters, callback });
    const separator = config.appsScriptUrl.includes("?") ? "&" : "?";
    const timeout = window.setTimeout(() => cleanup(new Error("timeout")), 10000);
    function cleanup(error, data) {
      window.clearTimeout(timeout);
      delete window[callback];
      script.remove();
      error ? reject(error) : resolve(data);
    }
    window[callback] = (data) => cleanup(null, data);
    script.onerror = () => cleanup(new Error("load failed"));
    script.src = config.appsScriptUrl + separator + query.toString();
    document.head.append(script);
  });
}
async function loadRemoteRegistrations() {
  if (!config.appsScriptUrl) return;
  try {
    const data = await requestJsonp();
    if (Array.isArray(data.registrations)) {
      registrations = data.registrations;
      saveRegistrations();
      if (!views.register.hidden) renderRegistrations();
    }
  } catch {
    syncStatus.textContent = "スプレッドシートに接続できません。";
  }
}
function renderRegistrations() {
  if (!registrations.length) {
    registrationList.innerHTML = '<p class="empty-registration">登録された番号はありません</p>';
    return;
  }
  registrationList.replaceChildren(...registrations.map((item) => {
    const row = document.createElement("div");
    row.className = "registration-row";
    const number = document.createElement("strong");
    number.className = "registration-number";
    number.textContent = `${item.number}番`;
    const slide = document.createElement("span");
    slide.textContent = `${item.slide}枚目`;
    const remove = document.createElement("button");
    remove.className = "delete-registration";
    remove.type = "button";
    remove.textContent = "削除";
    remove.addEventListener("click", () => {
      registrations = registrations.filter((entry) => entry.number !== item.number);
      saveRegistrations();
      renderRegistrations();
      sendUpdate({ action: "delete", number: item.number });
    });
    row.append(number, slide, remove);
    return row;
  }));
}
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const number = Number(document.querySelector("#specialNumber").value);
  const slide = Number(document.querySelector("#slideNumber").value);
  if (!Number.isInteger(number) || number < 1 || number > 100 || !Number.isInteger(slide) || slide < 1) {
    syncStatus.textContent = "番号は1〜100、スライド番号は1以上で入力してください。";
    return;
  }
  registrations = registrations.filter((entry) => entry.number !== number);
  registrations.push({ number, slide });
  registrations.sort((a, b) => a.number - b.number);
  saveRegistrations();
  renderRegistrations();
  const saved = await sendUpdate({ action: "register", number, slide });
  syncStatus.textContent = config.appsScriptUrl
    ? saved ? "スプレッドシートに登録しました。" : "端末には登録しましたが、スプレッドシートへ保存できませんでした。"
    : "この端末に登録しました。スプレッドシート連携は未設定です。";
  registerForm.reset();
});
document.querySelector("#openGame").addEventListener("click", () => showView("game"));
document.querySelector("#openRegister").addEventListener("click", () => showView("register"));
document.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", () => showView("home")));
loadRemoteRegistrations();
