
import { getAllPoliticians } from "./dataService";
import { ElectionPrediction, Politician } from "../types";

/**
 * Calculates election probability based on Neta App's internal data.
 * Formula: NetScore = Upvotes - (Downvotes * 0.8) - (Pending Complaints * 5)
 */
export const calculateElectionPredictions = (): ElectionPrediction[] => {
    const politicians = getAllPoliticians();
    const partyStats: Record<string, { score: number, seats: number }> = {};
    
    const parties = ['BJP', 'INC', 'AAP', 'AITC', 'SP'];
    parties.forEach(p => partyStats[p] = { score: 0, seats: 0 });
    partyStats['Others'] = { score: 0, seats: 0 };

    politicians.forEach(p => {
        const up = p.votes.up;
        const down = p.votes.down;
        const complaints = p.complaintStats?.pending || 0;
        
        // Internal Algo: Complaints have a high penalty
        const netScore = up - (down * 0.8) - (complaints * 5);
        
        const partyKey = parties.includes(p.party) ? p.party : 'Others';
        partyStats[partyKey].score += netScore;
        
        // Simple seat projection based on score positivity per "unit" (mocked)
        if (netScore > 0) {
            partyStats[partyKey].seats += 1; 
        }
    });

    // Normalize to percentage share of total "positive" score
    const totalScore = Object.values(partyStats).reduce((a, b) => a + Math.max(0, b.score), 0);
    
    const predictions: ElectionPrediction[] = Object.keys(partyStats).map(party => {
        const stats = partyStats[party];
        const rawProb = totalScore > 0 ? (Math.max(0, stats.score) / totalScore) * 100 : 0;
        
        // Determine Sentiment
        let sentiment = 0;
        if (rawProb > 30) sentiment = 80;
        else if (rawProb > 15) sentiment = 40;
        else sentiment = -20;

        return {
            party,
            winProbability: Math.round(rawProb), 
            // Extrapolate small sample to 543 seats for visualization
            projectedSeats: Math.floor((rawProb / 100) * 543), 
            sentimentScore: sentiment,
            color: getPartyColor(party)
        };
    });

    return predictions.sort((a, b) => b.winProbability - a.winProbability);
};

const getPartyColor = (party: string) => {
    switch(party) {
        case 'BJP': return '#f97316'; // Orange
        case 'INC': return '#3b82f6'; // Blue
        case 'AAP': return '#eab308'; // Yellow
        case 'AITC': return '#10b981'; // Green
        case 'SP': return '#ef4444'; // Red
        default: return '#94a3b8'; // Gray
    }
};
