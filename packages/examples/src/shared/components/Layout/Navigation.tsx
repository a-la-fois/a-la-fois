import { Code as CodeIcon, Dashboard as DashboardIcon, Key as KeyIcon } from '@mui/icons-material';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { isDev } from '~/config';

export const Navigation = () => {
    return (
        <List component="nav">
            <ListItemButton component={Link} to="/monaco">
                <ListItemIcon>
                    <CodeIcon />
                </ListItemIcon>
                <ListItemText primary="Code editor" />
            </ListItemButton>
            <ListItemButton component={Link} to="/pixelCanvas">
                <ListItemIcon>
                    <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Pixel Canvas" />
            </ListItemButton>
            {isDev && (
                <ListItemButton component={Link} to="/switchToken">
                    <ListItemIcon>
                        <KeyIcon />
                    </ListItemIcon>
                    <ListItemText primary="Switch Token" />
                </ListItemButton>
            )}
        </List>
    );
};
