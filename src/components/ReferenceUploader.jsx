import React, { useCallback, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Chip,
    IconButton,
    LinearProgress,
    Alert,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Description as FileIcon,
} from '@mui/icons-material';
import useStore from '../store/useStore';

const ReferenceUploader = () => {
    const referencePapers = useStore((state) => state.referencePapers);
    const setReferencePapers = useStore((state) => state.setReferencePapers);
    const removeReferencePaper = useStore((state) => state.removeReferencePaper);

    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processPDF = async (filePath, fileName) => {
        try {
            // Call Python PDF parser via IPC
            const response = await window.electronAPI.parsePDF(filePath);

            if (response.success) {
                return {
                    id: Date.now() + Math.random(),
                    fileName,
                    filePath,
                    ...response,
                };
            } else {
                throw new Error(response.error || 'Failed to parse PDF');
            }
        } catch (error) {
            console.error('Error processing PDF:', error);
            throw error;
        }
    };

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const files = Array.from(e.dataTransfer.files);
        const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));

        if (pdfFiles.length === 0) {
            setError('请上传 PDF 文件');
            return;
        }

        if (referencePapers.length + pdfFiles.length > 5) {
            setError('最多只能上传 5 篇参考文献');
            return;
        }

        setIsProcessing(true);

        try {
            const processedPapers = [];

            for (const file of pdfFiles.slice(0, 5 - referencePapers.length)) {
                try {
                    const paper = await processPDF(file.path, file.name);
                    processedPapers.push(paper);
                } catch (err) {
                    console.error(`Error processing ${file.name}:`, err);
                }
            }

            setReferencePapers([...referencePapers, ...processedPapers]);
        } catch (err) {
            setError('处理 PDF 文件时出错');
        } finally {
            setIsProcessing(false);
        }
    }, [referencePapers, setReferencePapers]);

    const handleFileSelect = async () => {
        try {
            const filePaths = await window.electronAPI.selectFiles();

            if (filePaths.length === 0) return;

            if (referencePapers.length + filePaths.length > 5) {
                setError('最多只能上传 5 篇参考文献');
                return;
            }

            setIsProcessing(true);
            setError(null);

            const processedPapers = [];

            for (const filePath of filePaths.slice(0, 5 - referencePapers.length)) {
                try {
                    const fileName = filePath.split(/[\\/]/).pop();
                    const fileData = await window.electronAPI.readFile(filePath);

                    if (fileData.success) {
                        // Here we would call the PDF parser
                        // For now, create a placeholder
                        const paper = {
                            id: Date.now() + Math.random(),
                            fileName,
                            filePath,
                            metadata: {
                                title: fileName.replace('.pdf', ''),
                                author: '',
                            },
                            content: {
                                abstract: '',
                                keywords: [],
                            },
                        };
                        processedPapers.push(paper);
                    }
                } catch (err) {
                    console.error(`Error processing file:`, err);
                }
            }

            setReferencePapers([...referencePapers, ...processedPapers]);
        } catch (err) {
            setError('选择文件时出错');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    border: isDragging ? '2px dashed #1976d2' : '2px dashed #ccc',
                    backgroundColor: isDragging ? 'action.hover' : 'background.paper',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isProcessing && handleFileSelect()}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        拖放 PDF 文件或点击上传
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        最多上传 5 篇参考文献 (PDF 格式)
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        sx={{ mt: 2 }}
                        disabled={isProcessing || referencePapers.length >= 5}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFileSelect();
                        }}
                    >
                        选择文件
                    </Button>
                </Box>

                {isProcessing && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress />
                        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                            正在处理文件...
                        </Typography>
                    </Box>
                )}
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {referencePapers.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        已上传的参考文献 ({referencePapers.length}/5)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {referencePapers.map((paper, index) => (
                            <Paper
                                key={paper.id}
                                elevation={1}
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <FileIcon color="primary" />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" fontWeight={500}>
                                        {paper.metadata?.title || paper.fileName}
                                    </Typography>
                                    {paper.metadata?.author && (
                                        <Typography variant="body2" color="text.secondary">
                                            {paper.metadata.author}
                                        </Typography>
                                    )}
                                    {paper.content?.keywords && paper.content.keywords.length > 0 && (
                                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {paper.content.keywords.slice(0, 5).map((keyword, i) => (
                                                <Chip key={i} label={keyword} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                                <IconButton
                                    color="error"
                                    onClick={() => removeReferencePaper(index)}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default ReferenceUploader;
