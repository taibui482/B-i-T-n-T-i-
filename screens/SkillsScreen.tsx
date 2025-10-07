import React from 'react';
import { Task } from '../types';
import TechniqueItem from '../components/TechniqueItem';

interface SkillsScreenProps {
    techniques: Task[];
    onCompleteTechnique: (techniqueId: string) => void;
    onRequestNewTechniques: () => void;
    isLoading: boolean;
}

const SkillsScreen: React.FC<SkillsScreenProps> = ({ techniques, onCompleteTechnique, onRequestNewTechniques, isLoading }) => {
    const activeTechniques = techniques.filter(t => !t.completed);
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                 <h2 className="text-4xl font-black text-[var(--color-text-base)] mb-2 tracking-tighter">Công Pháp & Bí Kíp</h2>
                 <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">Đây là những nhiệm vụ dài hạn, đòi hỏi sự kiên trì tu luyện. Hoàn thành chúng sẽ mang lại phần thưởng to lớn và đột phá cảnh giới.</p>
            </div>

            <div className="space-y-6">
                {activeTechniques.length > 0 ? (
                    activeTechniques.map(tech => (
                        <TechniqueItem key={tech.id} task={tech} onComplete={onCompleteTechnique} />
                    ))
                ) : (
                    !isLoading && (
                        <div className="text-center py-16 bg-[var(--color-surface)]/50 rounded-lg border-2 border-dashed border-[var(--color-border)]">
                            <p className="text-[var(--color-text-muted)] mb-4">Chưa lĩnh ngộ được công pháp nào.</p>
                             <p className="text-gray-500 text-sm">Hãy tĩnh tâm và thử tìm kiếm cơ duyên mới.</p>
                        </div>
                    )
                )}
                
                {isLoading && (
                     <div className="text-center py-10">
                        <p className="text-purple-300 animate-pulse">Hệ thống đang suy diễn thiên cơ, tìm kiếm công pháp phù hợp...</p>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center">
                 <button
                    onClick={onRequestNewTechniques}
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white font-bold rounded-lg hover:opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg shadow-purple-500/20"
                >
                    {isLoading ? 'ĐANG SUY DIỄN...' : 'Lĩnh Ngộ Công Pháp Mới'}
                </button>
            </div>
        </div>
    );
};

export default SkillsScreen;