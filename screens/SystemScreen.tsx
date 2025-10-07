import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../themes';


interface SystemScreenProps {
    onBackup: () => string;
    onRestore: (backupString: string) => boolean;
}

const ThemeSelector: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="bg-[var(--color-surface)]/50 backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-border)]/50">
            <h2 className="text-2xl font-bold mb-4 text-green-300">Tùy Chỉnh Giao Diện</h2>
            <p className="text-[var(--color-text-muted)] mb-6 text-sm">Chọn một giao diện để thay đổi màu sắc của ứng dụng, lấy cảm hứng từ các cảnh giới tu luyện.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(themes).map(([key, themeData]) => (
                    <button
                        key={key}
                        onClick={() => setTheme(key)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${theme === key ? 'border-[var(--color-accent)] scale-105 shadow-lg' : 'border-[var(--color-border)] hover:border-[var(--color-border)]/50'}`}
                        style={{ boxShadow: theme === key ? `0 4px 14px 0 var(--color-accent-glow)` : 'none' }}
                    >
                        <span className="font-bold text-lg text-[var(--color-text-base)]">{themeData.name}</span>
                        <div className="flex justify-center items-center gap-2 mt-3">
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: themeData.colors['--color-background'] }}></div>
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: themeData.colors['--color-surface'] }}></div>
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: themeData.colors['--color-primary'] }}></div>
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: themeData.colors['--color-accent'] }}></div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}


const SystemScreen: React.FC<SystemScreenProps> = ({ onBackup, onRestore }) => {
    const [backupCode, setBackupCode] = useState('');
    const [restoreInput, setRestoreInput] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [restoreMessage, setRestoreMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        // Generate the backup code when the component mounts
        setBackupCode(onBackup());
    }, [onBackup]);

    const handleCopy = () => {
        navigator.clipboard.writeText(backupCode).then(() => {
            setCopySuccess('Đã sao chép vào bộ nhớ tạm!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Sao chép thất bại.');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handleRestoreClick = () => {
        if (!restoreInput) {
            setRestoreMessage({ type: 'error', text: 'Vui lòng dán mã sao lưu vào ô.' });
            return;
        }
        
        if (window.confirm('Cảnh báo: Hành động này sẽ GHI ĐÈ toàn bộ dữ liệu tu luyện hiện tại của bạn. Bạn có chắc chắn muốn tiếp tục?')) {
            const success = onRestore(restoreInput);
            if (success) {
                setRestoreMessage({ type: 'success', text: 'Khôi phục thành công! Dữ liệu đã được tải.' });
                setRestoreInput('');
            } else {
                setRestoreMessage({ type: 'error', text: 'Khôi phục thất bại. Mã sao lưu không hợp lệ.' });
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                 <h2 className="text-4xl font-black text-[var(--color-text-base)] mb-2 tracking-tighter">Bảng Điều Khiển Hệ Thống</h2>
                 <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">Quản lý dữ liệu và tùy chỉnh giao diện của hệ thống tu luyện.</p>
            </div>

            <ThemeSelector />

            {/* Backup Section */}
            <div className="bg-[var(--color-surface)]/50 backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-border)]/50">
                <h2 className="text-2xl font-bold mb-4 text-[var(--color-accent)]">Sao Lưu Linh Hồn</h2>
                <p className="text-[var(--color-text-muted)] mb-4 text-sm">Sao chép đoạn mã dưới đây và lưu nó ở một nơi an toàn (như trình quản lý mật khẩu, ghi chú đám mây). Đây là toàn bộ dữ liệu tu luyện của bạn.</p>
                <textarea
                    value={backupCode}
                    readOnly
                    className="w-full h-40 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] font-mono text-xs focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition"
                />
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-[var(--color-success)] h-6">{copySuccess}</span>
                    <button
                        onClick={handleCopy}
                        className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-text)] font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] disabled:bg-gray-600 transition-colors"
                    >
                        Sao Chép Mã
                    </button>
                </div>
            </div>

            {/* Restore Section */}
            <div className="bg-[var(--color-surface)]/50 backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-border)]/50">
                <h2 className="text-2xl font-bold mb-4 text-[var(--color-secondary)]">Tái Nhập Linh Hồn</h2>
                <p className="text-[var(--color-text-muted)] mb-4 text-sm">Dán mã sao lưu của bạn vào đây để khôi phục lại quá trình tu luyện. <span className="font-bold text-[var(--color-danger)]">Cảnh báo: Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại.</span></p>
                 <textarea
                    value={restoreInput}
                    onChange={(e) => setRestoreInput(e.target.value)}
                    placeholder="Dán mã sao lưu của bạn tại đây..."
                    className="w-full h-40 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-base)] font-mono text-xs focus:ring-2 focus:ring-[var(--color-secondary)] focus:outline-none transition"
                />
                <div className="mt-4 flex justify-between items-center">
                     <span className={`h-6 font-semibold ${restoreMessage.type === 'success' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                        {restoreMessage.text}
                    </span>
                    <button
                        onClick={handleRestoreClick}
                        className="px-6 py-2 bg-[var(--color-secondary)] text-white font-semibold rounded-lg hover:bg-[var(--color-secondary-hover)] disabled:bg-gray-600 transition-colors"
                        disabled={!restoreInput}
                    >
                        Khôi Phục
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemScreen;