import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useChatStore } from '../../src/stores/chatStore';
import { ChatBubble } from '../../src/components/ChatBubble';
import { isAIConfigured } from '../../src/services/aiService';

const QUICK_PROMPTS = [
  { label: '🍲 İftar Menüsü', prompt: 'Bugün için pratik bir iftar menüsü önerir misin?' },
  { label: '🥗 Sahur Önerisi', prompt: 'Sahurda ne yemeli? Tok tutan yiyecekler öner.' },
  { label: '🍰 Ramazan Tatlısı', prompt: 'Kolay yapılan bir Ramazan tatlısı tarifi ver.' },
  { label: '🥤 İçecek Tarifi', prompt: 'İftar için ferahlatıcı bir içecek tarifi öner.' },
];

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { messages, isLoading, error, sendMessage, clearChat, clearError } = useChatStore();

  const isConfigured = isAIConfigured();

  useEffect(() => {
    // Yeni mesaj geldiğinde aşağı scroll
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const message = inputText.trim();
    setInputText('');
    await sendMessage(message);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage(prompt);
  };

  if (!isConfigured) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
        <Text className="text-5xl mb-4">🤖</Text>
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">
          AI Asistanı Şu An Kullanılamıyor
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Ramazan asistanı şu an bakımda. Lütfen daha sonra tekrar deneyin.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-100 dark:bg-gray-900"
      keyboardVerticalOffset={90}
    >
      {/* Mesaj Listesi */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-5xl mb-4">🌙</Text>
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">
              Ramazan Asistanı
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mb-6 px-4">
              Size yemek tarifleri, iftar menüleri ve Ramazan ile ilgili sorularınızda yardımcı olabilirim.
            </Text>

            {/* Hızlı Başlangıç Butonları */}
            <View className="flex-row flex-wrap justify-center gap-2 px-4">
              {QUICK_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuickPrompt(prompt.prompt)}
                  className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700"
                >
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    {prompt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListHeaderComponent={
          messages.length > 0 ? (
            <TouchableOpacity
              onPress={clearChat}
              className="self-center mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full"
            >
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                🗑️ Sohbeti Temizle
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Hata Mesajı */}
      {error && (
        <View className="mx-4 mb-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex-row items-center">
          <Text className="flex-1 text-red-700 dark:text-red-300 text-sm">{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text className="text-red-700 dark:text-red-300 ml-2">✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Yükleniyor */}
      {isLoading && (
        <View className="mx-4 mb-2 p-3 bg-gray-200 dark:bg-gray-700 rounded-xl flex-row items-center">
          <ActivityIndicator size="small" color="#1a5f4a" />
          <Text className="ml-2 text-gray-600 dark:text-gray-400">Yanıt yazılıyor...</Text>
        </View>
      )}

      {/* Giriş Alanı */}
      <View className="flex-row items-end p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={1000}
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 text-gray-800 dark:text-gray-100 max-h-32"
          style={{ fontSize: 16 }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          className={`ml-2 w-12 h-12 rounded-full items-center justify-center ${
            inputText.trim() && !isLoading
              ? 'bg-primary-500'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <Text className="text-white text-xl">➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
