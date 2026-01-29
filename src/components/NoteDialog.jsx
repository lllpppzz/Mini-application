import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Chip,
    Stack,
    Box,
    IconButton,
    Typography,
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
} from '@mui/icons-material';

const NoteDialog = ({ open, onClose, paper, initialNote, onSave }) => {
    const paperId = paper?.paperId || paper?.doi || paper?.arxivId;
    const [noteText, setNoteText] = useState(initialNote?.text || '');
    const [tags, setTags] = useState(initialNote?.tags || []);
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = () => {
        onSave(paperId, noteText, tags);
        onClose();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddTag();
        }
    };

    if (!paper) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">论文笔记</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {paper.title}
                </Typography>

                <TextField
                    label="笔记内容"
                    multiline
                    rows={8}
                    fullWidth
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="输入您的笔记..."
                    sx={{ mt: 2, mb: 3 }}
                />

                <Typography variant="subtitle2" gutterBottom>
                    标签
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        size="small"
                        placeholder="添加标签"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddTag}
                    >
                        添加
                    </Button>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {tags.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => handleRemoveTag(tag)}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    ))}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={handleSave} variant="contained">
                    保存
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NoteDialog;
