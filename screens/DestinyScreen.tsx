import React, { useState } from 'react';
import { UserEvent } from '../types';

interface DestinyScreenProps {
    diaryDraft: string;
    onDiaryDraftChange: (draft: string) => void;
    onSaveDiary: () => void;
    onAddEvent: (name: string, date: string) => void;
    events: UserEvent[];
    onDeleteEvent: (eventId: string) => void;
}

const DestinyScreen: React.FC<DestinyScreenProps> = ({ diaryDraft, onDiaryDraftChange, onSaveDiary, onAddEvent, events, onDeleteEvent }) => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [saveMessage, setSaveMessage] = useState('');

    const handleSaveDiary = () => {
        onSaveDiary();
        setSaveMessage('Nhật ký đã được ghi vào thiên cơ.');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleAddEvent = () => {
        if (eventName && eventDate) {
            onAddEvent(eventName, eventDate);
            setEventName('');
            setEventDate('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Diary Section */}
            <div className="bg-[var(--color-surface)]/50 backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-border)]/50">
                <h2 className="text-2xl font-bold mb-4 text-[var(--color-accent)]">Nhật Ký Tu Luyện</h2>
                <p className="text-[var(--color-text-muted)] mb-4 text-sm">Ghi lại những suy ngẫm, tâm ma, hoặc mục tiêu. Hệ thống sẽ dựa vào đây để đưa ra thử thách phù hợp vào ngày tiếp theo.</p>
                <textarea
                    value={diaryDraft}
                    onChange={(e) => onDiaryDraftChange(e.target.value)}
                    placeholder="Viết ra những suy nghĩ của bạn..."
                    className="w-full h-40 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-base)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition"
                />
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-[var(--color-success)] h-6">{saveMessage}</span>
                    <button
                        onClick={handleSaveDiary}
                        className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-text)] font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] disabled:bg-gray-600 transition-colors"
                        disabled={!diaryDraft.trim()}
                    >
                        Lưu trữ
                    </button>
                </div>
            </div>

            {/* Events Section */}
            <div className="bg-[var(--color-surface)]/50 backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-border)]/50">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">Thiên Cơ Sắp Tới</h2>
                <p className="text-[var(--color-text-muted)] mb-4 text-sm">Thêm các sự kiện quan trọng. Hệ thống sẽ tự động tạo nhiệm vụ chuẩn bị khi sự kiện đến gần (còn 3 ngày).</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="Tên sự kiện (ví dụ: Phỏng vấn)"
                        className="md:col-span-2 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-base)] focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                    />
                    <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-base)] focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        min={new Date().toISOString().split("T")[0]} // Prevent past dates
                    />
                </div>
                 <button
                    onClick={handleAddEvent}
                    className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 disabled:bg-gray-600 transition-colors"
                    disabled={!eventName || !eventDate}
                >
                    Thêm Sự Kiện
                </button>
            </div>
            
            {/* Event List */}
            {events.length > 0 && (
                <div className="bg-[var(--color-surface)]/50 backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-border)]/50">
                    <h3 className="text-xl font-bold mb-4 text-[var(--color-text-base)]">Danh sách Thiên Cơ</h3>
                    <ul className="space-y-4">
                        {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const eventDate = new Date(event.date);
                            eventDate.setHours(0,0,0,0); // Ensure we compare dates only

                            const timeDiff = eventDate.getTime() - today.getTime();
                            const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));
                            
                            const isUpcoming = daysDiff >= 0 && daysDiff <= 7;
                            const isToday = daysDiff === 0;

                            return (
                                <li key={event.id} className={`flex justify-between items-center bg-[var(--color-background)]/50 p-3 rounded-lg transition-all duration-300 ${isUpcoming ? 'ring-2 ring-offset-2 ring-offset-[var(--color-surface)] ring-[var(--color-gold)]' : ''}`}>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-[var(--color-text-base)]">{event.name}</p>
                                        <p className="text-sm text-[var(--color-text-muted)]">{new Date(event.date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {isUpcoming && (
                                            <span className="text-xs font-bold text-[var(--color-gold)] bg-yellow-900/50 px-2.5 py-1 rounded-full">
                                                {isToday ? 'HÔM NAY' : `CÒN ${daysDiff} NGÀY`}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => onDeleteEvent(event.id)}
                                            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors p-1"
                                            aria-label={`Xóa sự kiện ${event.name}`}
                                        >
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DestinyScreen;