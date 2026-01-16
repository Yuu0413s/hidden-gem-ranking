/**
 * ベイズ推定を用いたスコア計算（ベータ分布の事後期待値）
 * * @param upVotes 高評価の数 (成功回数)
 * @param downVotes 低評価の数 (失敗回数)
 * @param priorAlpha 事前分布のα (デフォルト2: 理由不十分の原則などに基づき調整)
 * @param priorBeta 事前分布のβ (デフォルト2)
 * @returns 補正後のスコア (0.0 ~ 1.0)
 */
export const calculateBayesianScore = (
    upVotes: number,
    downVotes: number,
    priorAlpha: number = 2,
    priorBeta: number = 2
): number => {
    // 事後分布のパラメータ更新
    const posteriorAlpha = priorAlpha + upVotes;
    const posteriorBeta = priorBeta + downVotes;

    // ベータ分布の期待値 E[X] = α / (α + β)
    return posteriorAlpha / (posteriorAlpha + posteriorBeta);
};

/**
 * 単純な平均スコア（比較用）
 */
export const calculateSimpleAverage = (upVotes: number, downVotes: number): number => {
    if (upVotes + downVotes === 0) return 0;
    return upVotes / (upVotes + downVotes);
};