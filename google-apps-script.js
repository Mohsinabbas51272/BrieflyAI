/**
 * BrieflyAI - Google Sheets Database Web App
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click Extensions > Apps Script
 * 3. Delete any code and PASTE this entire script
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Configuration:
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 7. Click "Deploy", authorize permissions, and COPY the Web App URL!
 * 8. Set this URL in your environment as GOOGLE_SHEET_URL.
 */

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Users
  let usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) {
    usersSheet = ss.insertSheet('Users');
    usersSheet.appendRow(['id', 'email', 'passwordHash', 'name', 'role', 'plan', 'dailyUsageCount', 'lastUsageDate', 'createdAt', 'updatedAt']);
    usersSheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#e2e8f0');
  }

  // Sheet 2: Summaries
  let summariesSheet = ss.getSheetByName('Summaries');
  if (!summariesSheet) {
    summariesSheet = ss.insertSheet('Summaries');
    summariesSheet.appendRow(['id', 'userId', 'title', 'sourceUrl', 'sourceType', 'overview', 'keyPoints', 'aiModel', 'tone', 'category', 'isFavorite', 'createdAt']);
    summariesSheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#e2e8f0');
  }

  // Sheet 3: Subscriptions
  let subSheet = ss.getSheetByName('Subscriptions');
  if (!subSheet) {
    subSheet = ss.insertSheet('Subscriptions');
    subSheet.appendRow(['id', 'userId', 'plan', 'status', 'stripeCustomerId', 'currentPeriodEnd', 'createdAt']);
    subSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#e2e8f0');
  }

  // Sheet 4: UsageLogs
  let usageSheet = ss.getSheetByName('UsageLogs');
  if (!usageSheet) {
    usageSheet = ss.insertSheet('UsageLogs');
    usageSheet.appendRow(['id', 'userId', 'sourceType', 'aiModel', 'tokensUsed', 'createdAt']);
    usageSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#e2e8f0');
  }
}

function doGet(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action || 'getAll';

  if (action === 'getAll') {
    const users = getSheetData(ss.getSheetByName('Users'));
    const summaries = getSheetData(ss.getSheetByName('Summaries'));
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      users: users,
      summaries: summaries
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action; // 'insert', 'update', 'delete'
    const entity = body.entity; // 'Users', 'Summaries', 'Subscriptions', 'UsageLogs'
    const data = body.data;

    const sheet = ss.getSheetByName(entity);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Sheet not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'insert') {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const row = headers.map(h => {
        let val = data[h];
        if (Array.isArray(val)) return val.join(' | ');
        if (val instanceof Date) return val.toISOString();
        return val !== undefined && val !== null ? val : '';
      });
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({ status: 'inserted', id: data.id })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'update') {
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idColIdx = headers.indexOf('id');
      
      for (let r = 1; r < allData.length; r++) {
        if (allData[r][idColIdx] === data.id) {
          headers.forEach((h, c) => {
            if (data[h] !== undefined) {
              let val = data[h];
              if (Array.isArray(val)) val = val.join(' | ');
              if (val instanceof Date) val = val.toISOString();
              sheet.getRange(r + 1, c + 1).setValue(val);
            }
          });
          return ContentService.createTextOutput(JSON.stringify({ status: 'updated' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    if (action === 'delete') {
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idColIdx = headers.indexOf('id');
      for (let r = 1; r < allData.length; r++) {
        if (allData[r][idColIdx] === data.id) {
          sheet.deleteRow(r + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: 'deleted' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetData(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  const headers = rows[0];
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const item = {};
    headers.forEach((h, colIdx) => {
      let val = rows[i][colIdx];
      if (h === 'keyPoints' && typeof val === 'string') {
        val = val.split(' | ');
      }
      item[h] = val;
    });
    list.push(item);
  }
  return list;
}
