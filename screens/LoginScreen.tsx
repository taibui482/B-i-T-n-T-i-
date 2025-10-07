import React, { useState } from 'react';

interface LoginScreenProps {
    onEnter: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onEnter }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    const handleEnterClick = () => {
        setIsFadingOut(true);
        // Wait for the fade-out animation to complete before calling onEnter
        setTimeout(onEnter, 1000); // 1s matches the animation duration
    };

    return (
        <div 
            className={`
                min-h-screen w-full flex flex-col items-center justify-center 
                bg-[var(--color-background)] text-[var(--color-text-base)] p-4 transition-opacity duration-1000
                ${isFadingOut ? 'opacity-0' : 'opacity-100'}
            `}
            style={{
                backgroundImage: `
                    radial-gradient(circle at 10% 10%, rgba(120, 119, 198, 0.2) 0%, transparent 40%),
                    radial-gradient(circle at 90% 80%, rgba(34, 211, 238, 0.2) 0%, transparent 40%)
                `
            }}
        >
            <div className="text-center animate-fade-in-slow">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Hệ Thống Tu Luyện
                </h1>
                <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 max-w-2xl mx-auto">
                    Một hệ thống AI được thiết kế để gamify hóa hành trình phát triển bản thân của bạn, lấy cảm hứng từ thế giới tu tiên huyền ảo.
                </p>

                <button
                    onClick={handleEnterClick}
                    className="
                        px-12 py-5 bg-[var(--color-accent)] text-black font-bold text-xl rounded-lg
                        transition-all duration-300 transform hover:scale-110 hover:shadow-2xl
                        focus:outline-none focus:ring-4 focus:ring-cyan-300
                        animate-pulse-slow
                    "
                    style={{
                        boxShadow: '0 0 20px var(--color-accent-glow), 0 0 40px var(--color-accent-glow)'
                    }}
                >
                    Tiến Nhập Tu Luyện Giới
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;
