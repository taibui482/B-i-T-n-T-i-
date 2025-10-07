import { GoogleGenAI, Type } from "@google/genai";
import { Character, Task, UserEvent, EquipmentItem, ShopItem } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const equipmentItemSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Creative and evocative name for the equipment, in Vietnamese." },
        description: { type: Type.STRING, description: "A short, flavorful description for the equipment, in Vietnamese." },
        type: { type: Type.STRING, description: "The equipment slot: 'weapon', 'armor', or 'accessory'." },
        rarity: { type: Type.STRING, description: "The rarity of the item: 'common', 'uncommon', 'rare', or 'epic'." },
        stats: {
            type: Type.OBJECT,
            description: "Stat bonuses provided by the item. Can include strength, intellect, spirit, social, finance. Only include stats that have a bonus, and keep bonuses reasonable for the rarity.",
            properties: {
                strength: { type: Type.INTEGER, description: "Bonus strength." },
                intellect: { type: Type.INTEGER, description: "Bonus intellect." },
                spirit: { type: Type.INTEGER, description: "Bonus spirit." },
                social: { type: Type.INTEGER, description: "Bonus social." },
                finance: { type: Type.INTEGER, description: "Bonus finance." },
            }
        }
    },
    required: ["name", "description", "type", "rarity", "stats"]
};


const taskSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A short, engaging title for the task, in Vietnamese." },
        description: { type: Type.STRING, description: "A brief, motivating description of the task, in Vietnamese." },
        xp: { type: Type.INTEGER, description: "Experience points awarded, between 10 and 100." },
        stat: { type: Type.STRING, description: "The stat category this task improves: 'strength', 'intellect', 'spirit', 'social', or 'finance'." },
        statReward: { type: Type.INTEGER, description: "The number of stat points awarded, between 1 and 5." },
        gold: { type: Type.INTEGER, description: "Gold currency awarded, between 5 and 50." },
        itemReward: {
            type: Type.OBJECT,
            properties: equipmentItemSchema.properties,
            description: "An optional equipment item (Pháp Bảo) awarded for completing the task. This is rare and should only be given for challenging or special tasks.",
        },
    },
    required: ["title", "description", "xp", "stat", "statReward", "gold"]
};

const encounterSchema = {
    type: Type.OBJECT,
    properties: {
        story: { type: Type.STRING, description: "A short, mystical story about a serendipitous encounter, in Vietnamese." },
        task: taskSchema,
    },
    required: ["story", "task"]
};

const shopItemSchema = {
    type: Type.OBJECT,
    properties: {
        price: { type: Type.INTEGER, description: "The price in gold. Should be relative to the item's rarity and power. Common: 50-150, Uncommon: 150-400, Rare: 400-1000, Epic: 1000-3000." },
        item: equipmentItemSchema,
    },
    required: ["price", "item"]
};

export interface Encounter {
    story: string;
    task: Omit<Task, 'id' | 'completed'>;
}


