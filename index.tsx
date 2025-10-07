import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LoginScreen from './screens/LoginScreen';
import { ThemeProvider } from './contexts/ThemeContext';

const Main = () => {
    const [hasEntered, setHasEntered] = useState(() => {
        try {
            return window.localStorage.getItem('hasEnteredWorld') === 'true';
        } catch (e) {
            console.error("Could not access localStorage:", e);
            return false;
        }
    });

    const handleEnter = () => {
        try {
            window.localStorage.setItem('hasEnteredWorld', 'true');
        } catch (e) {
            console.error("Could not write to localStorage:", e);
        }
        setHasEntered(true);
    };

    if (!hasEntered) {
        return <LoginScreen onEnter={handleEnter} />;
    }

    return (
        <ThemeProvider>
            <App />
        </ThemeProvider>
    );
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);