"use strict";

(function createBingoApp(global) {
  const STORAGE_KEY = "bingo-called-numbers-v1";
  const MIN_NUMBER = 1;
  const MAX_NUMBER = 75;

  function loadNumbers() {
    try {
      const storedValue = JSON.parse(global.localStorage.getItem(STORAGE_KEY) ?? "[]");

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

  function saveNumbers(numbers) {
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(numbers));
  }

  function getBingoLetter(number) {
    return "BINGO"[Math.floor((number - 1) / 15)];
  }

  function initializeBoard(targetDocument, options = {}) {
    const numberForm = targetDocument.querySelector("#numberForm");
    const numberInput = targetDocument.querySelector("#numberInput");
    const numberGrid = targetDocument.querySelector("#numberGrid");
    const numberArea = targetDocument.querySelector("#numberArea");
    const emptyState = targetDocument.querySelector("#emptyState");
    const numberCount = targetDocument.querySelector("#numberCount");
    const formMessage = targetDocument.querySelector("#formMessage");
    const closeButton = targetDocument.querySelector("#closeApp");

    let calledNumbers = loadNumbers();

    function showMessage(message, type = "error") {
      formMessage.textContent = message;
      formMessage.classList.toggle("is-success", type === "success");
    }

    function createNumberCard(number) {
      const card = targetDocument.createElement("article");
      card.className = "number-card";

      const letter = targetDocument.createElement("span");
      letter.className = "number-card__letter";
      letter.textContent = getBingoLetter(number);

      const value = targetDocument.createElement("span");
      value.className = "number-card__value";
      value.textContent = String(number);

      const removeButton = targetDocument.createElement("button");
      removeButton.className = "remove-button";
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", `${number}番を削除`);
      removeButton.textContent = "×";
      removeButton.addEventListener("click", () => {
        calledNumbers = calledNumbers.filter((item) => item !== number);
        saveAndRender();
        showMessage(`${number}番を削除しました。`, "success");
        numberInput.focus();
      });

      card.append(letter, value, removeButton);
      return card;
    }

    function renderNumbers() {
      numberGrid.replaceChildren(...calledNumbers.map(createNumberCard));
      emptyState.hidden = calledNumbers.length > 0;
      numberCount.textContent = String(calledNumbers.length);
    }

    function saveAndRender() {
      try {
        saveNumbers(calledNumbers);
      } catch {
        showMessage("このブラウザーでは番号を保存できません。");
      }

      renderNumbers();
      options.onChange?.(calledNumbers);
    }

    numberForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const number = Number(numberInput.value);

      if (!Number.isInteger(number) || number < MIN_NUMBER || number > MAX_NUMBER) {
        showMessage(`${MIN_NUMBER}〜${MAX_NUMBER}の整数を入力してください。`);
        return;
      }

      if (calledNumbers.includes(number)) {
        showMessage(`${number}番はすでに追加されています。`);
        return;
      }

      calledNumbers.push(number);
      saveAndRender();
      showMessage(`${number}番を追加しました。`, "success");
      numberInput.value = "";
      numberInput.focus();

      global.requestAnimationFrame(() => {
        numberArea.scrollTo({ top: numberArea.scrollHeight, behavior: "smooth" });
      });
    });

    numberInput.addEventListener("input", () => showMessage(""));
    closeButton.addEventListener("click", () => options.close?.());

    global.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        calledNumbers = loadNumbers();
        renderNumbers();
      }
    });

    renderNumbers();
    global.setTimeout(() => numberInput.focus(), 80);
  }

  global.BingoApp = {
    initializeBoard,
    loadNumbers,
  };
})(window);
