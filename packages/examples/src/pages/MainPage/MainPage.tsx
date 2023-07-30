import { Link } from 'react-router-dom';

export const MainPage = () => (
    <div>
        <h1>A la fois</h1>
        <ul>
            <li>
                <Link to="/monaco">Monaco</Link>
            </li>
            <li>
                <Link to="/pixelCanvas">PixelCanvas</Link>
            </li>
            <li>
                <Link to="/switchToken">SwitchToken</Link>
            </li>
        </ul>
    </div>
);
