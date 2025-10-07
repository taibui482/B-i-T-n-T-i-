import React from 'react';
import { Task, StatCategory } from '../types';

const StatInfo: Record<StatCategory, { icon: string, color: string, label: string }> = {
    strength: { icon: '⚡️', color: 'text-red-400', label: 'Thể Lực' },
    intellect: { icon: '🧠', color: 'text-blue-400', label: 'Trí Lực' },
    spirit: { icon: '🧘', color: 'text-purple-400', label: 'Tinh Thần' },
    social: { icon: '👥', color: 'text-green-400', label: 'Xã Giao' },
    finance: { icon: '💰', color: 'text-yellow-400', label: 'Tài Chính' },
};

interface TaskItemProps {
    task: Task;
    onComplete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete }) => {
    const statInfo = StatInfo[task.stat];
    
    return (
        <div className={`relative bg-[var(--color-surface)]/50 border border-[var(--color-border)] p-5 rounded-lg transition-all duration-300 ${task.completed ? 'opacity-50' : 'hover:border-[var(--color-accent)] hover:shadow-lg'}`} style={{boxShadow: task.completed ? 'none' : `0 4px 14px 0 var(--color-accent-glow)`}}>
            {task.completed && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-[var(--color-success)] transform -rotate-12">ĐÃ HOÀN THÀNH</span>
                </div>
            )}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-base)]">{task.title}</h3>
                    <p className="text-[var(--color-text-muted)] mt-1 text-sm">{task.description}</p>
                </div>
                <div className={`flex items-center space-x-2 text-sm font-semibold ${statInfo.color}`}>
                    <span>{statInfo.icon}</span>
                    <span>+{task.statReward} {statInfo.label}</span>
                </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-[var(--color-xp)]">+{task.xp} EXP</span>
                    <span className="text-sm font-medium text-[var(--color-gold)]">+{task.gold} Vàng</span>
                </div>
                <button
                    onClick={() => onComplete(task.id)}
                    disabled={task.completed}
                    className="px-4 py-2 bg-[var(--color-success-bg)] text-white font-semibold rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    Hoàn thành
                </button>
            </div>
        </div>
    );
};

export default TaskItem;