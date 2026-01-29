const axios = require('axios');

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * PubMed API Client
 */
class PubMedAPI {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
        });
    }

    /**
     * Search for articles by keyword
     */
    async search(query, retmax = 100) {
        try {
            const response = await this.client.get('/esearch.fcgi', {
                params: {
                    db: 'pubmed',
                    term: query,
                    retmax,
                    retmode: 'json',
                },
            });

            const idList = response.data.esearchresult?.idlist || [];
            return {
                success: true,
                ids: idList,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                ids: [],
            };
        }
    }

    /**
     * Fetch details for given PubMed IDs
     */
    async fetchDetails(pmids) {
        if (!pmids || pmids.length === 0) {
            return { success: true, papers: [] };
        }

        try {
            const response = await this.client.get('/esummary.fcgi', {
                params: {
                    db: 'pubmed',
                    id: pmids.join(','),
                    retmode: 'json',
                },
            });

            const result = response.data.result;
            const papers = [];

            pmids.forEach(pmid => {
                const article = result[pmid];
                if (article && article.title) {
                    const authors = (article.authors || []).map(a => ({ name: a.name }));
                    const year = article.pubdate ? new Date(article.pubdate).getFullYear() : null;

                    papers.push({
                        pmid,
                        title: article.title,
                        abstract: article.abstract || '',
                        authors,
                        year,
                        journal: article.source || '',
                        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
                        source: 'pubmed',
                        citationCount: 0
                    });
                }
            });

            return {
                success: true,
                papers,
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
     * Search and fetch combined
     */
    async searchAndFetch(query, limit = 50) {
        try {
            const searchResult = await this.search(query, limit);
            if (!searchResult.success || searchResult.ids.length === 0) {
                return { success: true, papers: [] };
            }

            const detailsResult = await this.fetchDetails(searchResult.ids);
            return detailsResult;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                papers: [],
            };
        }
    }

    /**
     * Batch search by multiple keywords
     */
    async batchSearch(keywords, limitPerKeyword = 50) {
        try {
            const promises = keywords.map(keyword =>
                this.searchAndFetch(keyword, limitPerKeyword)
            );

            const results = await Promise.allSettled(promises);
            const allPapers = [];
            const seenPmids = new Set();

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value.success) {
                    result.value.papers.forEach(paper => {
                        if (paper.pmid && !seenPmids.has(paper.pmid)) {
                            seenPmids.add(paper.pmid);
                            allPapers.push(paper);
                        }
                    });
                }
            });

            return {
                success: true,
                papers: allPapers
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                papers: []
            };
        }
    }
}

module.exports = new PubMedAPI();
