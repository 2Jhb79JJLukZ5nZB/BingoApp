"use strict";

(function createBingoApp(global) {
  const STORAGE_KEY = "bingo-called-numbers-v1";
  const MIN_NUMBER = 1;
  const MAX_NUMBER = 100;

  function normalizeDigits(value) {
    return String(value).replace(/[０-９]/g, (digit) => String(digit.charCodeAt(0) - 0xFF10));
  }

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

  function initializeBoard(targetDocument, options = {}) {
    const numberForm = targetDocument.querySelector("#numberForm");
    const numberInput = targetDocument.querySelector("#numberInput");
    const numberGrid = targetDocument.querySelector("#numberGrid");
    const numberArea = targetDocument.querySelector("#numberArea");
    const emptyState = targetDocument.querySelector("#emptyState");
    const formMessage = targetDocument.querySelector("#formMessage");

    let calledNumbers = loadNumbers();
    let specialNumbers = options.specialNumbers ?? [];

    function showMessage(message, type = "error") {
      formMessage.textContent = message;
      formMessage.classList.toggle("is-success", type === "success");
    }

    function createNumberCard(number) {
      const card = targetDocument.createElement("article");
      card.className = "number-card";
      const special = specialNumbers.find((item) => item.number === number);
      card.classList.toggle("is-special", Boolean(special));

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
        showMessage("");
        options.onNumberRemoved?.(number);
        numberInput.focus();
      });

      card.append(value, removeButton);
      return card;
    }

    function renderNumbers() {
      numberGrid.replaceChildren(...calledNumbers.map(createNumberCard));
      emptyState.hidden = calledNumbers.length > 0;
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
      const normalizedValue = normalizeDigits(numberInput.value).trim();
      const number = Number(normalizedValue);

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
      showMessage("");
      const special = specialNumbers.find((item) => item.number === number);
      options.onNumberAdded?.(number, special);
      numberInput.value = "";
      numberInput.focus();

      global.requestAnimationFrame(() => {
        numberArea.scrollTo({ top: numberArea.scrollHeight, behavior: "smooth" });
      });
    });

    numberInput.addEventListener("input", () => {
      const normalizedValue = normalizeDigits(numberInput.value);
      if (numberInput.value !== normalizedValue) numberInput.value = normalizedValue;
      showMessage("");
    });

    global.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        calledNumbers = loadNumbers();
        renderNumbers();
      }
    });

    renderNumbers();
    global.setTimeout(() => numberInput.focus(), 80);

    return {
      setSpecialNumbers(value) {
        specialNumbers = Array.isArray(value) ? value : [];
        renderNumbers();
      },
    };
  }

  global.BingoApp = {
    initializeBoard,
    loadNumbers,
  };
})(window);
