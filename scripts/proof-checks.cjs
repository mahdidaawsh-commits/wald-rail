const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,digest}=require('./transport.cjs');
const config=JSON.parse(fs.readFileSync(path.join(root,'config/scenarios.json')));
const keys=['identity','final','duration','flow','shutdown_free'];
const publisher='mahdidaawsh-commits/wald-rail';
const gcd=(a,b)=>b?gcd(b,a%b):a;
function ratio(outcomes,capacity){
 const f=outcomes.filter(x=>x==='FAIL').length,p=outcomes.length-f;
 let n=4n**BigInt(f)*2n**BigInt(p),d=3n**BigInt(p),g=gcd(n,d);n/=g;d/=g;
 return {numerator:Number(n),denominator:Number(d),status:n>=20n*d?'FLAG':20n*n<=d?'CLEAR':outcomes.length===capacity?'EXHAUSTED':'RUNNING'};
}
function source(row,revision){
 const body=fs.readFileSync(path.join(root,'reports',row.file));
 return {trial_id:row.trial_id,url:`https://raw.githubusercontent.com/${publisher}/${revision}/reports/${row.file}`,sha256:digest(body),text:body.toString('utf8')};
}
function checkRecord(record,row,index,d,numeric){
 const expected=source(row,d.fixture_revision),paragraphs=expected.text.replace(/\r\n/g,'\n').split('\n\n').map(x=>x.trim()).filter(Boolean);
 assert(equal(Object.keys(record).sort(),['index','trial_id','report','decisions','observation','numerator','denominator','status'].sort()),'Exact record fields');
 assert(record.index===index&&record.trial_id===row.trial_id&&record.observation===row.observation,'Ordered trial interpretation');
 assert(equal(record.report,{url:expected.url,sha256:expected.sha256,text:expected.text,paragraphs}),'Full committed report');
 assert(equal(Object.keys(record.decisions).sort(),[...keys].sort()),'Exact dimension vector');
 for(let i=0;i<keys.length;i++){
  const v=record.decisions[keys[i]];
  assert(equal(Object.keys(v).sort(),['paragraph','value'])&&v.value===row.values[i],'Independent expected dimension');
  assert(Number.isInteger(v.paragraph)&&v.paragraph>=-1&&v.paragraph<paragraphs.length&&(v.paragraph>=0||v.value==='UNKNOWN'),'Material anchor bounds');
 }
 assert(record.numerator===numeric.numerator&&record.denominator===numeric.denominator&&record.status===numeric.status,'Exact prefix ratio/status');
}
function checkState(state,d,expectedAttempts,expectedCursor){
 const rows=config.cases[d.name],manifest=rows.map(row=>{const {text,...r}=source(row,d.fixture_revision);return r;});
 assert(equal(Object.keys(state).sort(),['target','cursor','numerator','denominator','status','attempts','manifest','records','last_attempt'].sort()),'Exact state fields');
 assert(state.target===config.target&&equal(state.manifest,manifest)&&equal(manifest,d.manifest),'Immutable plan');
 assert(state.cursor===expectedCursor&&state.attempts===expectedAttempts&&state.records.length===expectedCursor,'Exact cursor/attempt count');
 const outcomes=[];
 for(let i=0;i<state.records.length;i++){
  assert(rows[i].observation!=='VOID','VOID must not enter accepted history');
  outcomes.push(rows[i].observation);const r=ratio(outcomes,rows.length);
  checkRecord(state.records[i],rows[i],i,d,r);
  assert(i===state.records.length-1||r.status==='RUNNING','No trials after terminal boundary');
 }
 const numeric=ratio(outcomes,rows.length);
 assert(state.numerator===numeric.numerator&&state.denominator===numeric.denominator,'Exact ledger ratio');
 if(expectedAttempts>expectedCursor){
  assert(rows[expectedCursor].observation==='VOID'&&state.status==='BLOCKED','VOID blocks next row');
  checkRecord(state.last_attempt,rows[expectedCursor],expectedCursor,d,{...numeric,status:'BLOCKED'});
 }else{
  assert(state.status===numeric.status&&equal(state.last_attempt,state.records.at(-1)||null),'Latest accepted observation');
 }
 return true;
}
const cases={clear:{used:8,attempts:8,status:'CLEAR'},flag:{used:3,attempts:3,status:'FLAG'},exhausted:{used:2,attempts:2,status:'EXHAUSTED'},blocked:{used:0,attempts:2,status:'BLOCKED'}};
module.exports={config,publisher,keys,source,ratio,checkState,cases};
