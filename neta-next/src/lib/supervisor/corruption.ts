export function estimateCorruptionProbability(p: {
  criminalCases: number;
  totalAssets?: number;
  approvalRating: number;
  voteVelocity: number;
}) {
  let score = 0;

  score += p.criminalCases * 10;

  if (p.totalAssets && p.totalAssets > 100000000) {
    score += 10;
  }

  if (p.approvalRating < 20) {
    score += 15;
  }

  if (p.voteVelocity > 2000) {
    score += 20;
  }

  return Math.min(score, 100);
}

