const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,digest,rpc,read,receiptSummary,save}=require('./transport.cjs');
const {checkState,cases}=require('./proof-checks.cjs');
const load=n=>JSON.parse(fs.readFileSync(path.join(root,'proofs',n+'.json')));
async function main(){
 const offline=process.argv.includes('--offline'),deployments=load('deployments'),code=fs.readFileSync(path.join(root,'contracts/wald_rail.py')),journal=load('transactions');
 assert(equal(deployments.map(d=>d.name),Object.keys(cases)),'Complete four-case proof set');
 assert(journal.source_sha256===digest(code),'Journal source hash');
 if(!offline)assert(await rpc('eth_chainId',[])==='0xf22f','StudioNet only');
 const hashes=new Set(),summary={mode:offline?'offline-artifact':'fresh-rpc-and-state',source_sha256:digest(code),contracts:[],transactions:[]};
 async function verify(label,hash,d,success,sender){
  assert(!hashes.has(hash)&&journal.hashes[label]===hash,'Unique journal-bound transaction');hashes.add(hash);
  const saved=load(label+'-receipt'),r=offline?saved:await rpc('eth_getTransactionByHash',[hash]),s=receiptSummary(r);
  assert(s.hash===hash&&s.status==='FINALIZED'&&s.result==='MAJORITY_AGREE'&&s.agree>(s.agree+s.disagree+s.idle)/2,'Finalized strict majority');
  assert((r.to_address||r.recipient).toLowerCase()===d.contract.toLowerCase()&&(r.from_address||r.sender).toLowerCase()===sender,'Actual destination and signer');
  assert(equal(saved.consensus_data.votes,r.consensus_data.votes),'Saved votes');
  assert(success?['SUCCESS','FINISHED_WITH_RETURN'].includes(s.execution):s.execution==='ERROR','Expected execution outcome');summary.transactions.push({label,...s});
 }
 for(const d of deployments){
  const expected=cases[d.name];assert(d.network==='studionet'&&d.chain_id===61999&&d.source_sha256===digest(code),'Deployment domain');
  assert(d.fixture_revision===fs.readFileSync(path.join(root,'config/fixture-revision.txt'),'utf8').trim(),'Pinned fixtures');
  assert(d.callers.length===2&&new Set(d.callers).size===2,'Distinct test callers');
  await verify(d.name+'-deployment',d.transaction,d,true,d.callers[0]);
  let previous=load(d.name+'-initial-state'),attempts=0,cursor=0;checkState(previous,d,0,0);
  const labels=[...(d.name==='clear'?['clear-skipped']:[]),...Array.from({length:Math.max(expected.used,1)},(_,i)=>d.name+'-step-'+i),...(d.name==='clear'?['clear-terminal']:[]),...(d.name==='blocked'?['blocked-retry','blocked-skipped']:[])];
  for(const label of labels){
   const p=load(label);assert(p.contract===d.contract&&p.method==='step'&&equal(p.state_before,previous),'Continuous proof state');
   const rejected=label.endsWith('-skipped')||label==='clear-terminal',expectedIndex=label.endsWith('-skipped')?1:label==='clear-terminal'?8:label==='blocked-retry'?0:Number(label.split('-').at(-1));
   const caller=label.includes('-step-')?expectedIndex%2:1;
   assert(p.success===!rejected&&p.index===expectedIndex&&p.sender===d.callers[caller],'Fixed case call and signer');
   await verify(label,p.transaction,d,p.success,p.sender);
   if(rejected){
    const reason=label==='clear-terminal'?'[EXPECTED] Audit is terminal':'[EXPECTED] Sequence index does not match';
    assert(p.reason===reason&&equal(previous,p.state)&&JSON.stringify(load(label+'-decoded-receipt')).includes(reason),'Exact rejection without state change');
   }else{
    attempts++;if(d.name!=='blocked')cursor++;
    checkState(p.state,d,attempts,cursor);
   }
   previous=p.state;
  }
  checkState(previous,d,expected.attempts,expected.used);assert(previous.status===expected.status&&equal(previous,load(d.name+'-final-state')),'Exact final case');
  if(!offline){
   assert(code.equals(Buffer.from(await rpc('gen_getContractCode',[d.contract]),'base64')),'Exact live contract bytes');
   assert(equal(previous,await read(d.name+'-fresh',['call',d.contract,'get_state'])),'Fresh final state');
  }
  summary.contracts.push({name:d.name,contract:d.contract,status:previous.status,cursor:previous.cursor,attempts:previous.attempts,numerator:previous.numerator,denominator:previous.denominator});
 }
 assert(hashes.size===22&&Object.keys(journal.hashes).length===22,'Complete twenty-two transaction set');
 if(!offline){summary.live_state_match=true;save('verification',summary);}
 console.log(JSON.stringify(summary,null,2));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
