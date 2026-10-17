// Exercise verifier fixture semantics before sending any live transactions.
const fs=require('node:fs'),path=require('node:path');
const {root,assert}=require('./transport.cjs');
const {config,source,ratio,checkState,cases}=require('./proof-checks.cjs');
const revision='a'.repeat(40),keys=['identity','final','duration','flow','shutdown_free'];
for(const [name,expected] of Object.entries(cases)){
 const rows=config.cases[name],manifest=rows.map(row=>{const {text,...r}=source(row,revision);return r;}),d={name,fixture_revision:revision,manifest};
 const state={target:config.target,cursor:0,numerator:1,denominator:1,status:'RUNNING',attempts:0,manifest,records:[],last_attempt:null},outcomes=[];
 checkState(state,d,0,0);
 for(let attempt=0;attempt<expected.attempts;attempt++){
  const i=state.cursor,row=rows[i],body=source(row,revision),paragraphs=body.text.replace(/\r\n/g,'\n').split('\n\n').map(s=>s.trim()).filter(Boolean);
  if(row.observation!=='VOID'){outcomes.push(row.observation);state.cursor++;Object.assign(state,ratio(outcomes,rows.length));}else state.status='BLOCKED';
  state.attempts++;
  state.last_attempt={index:i,trial_id:row.trial_id,report:{url:body.url,sha256:body.sha256,text:body.text,paragraphs},decisions:Object.fromEntries(keys.map((k,j)=>[k,{value:row.values[j],paragraph:row.anchors[j]}])),observation:row.observation,numerator:state.numerator,denominator:state.denominator,status:state.status};
  if(row.observation!=='VOID')state.records.push(state.last_attempt);
  checkState(state,d,state.attempts,state.cursor);
 }
 assert(state.status===expected.status&&state.cursor===expected.used,'Final synthetic trace');
}
console.log('Verifier accepts all four expected fixture traces');
