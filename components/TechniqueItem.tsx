import React from 'react';
import { Task, StatCategory } from '../types';

const StatInfo: Record<StatCategory, { icon: string, color: string, label: string }> = {
    strength: { icon: '⚡️', color: 'text-red-400', label: 'Thể Lực' },
    intellect: { icon: '🧠', color: 'text-blue-400', label: 'Trí Lực' },
    spirit: { icon: '🧘', color: 'text-purple-400', label: 'Tinh Thần' },
    social: { icon: '👥', color: 'text-green-400', label: 'Xã Giao' },
    finance: { icon: '💰', color: 'text-yellow-400', label: 'Tài Chính' },
};

interface TechniqueItemProps {
    task: Task;
    onComplete: (taskId: string) => void;
}

const TechniqueItem: React.FC<TechniqueItemProps> = ({ task, onComplete }) => {
    const statInfo = StatInfo[task.stat];
    
    return (
        <div className={`relative bg-gradient-to-br from-[var(--color-surface)] to-transparent border-2 border-[var(--color-secondary)]/50 p-5 rounded-lg shadow-lg shadow-purple-500/10 transition-all duration-300 ${task.completed ? 'opacity-50' : 'hover:border-[var(--color-secondary)]'}`}>
             {task.completed && (
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-10">
                    <span className="text-2xl font-bold text-[var(--color-gold)] transform -rotate-12 tracking-wider">ĐÃ VIÊN MÃN</span>
                </div>
            )}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-purple-300">{task.title}</h3>
                    <p className="text-[var(--color-text-muted)] mt-2 text-sm">{task.description}</p>
                </div>
                <div className={`flex items-center space-x-2 text-md font-bold ${statInfo.color}`}>
                    <span>{statInfo.icon}</span>
                    <span>+{task.statReward} {statInfo.label}</span>
                </div>
            </div>
            <div className="mt-6 border-t border-[var(--color-border)]/50 pt-4 flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <span className="text-md font-bold text-[var(--color-xp)]">+{task.xp} EXP</span>
                    <span className="text-md font-bold text-[var(--color-gold)]">+{task.gold} Vàng</span>
                </div>
                <button
                    onClick={() => onComplete(task.id)}
                    disabled={task.completed}
                    className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-md hover:shadow-lg"
                >
                    Viên Mãn
                </button>
            </div>
        </div>
    );
};

export default TechniqueItem;