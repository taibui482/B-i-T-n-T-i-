import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { themes } from '../themes';

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = window.localStorage.getItem('app-theme');
            return savedTheme && themes[savedTheme] ? savedTheme : 'onyx';
        } catch (error) {
            console.error("Failed to read theme from localStorage", error);
            return 'onyx';
        }
    });

    useEffect(() => {
        const selectedTheme = themes[theme];
        if (selectedTheme) {
            const root = window.document.documentElement;
            Object.entries(selectedTheme.colors).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
            try {
                window.localStorage.setItem('app-theme', theme);
            } catch (error) {
                console.error("Failed to save theme to localStorage", error);
            }
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
