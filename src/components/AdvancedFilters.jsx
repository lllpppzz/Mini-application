import React, { useState } from 'react';
import {
    Box,
    Drawer,
    Typography,
    Button,
    Divider,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    TextField,
    IconButton,
    Stack,
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Close as CloseIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';

const AdvancedFilters = ({ open, onClose, onApply, initialFilters }) => {
    const [filters, setFilters] = useState(initialFilters || {
        yearRange: [2000, new Date().getFullYear()],
        citationRange: [0, 1000],
        sources: [],
        authors: [],
    });

    const handleYearChange = (event, newValue) => {
        setFilters({ ...filters, yearRange: newValue });
    };

    const handleCitationChange = (event, newValue) => {
        setFilters({ ...filters, citationRange: newValue });
    };

    const handleSourceToggle = (source) => {
        const newSources = filters.sources.includes(source)
            ? filters.sources.filter(s => s !== source)
            : [...filters.sources, source];
        setFilters({ ...filters, sources: newSources });
    };

    const handleAuthorAdd = (event) => {
        if (event.key === 'Enter' && event.target.value.trim()) {
            const author = event.target.value.trim();
            if (!filters.authors.includes(author)) {
                setFilters({ ...filters, authors: [...filters.authors, author] });
            }
            event.target.value = '';
        }
    };

    const handleAuthorRemove = (author) => {
        setFilters({ ...filters, authors: filters.authors.filter(a => a !== author) });
    };

    const handleClear = () => {
        setFilters({
            yearRange: [2000, new Date().getFullYear()],
            citationRange: [0, 1000],
            sources: [],
            authors: [],
        });
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const availableSources = [
        'semanticscholar',
        'arxiv',
        'crossref',
        'pubmed',
    ];

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: 350, p: 3 } }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                    高级筛选
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Year Range Filter */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                    发表年份
                </Typography>
                <Slider
                    value={filters.yearRange}
                    onChange={handleYearChange}
                    valueLabelDisplay="auto"
                    min={1900}
                    max={new Date().getFullYear()}
                    marks={[
                        { value: 1900, label: '1900' },
                        { value: new Date().getFullYear(), label: new Date().getFullYear().toString() },
                    ]}
                />
                <Typography variant="caption" color="text.secondary">
                    {filters.yearRange[0]} - {filters.yearRange[1]}
                </Typography>
            </Box>

            {/* Citation Range Filter */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                    引用次数
                </Typography>
                <Slider
                    value={filters.citationRange}
                    onChange={handleCitationChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    marks={[
                        { value: 0, label: '0' },
                        { value: 1000, label: '1000+' },
                    ]}
                />
                <Typography variant="caption" color="text.secondary">
                    {filters.citationRange[0]} - {filters.citationRange[1] === 1000 ? '1000+' : filters.citationRange[1]}
                </Typography>
            </Box>

            {/* Data Source Filter */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                    数据源
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {availableSources.map((source) => (
                        <Chip
                            key={source}
                            label={source.toUpperCase()}
                            onClick={() => handleSourceToggle(source)}
                            color={filters.sources.includes(source) ? 'primary' : 'default'}
                            variant={filters.sources.includes(source) ? 'filled' : 'outlined'}
                            sx={{ mb: 1 }}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Author Filter */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                    作者
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="输入作者名并按Enter"
                    onKeyPress={handleAuthorAdd}
                    helperText="按Enter添加作者"
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                    {filters.authors.map((author) => (
                        <Chip
                            key={author}
                            label={author}
                            onDelete={() => handleAuthorRemove(author)}
                            size="small"
                        />
                    ))}
                </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClear}
                    fullWidth
                >
                    清除
                </Button>
                <Button
                    variant="contained"
                    onClick={handleApply}
                    fullWidth
                >
                    应用
                </Button>
            </Box>
        </Drawer>
    );
};

export default AdvancedFilters;
