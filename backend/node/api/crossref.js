const axios = require('axios');

const BASE_URL = 'https://api.crossref.org';

/**
 * CrossRef API Client
 */
class CrossRefAPI {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
            headers: {
                'User-Agent': 'AcademicPaperSearchApp/1.0',
            },
        });
    }

    /**
     * Search for works
     */
    async searchWorks(query, rows = 100, offset = 0) {
        try {
            const response = await this.client.get('/works', {
                params: {
                    query,
                    rows,
                    offset,
                    sort: 'relevance',
                    order: 'desc',
                },
            });

            const items = response.data.message.items || [];
            const papers = items.map(item => this.formatCrossRefItem(item));

            return {
                success: true,
                papers,
                total: response.data.message['total-results'] || 0,
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
     * Format CrossRef item to standard paper format
     */
    formatCrossRefItem(item) {
        const authors = (item.author || []).map(a => ({
            name: `${a.given || ''} ${a.family || ''}`.trim()
        }));

        return {
            doi: item.DOI,
            title: item.title ? item.title[0] : '',
            abstract: item.abstract || '',
            authors,
            year: item.published ? item.published['date-parts']?.[0]?.[0] : null,
            journal: item['container-title'] ? item['container-title'][0] : '',
            url: item.URL || `https://doi.org/${item.DOI}`,
            source: 'crossref',
            citationCount: item['is-referenced-by-count'] || 0
        };
    }

    /**
     * Batch search by multiple keywords
     */
    async batchSearch(keywords, limitPerKeyword = 50) {
        try {
            const promises = keywords.map(keyword =>
                this.searchWorks(keyword, limitPerKeyword)
            );

            const results = await Promise.allSettled(promises);
            const allPapers = [];
            const seenDois = new Set();

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value.success) {
                    result.value.papers.forEach(paper => {
                        if (paper.doi && !seenDois.has(paper.doi)) {
                            seenDois.add(paper.doi);
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

module.exports = new CrossRefAPI();
