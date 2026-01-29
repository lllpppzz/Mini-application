const semanticScholarAPI = require('../api/semanticScholar.js');
const arxivAPI = require('../api/arxiv.js');
const crossrefAPI = require('../api/crossref.js');
const pubmedAPI = require('../api/pubmed.js');
const cnkiAPI = require('../api/cnki.js');
const { extractKeywords, calculateSimilarity } = require('../pythonBridge.js');

/**
 * Unified Search Engine
 * Orchestrates searches across multiple academic databases
 */

class SearchEngine {
  constructor() {
    this.apis = {
      semanticscholar: semanticScholarAPI,
      arxiv: arxivAPI,
      crossref: crossrefAPI,
      pubmed: pubmedAPI,
      cnki: cnkiAPI,
    };
  }

  /**
   * Search using reference papers
   * 1. Extract keywords from references
   * 2. Search databases
   * 3. Rank results based on similarity to references
   */
  async searchWithReferences(referencePapers, options = {}) {
    try {
      // 1. Extract keywords
      const keywords = await this.extractSearchKeywords(referencePapers);

      if (keywords.length === 0) {
        return { success: false, error: 'No keywords extracted from references' };
      }

      // 2. Search databases
      const searchResults = await this.searchAll(keywords, options);

      // Flatten results
      let candidates = [];
      searchResults.forEach(result => {
        if (result.success) {
          candidates = [...candidates, ...result.papers];
        }
      });

      // Remove duplicates
      const uniqueCandidates = this.deduplicatePapers(candidates);
      console.log(`[SearchEngine] Found ${uniqueCandidates.length} unique candidates`);

      if (uniqueCandidates.length === 0) {
        return { success: true, papers: [] };
      }

      // Prepare texts for similarity calculation
      const referenceTexts = referencePapers.map(p => {
        const parts = [];
        if (p.metadata?.title) parts.push(p.metadata.title);
        if (p.content?.abstract) parts.push(p.content.abstract);
        if (p.content?.keywords) parts.push(p.content.keywords.join(' '));
        return parts.join(' ');
      });

      const candidateTexts = uniqueCandidates.map(p => {
        const parts = [];
        if (p.title) parts.push(p.title);
        if (p.abstract) parts.push(p.abstract);
        return parts.join(' ');
      });

      // 3. Calculate similarity and rank
      const similarityResult = await calculateSimilarity(referenceTexts, candidateTexts);

      if (similarityResult.success) {
        // Add scores to papers
        const rankedPapers = uniqueCandidates.map((paper, index) => {
          const similarityScore = similarityResult.similarities ? similarityResult.similarities[index] : (similarityResult.scores ? similarityResult.scores[index] : 0);
          return {
            ...paper,
            score: this.calculateCompositeScore(paper, similarityScore),
            similarity: similarityScore,
          };
        });

        // Sort by score
        rankedPapers.sort((a, b) => b.score - a.score);

        return {
          success: true,
          papers: rankedPapers,
        };
      } else {
        console.error('[SearchEngine] Similarity calculation failed:', similarityResult.error);
        // Return unranked results
        return {
          success: true,
          papers: uniqueCandidates.map(paper => ({
            ...paper,
            score: 0,
            similarity: 0
          })),
        };
      }

    } catch (error) {
      console.error('[SearchEngine] Error in searchWithReferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extracts keywords from a list of reference papers.
   */
  async extractSearchKeywords(referencePapers) {
    const texts = referencePapers.map(p => {
      const parts = [];
      if (p.metadata?.title) parts.push(p.metadata.title);
      if (p.content?.abstract) parts.push(p.content.abstract);
      if (p.content?.keywords) parts.push(p.content.keywords.join(' '));
      return parts.join(' ');
    });

    console.log('[SearchEngine] Extracting keywords from', referencePapers.length, 'papers');
    const keywordResult = await extractKeywords(texts, 20);
    console.log('[SearchEngine] Keyword extraction result:', JSON.stringify(keywordResult));

    let keywords = [];
    if (keywordResult.success) {
      keywords = keywordResult.keywords.map(([keyword, score]) => keyword);
      console.log('[SearchEngine] Extracted keywords:', keywords);
    } else {
      console.error('[SearchEngine] Keyword extraction failed:', keywordResult.error);
      // Fallback: use titles
      keywords = referencePapers.map(p => p.metadata?.title).filter(t => t);
    }
    return keywords;
  }

  /**
   * Search across all databases
   */
  async searchAll(keywords, options = {}) {
    const {
      sources = ['semanticscholar', 'arxiv', 'crossref', 'pubmed', 'cnki'],
      limitPerSource = 50,
      limitPerKeyword = 20,
    } = options;

    console.log('[SearchEngine] Starting search with keywords:', keywords);
    console.log('[SearchEngine] Sources:', sources);

    try {
      const searchPromises = sources.map(async (source) => {
        const api = this.apis[source];
        if (!api) return { success: false, source, papers: [] };

        try {
          console.log(`[SearchEngine] Searching ${source}...`);
          const result = await api.batchSearch(keywords, limitPerKeyword);
          console.log(`[SearchEngine] ${source} returned ${result.papers?.length || 0} papers`);
          return {
            success: true,
            source,
            papers: result.papers || [],
          };
        } catch (error) {
          console.error(`[SearchEngine] Error searching ${source}:`, error);
          return {
            success: false,
            source,
            papers: [],
            error: error.message,
          };
        }
      });

      return await Promise.all(searchPromises);
    } catch (error) {
      console.error('[SearchEngine] Error in searchAll:', error);
      return [];
    }
  }

  /**
   * Remove duplicate papers based on ID, DOI, or Title
   */
  deduplicatePapers(papers) {
    const seen = new Set();
    return papers.filter(paper => {
      const id = paper.paperId || paper.doi || paper.arxivId || paper.pmid || paper.title;
      if (!id) return false;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  /**
   * Calculate composite score (simplified - no IF/partition)
   */
  calculateCompositeScore(paper, similarity) {
    const w1 = 0.5; // Similarity weight (increased)
    const w2 = 0.3; // Citation weight (increased)
    const w3 = 0.2; // Recency weight (increased)

    // Normalize citation count (log scale)
    const citationScore = Math.min(Math.log10((paper.citationCount || 0) + 1) / 4, 1);

    // Normalize recency (linear decay over 10 years)
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - (paper.year || currentYear));
    const recencyScore = Math.max(0, 1 - age / 10);

    return (
      w1 * similarity +
      w2 * citationScore +
      w3 * recencyScore
    );
  }


}

module.exports = new SearchEngine();
