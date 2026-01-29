const axios = require('axios');

const BASE_URL = 'http://export.arxiv.org/api/query';

/**
 * arXiv API Client
 */
class ArxivAPI {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
        });
    }

    /**
     * Parse arXiv XML entry
     */
    parseEntry(entryString) {
        try {
            const idMatch = entryString.match(/<id>(.*?)<\/id>/);
            const titleMatch = entryString.match(/<title>(.*?)<\/title>/s);
            const summaryMatch = entryString.match(/<summary>(.*?)<\/summary>/s);
            const publishedMatch = entryString.match(/<published>(.*?)<\/published>/);
            const authorMatches = [...entryString.matchAll(/<author>\s*<name>(.*?)<\/name>\s*<\/author>/g)];

            const id = idMatch ? idMatch[1] : '';
            const title = titleMatch ? titleMatch[1].replace(/\n/g, ' ').trim() : '';
            const summary = summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').trim() : '';
            const published = publishedMatch ? publishedMatch[1] : '';
            const authors = authorMatches.map(m => ({ name: m[1] }));
            const year = published ? new Date(published).getFullYear() : null;

            return {
                arxivId: id,
                title,
                abstract: summary,
                authors,
                year,
                url: id,
                source: 'arxiv',
                citationCount: 0
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * Search papers by query
     */
    async searchPapers(query, limit = 100, start = 0) {
        try {
            const response = await this.client.get('', {
                params: {
                    search_query: `all:${query}`,
                    start,
                    max_results: limit,
                },
                responseType: 'text'
            });

            const data = response.data;
            const entries = data.split('<entry>');
            // First part is header, skip it
            const papers = entries.slice(1).map(entry => this.parseEntry(entry)).filter(p => p);

            return {
                success: true,
                papers,
                total: papers.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                papers: []
            };
        }
    }

    /**
     * Batch search by multiple keywords
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
                        if (paper.arxivId && !seenIds.has(paper.arxivId)) {
                            seenIds.add(paper.arxivId);
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

module.exports = new ArxivAPI();
