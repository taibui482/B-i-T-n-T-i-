import React from 'react';

interface SystemTerminalProps {
    messages: string[];
    onNewTasks: () => void;
    isLoading: boolean;
    onNewEncounter: () => void;
    isEncounterAvailable: boolean;
    isEncounterLoading: boolean;
}

const SystemTerminal: React.FC<SystemTerminalProps> = ({ messages, onNewTasks, isLoading, onNewEncounter, isEncounterAvailable, isEncounterLoading }) => {
    return (
        <div className="bg-[var(--color-terminal)] backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-border)]/50 shadow-2xl h-full flex flex-col">
            <div className="flex items-center mb-4 border-b border-[var(--color-border)] pb-2">
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <h3 className="ml-3 text-lg font-semibold text-green-300 tracking-wider">SYSTEM LOG</h3>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-2 text-sm font-mono">
                {messages.map((msg, index) => (
                    <p key={index} className="text-[var(--color-text-muted)] whitespace-pre-wrap break-words">
                        <span className="text-green-500 mr-2">&gt;</span>{msg}
                    </p>
                ))}
                {(isLoading || isEncounterLoading) && (
                    <p className="text-yellow-400 animate-pulse">
                         <span className="text-yellow-500 mr-2">&gt;</span>{isLoading ? 'Đang kết nối với lõi hệ thống...' : 'Đang dò xét thiên cơ...'}
                    </p>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3">
                {isEncounterAvailable && (
                    <button
                        onClick={onNewEncounter}
                        disabled={isLoading || isEncounterLoading}
                        className="w-full px-4 py-3 bg-[var(--color-secondary)] text-white font-bold rounded-lg hover:bg-[var(--color-secondary-hover)] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg shadow-purple-500/20"
                    >
                        {isEncounterLoading ? 'ĐANG TÌM KIẾM...' : '✨ Tìm kiếm Kỳ Ngộ'}
                    </button>
                )}
                <button
                    onClick={onNewTasks}
                    disabled={isLoading || isEncounterLoading}
                    className="w-full px-4 py-3 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-hover)] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    {isLoading ? 'ĐANG TẢI...' : 'Yêu Cầu Nhiệm Vụ Mới'}
                </button>
            </div>
        </div>
    );
};

export default SystemTerminal;