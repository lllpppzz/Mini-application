import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  LinearProgress,
  Checkbox,
  Menu,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import useStore from '../store/useStore';
import PaperCard from '../components/PaperCard';
import AdvancedFilters from '../components/AdvancedFilters';
import Papa from 'papaparse';

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const isSearching = useStore((state) => state.isSearching);
  const searchResults = useStore((state) => state.searchResults);
  const searchProgress = useStore((state) => state.searchProgress);
  const referencePapers = useStore((state) => state.referencePapers);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('composite');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    yearRange: [2000, new Date().getFullYear()],
    citationRange: [0, 1000],
    sources: [],
    authors: [],
  });
  const [selectedPapers, setSelectedPapers] = useState(new Set());
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  const addToFavorites = useStore((state) => state.addToFavorites);

  const handleViewDetails = useCallback((paper) => {
    navigate('/paper-detail', { state: { paper } });
  }, [navigate]);

  const handleFilterApply = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleToggleSelect = useCallback((paper) => {
    const id = paper.paperId || paper.doi || paper.arxivId;
    setSelectedPapers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Debounce hook implementation
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    React.useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    return debouncedValue;
  };

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort results with useMemo for performance
  const filteredResults = useMemo(() => {
    let results = [...searchResults];

    // Search filter using debounced query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      results = results.filter(paper =>
        (paper.title?.toLowerCase().includes(query)) ||
        (paper.abstract?.toLowerCase().includes(query)) ||
        (paper.authors?.some(a => a.name?.toLowerCase().includes(query)))
      );
    }

    // Advanced filters
    // Year filter
    if (filters.yearRange) {
      results = results.filter(paper => {
        const year = paper.year;
        return year && year >= filters.yearRange[0] && year <= filters.yearRange[1];
      });
    }

    // Citation filter
    if (filters.citationRange) {
      results = results.filter(paper => {
        const citations = paper.citationCount || 0;
        return citations >= filters.citationRange[0] &&
          (filters.citationRange[1] === 1000 || citations <= filters.citationRange[1]);
      });
    }

    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      results = results.filter(paper =>
        filters.sources.includes(paper.source)
      );
    }

    // Author filter
    if (filters.authors && filters.authors.length > 0) {
      results = results.filter(paper => {
        const paperAuthors = paper.authors?.map(a => a.name.toLowerCase()) || [];
        return filters.authors.some(filterAuthor =>
          paperAuthors.some(paperAuthor =>
            paperAuthor.includes(filterAuthor.toLowerCase())
          )
        );
      });
    }

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case 'similarity':
          return (b.scores?.similarity || b.similarity || 0) - (a.scores?.similarity || a.similarity || 0);
        case 'citations':
          return (b.citationCount || 0) - (a.citationCount || 0);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'composite':
        default:
          return (b.scores?.composite || b.score || 0) - (a.scores?.composite || a.score || 0);
      }
    });

    return results;
  }, [searchResults, debouncedSearchQuery, sortBy, filters]);

  // These handlers depend on filteredResults, so define them after
  const handleSelectAll = useCallback(() => {
    if (selectedPapers.size === filteredResults.length && filteredResults.length > 0) {
      // Deselect all
      setSelectedPapers(new Set());
    } else {
      // Select all
      const allIds = new Set(filteredResults.map(p => p.paperId || p.doi || p.arxivId));
      setSelectedPapers(allIds);
    }
  }, [filteredResults, selectedPapers.size]);

  const handleBatchFavorite = useCallback(() => {
    const papers = filteredResults.filter(p => {
      const id = p.paperId || p.doi || p.arxivId;
      return selectedPapers.has(id);
    });
    papers.forEach(paper => addToFavorites(paper));
    alert(`已收藏 ${papers.length} 篇论文！`);
  }, [filteredResults, selectedPapers, addToFavorites]);

  const handleExportClick = useCallback((event) => {
    setExportMenuAnchor(event.currentTarget);
  }, []);

  const handleExportClose = useCallback(() => {
    setExportMenuAnchor(null);
  }, []);

  const handleExport = useCallback(async (format) => {
    setExportMenuAnchor(null);

    const papersToExport = selectedPapers.size > 0
      ? filteredResults.filter(p => {
        const id = p.paperId || p.doi || p.arxivId;
        return selectedPapers.has(id);
      })
      : filteredResults;

    let content, extension, mimeType;

    switch (format) {
      case 'csv':
        const csvData = papersToExport.map(paper => ({
          标题: paper.title || '',
          作者: paper.authors?.map(a => a.name).join('; ') || '',
          年份: paper.year || '',
          期刊: paper.journal || paper.source || '',
          引用数: paper.citationCount || 0,
          相似度: ((paper.scores?.similarity || paper.similarity || 0) * 100).toFixed(1),
          综合得分: ((paper.scores?.composite || paper.score || 0) * 100).toFixed(1),
          链接: paper.url || '',
          来源: paper.source || '',
        }));
        content = '\ufeff' + Papa.unparse(csvData);
        extension = '.csv';
        mimeType = 'text/csv;charset=utf-8;';
        break;

      case 'bibtex':
      case 'endnote':
      case 'ris':
      case 'markdown':
        // Call export service via IPC
        try {
          const result = await window.electronAPI.exportPapers({
            papers: papersToExport,
            format: format
          });
          if (result.success) {
            content = result.content;
            extension = result.extension;
            mimeType = 'text/plain;charset=utf-8;';
          } else {
            alert('导出失败: ' + result.error);
            return;
          }
        } catch (error) {
          alert('导出失败: ' + error.message);
          return;
        }
        break;

      default:
        alert('不支持的格式');
        return;
    }

    // Save file
    const defaultPath = `search_results_${new Date().toISOString().split('T')[0]}${extension}`;

    if (window.electronAPI && window.electronAPI.saveFile) {
      const result = await window.electronAPI.saveFile({
        defaultPath,
        content,
      });

      if (result.success) {
        alert(`成功导出 ${papersToExport.length} 篇论文!`);
      }
    }
  }, [filteredResults, selectedPapers]);

  if (isSearching) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          {searchProgress.status}
        </Typography>
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={searchProgress.current}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchProgress.current}%
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!referencePapers || referencePapers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Alert severity="info">
          请先在首页上传参考文献并开始检索
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          搜索结果
        </Typography>
        <Typography variant="body1" color="text.secondary">
          基于 {referencePapers.length} 篇参考文献，共找到 {filteredResults.length} 篇相关论文
        </Typography>
      </Box>

      {searchResults.length > 0 && (
        <>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="搜索标题、作者、摘要..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 300 }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>排序方式</InputLabel>
              <Select
                value={sortBy}
                label="排序方式"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="composite">综合得分 (推荐)</MenuItem>
                <MenuItem value="similarity">相关度</MenuItem>
                <MenuItem value="citations">引用数</MenuItem>
                <MenuItem value="year">最新发表</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDrawerOpen(true)}
            >
              高级筛选
            </Button>

            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExportClick}
            >
              导出
            </Button>
          </Box>

          {/* Batch operations toolbar */}
          {selectedPapers.size > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="body2" color="primary.contrastText">
                  已选择 {selectedPapers.size} 篇论文
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={<FavoriteIcon />}
                  onClick={handleBatchFavorite}
                >
                  批量收藏
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  onClick={() => handleExport('bibtex')}
                >
                  导出选中
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedPapers(new Set())}
                >
                  取消选择
                </Button>
              </Box>
            </Box>
          )}

          {/* Export menu */}
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={() => handleExport('csv')}>
              <ListItemText>CSV 格式</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExport('bibtex')}>
              <ListItemText>BibTeX 格式</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExport('endnote')}>
              <ListItemText>EndNote 格式</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExport('ris')}>
              <ListItemText>RIS 格式</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExport('markdown')}>
              <ListItemText>Markdown 格式</ListItemText>
            </MenuItem>
          </Menu>

          {/* Select all checkbox */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={selectedPapers.size === filteredResults.length && filteredResults.length > 0}
              indeterminate={selectedPapers.size > 0 && selectedPapers.size < filteredResults.length}
              onChange={handleSelectAll}
            />
            <Typography variant="body2" color="text.secondary">
              全选 ({filteredResults.length} 篇)
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {filteredResults.map((paper, index) => {
              const id = paper.paperId || paper.doi || paper.arxivId;
              const isSelected = selectedPapers.has(id);

              return (
                <Grid item xs={12} key={id || index}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleSelect(paper)}
                      sx={{ mt: 1 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <PaperCard
                        paper={paper}
                        onViewDetails={handleViewDetails}
                      />
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Advanced Filters Drawer */}
          <AdvancedFilters
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            onApply={handleFilterApply}
            initialFilters={filters}
          />
        </>
      )}
    </Box>
  );
};

export default SearchResultsPage;