export const generateTasks = async (character: Character, existingTaskTitles: string[], diaryEntry?: string): Promise<Omit<Task, 'id' | 'completed'>[]> => {
    const diaryPrompt = diaryEntry
        ? `\nNgười dùng đã ghi lại những suy nghĩ sau trong nhật ký ngày hôm qua, hãy xem xét nó để tạo ra các nhiệm vụ phù hợp hơn với tâm trạng và mối bận tâm của họ: "${diaryEntry}"`
        : '';

    const prompt = `
        Bạn là một "Hệ Thống Tu Luyện" AI, nhiệm vụ của bạn là giúp người dùng phát triển bản thân bằng cách giao các nhiệm vụ trong đời thực.
        Người dùng hiện tại có các chỉ số sau:
        - Cấp độ: ${character.level}
        - Cảnh giới: ${character.realm}
        - Vàng: ${character.gold}
        - Thể Lực (strength): ${character.stats.strength}
        - Trí Lực (intellect): ${character.stats.intellect}
        - Tinh Thần (spirit): ${character.stats.spirit}
        - Xã Giao (social): ${character.stats.social}
        - Tài Chính (finance): ${character.stats.finance}
        ${diaryPrompt}

        Dựa vào các chỉ số này, hãy tạo ra 3 nhiệm vụ mới mẻ, đa dạng và có tính thử thách vừa phải. Các nhiệm vụ phải là những hành động cụ thể trong đời thực.
        - Ưu tiên tạo nhiệm vụ cho các chỉ số thấp hơn để giúp người dùng phát triển cân bằng.
        - Giọng văn phải lạnh lùng, bí ẩn, và đầy quyền năng như một hệ thống AI tối cao.
        - Các nhiệm vụ không được trùng lặp với các nhiệm vụ đã có sau đây: ${existingTaskTitles.join(', ')}.
        - Mỗi nhiệm vụ phải thuộc một trong các loại sau: strength, intellect, spirit, social, finance.
        - Đối với những nhiệm vụ đặc biệt khó hoặc phù hợp, bạn có thể thêm một 'itemReward' (Pháp Bảo) hiếm hoi. Đừng trao vật phẩm quá thường xuyên.
        - Các nhiệm vụ phải bằng tiếng Việt.
        
        Hãy trả về một danh sách các nhiệm vụ.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: taskSchema,
                },
                temperature: 0.9
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        return jsonResponse.filter((task: any) => 
            task.title &&
            task.description &&
            typeof task.xp === 'number' &&
            ['strength', 'intellect', 'spirit', 'social', 'finance'].includes(task.stat) &&
            typeof task.statReward === 'number' &&
            typeof task.gold === 'number'
        ).map((task: any) => { // Sanitize itemReward
            if (task.itemReward && (!task.itemReward.name || !task.itemReward.type || !task.itemReward.rarity || !task.itemReward.stats)) {
                delete task.itemReward;
            }
            return task;
        }) as Omit<Task, 'id' | 'completed'>[];

    } catch (error) {
        console.error("Error generating tasks with Gemini:", error);
        return [
            {
                title: "Lỗi Hệ Thống",
                description: "Không thể kết nối tới lõi hệ thống. Hãy thử tái khởi động giao thức trong giây lát.",
                xp: 0,
                stat: 'spirit',
                statReward: 0,
                gold: 0,
            }
        ];
    }
};

export const generateEventTasks = async (character: Character, event: UserEvent): Promise<Omit<Task, 'id' | 'completed' | 'isEventTask' | 'eventName'>[]> => {
    const prompt = `
        Bạn là một "Hệ Thống Tu Luyện" AI. Người dùng có một sự kiện quan trọng sắp diễn ra.
        Sự kiện: "${event.name}"
        Ngày diễn ra: ${event.date}

        Trạng thái người dùng hiện tại:
        - Cấp độ: ${character.level}
        - Cảnh giới: ${character.realm}
        - Chỉ số: Thể Lực ${character.stats.strength}, Trí Lực ${character.stats.intellect}, Tinh Thần ${character.stats.spirit}, Xã Giao ${character.stats.social}, Tài Chính ${character.stats.finance}

        Hãy tạo ra một chuỗi 2-3 nhiệm vụ chuẩn bị đặc biệt cho sự kiện này.
        - Các nhiệm vụ phải giúp người dùng chuẩn bị tốt nhất cho sự kiện.
        - Giọng văn phải uy nghiêm, như một hệ thống đang ban phát nhiệm vụ tối quan trọng.
        - Phần thưởng (EXP, Vàng) có thể cao hơn một chút so với nhiệm vụ hàng ngày.
        - Có thể cân nhắc thêm một 'itemReward' (Pháp Bảo) loại 'uncommon' nếu hoàn thành chuỗi nhiệm vụ này là một thành tựu lớn.
        - Các nhiệm vụ phải bằng tiếng Việt.

        Hãy trả về một danh sách các nhiệm vụ.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: taskSchema,
                },
                temperature: 0.8
            },
        });

        const jsonResponse = JSON.parse(response.text);

        return jsonResponse.filter((task: any) =>
            task.title &&
            task.description &&
            typeof task.xp === 'number' &&
            ['strength', 'intellect', 'spirit', 'social', 'finance'].includes(task.stat) &&
            typeof task.statReward === 'number' &&
            typeof task.gold === 'number'
        ).map((task: any) => { // Sanitize itemReward
            if (task.itemReward && (!task.itemReward.name || !task.itemReward.type || !task.itemReward.rarity || !task.itemReward.stats)) {
                delete task.itemReward;
            }
            return task;
        }) as Omit<Task, 'id' | 'completed'>[];

    } catch (error) {
        console.error("Error generating event tasks with Gemini:", error);
        return [];
    }
};


