import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Chip,
    IconButton,
    Divider,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Replay as ReplayIcon,
    Star as StarIcon,
    OpenInNew,
} from '@mui/icons-material';
import useStore from '../store/useStore';
import { format } from 'date-fns';

const HistoryPage = () => {
    const navigate = useNavigate();
    const searchHistory = useStore((state) => state.searchHistory);
    const favorites = useStore((state) => state.favorites);
    const removeFromFavorites = useStore((state) => state.removeFromFavorites);

    const handleReplaySearch = (search) => {
        navigate('/', { state: { replaySearch: search } });
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={700}>
                历史记录
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    搜索历史
                </Typography>
                {searchHistory.length === 0 ? (
                    <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            暂无搜索历史
                        </Typography>
                    </Paper>
                ) : (
                    <Paper elevation={1}>
                        <List>
                            {searchHistory.map((search, index) => (
                                <React.Fragment key={search.id}>
                                    <ListItem
                                        secondaryAction={
                                            <IconButton edge="end" onClick={() => handleReplaySearch(search)}>
                                                <ReplayIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                                    {search.keywords?.slice(0, 5).map((keyword, i) => (
                                                        <Chip key={i} label={keyword} size="small" />
                                                    ))}
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" component="span">
                                                        {format(new Date(search.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                                    </Typography>
                                                    {' • '}
                                                    <Typography variant="body2" component="span">
                                                        参考文献: {search.referenceCount}
                                                    </Typography>
                                                    {' • '}
                                                    <Typography variant="body2" component="span">
                                                        结果: {search.resultCount}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < searchHistory.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    收藏夹 ({favorites.length})
                </Typography>
                {favorites.length === 0 ? (
                    <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
                        <StarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">
                            暂无收藏的论文
                        </Typography>
                    </Paper>
                ) : (
                    <Paper elevation={1}>
                        <List>
                            {favorites.map((paper, index) => {
                                const displayJournal = typeof paper.journal === 'string'
                                    ? paper.journal
                                    : (paper.journal?.name || paper.source || '未知期刊');

                                return (
                                    <React.Fragment key={paper.paperId || paper.doi || index}>
                                        <ListItem
                                            button
                                            onClick={() => navigate('/paper-detail', { state: { paper } })}
                                            secondaryAction={
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    {paper.url && (
                                                        <IconButton
                                                            edge="end"
                                                            color="primary"
                                                            component="a"
                                                            href={paper.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="查看原文"
                                                        >
                                                            <OpenInNew />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        edge="end"
                                                        color="error"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFromFavorites(paper.paperId || paper.doi);
                                                        }}
                                                        title="移除收藏"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            }
                                        >
                                            <ListItemText
                                                primary={paper.title}
                                                secondaryTypographyProps={{ component: 'div' }}
                                                secondary={
                                                    <Box>
                                                        <Typography component="div" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {paper.authors?.map(a => a.name).join(', ')}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            {paper.year && <Chip label={paper.year} size="small" />}
                                                            {displayJournal && (
                                                                <Chip
                                                                    label={displayJournal}
                                                                    size="small"
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < favorites.length - 1 && <Divider />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default HistoryPage;
