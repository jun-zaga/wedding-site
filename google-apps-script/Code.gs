const GUESTS_SHEET = 'Guests';
const RESPONSES_SHEET = 'RSVP Responses';

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || '').toLowerCase();
    if (action !== 'search') return jsonResponse({ success: false, message: 'Unknown action.' });

    const query = normalize((e.parameter && e.parameter.name) || '');
    if (!query) return jsonResponse({ success: true, results: [] });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(GUESTS_SHEET);
    if (!sheet) throw new Error('Guests sheet not found.');

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return jsonResponse({ success: true, results: [] });

    const headers = headerMap(values[0]);
    const guests = values.slice(1).map((row, index) => guestFromRow(row, index + 2, headers)).filter(Boolean);

    const matched = guests.filter(g =>
      normalize(g.displayName).includes(query) ||
      normalize(g.firstName).includes(query) ||
      normalize(g.lastName).includes(query) ||
      normalize(g.household).includes(query)
    );

    const householdKeys = [...new Set(matched.map(g => householdKey(g)))];
    const results = householdKeys.map(key => buildHouseholdResult(key, guests)).filter(Boolean);

    return jsonResponse({ success: true, results: results });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || String(error) });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const guestsSheet = ss.getSheetByName(GUESTS_SHEET);
    const responsesSheet = ss.getSheetByName(RESPONSES_SHEET);
    if (!guestsSheet || !responsesSheet) throw new Error('Guests or RSVP Responses sheet not found.');

    const guestValues = guestsSheet.getDataRange().getValues();
    const headers = headerMap(guestValues[0]);
    const attendingIds = new Set((payload.attendingGuestIds || []).map(String));
    const additionalGuests = (payload.additionalGuests || [])
      .map(g => String((g && g.name) || '').trim())
      .filter(Boolean);

    const primaryGuestId = String(payload.primaryGuestId || '');
    const household = String(payload.household || '');
    const reservedSeats = Number(payload.reservedSeats || 0);
    const numberAttending = attendingIds.size + additionalGuests.length;

    if (reservedSeats && numberAttending > reservedSeats) {
      throw new Error('This RSVP exceeds the number of seats reserved for the invitation.');
    }

    const householdRows = [];
    for (let i = 1; i < guestValues.length; i++) {
      const row = guestValues[i];
      const guestId = String(row[headers['guest id']] || '');
      const rowHousehold = String(row[headers['household / invitation group']] || '');
      const belongs = household
        ? rowHousehold === household
        : guestId === primaryGuestId;

      if (!belongs) continue;
      householdRows.push(i + 1);

      const isAttending = attendingIds.has(guestId);
      setByHeader(guestsSheet, i + 1, headers, 'rsvp status', isAttending ? 'Accepted' : 'Declined');
      setByHeader(guestsSheet, i + 1, headers, 'attending?', isAttending ? 'Yes' : 'No');
      setByHeader(guestsSheet, i + 1, headers, 'number attending', guestId === primaryGuestId ? numberAttending : '');
    }

    if (householdRows.length === 0) throw new Error('Invitation could not be matched to the guest list.');

    const address = payload.address || {};
    const addressCollectionMode = String(payload.addressCollectionMode || 'Shared');
    const individualAddresses = Array.isArray(payload.individualAddresses) ? payload.individualAddresses : [];
    const additionalGuestAddresses = Array.isArray(payload.additionalGuestAddresses) ? payload.additionalGuestAddresses : [];
    const responseHeaders = ensureResponseHeaders(responsesSheet);
    const row = new Array(responseHeaders.length).fill('');
    const primaryDisplayName = getPrimaryDisplayName(guestValues, headers, primaryGuestId);

    assignResponse(row, responseHeaders, 'Timestamp', new Date());
    assignResponse(row, responseHeaders, 'Guest ID', primaryGuestId);
    assignResponse(row, responseHeaders, 'Display Name', primaryDisplayName);
    assignResponse(row, responseHeaders, 'Attending?', numberAttending > 0 ? 'Yes' : 'No');
    assignResponse(row, responseHeaders, 'Number Attending', numberAttending);
    assignResponse(row, responseHeaders, 'Dietary Restrictions', payload.dietary || '');
    assignResponse(row, responseHeaders, 'Song Request', payload.song || '');
    assignResponse(row, responseHeaders, 'Message / Notes', payload.message || '');
    assignResponse(row, responseHeaders, 'Street Address', address.street || '');
    assignResponse(row, responseHeaders, 'Address Line 2', address.line2 || '');
    assignResponse(row, responseHeaders, 'City', address.city || '');
    assignResponse(row, responseHeaders, 'State', address.state || '');
    assignResponse(row, responseHeaders, 'ZIP', address.zip || '');
    assignResponse(row, responseHeaders, 'Address Confirmed', numberAttending > 0 ? 'Yes' : 'Not needed');
    assignResponse(row, responseHeaders, 'Additional Guests', additionalGuests.join(', '));
    assignResponse(row, responseHeaders, 'Household', household);
    assignResponse(row, responseHeaders, 'Individual Addresses', addressCollectionMode === 'Individual' ? JSON.stringify({ namedGuests: individualAddresses, additionalGuests: additionalGuestAddresses }) : '');

    responsesSheet.appendRow(row);

    if (headers['address'] !== undefined) {
      if (addressCollectionMode === 'Individual') {
        const byGuestId = {};
        individualAddresses.forEach(entry => {
          const guestId = String((entry && entry.guestId) || '');
          if (guestId) byGuestId[guestId] = (entry && entry.address) || {};
        });
        for (let i = 1; i < guestValues.length; i++) {
          const guestId = String(guestValues[i][headers['guest id']] || '');
          if (!attendingIds.has(guestId) || !byGuestId[guestId]) continue;
          guestsSheet.getRange(i + 1, headers['address'] + 1).setValue(formatAddress(byGuestId[guestId]));
        }
      } else if (primaryGuestId && numberAttending > 0) {
        for (let i = 1; i < guestValues.length; i++) {
          const guestId = String(guestValues[i][headers['guest id']] || '');
          const rowHousehold = String(guestValues[i][headers['household / invitation group']] || '');
          const belongs = household ? rowHousehold === household : guestId === primaryGuestId;
          if (belongs && attendingIds.has(guestId)) {
            guestsSheet.getRange(i + 1, headers['address'] + 1).setValue(formatAddress(address));
          }
        }
      }
    }

    return jsonResponse({ success: true, numberAttending: numberAttending, additionalGuests: additionalGuests });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || String(error) });
  }
}

