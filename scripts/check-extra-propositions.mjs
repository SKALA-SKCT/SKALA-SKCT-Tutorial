import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
const loader = registerHooks({resolve(s,c,n){ return n(s.startsWith('.') && !/\.[cm]?[jt]sx?$/.test(s) ? `${s}.ts` : s,c); }});
try {
  const { VR_PROPOSITION_EXTRA: questions } = await import('../src/data/extraBanks/vrProposition.ts');
  let checked = 0;
  let conditionalChecked = 0;
  for (const q of questions) {
    if (!q.passage.includes('모든') && !q.passage.includes('어떤')) {
      const names = [];
      const atom = clause => {
        const name = clause.trim().split(' ')[0];
        if (!names.includes(name)) names.push(name);
        return { index:names.indexOf(name), negative:/지 않/.test(clause) };
      };
      const parse = text => {
        const parts = text.replace(/\.$/,'').split(/면 /);
        assert.equal(parts.length,2, `${q.id}: ${text}`);
        return parts.map(atom);
      };
      const lines = q.passage.split('\n');
      const premises = lines.filter(s=>/^[ㄱㄴㄷㄹ]\./.test(s) && !s.includes('빈칸')).map(s=>parse(s.slice(3)));
      const choices = q.choices.map(parse);
      const conclusion = lines.find(s=>s.startsWith('따라서 '));
      const target = conclusion ? parse(conclusion.slice(4)) : null;
      assert(names.length >= 4 && names.length <= 5, q.id);
      const holds = (rule,world) => {
        const value = a => !!(world & 2**a.index) !== a.negative;
        return !value(rule[0]) || value(rule[1]);
      };
      const worlds = Array.from({length:2**names.length},(_,i)=>i).filter(w=>premises.every(p=>holds(p,w)));
      assert(worlds.length, q.id);
      const eligible = choices.flatMap((choice,i)=> {
        const candidates = target ? worlds.filter(w=>holds(choice,w)) : worlds;
        return candidates.length && candidates.every(w=>holds(target ?? choice,w)) ? [i] : [];
      });
      assert.deepEqual(eligible,[q.answer], `${q.id}: 조건 명제 정답 후보`);
      conditionalChecked++;
      continue;
    }
    const names = [];
    const parse = text => {
      const clean = text.trim().replace(/\.$/,'');
      const m = clean.match(/^(모든|어떤) (.+?)(?:은|는) (.+?)(이다|가 아니다|이 아니다)$/) ?? clean.match(/^(어떤) (.+?)도 (.+?)(가 아니다|이 아니다)$/);
      assert(m, `${q.id}: ${text}`);
      const index = name => { if (!names.includes(name)) names.push(name); return names.indexOf(name); };
      return {a:index(m[2]), b:index(m[3]), universal:m[1]==='모든' || clean.startsWith(`어떤 ${m[2]}도 `), negative:m[4]!=='이다'};
    };
    const lines = q.passage.split('\n');
    const premises = lines.filter(s=>/^[ㄱㄴㄷㄹ]\./.test(s) && !s.includes('빈칸')).map(s=>parse(s.slice(3)));
    const choices = q.choices.map(parse);
    const conclusion = lines.find(s=>s.startsWith('따라서 '));
    const target = conclusion ? parse(conclusion.slice(4)) : null;
    const negate = f => ({...f, universal:!f.universal, negative:!f.negative});
    const satisfies = fs => {
      const witnesses = fs.filter(f=>!f.universal).map(()=>false);
      for(let cell=0; cell<2**names.length; cell++) {
        const predicate = f => !!(cell & 2**f.a) && (!!(cell & 2**f.b) !== f.negative);
        if(fs.some(f=>f.universal && predicate({...f,negative:!f.negative}))) continue;
        fs.filter(f=>!f.universal).forEach((f,i)=>{ if(predicate(f)) witnesses[i]=true; });
      }
      return witnesses.every(Boolean);
    };
    assert(satisfies(premises), q.id);
    const eligible = choices.map((choice,i)=>{
      const ps = target ? [...premises,choice] : premises;
      const c = target ?? choice;
      const truePossible = satisfies([...ps,c]);
      const falsePossible = satisfies([...ps,negate(c)]);
      const correct = target ? satisfies(ps) && !falsePossible : q.stem.includes('알 수 없는') ? truePossible && falsePossible : q.stem.includes('거짓') ? !truePossible : !falsePossible;
      return correct ? i : -1;
    }).filter(i=>i>=0);
    assert.deepEqual(eligible,[q.answer],`${q.id}: 정답 후보`);
    checked++;
  }
  assert.equal(checked,32);
  assert.equal(conditionalChecked,28);
  console.log(`집합 명제 ${checked}문항, 조건 명제 ${conditionalChecked}문항의 모든 선지 검증 완료`);
} finally { loader.deregister(); }
