import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Chip,
    Button,
    Divider,
    Grid,
    IconButton,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    OpenInNew,
    GetApp,
    Translate,
} from '@mui/icons-material';
import useStore from '../store/useStore';

const PaperDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { paper } = location.state || {};

    const favorites = useStore((state) => state.favorites);
    const addToFavorites = useStore((state) => state.addToFavorites);
    const removeFromFavorites = useStore((state) => state.removeFromFavorites);

    const [isTranslating, setIsTranslating] = useState(false);

    if (!paper) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography variant="h6">论文未找到</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    返回
                </Button>
            </Container>
        );
    }

    const isFavorited = favorites.some(
        (p) =>
            (p.paperId || p.doi || p.pmid || p.arxivId) ===
            (paper.paperId || paper.doi || paper.pmid || paper.arxivId)
    );

    const handleToggleFavorite = () => {
        if (isFavorited) {
            removeFromFavorites(paper.paperId || paper.doi || paper.pmid || paper.arxivId);
        } else {
            addToFavorites(paper);
        }
    };

    const handleTranslate = async () => {
        setIsTranslating(true);
        try {
            const { translateText } = await import('../utils/translator');
            await translateText(
                paper.title || '无标题',
                paper.abstract || '无摘要'
            );
        } catch (error) {
            console.error('Translation failed:', error);
            const { showBrowserTranslationGuide } = await import('../utils/translator');
            showBrowserTranslationGuide();
        } finally {
            setIsTranslating(false);
        }
    };

    const handlePDFDownload = () => {
        setTimeout(() => {
            alert('PDF下载已开始！\n\n文件将保存到您的默认下载文件夹。\n请在浏览器的下载管理器中查看下载进度。');
        }, 200);
    };

    const displayJournal =
        typeof paper.journal === 'string'
            ? paper.journal
            : paper.journal?.name || paper.source || '未知期刊';
    const displayYear = paper.year || '未知年份';
    const displayAuthors = paper.authors?.map((a) => a.name).join(', ') || '未知作者';
    const displayCitations = paper.citationCount || 0;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    返回搜索结果
                </Button>
                <IconButton onClick={handleToggleFavorite} color={isFavorited ? 'error' : 'default'}>
                    {isFavorited ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
            </Box>

            <Paper elevation={2} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h4" gutterBottom fontWeight={600} sx={{ lineHeight: 1.4, flex: 1 }}>
                        {paper.title || '无标题'}
                    </Typography>
                    <IconButton
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        color="primary"
                        title="翻译"
                    >
                        <Translate />
                    </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    <Chip label={displayYear} size="medium" variant="outlined" />
                    <Chip label={displayJournal} size="medium" variant="outlined" />
                    {displayCitations > 0 && (
                        <Chip
                            label={`${displayCitations} 引用`}
                            size="medium"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        作者
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {displayAuthors}
                    </Typography>
                </Box>

                {paper.abstract && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            摘要
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8, textAlign: 'justify' }}>
                            {paper.abstract}
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            发表年份
                        </Typography>
                        <Typography variant="body1">{displayYear}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            期刊/会议
                        </Typography>
                        <Typography variant="body1">{displayJournal}</Typography>
                    </Grid>
                    {paper.doi && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                DOI
                            </Typography>
                            <Typography variant="body1">{paper.doi}</Typography>
                        </Grid>
                    )}
                    {paper.paperId && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Paper ID
                            </Typography>
                            <Typography variant="body1">{paper.paperId}</Typography>
                        </Grid>
                    )}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            引用次数
                        </Typography>
                        <Typography variant="body1">{displayCitations}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            数据来源
                        </Typography>
                        <Typography variant="body1">{paper.source?.toUpperCase() || 'UNKNOWN'}</Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {paper.url && (
                        <Button
                            variant="contained"
                            startIcon={<OpenInNew />}
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            component="a"
                        >
                            查看原文
                        </Button>
                    )}
                    {(paper.openAccessPdf?.url || paper.pdfUrl) && (
                        <Button
                            variant="outlined"
                            startIcon={<GetApp />}
                            href={paper.openAccessPdf?.url || paper.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            component="a"
                            onClick={handlePDFDownload}
                        >
                            下载PDF
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default PaperDetailPage;
