import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Button,
    Divider,
    Link,
    IconButton,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    OpenInNew as OpenIcon,
    GetApp as DownloadIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteOutlineIcon,
} from '@mui/icons-material';
import useStore from '../store/useStore';

const PaperDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const searchResults = useStore((state) => state.searchResults);
    const favorites = useStore((state) => state.favorites);
    const addToFavorites = useStore((state) => state.addToFavorites);
    const removeFromFavorites = useStore((state) => state.removeFromFavorites);

    // Find paper by ID
    const paper = searchResults.find(p =>
        (p.paperId || p.doi || p.pmid || p.arxivId) === id
    );

    if (!paper) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" gutterBottom>
                    论文未找到
                </Typography>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/results')}>
                    返回搜索结果
                </Button>
            </Box>
        );
    }

    const isFavorited = favorites.some(p =>
        (p.paperId || p.doi || p.pmid || p.arxivId) === id
    );

    const handleToggleFavorite = () => {
        if (isFavorited) {
            removeFromFavorites(id);
        } else {
            addToFavorites(paper);
        }
    };

    return (
        <Box>
            <Button
                startIcon={<BackIcon />}
                onClick={() => navigate('/results')}
                sx={{ mb: 3 }}
            >
                返回搜索结果
            </Button>

            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Typography variant="h4" fontWeight={700}>
                        {paper.title}
                    </Typography>
                    <IconButton onClick={handleToggleFavorite} color={isFavorited ? 'error' : 'default'}>
                        {isFavorited ? <FavoriteIcon /> : <FavoriteOutlineIcon />}
                    </IconButton>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        作者
                    </Typography>
                    <Typography variant="body1">
                        {paper.authors?.map(a => a.name).join(', ') || 'Unknown'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    {paper.year && <Chip label={`年份: ${paper.year}`} />}
                    {paper.journal && <Chip label={`期刊: ${paper.journal}`} />}
                    {paper.citationCount !== undefined && (
                        <Chip label={`引用数: ${paper.citationCount}`} color="primary" />
                    )}
                    {paper.source && <Chip label={paper.source.toUpperCase()} color="secondary" />}
                </Box>

                <Divider sx={{ my: 3 }} />

                {paper.abstract && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            摘要
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {paper.abstract}
                        </Typography>
                    </Box>
                )}

                {paper.scores && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            评分
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    相似度
                                </Typography>
                                <Typography variant="h5" color="primary">
                                    {(paper.scores.similarity * 100).toFixed(1)}%
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    综合得分
                                </Typography>
                                <Typography variant="h5" color="primary">
                                    {(paper.scores.composite * 100).toFixed(1)}%
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    引用得分
                                </Typography>
                                <Typography variant="h5">
                                    {(paper.scores.citations * 100).toFixed(1)}%
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    时效性
                                </Typography>
                                <Typography variant="h5">
                                    {(paper.scores.recency * 100).toFixed(1)}%
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {paper.url && (
                        <Button
                            variant="contained"
                            startIcon={<OpenIcon />}
                            component={Link}
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            查看原文
                        </Button>
                    )}
                    {(paper.openAccessPdf?.url || paper.pdfUrl) && (
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            component={Link}
                            href={paper.openAccessPdf?.url || paper.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            下载 PDF
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default PaperDetailsPage;
