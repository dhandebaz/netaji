export function computePoliticianRisk(p: {
  criminalCases: number;
  approvalRating: number;
  votesUp: number;
  attendance?: number;
}) {
  let score = 0;

  score += p.criminalCases * 5;

  if (p.approvalRating < 20) score += 15;
  if (p.votesUp > 10000 && p.approvalRating < 15) score += 25;
  if (p.attendance !== undefined && p.attendance < 40) score += 10;

  return Math.min(score, 100);
}

