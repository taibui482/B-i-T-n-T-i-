import React from 'react';
import { Character } from '../types';

interface HeaderProps {
    character: Character;
    onNavigate: () => void;
    isActive: boolean;
}

const Header: React.FC<HeaderProps> = ({ character, onNavigate, isActive }) => {
    const xpPercentage = (character.xp / character.xpToNextLevel) * 100;

    return (
        <header className="sticky top-0 z-10 bg-[var(--color-background)]/70 backdrop-blur-md border-b border-[var(--color-border)]/50 p-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <button
                    onClick={onNavigate}
                    className={`flex items-center space-x-4 p-2 rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${isActive ? 'bg-[var(--color-surface)]' : 'hover:bg-[var(--color-surface)]/50'}`}
                    aria-label="Xem trang nhân vật"
                >
                     <div className="w-12 h-12 bg-[var(--color-surface)] rounded-full flex items-center justify-center border-2 border-[var(--color-accent)] flex-shrink-0 overflow-hidden">
                        {character.avatar ? (
                            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl font-bold">{character.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="text-left">
                        <h1 className="text-lg font-bold text-[var(--color-text-base)]">{character.name}</h1>
                        <p className="text-sm text-[var(--color-text-muted)]">Cấp {character.level} - {character.realm}</p>
                    </div>
                </button>
                <div className="flex items-center space-x-4">
                    <div className="w-40">
                         <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="font-medium text-[var(--color-xp)]">EXP</span>
                            <span className="text-[var(--color-text-muted)]">{character.xp} / {character.xpToNextLevel}</span>
                        </div>
                        <div className="w-full bg-[var(--color-surface)] rounded-full h-2">
                            <div className="bg-[var(--color-accent)] h-2 rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                        </div>
                    </div>
                    <div className="flex items-center bg-[var(--color-surface)]/50 px-3 py-1.5 rounded-lg">
                        <span className="text-yellow-400 mr-2 text-lg">💰</span>
                        <span className="text-lg font-bold text-[var(--color-text-base)]">{character.gold}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;