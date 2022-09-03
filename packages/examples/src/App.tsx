import { Redirect, Route } from 'wouter';
import { MonacoPage } from './pages/MonacoPage';

import './App.css';

const App = () => {
    return (
        <div className="App">
            <Route path="/">
                <Redirect to="/monaco" />
            </Route>
            <Route path="/monaco">
                <MonacoPage />
            </Route>
        </div>
    );
};

export default App;