/**
 * Export Service - Handle various export formats
 */

class ExportService {
    /**
     * Export papers to BibTeX format
     */
    exportToBibTeX(papers) {
        const entries = papers.map((paper, index) => {
            const id = paper.paperId || paper.doi || `paper${index}`;
            const type = paper.source === 'arxiv' ? 'article' : 'article';

            const authors = paper.authors?.map(a => a.name).join(' and ') || 'Unknown';
            const title = paper.title || 'Untitled';
            const year = paper.year || new Date().getFullYear();
            const journal = typeof paper.journal === 'string'
                ? paper.journal
                : paper.journal?.name || paper.source || 'Unknown';

            let entry = `@${type}{${id},\n`;
            entry += `  author = {${authors}},\n`;
            entry += `  title = {${title}},\n`;
            entry += `  year = {${year}},\n`;
            entry += `  journal = {${journal}},\n`;

            if (paper.doi) {
                entry += `  doi = {${paper.doi}},\n`;
            }

            if (paper.url) {
                entry += `  url = {${paper.url}},\n`;
            }

            entry += `}\n`;
            return entry;
        });

        return entries.join('\n');
    }

    /**
     * Export papers to EndNote format (RIS)
     */
    exportToEndNote(papers) {
        const entries = papers.map(paper => {
            const type = 'JOUR'; // Journal Article

            let entry = `TY  - ${type}\n`;

            // Authors
            if (paper.authors) {
                paper.authors.forEach(author => {
                    entry += `AU  - ${author.name}\n`;
                });
            }

            // Title
            if (paper.title) {
                entry += `TI  - ${paper.title}\n`;
            }

            // Journal
            const journal = typeof paper.journal === 'string'
                ? paper.journal
                : paper.journal?.name || paper.source || '';
            if (journal) {
                entry += `JO  - ${journal}\n`;
            }

            // Year
            if (paper.year) {
                entry += `PY  - ${paper.year}\n`;
            }

            // DOI
            if (paper.doi) {
                entry += `DO  - ${paper.doi}\n`;
            }

            // URL
            if (paper.url) {
                entry += `UR  - ${paper.url}\n`;
            }

            // Abstract
            if (paper.abstract) {
                entry += `AB  - ${paper.abstract}\n`;
            }

            entry += `ER  - \n\n`;
            return entry;
        });

        return entries.join('');
    }

    /**
     * Export papers to RIS format
     */
    exportToRIS(papers) {
        // RIS and EndNote format are the same
        return this.exportToEndNote(papers);
    }

    /**
     * Export papers to Markdown format
     */
    exportToMarkdown(papers) {
        let md = '# 搜索结果\n\n';
        md += `共找到 ${papers.length} 篇论文\n\n`;
        md += '---\n\n';

        papers.forEach((paper, index) => {
            md += `## ${index + 1}. ${paper.title || 'Untitled'}\n\n`;

            // Authors
            if (paper.authors && paper.authors.length > 0) {
                md += `**作者：** ${paper.authors.map(a => a.name).join(', ')}\n\n`;
            }

            // Year and Journal
            const journal = typeof paper.journal === 'string'
                ? paper.journal
                : paper.journal?.name || paper.source || 'Unknown';
            md += `**发表：** ${journal}, ${paper.year || 'N/A'}\n\n`;

            // Citations
            if (paper.citationCount) {
                md += `**引用数：** ${paper.citationCount}\n\n`;
            }

            // DOI
            if (paper.doi) {
                md += `**DOI：** ${paper.doi}\n\n`;
            }

            // URL
            if (paper.url) {
                md += `**链接：** [查看原文](${paper.url})\n\n`;
            }

            // Abstract
            if (paper.abstract) {
                md += `**摘要：** ${paper.abstract}\n\n`;
            }

            md += '---\n\n';
        });

        return md;
    }

    /**
     * Get file extension for format
     */
    getFileExtension(format) {
        const extensions = {
            bibtex: '.bib',
            endnote: '.enw',
            ris: '.ris',
            markdown: '.md',
            csv: '.csv',
        };
        return extensions[format] || '.txt';
    }

    /**
     * Export papers in specified format
     */
    export(papers, format) {
        switch (format.toLowerCase()) {
            case 'bibtex':
                return this.exportToBibTeX(papers);
            case 'endnote':
                return this.exportToEndNote(papers);
            case 'ris':
                return this.exportToRIS(papers);
            case 'markdown':
                return this.exportToMarkdown(papers);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
}

module.exports = new ExportService();
