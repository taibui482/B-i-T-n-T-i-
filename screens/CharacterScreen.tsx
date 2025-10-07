import React, { useMemo } from 'react';
import { Character, EquipmentItem, EquipmentSlot, StatCategory, Stats } from '../types';
import CharacterSheet from '../components/CharacterSheet';
import EquipmentPanel from '../components/EquipmentPanel';

interface CharacterScreenProps {
    character: Character;
    inventory: EquipmentItem[];
    onNameChange: (newName: string) => void;
    onGenerateAvatar: (prompt: string) => Promise<void>;
    onEquipItem: (itemId: string) => void;
    onUnequipItem: (slot: EquipmentSlot) => void;
}

const CharacterScreen: React.FC<CharacterScreenProps> = ({ character, inventory, onNameChange, onGenerateAvatar, onEquipItem, onUnequipItem }) => {
    
    const allItems = useMemo(() => {
        // Combine inventory with equipped items that might not be in the inventory list anymore
        const itemMap = new Map<string, EquipmentItem>();
        inventory.forEach(item => itemMap.set(item.id, item));
        
        // FIX: The `Object.values` method can have an imprecise return type (`unknown[]`) in some TypeScript configurations.
        // Iterating over keys provides better type safety.
        (Object.keys(character.equipment) as EquipmentSlot[]).forEach(slot => {
            const itemId = character.equipment[slot];
            if (itemId && !itemMap.has(itemId)) {
                // This case is unlikely but good for safety. 
                // We'd need a master item list to fully resolve, but for now inventory is the source of truth.
            }
        });
        
        return Array.from(itemMap.values());

    }, [inventory, character.equipment]);


    // Memoize the combined bonus stats from all equipped items
    const bonusStats = useMemo(() => {
        const bonuses: Partial<Stats> = { strength: 0, intellect: 0, spirit: 0, social: 0, finance: 0 };

        // FIX: Using Object.keys provides better type safety than Object.values, which can return `unknown[]`.
        (Object.keys(character.equipment) as EquipmentSlot[]).forEach(slot => {
            const itemId = character.equipment[slot];
            if (itemId) {
                // We need to find the item. It's either in inventory or it's the one we just moved out.
                // The most reliable source is `allItems`.
                const item = allItems.find(i => i.id === itemId);
                if (item && item.stats) {
                    for (const stat in item.stats) {
                        const key = stat as StatCategory;
                        bonuses[key] = (bonuses[key] || 0) + (item.stats[key] || 0);
                    }
                }
            }
        });
        return bonuses;
    }, [character.equipment, allItems]);
    
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <CharacterSheet 
                    character={character} 
                    bonusStats={bonusStats}
                    onNameChange={onNameChange} 
                    onGenerateAvatar={onGenerateAvatar} 
                />
            </div>
            <div className="lg:col-span-3">
                 <EquipmentPanel
                    character={character}
                    inventory={inventory}
                    onEquipItem={onEquipItem}
                    onUnequipItem={onUnequipItem}
                />
            </div>
        </div>
    );
};

export default CharacterScreen;