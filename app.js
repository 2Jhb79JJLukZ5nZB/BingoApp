"use strict";

const openAppButton = document.querySelector("#openApp");
const popupTemplate = document.querySelector("#popupTemplate");

let pictureInPictureWindow = null;

function addPopupStyles(targetDocument) {
  const viewport = targetDocument.createElement("meta");
  viewport.name = "viewport";
  viewport.content = "width=device-width, initial-scale=1.0";

  const stylesheet = targetDocument.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("popup.css", window.location.href).href;

  targetDocument.head.append(viewport, stylesheet);
}

async function openAlwaysOnTopWindow() {
  if (pictureInPictureWindow && !pictureInPictureWindow.closed) {
    pictureInPictureWindow.focus();
    return;
  }

  pictureInPictureWindow = await window.documentPictureInPicture.requestWindow({
    width: 560,
    height: 720,
  });

  pictureInPictureWindow.document.title = "ビンゴ番号ボード";
  addPopupStyles(pictureInPictureWindow.document);
  pictureInPictureWindow.document.body.append(popupTemplate.content.cloneNode(true));

  window.BingoApp.initializeBoard(pictureInPictureWindow.document, {
    close: () => pictureInPictureWindow.close(),
  });

  pictureInPictureWindow.addEventListener("pagehide", () => {
    pictureInPictureWindow = null;
  });
}

function openStandardPopup() {
  const popupWindow = window.open(
    "popup.html",
    "bingo-number-board",
    "popup=yes,width=560,height=720,resizable=yes,scrollbars=yes",
  );

  if (!popupWindow) {
    window.alert("ポップアップがブロックされました。ブラウザーの設定で許可してください。");
  }
}

openAppButton.addEventListener("click", async () => {
  if ("documentPictureInPicture" in window) {
    try {
      await openAlwaysOnTopWindow();
      return;
    } catch {
      openStandardPopup();
      return;
    }
  }

  openStandardPopup();
});
