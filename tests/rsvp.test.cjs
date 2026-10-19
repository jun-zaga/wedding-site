const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const headers = ['Guest ID','First Name','Last Name','Invitation Group','RSVP Status','Attending?'];
const address = {street:'123 Main',line2:'',city:'Bozeman',state:'MT',zip:'59715'};
function setup(rows) {
  const writes=[]; const data=[headers,...rows]; const logs=[];
  const sheet = values => ({getDataRange:()=>({getValues:()=>values}),getLastColumn:()=>values[0]?.length||0,
    getRange:(r,c,n=1,m=1)=>({getValues:()=>[Array.from({length:m},(_,i)=>values[r-1]?.[c+i-1]||'')],setValue:v=>{writes.push([r,c,v]); values[r-1]||=[]; values[r-1][c-1]=v;}}),
    appendRow:row=>{writes.push(row); values.push(row);}});
  const guests=sheet(data), responses=sheet(logs);
  let held=false;
  const ctx=vm.createContext({LockService:{getScriptLock:()=>({waitLock:()=>{held=true;},hasLock:()=>held,releaseLock:()=>{held=false;}})},
    SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:n=>n==='Guests'?guests:responses})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})}});
  vm.runInContext(fs.readFileSync('google-apps-script/Code.gs','utf8'),ctx);
  return {data,writes,logs,ctx,search:name=>ctx.doGet({parameter:{action:'search',name}}),post:payload=>ctx.doPost({postData:{contents:JSON.stringify(payload)}})};
}
const rows=()=>[['G001','Cousin','Smith','Cousin invitation','Pending',''],['G002','Plus one','','Cousin invitation','Pending',''],['G003','Solo','Jones','','Pending','']];
const payload=()=>({primaryGuestId:'G001',attendingGuestIds:['G001','G002'],guestNames:[{guestId:'G002',firstName:'Alex',lastName:'Brown'}],individualAddresses:[{guestId:'G001',address},{guestId:'G002',address}]});
test('Gregory full-name search returns Gregory and Carrie together',()=>{
  const s=setup([['G001','Gregory','Stein','Dad and Mom Stein','Pending',''],['G002','Carrie','Stein',' Dad  and Mom Stein ','Pending','']]);
  for (const query of ['Gregory Stein',' Gregory   Stein ','Stein Gregory','Carrie Stein']) {
    const result=s.search(query);assert.equal(result.apiVersion,'guest-rows-v2');
    assert.equal(result.results.length,1);assert.equal(result.results[0].members.length,2);
    assert.equal(result.results[0].members[0].displayName,'Gregory Stein');
    assert.equal(result.results[0].members[1].displayName,'Carrie Stein');
    assert.equal(result.approximate,false);
  }
  assert.equal(s.search('Gregoy Stein').approximate,true);
  assert.equal(s.search('Gregoy Stein').results[0].members.length,2);
  assert.equal(s.search('Completely Unknown').results.length,0);
  assert.equal(s.post({primaryGuestId:'G001',attendingGuestIds:['G001']}).success,true);
  assert.equal(s.data[1][5],'Yes');assert.equal(s.data[2][5],'No');
  const saved=s.search('Gregory Stein').results[0];
  assert.equal(saved.members[0].attending,'Yes');assert.equal(saved.members[1].attending,'No');
  assert.equal(s.logs[2][1],'G002');assert.equal(s.logs[2][6],'No');
});
test('only explicitly listed plus-one appears, with its own ID',()=>{
  const s=setup(rows()); const result=s.search('Cousin').results[0];
  assert.equal(result.members.length,2); assert.equal(result.members[1].guestId,'G002'); assert.equal(result.members[1].isUnnamed,true);
  assert.equal(s.search('Solo').results[0].members.length,1);
});
test('plus-one is named in place, preserves ID, and prefills on return',()=>{
  const s=setup(rows()); assert.equal(s.post(payload()).success,true);
  assert.deepEqual(s.data[2],['G002','Alex','Brown','Cousin invitation','Accepted','Yes']);
  const result=s.search('Alex').results[0]; assert.equal(result.members[1].isUnnamed,false); assert.equal('address' in result.members[1],false);
});
test('solo guest cannot add a plus-one or inflate seat cap',()=>{
  const s=setup(rows()); assert.equal(s.post({primaryGuestId:'G003',attendingGuestIds:[],reservedSeats:20,additionalGuests:[{name:'Uninvited'}]}).success,false); assert.equal(s.writes.length,0);
});
test('foreign guest IDs are rejected before writes',()=>{
  const s=setup(rows()); assert.equal(s.post({...payload(),attendingGuestIds:['G001','G003']}).success,false); assert.equal(s.writes.length,0);
});
test('unnamed attending guests require a name',()=>{
  const s=setup(rows()); assert.equal(s.post({...payload(),guestNames:[]}).success,false); assert.equal(s.writes.length,0);
});
test('named guests cannot be renamed through the plus-one field',()=>{
  const s=setup(rows()); assert.equal(s.post({...payload(),guestNames:[{guestId:'G001',firstName:'Hacked',lastName:'Name'}]}).success,false); assert.equal(s.writes.length,0);
});
test('can attend without using invited plus-one, then decline later',()=>{
  const s=setup(rows()); assert.equal(s.post({primaryGuestId:'G001',attendingGuestIds:['G001'],individualAddresses:[{guestId:'G001',address}]}).success,true);
  assert.equal(s.data[2][1],'Plus one'); assert.equal(s.data[2][5],'No');
  assert.equal(s.post({primaryGuestId:'G001',attendingGuestIds:[]}).success,true); assert.equal(s.data[1][4],'Declined');
});
test('blank invitation groups remain independent',()=>{
  const s=setup([['1','Same','Name','','Pending',''],['2','Same','Name','','Pending','']]); assert.equal(s.search('Same').results.length,2);
});
test('mixed attendance saves each person separately',()=>{
  const data=rows(); data[1][1]='Partner'; data[1][2]='Brown';
  const s=setup(data); assert.equal(s.post({primaryGuestId:'G001',attendingGuestIds:['G002'],individualAddresses:[{guestId:'G002',address}]}).success,true);
  assert.equal(s.data[1][5],'No'); assert.equal(s.data[2][5],'Yes');
});
test('duplicate guest IDs are rejected before writes',()=>{
  const data=rows();data[1][0]='G001';const s=setup(data);assert.equal(s.post(payload()).success,false);assert.equal(s.writes.length,0);
});
test('duplicate name updates cause no writes',()=>{
  const s=setup(rows());
  assert.equal(s.post({...payload(),guestNames:[...payload().guestNames,...payload().guestNames]}).success,false);assert.equal(s.writes.length,0);
});

test('attendance succeeds without any addresses and logs one row per invited person',()=>{
  const s=setup(rows());const data=payload();delete data.individualAddresses;
  assert.equal(s.post(data).success,true);
  assert.equal(s.logs.length,3);
  assert.deepEqual(s.logs[0],['Timestamp','Guest ID','First Name','Last Name','Invitation Group','RSVP Status','Attending?','Dietary Restrictions','Song Request','Message / Notes']);
  assert.equal(s.logs[2][1],'G002');assert.equal(s.logs[2][2],'Alex');assert.equal(s.logs[2][6],'Yes');
  assert.equal(s.logs[0].some(h=>/address|city|zip|state/i.test(h)),false);
});
