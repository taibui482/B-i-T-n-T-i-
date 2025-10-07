import React, { useMemo } from 'react';
import { Character, EquipmentItem, EquipmentSlot, Rarity, StatCategory } from '../types';

const RarityStyles: Record<Rarity, { text: string; border: string; bg: string }> = {
    common: { text: 'text-gray-300', border: 'border-gray-500', bg: 'bg-gray-500/10' },
    uncommon: { text: 'text-green-400', border: 'border-green-600', bg: 'bg-green-500/10' },
    rare: { text: 'text-blue-400', border: 'border-blue-600', bg: 'bg-blue-500/10' },
    epic: { text: 'text-purple-400', border: 'border-purple-600', bg: 'bg-purple-500/10' },
    legendary: { text: 'text-yellow-400', border: 'border-yellow-600', bg: 'bg-yellow-500/10' },
};

const StatLabels: Record<StatCategory, string> = {
    strength: 'Thể Lực',
    intellect: 'Trí Lực',
    spirit: 'Tinh Thần',
    social: 'Xã Giao',
    finance: 'Tài Chính',
};

const ItemStatsDisplay: React.FC<{ item: EquipmentItem }> = ({ item }) => (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {Object.entries(item.stats).map(([stat, value]) => (
            <span key={stat} className="font-medium text-[var(--color-text-muted)]">
                +{value} {StatLabels[stat as StatCategory]}
            </span>
        ))}
    </div>
);

const EquippedSlot: React.FC<{ slot: EquipmentSlot; label: string; item: EquipmentItem | undefined; onUnequip: (slot: EquipmentSlot) => void }> = ({ slot, label, item, onUnequip }) => {
    if (!item) {
        return (
            <div className="bg-[var(--color-background)]/50 p-4 rounded-lg border-2 border-dashed border-[var(--color-border)] text-center">
                <p className="font-semibold text-sm text-[var(--color-text-muted)]">{label}</p>
                <p className="text-xs text-gray-500">- Trống -</p>
            </div>
        );
    }

    const rarityStyle = RarityStyles[item.rarity] || RarityStyles.common;

    return (
        <div className={`p-4 rounded-lg border-2 ${rarityStyle.border} ${rarityStyle.bg}`}>
            <p className="font-semibold text-sm text-[var(--color-text-muted)] mb-1">{label}</p>
            <div className="flex justify-between items-center">
                <div>
                    <h4 className={`font-bold ${rarityStyle.text}`}>{item.name}</h4>
                    <ItemStatsDisplay item={item} />
                </div>
                <button
                    onClick={() => onUnequip(slot)}
                    className="px-3 py-1 text-xs font-semibold bg-[var(--color-border)] text-white rounded-md hover:bg-[var(--color-border)]/70 transition-colors"
                >
                    Gỡ
                </button>
            </div>
        </div>
    );
};


interface EquipmentPanelProps {
    character: Character;
    inventory: EquipmentItem[];
    onEquipItem: (itemId: string) => void;
    onUnequipItem: (slot: EquipmentSlot) => void;
}

const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ character, inventory, onEquipItem, onUnequipItem }) => {
    
    const { equippedItems, unequippedInventory } = useMemo(() => {
        const equippedIds = new Set(Object.values(character.equipment));
        const unequipped = inventory.filter(item => !equippedIds.has(item.id));
        
        const equipped: Record<EquipmentSlot, EquipmentItem | undefined> = {
            weapon: undefined,
            armor: undefined,
            accessory: undefined,
        };

        (Object.keys(equipped) as EquipmentSlot[]).forEach(slot => {
            const itemId = character.equipment[slot];
            if (itemId) {
                const foundItem = inventory.find(i => i.id === itemId);
                if (foundItem) {
                    equipped[slot] = foundItem;
                }
            }
        });

        return { equippedItems: equipped, unequippedInventory: unequipped };

    }, [character.equipment, inventory]);
    
    return (
        <div className="bg-[var(--color-surface)]/70 backdrop-blur-sm p-6 rounded-2xl border border-[var(--color-border)]/50 shadow-2xl h-full flex flex-col space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-[var(--color-accent)] mb-4">Pháp Bảo Trang Bị</h3>
                <div className="space-y-3">
                    <EquippedSlot slot="weapon" label="Vũ Khí" item={equippedItems.weapon} onUnequip={onUnequipItem} />
                    <EquippedSlot slot="armor" label="Giáp Trụ" item={equippedItems.armor} onUnequip={onUnequipItem} />
                    <EquippedSlot slot="accessory" label="Phụ Kiện" item={equippedItems.accessory} onUnequip={onUnequipItem} />
                </div>
            </div>

            <div className="flex-grow flex flex-col min-h-0">
                <h3 className="text-2xl font-bold text-purple-300 mb-4">Túi Càn Khôn</h3>
                <div className="flex-grow overflow-y-auto pr-2 space-y-3 bg-[var(--color-background)]/30 p-3 rounded-lg border border-[var(--color-border)]">
                    {unequippedInventory.length > 0 ? (
                        unequippedInventory.map(item => {
                             const rarityStyle = RarityStyles[item.rarity] || RarityStyles.common;
                             return (
                                <div key={item.id} className={`p-3 rounded-lg border ${rarityStyle.border} ${rarityStyle.bg} flex justify-between items-center`}>
                                    <div>
                                        <h4 className={`font-bold ${rarityStyle.text}`}>{item.name}</h4>
                                        <p className="text-xs text-[var(--color-text-muted)] italic mt-1 mb-2">{item.description}</p>
                                        <ItemStatsDisplay item={item} />
                                    </div>
                                    <button 
                                        onClick={() => onEquipItem(item.id)}
                                        className="px-3 py-1 text-xs font-semibold bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors flex-shrink-0 ml-4"
                                    >
                                        Trang Bị
                                    </button>
                                </div>
                             )
                        })
                    ) : (
                        <div className="h-full flex items-center justify-center text-center">
                            <p className="text-sm text-[var(--color-text-muted)]">Túi đồ của bạn trống rỗng.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EquipmentPanel;
