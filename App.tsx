import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Character, Task, UserEvent, BackupData, EquipmentItem, EquipmentSlot, ShopItem } from './types';
import { calculateXpToNextLevel, getRealmForLevel } from './constants';
import { generateTasks, generateEncounter, generateEventTasks, generateTechniques, generateAvatar, generateShopItems } from './services/geminiService';
import Header from './components/Header';
import Navigation, { Screen } from './components/Navigation';
import TasksScreen from './screens/TasksScreen';
import CharacterScreen from './screens/CharacterScreen';
import SkillsScreen from './screens/SkillsScreen';
import ShopScreen from './screens/ShopScreen';
import DestinyScreen from './screens/DestinyScreen';
import SystemScreen from './screens/SystemScreen';

const APP_VERSION = 2; // Version bump for new data structure

const App: React.FC = () => {
    const [character, setCharacter] = useState<Character>(() => {
        const savedChar = localStorage.getItem('character');
        if (savedChar) {
            const parsed = JSON.parse(savedChar);
            // Migration for users from older versions
            if (!parsed.equipment) {
                parsed.equipment = { weapon: null, armor: null, accessory: null };
            }
            return parsed;
        }
        return {
            name: 'Kẻ Tu Luyện',
            level: 1,
            xp: 0,
            xpToNextLevel: calculateXpToNextLevel(1),
            realm: getRealmForLevel(1).name,
            stats: { strength: 5, intellect: 5, spirit: 5, social: 5, finance: 5 },
            gold: 100,
            avatar: '',
            equipment: { weapon: null, armor: null, accessory: null },
        };
    });

    const [tasks, setTasks] = useState<Task[]>(() => {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    
    const [inventory, setInventory] = useState<EquipmentItem[]>(() => {
        const savedInventory = localStorage.getItem('inventory');
        return savedInventory ? JSON.parse(savedInventory) : [];
    });

    const [techniques, setTechniques] = useState<Task[]>(() => {
        const savedTechniques = localStorage.getItem('techniques');
        return savedTechniques ? JSON.parse(savedTechniques) : [];
    });
    
    const [isTechniquesLoading, setIsTechniquesLoading] = useState<boolean>(false);

    const [systemMessages, setSystemMessages] = useState<string[]>(['Hệ thống khởi động... Chào mừng Kẻ Tu Luyện.']);
    const [isTasksLoading, setIsTasksLoading] = useState<boolean>(false);
    const [activeScreen, setActiveScreen] = useState<Screen>('tasks');
    const [isEncounterAvailable, setIsEncounterAvailable] = useState<boolean>(false);
    const [isEncounterLoading, setIsEncounterLoading] = useState<boolean>(false);

    const [events, setEvents] = useState<UserEvent[]>(() => {
        const savedEvents = localStorage.getItem('cultivationEvents');
        return savedEvents ? JSON.parse(savedEvents) : [];
    });

    const [diaryDraft, setDiaryDraft] = useState<string>(() => {
        return localStorage.getItem('diaryDraft') || '';
    });
    
    const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
        const saved = localStorage.getItem('shopItems');
        return saved ? JSON.parse(saved) : [];
    });
    const [isShopLoading, setIsShopLoading] = useState<boolean>(false);


    const appState = useRef({ character, tasks, techniques, events, diaryDraft, inventory, shopItems });
    useEffect(() => {
        appState.current = { character, tasks, techniques, events, diaryDraft, inventory, shopItems };
    });

    useEffect(() => {
        const intervalId = setInterval(() => {
            const stateToSave = appState.current;
            console.log(`[Auto-Save] Tiến trình đã được tự động lưu vào lúc ${new Date().toLocaleTimeString()}`);
            try {
                localStorage.setItem('character', JSON.stringify(stateToSave.character));
                localStorage.setItem('tasks', JSON.stringify(stateToSave.tasks));
                localStorage.setItem('techniques', JSON.stringify(stateToSave.techniques));
                localStorage.setItem('cultivationEvents', JSON.stringify(stateToSave.events));
                localStorage.setItem('diaryDraft', stateToSave.diaryDraft);
                localStorage.setItem('inventory', JSON.stringify(stateToSave.inventory));
                localStorage.setItem('shopItems', JSON.stringify(stateToSave.shopItems));
            } catch (error) {
                console.error("Auto-save failed:", error);
            }
        }, 15000);

        return () => clearInterval(intervalId);
    }, []);
    
    const addMessage = useCallback((message: string) => {
        setSystemMessages(prev => [...prev.slice(-20), message]);
    }, []);

    const refreshShop = useCallback(async () => {
        setIsShopLoading(true);
        addMessage("Thương Thành đang làm mới vật phẩm...");
        const newItemsData = await generateShopItems(character);
        if (newItemsData) {
            const newShopItems: ShopItem[] = newItemsData.map(itemData => ({
                ...itemData,
                id: `shop-${Date.now()}-${Math.random()}`,
            }));
            setShopItems(newShopItems);
            localStorage.setItem('lastShopRefresh', new Date().toDateString());
            addMessage(`Thương Thành đã được làm mới với ${newShopItems.length} vật phẩm.`);
        } else {
            addMessage("Lỗi kết nối với Thương Thành. Không thể làm mới vật phẩm.");
        }
        setIsShopLoading(false);
    }, [character, addMessage]);
    
    useEffect(() => {
        const lastRefresh = localStorage.getItem('lastShopRefresh');
        const today = new Date().toDateString();
        if (lastRefresh !== today) {
            refreshShop();
        }
    }, [refreshShop]);

    useEffect(() => {
        const lastEncounterDate = localStorage.getItem('lastEncounterDate');
        const today = new Date().toDateString();
        
        if (lastEncounterDate !== today) {
            if (Math.random() < 0.3) {
                setIsEncounterAvailable(true);
                addMessage("Cảm giác có thiên cơ biến động... Một kỳ ngộ có thể đang chờ đợi.");
            }
            localStorage.setItem('lastEncounterDate', today);
        }
    }, [addMessage]);


    const handleLevelUp = useCallback((char: Character): Character => {
        let newChar = { ...char };
        while (newChar.xp >= newChar.xpToNextLevel) {
            newChar.xp -= newChar.xpToNextLevel;
            newChar.level += 1;
            newChar.xpToNextLevel = calculateXpToNextLevel(newChar.level);
            const newRealm = getRealmForLevel(newChar.level);
            if (newRealm.name !== newChar.realm) {
                newChar.realm = newRealm.name;
                addMessage(`**ĐỘT PHÁ!** Đã tiến nhập cảnh giới ${newRealm.name}!`);
            } else {
                 addMessage(`TINH! Thăng cấp! Cấp độ hiện tại: ${newChar.level}.`);
            }
        }
        return newChar;
    }, [addMessage]);

    const handleCompleteTask = useCallback((taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;

        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, completed: true } : t));

        addMessage(`Hoàn thành "${task.title}". +${task.xp} EXP, +${task.statReward} ${task.stat}, +${task.gold} Vàng.`);

        if (task.itemReward) {
            const newItem: EquipmentItem = {
                ...task.itemReward,
                id: `item-${Date.now()}-${Math.random()}`,
            };
            setInventory(prev => [...prev, newItem]);
            addMessage(`[VẬT PHẨM]: Bạn đã nhận được Pháp Bảo "${newItem.name}"!`);
        }

        setCharacter(prevChar => {
            const newStats = { ...prevChar.stats, [task.stat]: prevChar.stats[task.stat] + task.statReward };
            const newXp = prevChar.xp + task.xp;
            const newGold = prevChar.gold + task.gold;
            
            let updatedChar = { ...prevChar, stats: newStats, xp: newXp, gold: newGold };
            return handleLevelUp(updatedChar);
        });
    }, [tasks, addMessage, handleLevelUp]);

    const handleCompleteTechnique = useCallback((techniqueId: string) => {
        const technique = techniques.find(t => t.id === techniqueId);
        if (!technique || technique.completed) return;

        setTechniques(prev => prev.map(t => t.id === techniqueId ? { ...t, completed: true } : t));

        addMessage(`**Đại Đạo Quy Nhất!** Công Pháp "${technique.title}" đã viên mãn. Phần thưởng khổng lồ đang được chuyển tới.`);
        addMessage(`+${technique.xp} EXP, +${technique.statReward} ${technique.stat}, +${technique.gold} Vàng.`);

        setCharacter(prevChar => {
            const newStats = { ...prevChar.stats, [technique.stat]: prevChar.stats[technique.stat] + technique.statReward };
            const newXp = prevChar.xp + technique.xp;
            const newGold = prevChar.gold + technique.gold;
            
            let updatedChar = { ...prevChar, stats: newStats, xp: newXp, gold: newGold };
            return handleLevelUp(updatedChar);
        });
    }, [techniques, addMessage, handleLevelUp]);

    const requestNewTasks = useCallback(async () => {
        setIsTasksLoading(true);
        addMessage("Đang nhận tín hiệu từ hệ thống... phân tích nhiệm vụ phù hợp...");
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];
        const diary = JSON.parse(localStorage.getItem('cultivationDiary') || '{}');
        const diaryEntry = diary[yesterdayKey];
        if (diaryEntry) {
            addMessage("Phân tích nhật ký tu luyện của ngày hôm qua...");
        }

        const existingTaskTitles = tasks.filter(t => !t.completed).map(t => t.title);
        const newGeneratedTasks = await generateTasks(character, existingTaskTitles, diaryEntry);

        const newTasks: Task[] = newGeneratedTasks.map(t => ({
            ...t,
            id: `task-${Date.now()}-${Math.random()}`,
            completed: false,
        }));
        
        setTasks(prev => [...prev.filter(t => !t.completed), ...newTasks]);
        addMessage(`Hệ thống đã gửi ${newTasks.length} nhiệm vụ mới.`);
        setIsTasksLoading(false);
    }, [character, tasks, addMessage]);

    const requestEncounter = useCallback(async () => {
        if (!isEncounterAvailable) return;

        setIsEncounterLoading(true);
        addMessage("Dò xét thiên cơ, tìm kiếm kỳ ngộ...");
        const encounter = await generateEncounter(character);

        if (encounter && encounter.task) {
            const newTask: Task = {
                ...encounter.task,
                id: `task-encounter-${Date.now()}`,
                completed: false,
            };
            addMessage(`[KỲ NGỘ]: ${encounter.story}`);
            setTasks(prev => [...prev, newTask]);
            addMessage(`Nhiệm vụ kỳ ngộ đã được thêm: "${newTask.title}"`);
        } else {
            addMessage("Thiên cơ hỗn loạn, không thể tìm thấy kỳ ngộ. Hãy thử lại vào ngày khác.");
        }
        
        setIsEncounterAvailable(false);
        setIsEncounterLoading(false);
    }, [character, addMessage, isEncounterAvailable]);

    const requestNewTechniques = useCallback(async () => {
        setIsTechniquesLoading(true);
        addMessage("Hệ thống đang suy diễn công pháp thượng thừa...");
        
        const existingTechniqueTitles = techniques.filter(t => !t.completed).map(t => t.title);
        const newGeneratedTechniques = await generateTechniques(character, existingTechniqueTitles);

        const newTechniques: Task[] = newGeneratedTechniques.map(t => ({
            ...t,
            id: `tech-${Date.now()}-${Math.random()}`,
            completed: false,
            isLongTerm: true,
        }));
        
        setTechniques(prev => [...prev.filter(t => !t.completed), ...newTechniques]);
        addMessage(`Hệ thống đã truyền thụ ${newTechniques.length} công pháp mới.`);
        setIsTechniquesLoading(false);
    }, [character, techniques, addMessage]);

    const checkAndGenerateEventTasks = useCallback(async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);

        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return !event.tasksGenerated && eventDate >= today && eventDate <= threeDaysFromNow;
        });

        if (upcomingEvents.length > 0) {
            addMessage("Phát hiện thiên cơ biến động, sự kiện quan trọng sắp diễn ra...");
            for (const event of upcomingEvents) {
                const eventTasks = await generateEventTasks(character, event);
                if (eventTasks.length > 0) {
                    const newTasks: Task[] = eventTasks.map(t => ({
                        ...t,
                        id: `task-event-${event.id}-${Math.random()}`,
                        completed: false,
                        isEventTask: true,
                        eventName: event.name
                    }));
                    setTasks(prev => [...prev, ...newTasks]);
                    addMessage(`Hệ thống đã ban bố nhiệm vụ chuẩn bị cho sự kiện "${event.name}".`);
                }
                setEvents(prevEvents => prevEvents.map(e => e.id === event.id ? { ...e, tasksGenerated: true } : e));
            }
        }
    }, [character, events, addMessage]);

    useEffect(() => {
        checkAndGenerateEventTasks();
    }, [checkAndGenerateEventTasks]);
    
    useEffect(() => {
        if (tasks.filter(t => !t.completed).length === 0 && !isTasksLoading) {
            requestNewTasks();
        }
    }, [tasks, isTasksLoading, requestNewTasks]);

    const handleSaveDiary = () => {
        if (!diaryDraft.trim()) return;
        const todayKey = new Date().toISOString().split('T')[0];
        const diary = JSON.parse(localStorage.getItem('cultivationDiary') || '{}');
        diary[todayKey] = diaryDraft;
        localStorage.setItem('cultivationDiary', JSON.stringify(diary));
        addMessage("Nhật ký tu luyện đã được lưu trữ.");
        setDiaryDraft('');
        localStorage.removeItem('diaryDraft');
    };

    const handleAddEvent = (name: string, date: string) => {
        const newEvent: UserEvent = {
            id: `event-${Date.now()}`,
            name,
            date,
            tasksGenerated: false,
        };
        setEvents(prev => [...prev, newEvent]);
        addMessage(`Đã ghi lại thiên cơ: "${name}".`);
    };
    
    const handleDeleteEvent = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        setTasks(prev => prev.filter(t => !(t.isEventTask && t.id.includes(eventId))));
        addMessage("Một thiên cơ đã được xóa bỏ.");
    }

    const handleNameChange = (newName: string) => {
        if (newName.trim()) {
            setCharacter(prev => ({ ...prev, name: newName.trim() }));
            addMessage(`Tên của Kẻ Tu Luyện đã được đổi thành "${newName.trim()}".`);
        }
    };

    const handleGenerateAvatar = async (prompt: string) => {
        addMessage("Hệ thống đang hội tụ linh khí, kiến tạo pháp tướng mới...");
        const newAvatarBase64 = await generateAvatar(character, prompt);
        if (newAvatarBase64) {
            const avatarUrl = `data:image/png;base64,${newAvatarBase64}`;
            setCharacter(prev => ({ ...prev, avatar: avatarUrl }));
            addMessage("Pháp tướng mới đã được hình thành!");
        } else {
            addMessage("Lỗi kiến tạo: Không thể hình thành pháp tướng. Linh khí hỗn loạn.");
        }
    };

    const handleEquipItem = (itemId: string) => {
        const itemToEquip = inventory.find(i => i.id === itemId);
        if (!itemToEquip) return;

        const slotToEquip = itemToEquip.type;
        const currentlyEquippedItemId = character.equipment[slotToEquip];
        
        // New inventory without the item we're equipping
        const newInventory = inventory.filter(i => i.id !== itemId);
        
        // If an item was equipped in that slot, add it back to inventory
        if (currentlyEquippedItemId) {
            const itemToUnequip = inventory.find(i => i.id === currentlyEquippedItemId) 
                                 || appState.current.inventory.find(i => i.id === currentlyEquippedItemId); // Check current state too
            if(itemToUnequip) newInventory.push(itemToUnequip);
        }

        setInventory(newInventory);
        setCharacter(prev => ({
            ...prev,
            equipment: {
                ...prev.equipment,
                [slotToEquip]: itemId
            }
        }));
        addMessage(`Đã trang bị [${itemToEquip.name}].`);
    };

    const handleUnequipItem = (slot: EquipmentSlot) => {
        const currentlyEquippedItemId = character.equipment[slot];
        if (!currentlyEquippedItemId) return;
        
        // Find the item object. It might not be in the current `inventory` state slice.
        const itemToUnequip = appState.current.inventory.find(i => i.id === currentlyEquippedItemId);
        
        if (itemToUnequip) {
            setInventory(prev => [...prev, itemToUnequip]);
            setCharacter(prev => ({
                ...prev,
                equipment: {
                    ...prev.equipment,
                    [slot]: null
                }
            }));
            addMessage(`Đã gỡ bỏ [${itemToUnequip.name}].`);
        }
    };
    
    const handlePurchaseItem = useCallback((itemId: string) => {
        const shopItem = shopItems.find(i => i.id === itemId);
        if (!shopItem) return;

        if (character.gold < shopItem.price) {
            addMessage("Linh thạch không đủ, không thể mua vật phẩm này.");
            return;
        }
        
        setCharacter(prev => ({ ...prev, gold: prev.gold - shopItem.price }));
        
        const newInventoryItem: EquipmentItem = {
            ...shopItem.item,
            id: `item-${Date.now()}-${Math.random()}`
        };
        
        setInventory(prev => [...prev, newInventoryItem]);
        setShopItems(prev => prev.filter(i => i.id !== itemId));
        
        addMessage(`Mua thành công [${shopItem.item.name}] với giá ${shopItem.price} vàng.`);
    }, [shopItems, character.gold, addMessage]);


    const handleBackup = (): string => {
        const backupData: BackupData = {
            version: APP_VERSION,
            character,
            tasks,
            techniques,
            events,
            cultivationDiary: JSON.parse(localStorage.getItem('cultivationDiary') || '{}'),
            lastEncounterDate: localStorage.getItem('lastEncounterDate'),
            inventory,
        };
        return JSON.stringify(backupData);
    };

    const handleRestore = (backupString: string): boolean => {
        try {
            const data: BackupData = JSON.parse(backupString);
            
            if (data.version && data.character && Array.isArray(data.tasks)) {
                setCharacter(data.character);
                setTasks(data.tasks);
                setTechniques(data.techniques || []);
                setEvents(data.events || []);
                setInventory(data.inventory || []);
                setDiaryDraft('');
                // Clear shop data on restore to force a refresh
                setShopItems([]);
                localStorage.removeItem('shopItems');
                localStorage.removeItem('lastShopRefresh');

                localStorage.setItem('cultivationDiary', JSON.stringify(data.cultivationDiary || {}));
                if(data.lastEncounterDate) {
                    localStorage.setItem('lastEncounterDate', data.lastEncounterDate);
                } else {
                    localStorage.removeItem('lastEncounterDate');
                }
                localStorage.removeItem('diaryDraft');
                
                addMessage("Khôi phục linh hồn thành công! Dữ liệu đã được tải.");
                setActiveScreen('character');
                return true;
            } else {
                throw new Error("Dữ liệu sao lưu không hợp lệ.");
            }
        } catch (error) {
            console.error("Restore failed:", error);
            addMessage("Lỗi: Không thể khôi phục linh hồn. Dữ liệu sao lưu bị hỏng hoặc không đúng định dạng.");
            return false;
        }
    };

    const hasUpcomingEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);

        return events.some(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0,0,0,0);
            return eventDate >= today && eventDate <= sevenDaysFromNow;
        });
    }, [events]);


    const renderScreen = () => {
        switch(activeScreen) {
            case 'tasks':
                return <TasksScreen 
                            tasks={tasks} 
                            systemMessages={systemMessages} 
                            isTasksLoading={isTasksLoading} 
                            onCompleteTask={handleCompleteTask} 
                            onNewTasks={requestNewTasks} 
                            isEncounterAvailable={isEncounterAvailable}
                            isEncounterLoading={isEncounterLoading}
                            onNewEncounter={requestEncounter}
                        />;
            case 'character':
                return <CharacterScreen 
                            character={character} 
                            inventory={inventory}
                            onNameChange={handleNameChange} 
                            onGenerateAvatar={handleGenerateAvatar}
                            onEquipItem={handleEquipItem}
                            onUnequipItem={handleUnequipItem}
                        />;
            case 'destiny':
                return <DestinyScreen 
                            events={events}
                            diaryDraft={diaryDraft}
                            onDiaryDraftChange={setDiaryDraft}
                            onSaveDiary={handleSaveDiary}
                            onAddEvent={handleAddEvent}
                            onDeleteEvent={handleDeleteEvent}
                        />;
            case 'skills':
                return <SkillsScreen 
                            techniques={techniques}
                            onCompleteTechnique={handleCompleteTechnique}
                            onRequestNewTechniques={requestNewTechniques}
                            isLoading={isTechniquesLoading}
                        />;
            case 'shop':
                return <ShopScreen 
                            character={character}
                            shopItems={shopItems}
                            onPurchaseItem={handlePurchaseItem}
                            isLoading={isShopLoading}
                        />;
             case 'system':
                return <SystemScreen onBackup={handleBackup} onRestore={handleRestore} />;
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-[var(--color-text-base)] flex flex-col">
            <Header 
                character={character} 
                onNavigate={() => setActiveScreen('character')}
                isActive={activeScreen === 'character'}
            />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 pb-24">
                {renderScreen()}
            </main>
            <Navigation activeScreen={activeScreen} setActiveScreen={setActiveScreen} hasUpcomingEvents={hasUpcomingEvents} />
        </div>
    );
};

export default App;