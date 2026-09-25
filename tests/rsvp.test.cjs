const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('google-apps-script/Code.gs', 'utf8');
const headers = ['Guest ID','First Name','Last Name','Display Name','Household / Invitation Group','Reserved Seats','RSVP Status','Invitation Type','Address','Attending?','Number Attending'];
const address = { street: '123 Main', line2: '', city: 'Bozeman', state: 'MT', zip: '59715' };
function setup(rows) {
  const writes = [];
  function sheet(values) {
    return { getDataRange: () => ({getValues: () => values}), getLastColumn: () => values[0]?.length || 0,
      getRange: (r,c,n=1,m=1) => ({getValues: () => [Array.from({length:m},(_,i) => values[r-1]?.[c+i-1] || '')], setValue: value => { writes.push([r,c,value]); values[r-1] ||= []; values[r-1][c-1] = value; }}),
      appendRow: row => { writes.push(row); values.push(row); } };
  }
  const guests = sheet([headers, ...rows]); const responses = sheet([]);
  const ctx = vm.createContext({SpreadsheetApp: {getActiveSpreadsheet: () => ({getSheetByName: n => n === 'Guests' ? guests : responses})}, ContentService: {MimeType: {JSON:'json'}, createTextOutput: s => ({setMimeType: () => JSON.parse(s)})}});
  vm.runInContext(source, ctx);
  return {ctx, writes, post: data => ctx.doPost({postData: {contents: JSON.stringify(data)}})};
}
const rows = () => [['1','Colten','Smith','Colten Smith','Colten and Sylva',1,'Pending','',''],['2','Sylva','Nesset','Sylva Nesset','Colten and Sylva',1,'Pending','',''],['3','Other','Guest','Other Guest','Other',1,'Pending','','']];
const payload = () => ({primaryGuestId:'1', attendingGuestIds:['1','2'], individualAddresses:[{guestId:'1',address},{guestId:'2',address:{...address,street:'456 Oak'}}]});
test('mixed surnames require individual addresses and preserve both on save', () => {
  const {ctx, post} = setup(rows());
  const found = ctx.doGet({parameter:{action:'search', name:'Colten'}}).results[0];
  assert.equal(found.addressCollectionMode,'Individual');
  assert.equal(post(payload()).success,true);
  const saved = ctx.doGet({parameter:{action:'search',name:'Colten'}}).results[0];
  assert.equal(saved.members[0].address.city,'Bozeman');
  assert.equal(saved.members[1].address.street,'456 Oak');
});
test('rejects one shared address for mixed surnames without writes', () => {
  const {post,writes} = setup(rows()); assert.equal(post({primaryGuestId:'1',attendingGuestIds:['1','2'],address}).success,false); assert.equal(writes.length,0);
});
test('rejects guests from another invitation without writes', () => {
  const {post,writes} = setup(rows()); assert.equal(post({...payload(),attendingGuestIds:['3']}).success,false); assert.equal(writes.length,0);
});
test('cannot inflate seats in the request', () => {
  const {post,writes} = setup(rows()); assert.equal(post({...payload(),reservedSeats:100,additionalGuests:[{name:'Extra Guest'}]}).success,false); assert.equal(writes.length,0);
});
test('decline needs no address and ungrouped invitations match by guest ID', () => {
  const {post} = setup([['1','Solo','Guest','Solo Guest','',1,'Pending','','']]);
  assert.equal(post({primaryGuestId:'1', household:'Solo Guest',attendingGuestIds:[]}).success,true);
});
test('same surnames share an address', () => {
  const data = rows(); data[1][2]='Smith';
  const {post} = setup(data); assert.equal(post({primaryGuestId:'1',attendingGuestIds:['1','2'],address}).success,true);
});
test('missing surname columns fall back to full display names', () => {
  const data = rows(); data[0][2]=''; data[1][2]='';
  const {ctx} = setup(data); assert.equal(ctx.doGet({parameter:{action:'search',name:'Colten'}}).results[0].addressCollectionMode,'Individual');
});

test('same-surname family uses one shared mailing address', () => {
  const data = rows(); data[1][2] = 'Smith'; data[0][7] = 'Family'; data[1][7] = 'Family';
  const {ctx, post} = setup(data);
  assert.equal(ctx.doGet({parameter:{action:'search',name:'Colten'}}).results[0].addressCollectionMode, 'Shared');
  assert.equal(post({primaryGuestId:'1',attendingGuestIds:['1','2'],address}).success, true);
  const saved = ctx.doGet({parameter:{action:'search',name:'Colten'}}).results[0];
  assert.equal(saved.members[0].address.street, address.street);
  assert.equal(saved.members[1].address.street, address.street);
});
