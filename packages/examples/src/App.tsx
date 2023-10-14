import { ThemeProvider } from '@mui/material';
import { CssBaseline } from '@mui/material';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { basePath, isDev } from './config';
import { MainPage } from './pages/MainPage';
import { MonacoPage } from './pages/MonacoPage';
import { PixelCanvasPage } from './pages/PixelCanvas';
import { SwitchTokenPage } from './pages/SwitchTokenPage';
import { Layout } from './shared/components/Layout';
import { defaultTheme } from './shared/theme';

import './App.css';

const App = () => {
    return (
        <ThemeProvider theme={defaultTheme}>
            <Router basename={basePath}>
                <CssBaseline />
                <Layout>
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/monaco" element={<MonacoPage />} />
                        <Route path="/pixelCanvas" element={<PixelCanvasPage />} />
                        {isDev && <Route path="/switchToken" element={<SwitchTokenPage />} />}
                    </Routes>
                </Layout>
            </Router>
        </ThemeProvider>
    );
};

export default App;
