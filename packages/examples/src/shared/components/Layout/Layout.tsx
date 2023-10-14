import { ChevronLeft as ChevronLeftIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Toolbar, Typography, styled } from '@mui/material';
import { ReactNode } from 'react';
import { useToggle } from 'react-use';
import { Navigation } from './Navigation';
import { AppBar } from './AppBar';
import { Drawer } from './Drawer';

export type LayoutProps = {
    children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
    const [open, toggleDrawer] = useToggle(false);

    return (
        <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Á la fois
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: [1],
                    }}
                >
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider />
                <Navigation />
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                <DrawerHeader />
                {children}
            </Box>
        </Box>
    );
};

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));
