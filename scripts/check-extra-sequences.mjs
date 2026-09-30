import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
const loader=registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&!/\.[cm]?[jt]sx?$/.test(s)?`${s}.ts`:s,c);}});
try{
 const {EXTRA_QUESTION_BANK:bank}=await import('../src/data/extraQuestions.ts');
 const qs=bank.filter(q=>q.categoryId==='sequence-reasoning');
 assert.equal(qs.length,180);
 const equal=(a,b)=>Math.abs(a-b)<1e-6;
 const arithmetic=ns=>ns.slice(2).every((n,i)=>equal(n-ns[i+1],ns[1]-ns[0]));
 const geometric=ns=>ns.slice(2).every((n,i)=>equal(n,ns[i+1]*ns[1]/ns[0]));
 for(const q of qs){
  const values=q.visuals.find(v=>v.type==='sequence').items.map(x=>x.value);
  const candidates=q.choices.flatMap((choice,index)=>{
   const ns=values.map(x=>x.trim()==='(   )'?Number(choice):Number(x));
   assert(ns.every(Number.isFinite),q.id);
   let valid;
   if(q.kindId==='sr-arithgeo-1') valid=geometric(ns);
   else if(q.kindId==='sr-various-1')valid=[0,1].every(parity=>{
    const group=ns.filter((_,i)=>i%2===parity);
    return arithmetic(group)||geometric(group);
   });
   else {
    const diffs=ns.slice(1).map((n,i)=>n-ns[i]);
    valid=[2,3,4].some(period=>diffs.length>=2*period&&diffs.slice(period).every((d,i)=>equal(d,diffs[i%period])));
   }
   return valid?[index]:[];
  });
  assert.deepEqual(candidates,[q.answer],`${q.id}: 수열 규칙 정답 후보`);
 }
 console.log('수열 추가 180문항: 표시된 항과 모든 선지의 규칙 검증 완료');
}finally{loader.deregister();}
