import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
const loader=registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&!/\.[cm]?[jt]sx?$/.test(s)?`${s}.ts`:s,c);}});
try {
  const {VR_TRUTH_EXTRA:questions}=await import('../src/data/extraBanks/vrTruth.ts');
  assert.equal(questions.length,60);
  for(const q of questions){
    const lines=q.passage.split('\n');
    const names=lines.map(s=>s.split(':')[0]);
    const statements=lines.map(s=>s.slice(s.indexOf('“')+1,s.lastIndexOf('”')));
    const evaluate=(text,speaker,actors,truths)=>{
      const subjects=names.flatMap((name,i)=>text.includes(name)?[i]:[]);
      if(/^(?:나[는와]|내가)/.test(text)) subjects.unshift(speaker);
      assert(subjects.length && subjects.length<=2,`${q.id}: ${text}`);
      if(/말은|진실을|거짓말|진술은/.test(text)){
        assert.equal(subjects.length,1,q.id);
        return truths[subjects[0]] !== /거짓/.test(text);
      }
      const negative=/않|아니다/.test(text);
      const values=subjects.map(i=>actors[i]!==negative);
      return /중 (?:적어도 )?한 명/.test(text)?values.some(Boolean):values.every(Boolean);
    };
    const actorCount=/다섯 사람 중 두 명/.test(q.stem)?2:1;
    const liarCount=/한 명만 참/.test(q.stem)?4:/두 명만 참/.test(q.stem)?3:/두 명(?:만|은) 거짓/.test(q.stem)?2:1;
    const samePeople=/사람 (?:한|두) 명만 거짓/.test(q.stem);
    const includesActor=/포함한 두 명/.test(q.stem);
    const worlds=[];
    for(let a=0;a<32;a++){
      const actors=names.map((_,i)=>!!(a&2**i));
      if(actors.filter(Boolean).length!==actorCount)continue;
      for(let t=0;t<32;t++){
        const truths=names.map((_,i)=>!!(t&2**i));
        if(truths.filter(x=>!x).length!==liarCount)continue;
        if((samePeople||includesActor)&&actors.some((x,i)=>x&&truths[i]))continue;
        if(statements.every((s,i)=>evaluate(s,i,actors,truths)===truths[i]))worlds.push({actors,truths});
      }
    }
    assert.equal(worlds.length,1,`${q.id}: 가능한 경우 수`);
    const {actors,truths}=worlds[0];
    const candidates=q.choices.flatMap((choice,i)=>{
      let valid;
      if(q.stem.includes('항상 참'))valid=evaluate(choice,-1,actors,truths);
      else if(q.stem.includes('순서대로')){
        const pair=choice.split(', ');
        valid=!truths[names.indexOf(pair[0])]&&actors[names.indexOf(pair[1])];
      }else valid=choice.split(', ').every(name=>actors[names.indexOf(name)]);
      return valid?[i]:[];
    });
    assert.deepEqual(candidates,[q.answer],`${q.id}: 정답 후보`);
  }
  console.log('진실게임 60문항의 전체 인물 조합, 진술, 정답 검증 완료');
}finally{loader.deregister();}
