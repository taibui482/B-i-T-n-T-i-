
import { Realm } from './types';

export const REALMS: Realm[] = [
    { name: 'Phàm Nhân', minLevel: 0, color: 'text-gray-400' },
    { name: 'Luyện Khí', minLevel: 1, color: 'text-green-400' },
    { name: 'Trúc Cơ', minLevel: 10, color: 'text-blue-400' },
    { name: 'Kim Đan', minLevel: 25, color: 'text-yellow-400' },
    { name: 'Nguyên Anh', minLevel: 50, color: 'text-purple-400' },
    { name: 'Hóa Thần', minLevel: 100, color: 'text-red-400' },
    { name: 'Đại Thừa', minLevel: 200, color: 'text-cyan-300' },
];

export const getRealmForLevel = (level: number): Realm => {
    let currentRealm = REALMS[0];
    for (const realm of REALMS) {
        if (level >= realm.minLevel) {
            currentRealm = realm;
        } else {
            break;
        }
    }
    return currentRealm;
};

export const calculateXpToNextLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(1.15, level));
};
