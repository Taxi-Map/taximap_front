/**
 * Fuzzy search utilities for matching user input to stop names
 * even when they misspell words (e.g., "danjereux" -> "Dangereux")
 */

/**
 * Calculate Levenshtein distance between two strings
 * Lower distance = more similar
 */
export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    const aLen = a.length;
    const bLen = b.length;

    if (aLen === 0) return bLen;
    if (bLen === 0) return aLen;

    // Initialize matrix
    for (let i = 0; i <= bLen; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= aLen; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= bLen; i++) {
        for (let j = 1; j <= aLen; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[bLen][aLen];
}

/**
 * Calculate similarity score between 0 and 1
 * 1 = identical, 0 = completely different
 */
export function stringSimilarity(a: string, b: string): number {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    if (aLower === bLower) return 1;

    const distance = levenshteinDistance(aLower, bLower);
    const maxLen = Math.max(aLower.length, bLower.length);

    return maxLen === 0 ? 1 : 1 - (distance / maxLen);
}

/**
 * Check if string contains a fuzzy match
 * Returns true if any word in the target starts similarly to the query
 */
export function fuzzyContains(query: string, target: string): boolean {
    const queryLower = query.toLowerCase().trim();
    const targetLower = target.toLowerCase();

    // Exact substring match is always valid
    if (targetLower.includes(queryLower)) return true;

    // Check word-by-word similarity
    const targetWords = targetLower.split(/\s+/);

    for (const word of targetWords) {
        // If query is similar to beginning of word
        const wordStart = word.substring(0, queryLower.length);
        if (stringSimilarity(queryLower, wordStart) > 0.6) return true;

        // Full word similarity
        if (stringSimilarity(queryLower, word) > 0.6) return true;
    }

    // Check overall similarity for short queries
    if (queryLower.length >= 3) {
        if (stringSimilarity(queryLower, targetLower) > 0.5) return true;
    }

    return false;
}

export interface FuzzySearchResult<T> {
    item: T;
    score: number;
}

/**
 * Search and sort items by similarity to query
 * Returns items sorted by best match first
 */
export function fuzzySearch<T>(
    query: string,
    items: T[],
    getSearchField: (item: T) => string,
    minScore: number = 0.3
): FuzzySearchResult<T>[] {
    const queryLower = query.toLowerCase().trim();

    if (queryLower.length === 0) {
        return items.map(item => ({ item, score: 0 }));
    }

    const results: FuzzySearchResult<T>[] = [];

    for (const item of items) {
        const field = getSearchField(item).toLowerCase();

        // Exact substring gets highest priority
        if (field.includes(queryLower)) {
            // Boost score based on where match occurs
            const position = field.indexOf(queryLower);
            const positionBonus = position === 0 ? 0.2 : 0;
            results.push({ item, score: 1 + positionBonus });
            continue;
        }

        // Calculate fuzzy similarity
        const similarity = stringSimilarity(queryLower, field);

        // Also check word-level similarity
        const words = field.split(/\s+/);
        let bestWordScore = 0;
        for (const word of words) {
            const wordSim = stringSimilarity(queryLower, word);
            bestWordScore = Math.max(bestWordScore, wordSim);
        }

        const finalScore = Math.max(similarity, bestWordScore);

        if (finalScore >= minScore) {
            results.push({ item, score: finalScore });
        }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
}
