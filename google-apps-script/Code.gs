const GUESTS_SHEET = 'Guests';
const RESPONSES_SHEET = 'RSVP Responses';
const RSVP_API_VERSION = 'guest-rows-v2';

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || '').toLowerCase();
    if (action !== 'search') return jsonResponse({ success: false, message: 'Unknown action.' });

    const query = normalizeName((e.parameter && e.parameter.name) || '');
    if (!query) return jsonResponse({ success: true, results: [] });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(GUESTS_SHEET);
    if (!sheet) throw new Error('Guests sheet not found.');

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return jsonResponse({ success: true, results: [] });

    const headers = headerMap(values[0]);
    validateGuestHeaders(headers);
    const guests = values.slice(1).map((row, index) => guestFromRow(row, index + 2, headers)).filter(Boolean);

    const tokens = query.split(' ');
    let matched = guests.filter(g => !g.isUnnamed && tokens.every(token =>
      normalizeName(g.displayName).split(' ').some(part => part.includes(token))));
    let approximate = false;
    if (!matched.length) {
      matched = guests.filter(g => !g.isUnnamed && tokens.every(token =>
        normalizeName(g.displayName).split(' ').some(part => part === token ||
          (token.length >= 4 && part.length >= 4 && oneEditApart(token, part)))));
      approximate = matched.length > 0;
    }

    const householdKeys = [...new Set(matched.map(g => householdKey(g)))];
    const results = householdKeys.map(key => buildHouseholdResult(key, guests)).filter(Boolean);

    return jsonResponse({ success: true, results: results, approximate: approximate });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || String(error) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const guestsSheet = ss.getSheetByName(GUESTS_SHEET);
    const responsesSheet = ss.getSheetByName(RESPONSES_SHEET);
    if (!guestsSheet || !responsesSheet) throw new Error('Guests or RSVP Responses sheet not found.');

    const guestValues = guestsSheet.getDataRange().getValues();
    const headers = headerMap(guestValues[0]);
    validateGuestHeaders(headers);
    const guests = guestValues.slice(1).map((row, index) => guestFromRow(row, index + 2, headers)).filter(Boolean);
    if (new Set(guests.map(g => g.guestId)).size !== guests.length) throw new Error('Guest IDs must be unique. Please contact the hosts.');
    const primary = guests.find(g => g.guestId === String(payload.primaryGuestId || ''));
    if (!primary) throw new Error('Invitation could not be matched to the guest list.');
    const members = guests.filter(g => householdKey(g) === householdKey(primary));
    if (!Array.isArray(payload.attendingGuestIds)) throw new Error('Invalid attending guest list.');
    const attendingIds = new Set(payload.attendingGuestIds.map(String));
    if ([...attendingIds].some(id => !members.some(g => g.guestId === id))) {
      throw new Error('An attending guest does not belong to this invitation.');
    }
    const extras = payload.additionalGuests || [];
    if (!Array.isArray(extras) || extras.length) throw new Error('Only guests listed on this invitation may RSVP.');
    const nameUpdates = payload.guestNames || [];
    if (!Array.isArray(nameUpdates)) throw new Error('Invalid guest names.');
    const updateIds = new Set();
    nameUpdates.forEach(entry => {
      const guest = entry && members.find(g => g.guestId === entry.guestId);
      if (!guest || !guest.isUnnamed || updateIds.has(entry.guestId) || !attendingIds.has(entry.guestId)) throw new Error('Invalid guest name update.');
      if (typeof entry.firstName !== 'string' || !entry.firstName.trim() || typeof entry.lastName !== 'string' || !entry.lastName.trim() || entry.firstName.length > 100 || entry.lastName.length > 100) throw new Error('Please enter first and last names for each unnamed guest attending.');
      updateIds.add(entry.guestId);
    });
    if (members.some(g => g.isUnnamed && attendingIds.has(g.guestId) && !updateIds.has(g.guestId))) throw new Error('Please name each unnamed guest attending.');
    const numberAttending = attendingIds.size;
    // Validate the entire invitation before making any sheet changes.
    nameUpdates.forEach(entry => {
      const guest = members.find(g => g.guestId === entry.guestId);
      setByHeader(guestsSheet, guest.sheetRow, headers, 'first name', safeCell(entry.firstName.trim()));
      setByHeader(guestsSheet, guest.sheetRow, headers, 'last name', safeCell(entry.lastName.trim()));
    });
    members.forEach(guest => {
      const isAttending = attendingIds.has(guest.guestId);
      setByHeader(guestsSheet, guest.sheetRow, headers, 'rsvp status', isAttending ? 'Accepted' : 'Declined');
      setByHeader(guestsSheet, guest.sheetRow, headers, 'attending?', isAttending ? 'Yes' : 'No');
    });

    const responseHeaders = ensureResponseHeaders(responsesSheet);
    const timestamp = new Date();
    members.forEach(guest => {
      const update = nameUpdates.find(entry => entry.guestId === guest.guestId);
      const isAttending = attendingIds.has(guest.guestId);
      const row = new Array(responseHeaders.length).fill('');
      const fields = {
        'Timestamp': timestamp, 'Guest ID': guest.guestId,
        'First Name': update ? update.firstName.trim() : guest.firstName,
        'Last Name': update ? update.lastName.trim() : guest.lastName,
        'Invitation Group': guest.household,
        'RSVP Status': isAttending ? 'Accepted' : 'Declined',
        'Attending?': isAttending ? 'Yes' : 'No',
        'Dietary Restrictions': payload.dietary || '',
        'Song Request': payload.song || '', 'Message / Notes': payload.message || ''
      };
      Object.keys(fields).forEach(header => assignResponse(row, responseHeaders, header, fields[header]));
      responsesSheet.appendRow(row);
    });
    return jsonResponse({ success: true, numberAttending: numberAttending });

  } catch (error) {
    return jsonResponse({ success: false, message: error.message || String(error) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function guestFromRow(row, sheetRow, headers) {
  const guestId = String(row[headers['guest id']] || '').trim();
  if (!guestId) return null;
  const firstName = String(row[headers['first name']] || '').trim();
  const lastName = String(row[headers['last name']] || '').trim();
  const isUnnamed = /^(plus one|unnamed guest|child \d+|extra baby)$/i.test(firstName);
  return { sheetRow, guestId, firstName, lastName,
    displayName: [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed guest',
    household: String(row[headers['invitation group']] || '').trim(),
    rsvpStatus: String(row[headers['rsvp status']] || 'Pending'),
    attending: String(row[headers['attending?']] || ''), isUnnamed };
}

function householdKey(guest) {
  return guest.household ? 'household:' + normalize(guest.household) : 'guest:' + guest.guestId;
}

function buildHouseholdResult(key, guests) {
  const members = guests.filter(g => householdKey(g) === key);
  if (!members.length) return null;
  const primary = members.find(g => !g.isUnnamed) || members[0];
  return { household: primary.household || primary.displayName,
    primaryGuestId: primary.guestId, reservedSeats: members.length,
    members: members.map(g => ({ guestId: g.guestId, displayName: g.displayName,
      firstName: g.firstName, lastName: g.lastName, rsvpStatus: g.rsvpStatus,
      attending: g.attending, isUnnamed: g.isUnnamed })) };
}

function safeCell(value) {
  return /^[=+@-]/.test(String(value)) ? "'" + value : value;
}

function validateGuestHeaders(headers) {
  ['guest id', 'first name', 'last name', 'invitation group', 'rsvp status', 'attending?'].forEach(key => {
    if (headers[key] === undefined) throw new Error('Please update the Guests sheet to the new six-column format. Missing: ' + key);
  });
}

function headerMap(headerRow) {
  const map = {};
  headerRow.forEach((header, index) => {
    const key = normalize(header);
    if (key) map[key] = index;
  });
  return map;
}

function setByHeader(sheet, row, headers, header, value) {
  const index = headers[normalize(header)];
  if (index === undefined) return;
  sheet.getRange(row, index + 1).setValue(value);
}

function ensureResponseHeaders(sheet) {
  const desired = ['Timestamp', 'Guest ID', 'First Name', 'Last Name', 'Invitation Group', 'RSVP Status', 'Attending?', 'Dietary Restrictions', 'Song Request', 'Message / Notes'];
  const current = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  desired.forEach(header => {
    if (!current.some(existing => normalize(existing) === normalize(header))) {
      current.push(header);
      sheet.getRange(1, current.length).setValue(header);
    }
  });
  return current;
}

function assignResponse(row, headers, header, value) {
  const index = headers.findIndex(h => normalize(h) === normalize(header));
  if (index >= 0) row[index] = typeof value === 'string' ? safeCell(value) : value;
}

function normalize(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function jsonResponse(payload) {
  payload.apiVersion = RSVP_API_VERSION;
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function normalizeName(value) {
  return normalize(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

// One insertion, deletion, substitution or adjacent transposition. Used only
// when exact name-token matching finds no invitation; the guest chooses a result.
function oneEditApart(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const different = [];
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) different.push(i);
    if (different.length === 1) return true;
    return different.length === 2 && different[1] === different[0] + 1 &&
      a[different[0]] === b[different[1]] && a[different[1]] === b[different[0]];
  }
  const short = a.length < b.length ? a : b;
  const long = a.length < b.length ? b : a;
  let i = 0, j = 0, skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) { i++; j++; }
    else { if (skipped) return false; skipped = true; j++; }
  }
  return true;
}

