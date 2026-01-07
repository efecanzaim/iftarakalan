import { GoogleGenerativeAI } from '@google/generative-ai';

// NOT: Kullanıcı kendi API key'ini sağlamalı
// Google AI Studio'dan ücretsiz key alınabilir: https://aistudio.google.com/apikey
let genAI: GoogleGenerativeAI | null = null;

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

/**
 * Gemini API'yi başlat
 */
export function initializeGemini(apiKey: string): void {
  if (!apiKey) {
    console.warn('Gemini API key not provided');
    return;
  }
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Gemini'nin başlatılıp başlatılmadığını kontrol et
 */
export function isGeminiInitialized(): boolean {
  return genAI !== null;
}

/**
 * Gemini ile sohbet et
 */
export async function chat(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  if (!genAI) {
    return 'AI servisi henüz yapılandırılmamış. Lütfen Ayarlar sayfasından API anahtarınızı girin.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Sohbet geçmişini Gemini formatına çevir
    const history = conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Sistem talimatı: ' + SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Anladım, Ramazan asistanı olarak size yardımcı olmaya hazırım!' }],
        },
        ...history,
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'Geçersiz API anahtarı. Lütfen Ayarlar sayfasından doğru API anahtarını girin.';
      }
      if (error.message.includes('quota')) {
        return 'Günlük API kotası aşıldı. Lütfen yarın tekrar deneyin.';
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
