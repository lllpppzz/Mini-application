import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Alert,
} from '@mui/material';
import { Search as SearchIcon, TrendingUp as TrendingIcon } from '@mui/icons-material';
import ReferenceUploader from '../components/ReferenceUploader';
import useStore from '../store/useStore';


const HomePage = () => {
    const navigate = useNavigate();
    const referencePapers = useStore((state) => state.referencePapers);
    const setIsSearching = useStore((state) => state.setIsSearching);
    const setSearchResults = useStore((state) => state.setSearchResults);
    const setSearchProgress = useStore((state) => state.setSearchProgress);
    const filters = useStore((state) => state.filters);
    const addToHistory = useStore((state) => state.addToHistory);

    const [error, setError] = React.useState(null);

    const handleStartSearch = async () => {
        if (referencePapers.length === 0) {
            setError('请至少上传一篇参考文献');
            return;
        }

        setError(null);
        setIsSearching(true);
        setSearchProgress({ current: 0, total: 100, status: '开始搜索...' });

        try {
            // Navigate to results page
            navigate('/results');

            // Perform search
            setSearchProgress({ current: 20, total: 100, status: '提取关键词...' });

            const result = await window.electronAPI.searchPapers({
                referencePapers,
                options: {
                    sources: filters.sources,
                    limitPerSource: 50,
                    limitPerKeyword: 20,
                }
            });

            if (result.success) {
                setSearchProgress({ current: 80, total: 100, status: '整理结果...' });

                // Filter results based on user criteria
                let filteredPapers = result.papers;

                // Year filter
                if (filters.yearRange) {
                    filteredPapers = filteredPapers.filter(paper => {
                        const year = paper.year || 0;
                        return year >= filters.yearRange[0] && year <= filters.yearRange[1];
                    });
                }

                // Citation filter
                if (filters.minCitations > 0) {
                    filteredPapers = filteredPapers.filter(paper =>
                        (paper.citationCount || 0) >= filters.minCitations
                    );
                }

                setSearchResults(filteredPapers);

                // Add to history
                addToHistory({
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    referenceCount: referencePapers.length,
                    resultCount: filteredPapers.length,
                    keywords: result.keywords || [],
                });

                setSearchProgress({ current: 100, total: 100, status: '搜索完成！' });
            } else {
                setError(result.error || '搜索失败');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('搜索过程中出错：' + err.message);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Box>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                    学术论文检索系统
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    基于参考文献模板的智能文献发现平台
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    上传最多 5 篇参考文献，系统将自动搜索全网相关高质量论文
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <ReferenceUploader />

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SearchIcon />}
                            onClick={handleStartSearch}
                            disabled={referencePapers.length === 0}
                            sx={{
                                px: 6,
                                py: 2,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                borderRadius: 2,
                                boxShadow: 3,
                                '&:hover': {
                                    boxShadow: 6,
                                },
                            }}
                        >
                            开始检索
                        </Button>
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            ✨ 核心功能
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                                <strong>多数据库检索：</strong>整合 Semantic Scholar、arXiv、PubMed、CrossRef
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                                <strong>智能排序：</strong>基于相似度、引用量、期刊分区综合排名
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                                <strong>中英文支持：</strong>自动识别和处理中英文文献
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                                <strong>高级筛选：</strong>按年份、引用量、期刊等级多维度过滤
                            </Typography>
                        </Box>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TrendingIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight={600}>
                                使用说明
                            </Typography>
                        </Box>
                        <Box component="ol" sx={{ pl: 2 }}>
                            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
                                上传 1-5 篇高质量参考文献（PDF格式）
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
                                系统自动提取关键词和主题
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
                                跨数据库智能检索相关论文
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
                                查看排序后的高质量结果
                            </Typography>
                            <Typography component="li" variant="body2">
                                导出、收藏或下载感兴趣的论文
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomePage;