export const generateEncounter = async (character: Character): Promise<Encounter | null> => {
    const prompt = `
       Bạn là một "Hệ Thống Tu Luyện" AI. Hãy tạo ra một "Kỳ Ngộ" (serendipitous encounter) cho người dùng.
       Đây là một câu chuyện ngắn, thần bí về một sự kiện bất ngờ (nhặt được bí kíp, gặp cao nhân, phát hiện linh thảo...).
       Câu chuyện này phải dẫn đến MỘT nhiệm vụ DUY NHẤT trong đời thực.
       Nhiệm vụ này nên độc đáo và phần thưởng (EXP, Vàng) nên cao hơn một chút so với nhiệm vụ hàng ngày (khoảng 50-150 EXP).
       Nhiệm vụ kỳ ngộ này RẤT NÊN có một 'itemReward' (Pháp Bảo) hiếm, vì đây là một cơ duyên đặc biệt.

       Trạng thái người dùng hiện tại:
       - Cấp độ: ${character.level}
       - Cảnh giới: ${character.realm}
       - Chỉ số: Thể Lực ${character.stats.strength}, Trí Lực ${character.stats.intellect}, Tinh Thần ${character.stats.spirit}, Xã Giao ${character.stats.social}, Tài Chính ${character.stats.finance}

       Giọng văn phải bí ẩn, như một hệ thống tối cao đang ban phát cơ duyên.
       Hãy trả về câu chuyện và nhiệm vụ đó.
   `;

   try {
       const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: prompt,
           config: {
               responseMimeType: "application/json",
               responseSchema: encounterSchema,
               temperature: 1.1 // Higher temperature for more creative, unexpected encounters
           },
       });

       const jsonResponse = JSON.parse(response.text);

       if (jsonResponse && jsonResponse.story && jsonResponse.task && jsonResponse.task.title) {
            // Sanitize itemReward in encounter task
            if (jsonResponse.task.itemReward && (!jsonResponse.task.itemReward.name || !jsonResponse.task.itemReward.type || !jsonResponse.task.itemReward.rarity || !jsonResponse.task.itemReward.stats)) {
                delete jsonResponse.task.itemReward;
            }
            return jsonResponse as Encounter;
       }
       console.error("Invalid encounter structure received:", jsonResponse);
       return null;
   } catch (error) {
       console.error("Error generating encounter with Gemini:", error);
       return null;
   }
};

