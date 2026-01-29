import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Link,
  Tooltip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteOutlineIcon,
  GetApp as DownloadIcon,
  OpenInNew as OpenIcon,
  TrendingUp as CitationIcon,
  NoteAdd as NoteAddIcon,
  Translate,
} from '@mui/icons-material';
import useStore from '../store/useStore';
import NoteDialog from './NoteDialog';
import { translateText } from '../utils/translator';

const PaperCard = ({ paper, onViewDetails }) => {
  const favorites = useStore((state) => state.favorites);
  const addToFavorites = useStore((state) => state.addToFavorites);
  const removeFromFavorites = useStore((state) => state.removeFromFavorites);
  const notes = useStore((state) => state.notes);
  const addNote = useStore((state) => state.addNote);

  const [translatedTitle, setTranslatedTitle] = useState(null);
  const [translatedAbstract, setTranslatedAbstract] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  const paperId = paper.paperId || paper.doi || paper.arxivId;
  const hasNote = notes[paperId];

  const handleSaveNote = (paperId, noteText, tags) => {
    addNote(paperId, noteText, tags);
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const { translateText } = await import('../utils/translator');
      await translateText(
        paper.title || '无标题',
        paper.abstract || '无摘要'
      );
      // Result handling and alerts are now managed within translateText
    } catch (error) {
      console.error('Translation failed:', error);
      const { showBrowserTranslationGuide } = await import('../utils/translator');
      showBrowserTranslationGuide();
    } finally {
      setIsTranslating(false);
    }
  };

  const isFavorited = favorites.some(p => {
    return (p.paperId || p.doi || p.pmid || p.arxivId) ===
      (paper.paperId || paper.doi || paper.pmid || paper.arxivId);
  });

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (isFavorited) {
      removeFromFavorites(paper.paperId || paper.doi || paper.pmid || paper.arxivId);
    } else {
      addToFavorites(paper);
    }
  };

  const displayTitle = paper.title || '无标题';
  const displayAuthors = paper.authors?.map(a => a.name).join(', ') || '未知作者';
  const displayYear = paper.year || '未知年份';
  // Handle journal as either string or object
  const displayJournal = typeof paper.journal === 'string'
    ? paper.journal
    : (paper.journal?.name || paper.source || '未知期刊');
  const displayCitations = paper.citationCount || 0;
  const displaySource = paper.source || 'unknown';

  // Get scores with fallback
  const similarityScore = paper.scores?.similarity || paper.similarity || 0;
  const compositeScore = paper.scores?.composite || paper.score || 0;

  const sourceColors = {
    semanticscholar: 'primary',
    arxiv: 'success',
    crossref: 'warning',
    pubmed: 'error',
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          elevation: 6,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ lineHeight: 1.3 }}>
            {translatedTitle || displayTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {displayAuthors}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
            <Chip label={displayYear} size="small" variant="outlined" />
            <Chip label={displayJournal} size="small" variant="outlined" />

            {displayCitations > 0 && (
              <Chip
                icon={<CitationIcon />}
                label={`${displayCitations} 引用`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            <Chip
              label={displaySource.toUpperCase()}
              size="small"
              color={sourceColors[displaySource] || 'default'}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton
            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(e); }}
            color={isFavorited ? 'error' : 'default'}
          >
            {isFavorited ? <FavoriteIcon /> : <FavoriteOutlineIcon />}
          </IconButton>
          <IconButton
            onClick={(e) => { e.stopPropagation(); setNoteDialogOpen(true); }}
            color={hasNote ? 'primary' : 'default'}
          >
            <NoteAddIcon />
          </IconButton>
          <IconButton
            onClick={(e) => { e.stopPropagation(); handleTranslate(); }}
            disabled={isTranslating}
            size="small"
            title="翻译提示"
          >
            <Translate />
          </IconButton>
          {paper.url && (
            <Button
              size="small"
              startIcon={<OpenIcon />}
              component={Link}
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              原文
            </Button>
          )}
        </Box>
      </Box>

      {paper.abstract && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {translatedAbstract || paper.abstract}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box>
            <Typography variant="caption" display="block" color="text.secondary">
              相关度: {similarityScore > 0 ? `${(similarityScore * 100).toFixed(1)}%` : 'N/A'}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              综合得分: {compositeScore > 0 ? (compositeScore * 100).toFixed(1) : 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {paper.url && (
            <Button
              size="small"
              startIcon={<OpenIcon />}
              component={Link}
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              原文
            </Button>
          )}
          {(paper.openAccessPdf?.url || paper.pdfUrl) && (
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              component={Link}
              href={paper.openAccessPdf?.url || paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              PDF
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            onClick={() => onViewDetails(paper)}
            sx={{ ml: 'auto' }}
          >
            查看详情
          </Button>
        </Box>
      </Box>

      {/* Note Dialog */}
      <NoteDialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        paper={paper}
        initialNote={hasNote}
        onSave={handleSaveNote}
      />
    </Paper>
  );
};

// Optimize performance with React.memo
export default React.memo(PaperCard, (prevProps, nextProps) => {
  // Only re-render if paper ID or translation state changes
  const prevId = prevProps.paper.paperId || prevProps.paper.doi || prevProps.paper.arxivId;
  const nextId = nextProps.paper.paperId || nextProps.paper.doi || nextProps.paper.arxivId;
  return prevId === nextId;
});