function guestFromRow(row, sheetRow, headers) {
  const guestId = String(row[headers['guest id']] || '').trim();
  if (!guestId) return null;
  return {
    sheetRow: sheetRow,
    guestId: guestId,
    firstName: String(row[headers['first name']] || '').trim(),
    lastName: String(row[headers['last name']] || '').trim(),
    displayName: String(row[headers['display name']] || '').trim(),
    household: String(row[headers['household / invitation group']] || '').trim(),
    reservedSeats: Number(row[headers['reserved seats']] || 0),
    rsvpStatus: String(row[headers['rsvp status']] || 'Pending'),
    invitationType: String(row[headers['invitation type']] || '').trim(),
    address: String(row[headers['address']] || '').trim()
  };
}

function householdKey(guest) {
  return guest.household ? 'household:' + guest.household : 'guest:' + guest.guestId;
}

function buildHouseholdResult(key, guests) {
  const members = guests.filter(g => householdKey(g) === key);
  if (!members.length) return null;

  const primary = members.find(g => g.reservedSeats > 1) || members.find(g => g.reservedSeats > 0) || members[0];
  const reservedSeats = Math.max(members.length, members.reduce((sum, g) => sum + (g.reservedSeats || 0), 0));
  const householdName = primary.household || primary.displayName;

  const lastNames = [...new Set(members.map(g => normalize(g.lastName)).filter(Boolean))];
  const isFamily = members.some(g => normalize(g.invitationType) === 'family');
  const addressCollectionMode = isFamily || lastNames.length > 1 ? 'Individual' : 'Shared';

  return {
    household: householdName,
    primaryGuestId: primary.guestId,
    reservedSeats: reservedSeats,
    addressCollectionMode: addressCollectionMode,
    members: members.map(g => ({
      guestId: g.guestId,
      displayName: g.displayName,
      firstName: g.firstName,
      lastName: g.lastName,
      rsvpStatus: g.rsvpStatus,
      address: parseAddress(g.address)
    })),
    address: parseAddress(primary.address)
  };
}

function parseAddress(value) {
  if (!value) return { street: '', line2: '', city: '', state: '', zip: '' };
  return { street: value, line2: '', city: '', state: '', zip: '' };
}

function getPrimaryDisplayName(values, headers, guestId) {
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][headers['guest id']] || '') === guestId) return String(values[i][headers['display name']] || '');
  }
  return '';
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
  const desired = [
    'Timestamp', 'Guest ID', 'Display Name', 'Attending?', 'Number Attending',
    'Dietary Restrictions', 'Song Request', 'Message / Notes', 'Street Address',
    'Address Line 2', 'City', 'State', 'ZIP', 'Address Confirmed', 'Additional Guests', 'Household', 'Individual Addresses'
  ];
  const current = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), desired.length)).getValues()[0] : [];
  desired.forEach((header, index) => {
    if (!current[index]) sheet.getRange(1, index + 1).setValue(header);
  });
  return sheet.getRange(1, 1, 1, desired.length).getValues()[0];
}

function formatAddress(address) {
  address = address || {};
  return [address.street, address.line2, [address.city, address.state, address.zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
}

function assignResponse(row, headers, header, value) {
  const index = headers.findIndex(h => normalize(h) === normalize(header));
  if (index >= 0) row[index] = value;
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
