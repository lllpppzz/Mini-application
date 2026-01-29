import React from 'react';
import {
    Box,
    Typography,
    Paper,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Slider,
    TextField,
    Button,
    Divider,
    Switch,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import useStore from '../store/useStore';

const SettingsPage = () => {
    const filters = useStore((state) => state.filters);
    const setFilters = useStore((state) => state.setFilters);
    const resetFilters = useStore((state) => state.resetFilters);
    const theme = useStore((state) => state.theme);
    const toggleTheme = useStore((state) => state.toggleTheme);

    const currentYear = new Date().getFullYear();

    const handleSourceChange = (source) => (event) => {
        const newSources = event.target.checked
            ? [...filters.sources, source]
            : filters.sources.filter(s => s !== source);
        setFilters({ sources: newSources });
    };

    const handleYearRangeChange = (event, newValue) => {
        setFilters({ yearRange: newValue });
    };

    const handleMinCitationsChange = (event) => {
        setFilters({ minCitations: parseInt(event.target.value) || 0 });
    };

    const handleSave = () => {
        alert('设置已保存！');
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight={700}>
                设置
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    外观设置
                </Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                        />
                    }
                    label="深色模式"
                />
            </Paper>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    搜索设置
                </Typography>

                <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <FormLabel component="legend">数据源</FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.sources.includes('semanticscholar')}
                                    onChange={handleSourceChange('semanticscholar')}
                                />
                            }
                            label="Semantic Scholar"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.sources.includes('arxiv')}
                                    onChange={handleSourceChange('arxiv')}
                                />
                            }
                            label="arXiv"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.sources.includes('crossref')}
                                    onChange={handleSourceChange('crossref')}
                                />
                            }
                            label="CrossRef"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.sources.includes('pubmed')}
                                    onChange={handleSourceChange('pubmed')}
                                />
                            }
                            label="PubMed"
                        />
                    </FormGroup>
                </FormControl>

                <Divider sx={{ my: 3 }} />

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <FormLabel>发表年份范围</FormLabel>
                    <Box sx={{ px: 2, mt: 2 }}>
                        <Slider
                            value={filters.yearRange}
                            onChange={handleYearRangeChange}
                            valueLabelDisplay="auto"
                            min={1990}
                            max={currentYear}
                            marks={[
                                { value: 1990, label: '1990' },
                                { value: 2000, label: '2000' },
                                { value: 2010, label: '2010' },
                                { value: 2020, label: '2020' },
                                { value: currentYear, label: currentYear.toString() },
                            ]}
                        />
                    </Box>
                </FormControl>

                <TextField
                    label="最小引用数"
                    type="number"
                    value={filters.minCitations}
                    onChange={handleMinCitationsChange}
                    fullWidth
                    sx={{ mb: 3 }}
                    InputProps={{ inputProps: { min: 0 } }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                    >
                        保存设置
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={resetFilters}
                    >
                        重置为默认
                    </Button>
                </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    关于
                </Typography>
                <Typography variant="body2" paragraph>
                    <strong>学术论文检索系统</strong> v1.0.0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    基于模板的智能文献发现平台，整合多个学术数据库，提供智能排序和高级筛选功能。
                </Typography>
            </Paper>
        </Box>
    );
};

export default SettingsPage;
