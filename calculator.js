// ==========================================
// 1. 遺伝子およびコンボモルフの定義データ
// ==========================================

// 遺伝子マスター
const GENE_CONFIG = {
  Whiteout: { type: "co-dominant", normal: "N", mutant: "W", visual_het: "ホワイトアウト", visual_homo: "致死" },
  Oreo: { type: "recessive", normal: "N", mutant: "o", name: "オレオ" },
  Caramel: { type: "recessive", normal: "N", mutant: "c", name: "キャラメル" },
  Patternless: { type: "recessive", normal: "N", mutant: "p", name: "パターンレス" },
  Ghost: { type: "recessive", normal: "N", mutant: "g", name: "ゴースト" },
  Amelanistic: { type: "recessive", normal: "N", mutant: "a", name: "アメラニスティック" }
};

// コンボモルフの変換ルール（条件が厳しい = 必要遺伝子数が多い順に定義すること）
const COMBO_RULES = [
  { name: "ゴールドヘイズ", requires: ["ゴースト", "キャラメル", "オレオ", "パターンレス"] },
  { name: "パープルヘイズ", requires: ["ゴースト", "オレオ", "パターンレス"] },
  { name: "スノー", requires: ["オレオ", "キャラメル"] }
];

// ==========================================
// 2. 計算コアロジック
// ==========================================

/**
 * 2匹の親の遺伝子データから、生まれる子どもの確率を計算する
 * @param {Object} p1 - 親1の遺伝子型オブジェクト
 * @param {Object} p2 - 親2の遺伝子型オブジェクト
 */