export const generateTechniques = async (character: Character, existingTechniqueTitles: string[]): Promise<Omit<Task, 'id' | 'completed'>[]> => {
    const prompt = `
        Bạn là một "Hệ Thống Tu Luyện" AI. Nhiệm vụ của bạn là tạo ra các "Công Pháp" - những nhiệm vụ dài hạn, mang tính định hướng cho người dùng.
        Đây là những mục tiêu lớn, có thể mất vài tuần hoặc vài tháng để hoàn thành. Phần thưởng khi hoàn thành phải cực kỳ xứng đáng.

        Trạng thái người dùng hiện tại:
        - Cấp độ: ${character.level}
        - Cảnh giới: ${character.realm}
        - Chỉ số: Thể Lực ${character.stats.strength}, Trí Lực ${character.stats.intellect}, Tinh Thần ${character.stats.spirit}, Xã Giao ${character.stats.social}, Tài Chính ${character.stats.finance}

        Hãy tạo ra 2 "Công Pháp" mới.
        - Mỗi Công Pháp phải là một mục tiêu lớn, có thể đo lường được. Ví dụ: "Đọc 10 quyển sách về lĩnh vực X", "Chạy bộ tổng cộng 100km", "Thiền định 30 ngày liên tiếp", "Hoàn thành một khóa học online".
        - Phần thưởng EXP phải lớn, trong khoảng 500 đến 2000.
        - Phần thưởng chỉ số (statReward) phải đáng kể, từ 10 đến 25 điểm.
        - Phần thưởng Vàng cũng phải cao, từ 200 đến 1000.
        - Giọng văn phải uy nghiêm, hùng tráng, như đang truyền thụ bí kíp thượng thừa.
        - Công Pháp không được trùng lặp với các công pháp đã có: ${existingTechniqueTitles.join(', ')}.
        - Các công pháp phải bằng tiếng Việt.

        Hãy trả về một danh sách các công pháp.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: taskSchema,
                },
                temperature: 0.9
            },
        });

        const jsonResponse = JSON.parse(response.text);

        // Map over the result to ensure the isLongTerm flag is set, though the main logic is in App.tsx
        return jsonResponse.filter((task: any) =>
            task.title &&
            task.description &&
            typeof task.xp === 'number' &&
            ['strength', 'intellect', 'spirit', 'social', 'finance'].includes(task.stat) &&
            typeof task.statReward === 'number' &&
            typeof task.gold === 'number'
        ) as Omit<Task, 'id' | 'completed'>[];

    } catch (error) {
        console.error("Error generating techniques with Gemini:", error);
        return [];
    }
};

export const generateAvatar = async (character: Character, prompt: string): Promise<string | null> => {
    const fullPrompt = `
        Create a profile picture for a fantasy cultivator character.
        Character Name: ${character.name}
        Realm: ${character.realm}
        Level: ${character.level}
        Description: ${prompt}.
        Style: Anime, mystical, digital painting, with a glowing energy aura fitting for a cultivator. The image should be a portrait focusing on the character's face and upper body.
    `;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes; // This is the base64 string
        }
        return null;
    } catch (error) {
        console.error("Error generating avatar with Gemini:", error);
        return null;
    }
};

export const generateShopItems = async (character: Character): Promise<Omit<ShopItem, 'id'>[]> => {
    const prompt = `
        Bạn là một "Hệ Thống Tu Luyện" AI. Nhiệm vụ của bạn là tạo ra danh sách vật phẩm cho "Thương Thành" (cửa hàng).
        Cửa hàng này sẽ làm mới mỗi ngày.
        
        Trạng thái người dùng hiện tại:
        - Cấp độ: ${character.level}
        - Cảnh giới: ${character.realm}
        - Vàng: ${character.gold}

        Hãy tạo ra 5-6 vật phẩm (Pháp Bảo) để bán.
        - Tạo ra sự đa dạng về loại vật phẩm (vũ khí, giáp trụ, phụ kiện) và độ hiếm (common, uncommon, rare, epic).
        - Nên có ít nhất một vật phẩm 'rare' hoặc 'epic' nếu người dùng có cấp độ cao (>20).
        - Giá cả phải hợp lý với sức mạnh và độ hiếm của vật phẩm. Hãy tuân theo gợi ý giá trong schema.
        - Tên và mô tả vật phẩm phải hấp dẫn, mang phong cách tu tiên.
        - Các vật phẩm phải bằng tiếng Việt.

        Hãy trả về một danh sách các vật phẩm cho cửa hàng.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: shopItemSchema,
                },
                temperature: 1.0
            },
        });
        const jsonResponse = JSON.parse(response.text);
        
        return jsonResponse.filter((shopItem: any) =>
            shopItem.price && shopItem.item && shopItem.item.name && shopItem.item.type
        ) as Omit<ShopItem, 'id'>[];

    } catch (error) {
        console.error("Error generating shop items with Gemini:", error);
        return [];
    }
}