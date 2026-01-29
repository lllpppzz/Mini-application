import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useStore from './store/useStore';

// Pages
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import PaperDetailsPage from './pages/PaperDetailsPage';
import PaperDetailPage from './pages/PaperDetailPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

// Layout
import Layout from './components/Layout';

function App() {
    const theme = useStore((state) => state.theme);

    const muiTheme = createTheme({
        palette: {
            mode: theme,
            primary: {
                main: theme === 'light' ? '#1976d2' : '#90caf9',
            },
            secondary: {
                main: theme === 'light' ? '#dc004e' : '#f48fb1',
            },
            background: {
                default: theme === 'light' ? '#f5f5f5' : '#121212',
                paper: theme === 'light' ? '#ffffff' : '#1e1e1e',
            },
        },
        typography: {
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 8,
                        fontWeight: 500,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/results" element={<SearchResultsPage />} />
                        <Route path="/paper/:id" element={<PaperDetailsPage />} />
                        <Route path="/paper-detail" element={<PaperDetailPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
}

export default App;