function calculateOffspring(p1, p2) {
  const loci = Object.keys(GENE_CONFIG);
  let combinations = [{ genotype: {}, probability: 1.0 }];

  // 各遺伝子座（Locus）ごとにパネット図を計算し、デカルト積（総当たり）で掛け合わせる
  for (const locus of loci) {
    const config = GENE_CONFIG[locus];
    const p1Alleles = p1[locus] || [config.normal, config.normal];
    const p2Alleles = p2[locus] || [config.normal, config.normal];

    // この遺伝子座における子の可能性（4通り）
    const locusOutcomes = [];
    for (const a1 of p1Alleles) {
      for (const a2 of p2Alleles) {
        // 対立遺伝子をアルファベット順等でソートして表記を統一 (例: 'No' と 'oN' を 'No' に統一)
        const sortedGenotype = [a1, a2].sort().join("");
        locusOutcomes.push(sortedGenotype);
      }
    }

    // 既存の組み合わせに今回の遺伝子座の結果を掛け合わせる
    const nextCombinations = [];
    for (const current of combinations) {
      for (const outcome of locusOutcomes) {
        const newGenotype = { ...current.genotype, [locus]: outcome };
        // 4通りの分岐なので確率は 1/4 (0.25) を掛ける
        nextCombinations.push({
          genotype: newGenotype,
          probability: current.probability * 0.25
        });
      }
    }
    combinations = nextCombinations;
  }

  // 同一の遺伝子型を持つデータを集計
  const aggregatedGenotypes = {};
  for (const item of combinations) {
    const key = JSON.stringify(item.genotype);
    if (!aggregatedGenotypes[key]) {
      aggregatedGenotypes[key] = { genotype: item.genotype, probability: 0 };
    }
    aggregatedGenotypes[key].probability += item.probability;
  }

  // 致死遺伝子（ホワイトアウトのホモ: WW）の除外処理
  let livingResults = [];
  let totalLivingProbability = 0;

  for (const key in aggregatedGenotypes) {
    const item = aggregatedGenotypes[key];
    // ホワイトアウトが 'WW' (ホモ) になっている場合は致死としてスキップ
    if (item.genotype.Whiteout === "WW") {
      continue; 
    }
    livingResults.push(item);
    totalLivingProbability += item.probability;
  }

  // 生存する個体の中で確率の合計が 100% (1.0) になるよう正規化
  for (const item of livingResults) {
    item.probability = item.probability / totalLivingProbability;
  }

  // 表現型（見た目の名前）への翻訳とコンボ判定
  const phenotypeResults = {};

  for (const item of livingResults) {
    const name = translateGenotypeToPhenotypeName(item.genotype);
    if (!phenotypeResults[name]) {
      phenotypeResults[name] = 0;
    }
    phenotypeResults[name] += item.probability;
  }

  // 確率の高い順にソートして配列で返す
  return Object.keys(phenotypeResults)
    .map(name => ({
      morphName: name,
      percentage: parseFloat((phenotypeResults[name] * 100).toFixed(2)) // 小数点2桁に丸める
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * 遺伝子型の組み合わせからユーザー向けのモルフ名に翻訳する
 */
function translateGenotypeToPhenotypeName(genotype) {
  let visuals = [];
  let hets = [];

  for (const locus in genotype) {
    const pair = genotype[locus];
    const config = GENE_CONFIG[locus];

    if (config.type === "co-dominant") {
      // 共優性（ホワイトアウトなど）の判定
      if (pair.includes(config.mutant)) {
        // 致死(WW)は前段で除外されているため、ここでは必ずヘテロ(NW)
        visuals.push(config.visual_het);
      }
    } else if (config.type === "recessive") {
      // 劣性遺伝の判定
      const mutantCount = (pair.match(new RegExp(config.mutant, "g")) || []).length;
      if (mutantCount === 2) {
        visuals.push(config.name); // ホモ結合＝見た目に出る
      } else if (mutantCount === 1) {
        hets.push(config.name); // ヘテロ結合＝隠れ遺伝子(Het)
      }
    }
  }

  // --- コンボモルフの判定 ---
  for (const rule of COMBO_RULES) {
    // 必要な視覚的モルフがすべて visuals に含まれているかチェック
    const hasAllRequires = rule.requires.every(req => visuals.includes(req));
    if (hasAllRequires) {
      // 含まれていた場合、元の単一モルフ名を削除し、コンボ名に置き換える
      visuals = visuals.filter(v => !rule.requires.includes(v));
      visuals.push(rule.name);
    }
  }

  // 名前を整形
  let finalName = "";
  if (visuals.length > 0) {
    finalName = visuals.join(" ");
  } else {
    finalName = "ノーマル";
  }

  if (hets.length > 0) {
    finalName += " Het " + hets.join("・");
  }

  return finalName;
}

// 両親のデータ（オレオ、キャラメル、パターンレス、ゴーストの4重ヘテロ）
const parentA = {
  Whiteout: ["N", "N"],
  Oreo: ["N", "o"],
  Caramel: ["N", "c"],
  Patternless: ["N", "p"],
  Ghost: ["N", "g"],
  Amelanistic: ["N", "N"]
};
const parentB = JSON.parse(JSON.stringify(parentA)); // 同じ遺伝子

const result1 = calculateOffspring(parentA, parentB);
console.log("--- 4重ヘテロ同士の交配結果 ---");
// ゴールドヘイズが約0.39%で含まれているか確認
console.log(result1.find(r => r.morphName === "ゴールドヘイズ")); 
// 出力例: { morphName: 'ゴールドヘイズ', percentage: 0.39 }

const whiteoutParent = {
  Whiteout: ["N", "W"], // ホワイトアウト表現体
  Oreo: ["N", "N"], Caramel: ["N", "N"], Patternless: ["N", "N"], Ghost: ["N", "N"], Amelanistic: ["N", "N"]
};

const result2 = calculateOffspring(whiteoutParent, whiteoutParent);
console.log("\n--- ホワイトアウト×ホワイトアウトの交配結果 ---");
console.log(result2);
/* 出力例:
[
  { morphName: 'ホワイトアウト', percentage: 66.67 },
  { morphName: 'ノーマル', percentage: 33.33 }
]
*/