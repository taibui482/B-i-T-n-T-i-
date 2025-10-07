import React, { useState, useEffect } from 'react';
import { Character, ShopItem, Rarity, EquipmentItem, StatCategory } from '../types';

const RarityStyles: Record<Rarity, { text: string; border: string; bg: string; shadow: string }> = {
    common: { text: 'text-gray-300', border: 'border-gray-500', bg: 'bg-gray-500/10', shadow: '' },
    uncommon: { text: 'text-green-400', border: 'border-green-600', bg: 'bg-green-500/10', shadow: 'shadow-green-500/10' },
    rare: { text: 'text-blue-400', border: 'border-blue-600', bg: 'bg-blue-500/10', shadow: 'shadow-blue-500/20' },
    epic: { text: 'text-purple-400', border: 'border-purple-600', bg: 'bg-purple-500/10', shadow: 'shadow-purple-500/30' },
    legendary: { text: 'text-yellow-400', border: 'border-yellow-600', bg: 'bg-yellow-500/10', shadow: 'shadow-yellow-500/40' },
};

const StatLabels: Record<StatCategory, string> = {
    strength: 'Thể Lực', intellect: 'Trí Lực', spirit: 'Tinh Thần', social: 'Xã Giao', finance: 'Tài Chính',
};

const ItemStatsDisplay: React.FC<{ item: Omit<EquipmentItem, 'id'> }> = ({ item }) => (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {Object.entries(item.stats).map(([stat, value]) => (
            <span key={stat} className="font-medium text-[var(--color-text-muted)]">
                +{value} {StatLabels[stat as StatCategory]}
            </span>
        ))}
    </div>
);

const ShopItemCard: React.FC<{ shopItem: ShopItem; characterGold: number; onPurchase: (itemId: string) => void }> = ({ shopItem, characterGold, onPurchase }) => {
    const { item, price } = shopItem;
    const canAfford = characterGold >= price;
    const rarityStyle = RarityStyles[item.rarity] || RarityStyles.common;

    return (
        <div className={`flex flex-col justify-between bg-[var(--color-surface)]/50 p-4 rounded-lg border-2 ${rarityStyle.border} ${rarityStyle.bg} shadow-lg ${rarityStyle.shadow} transition-all duration-300 hover:scale-105`}>
            <div>
                <h4 className={`text-lg font-bold ${rarityStyle.text}`}>{item.name}</h4>
                <p className="text-xs font-semibold uppercase text-gray-400 mb-2">{item.type.replace('_', ' ')}</p>
                <p className="text-sm text-[var(--color-text-muted)] italic mb-3">{item.description}</p>
                <div className="border-t border-[var(--color-border)] my-2"></div>
                <ItemStatsDisplay item={item} />
            </div>
            <div className="mt-4 flex justify-between items-center">
                <span className="text-xl font-bold text-[var(--color-gold)] flex items-center">
                    💰 {price}
                </span>
                <button
                    onClick={() => onPurchase(shopItem.id)}
                    disabled={!canAfford}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-hover)] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    Mua
                </button>
            </div>
        </div>
    );
};


interface ShopScreenProps {
    character: Character;
    shopItems: ShopItem[];
    onPurchaseItem: (itemId: string) => void;
    isLoading: boolean;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ character, shopItems, onPurchaseItem, isLoading }) => {
    const [timeUntilReset, setTimeUntilReset] = useState('');

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeUntilReset(`${hours} giờ ${minutes} phút`);
        };
        calculateTime();
        const interval = setInterval(calculateTime, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-[var(--color-text-base)] mb-2 tracking-tighter">Thương Thành</h2>
                <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
                    Nơi cơ duyên và linh thạch hội tụ. Vật phẩm sẽ được làm mới sau <span className="font-bold text-[var(--color-accent)]">{timeUntilReset}</span>.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center py-20">
                    <p className="text-lg text-purple-300 animate-pulse">Chủ tiệm đang bày hàng, xin chờ trong giây lát...</p>
                </div>
            ) : shopItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shopItems.map(item => (
                        <ShopItemCard 
                            key={item.id}
                            shopItem={item}
                            characterGold={character.gold}
                            onPurchase={onPurchaseItem}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-20 bg-[var(--color-surface)]/30 rounded-lg">
                    <h3 className="text-xl font-bold text-[var(--color-text-base)]">Thương Thành đã bán hết hàng</h3>
                    <p className="text-[var(--color-text-muted)] mt-2">Vui lòng quay lại vào ngày mai để xem các vật phẩm mới.</p>
                </div>
            )}
        </div>
    );
};

export default ShopScreen;