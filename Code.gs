const REGISTRATION_SHEET = '番号登録';
const HISTORY_SHEET = '抽選履歴';

function setupSheets() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  prepareSheet_(book, REGISTRATION_SHEET, ['特別番号', 'スライド番号', '登録日時']);
  prepareSheet_(book, HISTORY_SHEET, ['番号', '抽選日時', '状態']);
}

function doPost(e) {
  setupSheets();
  const data = JSON.parse(e.postData.contents || '{}');
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const number = Number(data.number);
  if (!Number.isInteger(number) || number < 1 || number > 100) return json_({ ok: false });

  if (data.action === 'register') register_(book, number, Number(data.slide));
  if (data.action === 'delete') deleteRegistration_(book, number);
  if (data.action === 'call') book.getSheetByName(HISTORY_SHEET).appendRow([number, new Date(), '追加']);
  if (data.action === 'uncall') book.getSheetByName(HISTORY_SHEET).appendRow([number, new Date(), '削除']);
  return json_({ ok: true });
}

function doGet(e) {
  setupSheets();
  const action = String(e.parameter.action || '');
  let ok = true;
  if (action) ok = processAction_(e.parameter);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REGISTRATION_SHEET);
  const registrations = sheet.getDataRange().getValues().slice(1)
    .filter(row => Number.isInteger(Number(row[0])) && Number.isInteger(Number(row[1])))
    .map(row => ({ number: Number(row[0]), slide: Number(row[1]) }));
  const result = JSON.stringify({ ok, registrations });
  const callback = String(e.parameter.callback || '');
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + result + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.JSON);
}

function processAction_(data) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const number = Number(data.number);
  if (!Number.isInteger(number) || number < 1 || number > 100) return false;
  if (data.action === 'register') register_(book, number, Number(data.slide));
  else if (data.action === 'delete') deleteRegistration_(book, number);
  else if (data.action === 'call') book.getSheetByName(HISTORY_SHEET).appendRow([number, new Date(), '追加']);
  else if (data.action === 'uncall') book.getSheetByName(HISTORY_SHEET).appendRow([number, new Date(), '削除']);
  else return false;
  return true;
}

function register_(book, number, slide) {
  if (!Number.isInteger(slide) || slide < 1) return;
  const sheet = book.getSheetByName(REGISTRATION_SHEET);
  const values = sheet.getDataRange().getValues();
  for (let row = 1; row < values.length; row++) {
    if (Number(values[row][0]) === number) {
      sheet.getRange(row + 1, 1, 1, 3).setValues([[number, slide, new Date()]]);
      return;
    }
  }
  sheet.appendRow([number, slide, new Date()]);
}

function deleteRegistration_(book, number) {
  const sheet = book.getSheetByName(REGISTRATION_SHEET);
  const values = sheet.getDataRange().getValues();
  for (let row = values.length - 1; row >= 1; row--) {
    if (Number(values[row][0]) === number) sheet.deleteRow(row + 1);
  }
}

function prepareSheet_(book, name, headers) {
  const sheet = book.getSheetByName(name) || book.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  sheet.setFrozenRows(1);
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
