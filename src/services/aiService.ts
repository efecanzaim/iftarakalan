import Groq from 'groq-sdk';
import Constants from 'expo-constants';

// app.config.js'den API key'i al
const API_KEY = Constants.expoConfig?.extra?.groqApiKey || '';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `Sen bir Ramazan asistanısın. Kullanıcılara Ramazan ayı boyunca yardımcı oluyorsun.

Özellikle şu konularda yardımcı olabilirsin:
- İftar ve sahur için yemek tarifleri
- Ramazan'a özel pratik tarifler
- Sağlıklı beslenme önerileri
- Ramazan ile ilgili sorular
- Dini sorulara genel bilgi (fetva değil, genel bilgi)

Kurallar:
- Her zaman Türkçe cevap ver
- Yemek tarifi verirken malzemeleri ve adımları net yaz
- Kısa ve öz cevaplar ver
- Samimi ve yardımsever ol
- Dini konularda dikkatli ol, "dini yetkili değilim" de ve genel bilgi ver`;

// Groq client
let groq: Groq | null = null;

function getGroq(): Groq | null {
  if (!API_KEY) {
    console.warn('Groq API key not configured');
    return null;
  }
  if (!groq) {
    groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
  }
  return groq;
}

/**
 * AI'nin yapılandırılıp yapılandırılmadığını kontrol et
 */
export function isAIConfigured(): boolean {
  return !!API_KEY;
}

/**
 * AI ile sohbet et
 */
export async function chat(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const client = getGroq();

  if (!client) {
    return 'AI servisi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
  }

  try {
    // Sohbet geçmişini Groq formatına çevir
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || 'Yanıt alınamadı.';
  } catch (error) {
    console.error('Groq API error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'AI servisi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
      }
      if (error.message.includes('rate') || error.message.includes('limit')) {
        return 'Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.';
      }
    }

    return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
}

/**
 * Yemek tarifi önerisi al
 */
export async function getRecipeSuggestion(
  mealType: 'iftar' | 'sahur',
  preferences?: string
): Promise<string> {
  const prompt = `${mealType === 'iftar' ? 'İftar' : 'Sahur'} için bir yemek tarifi öner.${
    preferences ? ` Tercihler: ${preferences}` : ''
  } Malzemeleri ve yapılışı adım adım yaz.`;

  return chat(prompt);
}

/**
 * Rastgele iftar menüsü öner
 */
export async function suggestIftarMenu(): Promise<string> {
  const prompt = `Bugün için tam bir iftar menüsü öner. Çorba, ana yemek, yan yemek ve tatlı dahil. Her biri için kısa tarif ver.`;
  return chat(prompt);
}
