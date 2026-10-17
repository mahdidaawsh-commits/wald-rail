const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,sourceHash,save,invoke,read,rpc,receipt,delay}=require('./transport.cjs');
const {config,source,checkState,cases}=require('./proof-checks.cjs');
async function main(){
 assert(await rpc('eth_chainId',[])==='0xf22f','Gasless StudioNet only');
 const accounts=JSON.parse(process.env.WALD_ACCOUNTS||'null');assert(accounts?.length===2,'Two caller accounts required');
 const revision=fs.readFileSync(path.join(root,'config/fixture-revision.txt'),'utf8').trim();assert(/^[a-f0-9]{40}$/.test(revision),'Pinned fixture revision');
 const deployments=[];
 for(const [name,expected] of Object.entries(cases)){
  const fixtures=config.cases[name].map(row=>source(row,revision)),manifest=fixtures.map(({text,...r})=>r);
  for(const row of fixtures){const r=await fetch(row.url,{signal:AbortSignal.timeout(45000)});assert(r.ok&&Buffer.from(await r.arrayBuffer()).equals(Buffer.from(row.text)),'Published bytes');}
  process.env.WALD_ACCOUNT=accounts[0].name;
  const hash=await invoke(name+'-deployment',['deploy','--contract','contracts/wald_rail.py','--args',config.target,JSON.stringify(manifest.map(r=>r.trial_id)),JSON.stringify(manifest.map(r=>r.url)),JSON.stringify(manifest.map(r=>r.sha256))]);
  const receiptValue=await receipt(name+'-deployment',hash,true),contract=receiptValue.to_address||receiptValue.recipient;
  assert(/^0x[a-f0-9]{40}$/i.test(contract),'Contract address');
  assert(fs.readFileSync(path.join(root,'contracts/wald_rail.py')).equals(Buffer.from(await rpc('gen_getContractCode',[contract]),'base64')),'Exact deployed code');
  const d={name,contract,transaction:hash,manifest,fixture_revision:revision,source_sha256:sourceHash,network:'studionet',chain_id:61999,callers:accounts.map(a=>a.address)};
  deployments.push(d);save('deployments',deployments);
  let state=await read(name+'-initial',['call',contract,'get_state']);checkState(state,d,0,0);save(name+'-initial-state',state);
  let attempts=0,cursor=0;
  async function step(label,index,account,success=true,reason=null){
   process.env.WALD_ACCOUNT=accounts[account].name;
   const before=state,tx=await invoke(label,['write',contract,'step','--args',String(index)]);
   const r=await receipt(label,tx,success);state=await read(label+'-state',['call',contract,'get_state']);
   assert((r.from_address||r.sender).toLowerCase()===accounts[account].address,'Actual signing caller');
   if(!success){
    assert(equal(before,state),'Rejected request changed state');
    const decoded=await read(label+'-decoded',['receipt',tx,'--status','FINALIZED','--retries','2']);
    assert(JSON.stringify(decoded).includes(reason),'Rejection reason');save(label+'-decoded-receipt',decoded);
   }else{
    attempts++;if(config.cases[name][index].observation!=='VOID')cursor++;
    checkState(state,d,attempts,cursor);
   }
   save(label,{contract,transaction:tx,sender:accounts[account].address,success,reason,method:'step',index,state_before:before,state});
  }
  if(name==='clear')await step('clear-skipped',1,1,false,'[EXPECTED] Sequence index does not match');
  for(let i=0;i<Math.max(expected.used,1);i++)await step(name+'-step-'+i,i,i%2);
  if(name==='clear')await step('clear-terminal',expected.used,1,false,'[EXPECTED] Audit is terminal');
  if(name==='blocked'){
   await step('blocked-retry',0,1);
   await step('blocked-skipped',1,1,false,'[EXPECTED] Sequence index does not match');
  }
  checkState(state,d,expected.attempts,expected.used);assert(state.status===expected.status,'Final case status');save(name+'-final-state',state);
  console.log('VERIFIED',name,contract);await delay(4000);
 }
}
main().catch(e=>{console.error(e.stack,e.cause?.message||'');process.exitCode=1;});
