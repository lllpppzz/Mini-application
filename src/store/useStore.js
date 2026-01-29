import { create } from 'zustand';

/**
 * Global Application Store
 * Using Zustand for state management
 */

const useStore = create((set) => ({
    // Theme
    theme: 'light',
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
    }),

    // Reference Papers
    referencePapers: [],
    setReferencePapers: (papers) => set({ referencePapers: papers }),
    addReferencePaper: (paper) => set((state) => ({
        referencePapers: [...state.referencePapers, paper],
    })),
    removeReferencePaper: (index) => set((state) => ({
        referencePapers: state.referencePapers.filter((_, i) => i !== index),
    })),
    clearReferencePapers: () => set({ referencePapers: [] }),

    // Search State
    isSearching: false,
    setIsSearching: (searching) => set({ isSearching: searching }),

    searchResults: [],
    setSearchResults: (results) => set({ searchResults: results }),

    searchProgress: {
        current: 0,
        total: 0,
        status: '',
    },
    setSearchProgress: (progress) => set({ searchProgress: progress }),

    // Filters
    filters: {
        yearRange: [1990, new Date().getFullYear()],
        minCitations: 0,
        sources: ['semanticscholar', 'arxiv', 'crossref', 'pubmed'],
        language: 'all',
    },
    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
    })),
    resetFilters: () => set({
        filters: {
            yearRange: [1990, new Date().getFullYear()],
            minCitations: 0,
            sources: ['semanticscholar', 'arxiv', 'crossref', 'pubmed'],
            language: 'all',
        },
    }),

    // Search History
    searchHistory: [],
    addToHistory: (search) => set((state) => ({
        searchHistory: [search, ...state.searchHistory.slice(0, 19)],
    })),

    // Favorites
    favorites: [],

    // Notes system
    notes: {},

    addToFavorites: (paper) => set((state) => {
        const exists = state.favorites.some(
            (p) =>
                (p.paperId || p.doi || p.pmid || p.arxivId) ===
                (paper.paperId || paper.doi || paper.pmid || paper.arxivId)
        );
        if (!exists) {
            return { favorites: [...state.favorites, paper] };
        }
        return state;
    }),

    removeFromFavorites: (paperId) => set((state) => ({
        favorites: state.favorites.filter(
            (p) => (p.paperId || p.doi || p.pmid || p.arxivId) !== paperId
        ),
    })),

    // Notes methods
    addNote: (paperId, noteText, tags = []) => set((state) => ({
        notes: {
            ...state.notes,
            [paperId]: {
                text: noteText,
                tags: tags,
                timestamp: Date.now(),
            },
        },
    })),

    updateNote: (paperId, noteText, tags) => set((state) => ({
        notes: {
            ...state.notes,
            [paperId]: {
                ...state.notes[paperId],
                text: noteText !== undefined ? noteText : state.notes[paperId]?.text,
                tags: tags !== undefined ? tags : state.notes[paperId]?.tags,
                timestamp: Date.now(),
            },
        },
    })),

    deleteNote: (paperId) => set((state) => {
        const newNotes = { ...state.notes };
        delete newNotes[paperId];
        return { notes: newNotes };
    }),

    // Selected Paper
    selectedPaper: null,
    setSelectedPaper: (paper) => set({ selectedPaper: paper }),
}));

export default useStore;
