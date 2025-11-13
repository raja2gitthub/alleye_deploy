import { GoogleGenerativeAI } from "@google/generative-ai";
import { Content, UserProgress } from "../types";

export const fetchRecommendations = async (
    userProgress: UserProgress, 
    allContent: Content[]
): Promise<{ content: Content; reason: string }[]> => {
    
    // Use the GoogleGenerativeAI client. The constructor takes the API key string.
    // Note: keep this server-side in production to avoid exposing secrets in the browser.
    const ai = new GoogleGenerativeAI(process.env.API_KEY as string);

    const history = Object.entries(userProgress)
        .filter(([_, p]) => p.status === 'completed')
        .map(([id, _]) => allContent.find(c => c.id === parseInt(id))?.title)
        .filter(Boolean);

    const availableContent = allContent
        .filter(c => userProgress[c.id]?.status !== 'completed')
        .map(c => ({ id: c.id, title: c.title, category: c.category, difficulty: c.difficulty }));

    if (availableContent.length === 0) {
        return [];
    }

    const prompt = `Based on the user's completed content history and the available content, recommend up to 4 items. For each recommendation, provide a brief, engaging, one-sentence reason why the user would like it. User history: [${history.join(', ')}]. Available content: ${JSON.stringify(availableContent)}.`;

    // Generate content. Keep the response as JSON text and parse it.
    // Some SDKs expose the `models` namespace; cast to `any` to avoid strict typing issues
    // when the installed package typings differ. Consider updating to proper typings later.
    const anyAi = ai as any;

    const response = await anyAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    const result = JSON.parse(response.text);
    const recs = result.map((rec: { id: number, reason: string }) => {
        const contentItem = allContent.find(c => c.id === rec.id);
        return contentItem ? { content: contentItem, reason: rec.reason } : null;
    }).filter(Boolean);

    return recs;
};
