import React, { useState, useMemo } from 'react';
import { Character, StatCategory, Stats } from '../types';
import { REALMS } from '../constants';

interface ProgressBarProps {
    value: number;
    maxValue: number;
    label: string;
    colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, maxValue, label, colorClass }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{label}</span>
                <span className="text-sm font-medium text-[var(--color-text-muted)]/80">{value} / {maxValue}</span>
            </div>
            <div className="w-full bg-[var(--color-surface)] rounded-full h-2.5">
                <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const StatDisplay: React.FC<{ icon: React.ReactNode, label: string, value: number, bonus: number, color: string }> = ({ icon, label, value, bonus, color }) => (
    <div className="flex items-center space-x-3 bg-[var(--color-surface)]/50 p-3 rounded-lg">
        <div className={`p-2 rounded-md ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
            <p className="text-xl font-bold text-[var(--color-text-base)]">
                {value + bonus}
                {bonus > 0 && <span className="text-sm font-medium text-green-400 ml-1">(+{bonus})</span>}
            </p>
        </div>
    </div>
);


const StatIcons: Record<StatCategory, { icon: React.ReactNode, color: string, label: string }> = {
    strength: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, color: 'bg-red-500/30 text-red-300', label: 'Thể Lực' },
    intellect: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, color: 'bg-blue-500/30 text-blue-300', label: 'Trí Lực' },
    spirit: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, color: 'bg-purple-500/30 text-purple-300', label: 'Tinh Thần' },
    social: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, color: 'bg-green-500/30 text-green-300', label: 'Xã Giao' },
    finance: { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-7 6h7m-3 4h3m-8 4h11.5a1.5 1.5 0 001.5-1.5V6.5A1.5 1.5 0 0016.5 5H4.5A1.5 1.5 0 003 6.5v12A1.5 1.5 0 004.5 20z" /></svg>, color: 'bg-yellow-500/30 text-yellow-300', label: 'Tài Chính' },
};

interface AvatarGenerationModalProps {
    character: Character;
    onClose: () => void;
    onGenerate: (prompt: string) => void;
    isLoading: boolean;
}

const AvatarGenerationModal: React.FC<AvatarGenerationModalProps> = ({ character, onClose, onGenerate, isLoading }) => {
    const suggestedPrompt = useMemo(() => {
        const stats = character.stats;
        const mainStat = Object.keys(stats).reduce((a, b) => stats[a as keyof typeof stats] > stats[b as keyof typeof stats] ? a : b);
        return `Một tu sĩ ${character.realm} mạnh mẽ tên là ${character.name}, có sở trường về ${mainStat}, phong thái thần bí, tỏa ra năng lượng tu luyện.`;
    }, [character]);
    
    const [prompt, setPrompt] = useState(suggestedPrompt);

    const handleGenerate = () => {
        if (prompt.trim() && !isLoading) {
            onGenerate(prompt);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 w-full max-w-lg animate-fade-in-slow">
                <h3 className="text-2xl font-bold text-center mb-2 text-[var(--color-accent)]">Kiến Tạo Pháp Tướng</h3>
                <p className="text-center text-[var(--color-text-muted)] mb-6">Mô tả ngoại hình, khí chất, hoặc pháp tướng mà bạn muốn hệ thống tạo ra.</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ví dụ: Một tu sĩ trẻ với ánh mắt sắc bén, bao quanh bởi lôi điện..."
                    className="w-full h-28 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-base)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition"
                    disabled={isLoading}
                />
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} disabled={isLoading} className="w-full px-4 py-3 bg-[var(--color-border)] text-white font-bold rounded-lg hover:bg-[var(--color-border)]/70 transition-colors">Hủy Bỏ</button>
                    <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full px-4 py-3 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-hover)] disabled:bg-gray-600 transition-colors">
                        {isLoading ? 'Đang Hội Tụ Linh Khí...' : 'Kiến Tạo'}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface CharacterSheetProps {
    character: Character;
    bonusStats: Partial<Stats>;
    onNameChange: (newName: string) => void;
    onGenerateAvatar: (prompt: string) => Promise<void>;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, bonusStats, onNameChange, onGenerateAvatar }) => {
    const realmInfo = REALMS.find(r => r.name === character.realm) || REALMS[0];
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(character.name);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleNameSave = () => {
        if (newName.trim() && newName.trim() !== character.name) {
            onNameChange(newName.trim());
        }
        setIsEditingName(false);
    };

    const handleGenerateClick = async (prompt: string) => {
        setIsGenerating(true);
        await onGenerateAvatar(prompt);
        setIsGenerating(false);
        setIsAvatarModalOpen(false);
    };

    return (
        <>
            <div className="bg-[var(--color-surface)]/70 backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-border)]/50 shadow-2xl h-full flex flex-col">
                <div className="flex justify-center mb-4">
                    <button 
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="group relative w-32 h-32 rounded-full border-4 border-[var(--color-accent)] shadow-lg bg-[var(--color-surface)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] focus-visible:ring-[var(--color-accent)]"
                        aria-label="Change character avatar"
                    >
                        {character.avatar ? (
                            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-full bg-cover" style={{backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='100' ry='100' stroke='%23374151FF' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`}}>
                                <span className="text-5xl font-bold">{character.name.charAt(0)}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                            </svg>
                        </div>
                    </button>
                </div>

                <div className="text-center mb-6">
                    {isEditingName ? (
                        <div className="flex justify-center items-center gap-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={handleNameSave}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); }}
                                className="text-3xl font-black tracking-tighter text-center bg-[var(--color-surface)] text-[var(--color-text-base)] rounded-lg px-2 py-1 w-auto focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                autoFocus
                            />
                            <button
                                onClick={handleNameSave}
                                className="px-3 py-1 bg-[var(--color-success-bg)] text-white font-semibold rounded-lg hover:bg-green-500 transition-colors"
                            >
                                Lưu
                            </button>
                        </div>
                    ) : (
                        <div 
                            className="flex items-center justify-center gap-2 group cursor-pointer"
                            onClick={() => {
                                setNewName(character.name);
                                setIsEditingName(true);
                            }}
                        >
                            <h2 className="text-3xl font-black tracking-tighter text-[var(--color-text-base)]">{character.name}</h2>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                            </svg>
                        </div>
                    )}
                    <p className="text-lg font-bold mt-1">
                        <span className={realmInfo.color}>{character.realm}</span> - Cấp {character.level}
                    </p>
                </div>

                <div className="mb-6">
                    <ProgressBar
                        label="Kinh nghiệm"
                        value={character.xp}
                        maxValue={character.xpToNextLevel}
                        colorClass="bg-[var(--color-accent)]"
                    />
                </div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Object.keys(character.stats) as StatCategory[]).map(key => (
                        <StatDisplay
                            key={key}
                            icon={StatIcons[key].icon}
                            label={StatIcons[key].label}
                            value={character.stats[key]}
                            bonus={bonusStats[key] || 0}
                            color={StatIcons[key].color}
                        />
                    ))}
                </div>
            </div>

            {isAvatarModalOpen && (
                <AvatarGenerationModal 
                    character={character}
                    onClose={() => setIsAvatarModalOpen(false)}
                    onGenerate={handleGenerateClick}
                    isLoading={isGenerating}
                />
            )}
        </>
    );
};

export default CharacterSheet;
