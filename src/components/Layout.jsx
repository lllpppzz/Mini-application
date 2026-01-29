import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    IconButton,
    Container,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Home as HomeIcon,
    History as HistoryIcon,
    Settings as SettingsIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import useStore from '../store/useStore';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useStore((state) => state.theme);
    const toggleTheme = useStore((state) => state.toggleTheme);
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const menuItems = [
        { text: '首页', icon: <HomeIcon />, path: '/' },
        { text: '搜索结果', icon: <SearchIcon />, path: '/results' },
        { text: '历史记录', icon: <HistoryIcon />, path: '/history' },
        { text: '设置', icon: <SettingsIcon />, path: '/settings' },
    ];

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static" elevation={2}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => navigate('/')}
                    >
                        📚 学术论文检索系统
                    </Typography>

                    <IconButton color="inherit" onClick={toggleTheme}>
                        {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
            >
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            导航菜单
                        </Typography>
                    </Box>
                    <Divider />
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    selected={location.pathname === item.path}
                                    onClick={() => navigate(item.path)}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Container
                maxWidth="xl"
                sx={{
                    flex: 1,
                    py: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {children}
            </Container>

            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
                }}
            >
                <Container maxWidth="xl">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © 2026 学术论文检索系统 - 基于模板的智能文献发现平台
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
