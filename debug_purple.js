const GENE_CONFIG = {
  Normal: { type: 'recessive', normal: 'N', mutant: 'X', name: 'ノーマル' },
  Whiteout: { type: 'co-dominant', normal: 'N', mutant: 'W', name: 'ホワイトアウト', visual_het: 'ホワイトアウト' },
  Oreo: { type: 'recessive', normal: 'N', mutant: 'o', name: 'オレオ' },
  Zulu: { type: 'recessive', normal: 'N', mutant: 'z', name: 'ズールー' },
  Caramel: { type: 'recessive', normal: 'N', mutant: 'c', name: 'キャラメル' },
  Patternless: { type: 'recessive', normal: 'N', mutant: 'p', name: 'パターンレス' },
  Ghost: { type: 'recessive', normal: 'N', mutant: 'g', name: 'ゴースト' },
  Amelanistic: { type: 'recessive', normal: 'N', mutant: 'a', name: 'アメラニスティック（アメル）' }
};
const COMBO_RULES = [
  { name: 'ゴールドヘイズ', requires: ['ゴースト', 'キャラメル', 'オレオ', 'パターンレス'] },
  { name: 'ラキビオ', requires: ['アメラニスティック（アメル）', 'キャラメル', 'オレオ'] },
  { name: 'パープルヘイズ', requires: ['ゴースト', 'オレオ', 'パターンレス'] },
  { name: 'ラキビノ', requires: ['アメラニスティック（アメル）', 'キャラメル'] },
  { name: 'スノー', requires: ['オレオ', 'キャラメル'] }
];
function getParentDataFromObject(paramObj, options = {}) {
    const states = { Normal: 'none', Whiteout: 'none', Zulu: 'none', Oreo: 'none', Caramel: 'none', Patternless: 'none', Ghost: 'none', Amelanistic: 'none' };
    const comboMode = options.comboMode || 'strict';
    function maxState(s1, s2) {
        if (s1 === 'homo' || s2 === 'homo') return 'homo';
        if (s1 === 'het' || s2 === 'het') return 'het';
        return 'none';
    }
    for (const key in paramObj) {
        const val = paramObj[key] || 'none';
        if (val === 'none') continue;
        if (key === 'PurpleHaze' || key === 'GoldHaze') {
            const effectiveValue = val;
            const loci = key === 'PurpleHaze' ? ['Ghost', 'Oreo', 'Patternless'] : ['Ghost', 'Caramel', 'Oreo', 'Patternless'];
            loci.forEach(locus => { states[locus] = maxState(states[locus], effectiveValue); });
        } else {
            if (key === 'Whiteout') states.Whiteout = maxState(states.Whiteout, val);
            else if (key === 'Oreo') states.Oreo = maxState(states.Oreo, val);
            else if (key === 'Caramel') states.Caramel = maxState(states.Caramel, val);
            else if (key === 'Patternless') states.Patternless = maxState(states.Patternless, val);
            else if (key === 'Ghost') states.Ghost = maxState(states.Ghost, val);
            else if (key === 'Amelanistic') states.Amelanistic = maxState(states.Amelanistic, val);
        }
    }
    const GENE_PAIR_MAP = {
        Normal: { none: ['N','N'], homo: ['N','N'] },
        Whiteout: { none: ['N','N'], het: ['N','W'], homo: ['W','W'] },
        Oreo: { none: ['N','N'], het: ['N','o'], homo: ['o','o'] },
        Zulu: { none: ['N','N'], het: ['N','z'], homo: ['z','z'] },
        Caramel: { none: ['N','N'], het: ['N','c'], homo: ['c','c'] },
        Patternless: { none: ['N','N'], het: ['N','p'], homo: ['p','p'] },
        Ghost: { none: ['N','N'], het: ['N','g'], homo: ['g','g'] },
        Amelanistic: { none: ['N','N'], het: ['N','a'], homo: ['a','a'] }
    };
    const data = {};
    for (const locus in states) data[locus] = GENE_PAIR_MAP[locus][states[locus]];
    return data;
}
function calculateOffspring(p1,p2){
    const loci = Object.keys(GENE_CONFIG);
    let combinations=[{ genotype:{}, probability:1.0 }];
    for(const locus of loci){
        if(!p1[locus]||!p2[locus]) continue;
        const map = {};
        for(const a1 of p1[locus]) for(const a2 of p2[locus]){ const outcome=[a1,a2].sort().join(''); map[outcome]=(map[outcome]||0)+0.25; }
        const next=[];
        for(const current of combinations) for(const outcome in map){ next.push({ genotype:{ ...current.genotype, [locus]:outcome }, probability: current.probability*map[outcome] }); }
        combinations=next;
    }
    const aggregated={};
    for(const item of combinations){ const key=JSON.stringify(item.genotype); if(!aggregated[key]) aggregated[key]={genotype:item.genotype, probability:0}; aggregated[key].probability+=item.probability; }
    let living=[]; let total=0;
    for(const key in aggregated){ const item=aggregated[key]; if(item.genotype.Whiteout==='WW') continue; living.push(item); total+=item.probability; }
    for(const item of living) item.probability/=total;
    const groupResults={};
    for(const item of living){
        const g=item.genotype; let visuals=[]; let hets=[];
        for(const locus in g){ if(locus==='Normal') continue; const pair=g[locus]; const config=GENE_CONFIG[locus]; const mutantCount=(pair.match(new RegExp(config.mutant,'g'))||[]).length;
            if(config.type==='co-dominant'){ if(pair.includes(config.mutant)) visuals.push(config.visual_het); }
            else { if(mutantCount===2) visuals.push(config.name); else if(mutantCount===1) hets.push(locus); }
        }
        let tempVisuals=[...visuals];
        for(const rule of COMBO_RULES){ const hasVisualCombo=rule.requires.every(req=>tempVisuals.includes(req)); if(hasVisualCombo){ tempVisuals=tempVisuals.filter(v=>!rule.requires.includes(v)); tempVisuals.push(rule.name); }}
        const visualNameBase = tempVisuals.length>0?tempVisuals.join(' '):'ノーマル';
        if(!groupResults[visualNameBase]){ groupResults[visualNameBase] = { visualNameBase, totalProbability:0, hetProbabilities:{} }; for(const l in GENE_CONFIG){ if(GENE_CONFIG[l].type==='recessive'&&l!=='Normal') groupResults[visualNameBase].hetProbabilities[l]=0; }}
        groupResults[visualNameBase].totalProbability += item.probability;
        for(const locus of hets) groupResults[visualNameBase].hetProbabilities[locus]+=item.probability;
    }
    const final=[];
    for(const vBase in groupResults){ const group=groupResults[vBase]; const hets=[]; for(const locus of loci){ if(locus==='Normal'||GENE_CONFIG[locus].type!=='recessive') continue; const hetProbInGroup=group.hetProbabilities[locus]; if(hetProbInGroup>0){ const perc=Math.round((hetProbInGroup/group.totalProbability)*100); if(perc===67) perc=66; if(perc===34) perc=33; const name=GENE_CONFIG[locus].name; if(perc===100) hets.push(`Het ${name}`); else if(perc>0) hets.push(`${perc}% Poss Het ${name}`); }} let name = group.visualNameBase; if(hets.length>0){ name = (name==='ノーマル' ? 'ノーマル '+hets.join(' ') : name+' '+hets.join(' ')); } final.push({ morphName:name, percentage:parseFloat((group.totalProbability*100).toFixed(2)) }); }
    return final.sort((a,b)=>b.percentage-a.percentage);
}
const p1=getParentDataFromObject({PurpleHaze:'homo'},{comboMode:'carrier'});
const p2=getParentDataFromObject({PurpleHaze:'homo'},{comboMode:'carrier'});
console.log('p1',p1);
console.log('p2',p2);
console.log(JSON.stringify(calculateOffspring(p1,p2),null,2));
