const axios = require('axios');

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

/**
 * Semantic Scholar API Client
 * Documentation: https://api.semanticscholar.org/
 */

class SemanticScholarAPI {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
        });
    }

    /**
     * Search for papers by keyword
     * @param {string} query - Search query
     * @param {number} limit - Maximum number of results (default: 100)
     * @param {number} offset - Offset for pagination
     * @returns {Promise} - Array of papers
     */
    async searchPapers(query, limit = 100, offset = 0) {
        try {
            const response = await this.client.get('/paper/search', {
                params: {
                    query,
                    limit,
                    offset,
                    fields: 'paperId,title,abstract,authors,year,citationCount,referenceCount,fieldsOfStudy,journal,publicationDate,url,openAccessPdf',
                },
            });

            return {
                success: true,
                papers: response.data.data || [],
                total: response.data.total || 0,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                papers: [],
            };
        }
    }

    /**
     * Get paper details by ID
     * @param {string} paperId - Paper ID
     * @returns {Promise} - Paper details
     */
    async getPaperDetails(paperId) {
        try {
            const response = await this.client.get(`/paper/${paperId}`, {
                params: {
                    fields: 'paperId,title,abstract,authors,year,citationCount,referenceCount,fieldsOfStudy,journal,publicationDate,url,openAccessPdf,citations,references',
                },
            });

            return {
                success: true,
                paper: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Search for papers by multiple keywords (batch search)
     * @param {Array} keywords - Array of keyword strings
     * @param {number} limitPerKeyword - Limit per keyword
     * @returns {Promise} - Combined results
     */
    async batchSearch(keywords, limitPerKeyword = 50) {
        try {
            const promises = keywords.map(keyword =>
                this.searchPapers(keyword, limitPerKeyword)
            );

            const results = await Promise.allSettled(promises);

            const allPapers = [];
            const seenIds = new Set();

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value.success) {
                    result.value.papers.forEach(paper => {
                        if (paper.paperId && !seenIds.has(paper.paperId)) {
                            seenIds.add(paper.paperId);
                            allPapers.push({
                                ...paper,
                                source: 'semanticscholar',
                            });
                        }
                    });
                }
            });

            return {
                success: true,
                papers: allPapers,
                count: allPapers.length,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                papers: [],
            };
        }
    }

    /**
     * Get recommendations based on a paper
     * @param {string} paperId - Paper ID
     * @param {number} limit - Maximum number of recommendations
     * @returns {Promise} - Recommended papers
     */
    async getRecommendations(paperId, limit = 20) {
        try {
            const response = await this.client.get(`/paper/${paperId}/recommendations`, {
                params: {
                    limit,
                    fields: 'paperId,title,abstract,authors,year,citationCount,journal',
                },
            });

            return {
                success: true,
                papers: response.data.recommendedPapers || [],
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                papers: [],
            };
        }
    }
}

module.exports = new SemanticScholarAPI();
