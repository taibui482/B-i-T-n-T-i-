export interface Stats {
  strength: number; // Thể Lực
  intellect: number; // Trí Lực
  spirit: number; // Tinh Thần
  social: number; // Xã Giao
  finance: number; // Tài Chính
}

export type StatCategory = keyof Stats;

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface EquipmentItem {
    id: string;
    name: string;
    description: string;
    type: EquipmentSlot;
    stats: Partial<Stats>;
    rarity: Rarity;
}

export interface ShopItem {
    id: string;
    price: number;
    item: Omit<EquipmentItem, 'id'>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  xp: number;
  stat: StatCategory;
  statReward: number;
  gold: number;
  completed: boolean;
  isEventTask?: boolean;
  eventName?: string;
  isLongTerm?: boolean;
  itemReward?: Omit<EquipmentItem, 'id'>;
}

export interface Character {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  realm: string;
  stats: Stats; // Base stats
  gold: number;
  avatar?: string; // Base64 encoded image URL
  equipment: Record<EquipmentSlot, string | null>; // Stores IDs of equipped items
}

export interface Realm {
    name: string;
    minLevel: number;
    color: string;
}

export interface UserEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  tasksGenerated?: boolean;
}

export interface BackupData {
  character: Character;
  tasks: Task[];
  techniques: Task[];
  events: UserEvent[];
  cultivationDiary: Record<string, string>;
  lastEncounterDate: string | null;
  inventory: EquipmentItem[];
  version: number;
}