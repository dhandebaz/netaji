
export const levenshteinDistance = (str1: string, str2: string): number => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) { track[0][i] = i; }
  for (let j = 0; j <= str2.length; j += 1) { track[j][0] = j; }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }
  return track[str2.length][str1.length];
};

export const fuzzySearch = <T>(items: T[], searchTerm: string, keys: (keyof T)[]): T[] => {
    if (!searchTerm) return items;
    const lowerTerm = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
        return keys.some((key) => {
            const value = String(item[key]).toLowerCase();
            // Direct match (includes)
            if (value.includes(lowerTerm)) return true;
            
            // Fuzzy match on words
            const words = value.split(/[\s-]+/); // Split by space or hyphen
            
            // Dynamic threshold based on search term length
            // Length <= 3: Exact match usually preferred, but 0 tolerance for safety
            // Length 4-6: 1 typo allowed
            // Length > 6: 2 typos allowed
            const threshold = lowerTerm.length <= 3 ? 0 : lowerTerm.length <= 6 ? 1 : 2;
            
            if (threshold === 0) return false;

            return words.some(word => {
                // Optimization: If length difference is too big, don't compute distance
                if (Math.abs(word.length - lowerTerm.length) > threshold) return false;
                return levenshteinDistance(word, lowerTerm) <= threshold;
            });
        });
    });
};
