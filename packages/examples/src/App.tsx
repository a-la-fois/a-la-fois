import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { MonacoPage } from './pages/MonacoPage';
import { PixelCanvasPage } from './pages/PixelCanvas';
import { SwitchTokenPage } from './pages/SwitchTokenPage';
// import { basePath } from './config';

import './App.css';

const App = () => {
    return (
        <Router>
            {/* TODO: return  when move from hash router <Router basename={basePath}> */}
            <div className="App">
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/monaco" element={<MonacoPage />} />
                    <Route path="/pixelCanvas" element={<PixelCanvasPage />} />
                    <Route path="/switchToken" element={<SwitchTokenPage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
