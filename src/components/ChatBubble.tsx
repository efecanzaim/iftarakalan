import React from 'react';
import { View, Text } from 'react-native';
import { ChatMessage } from '../services/geminiApi';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View
      className={`max-w-[85%] mb-3 ${isUser ? 'self-end' : 'self-start'}`}
    >
      <View
        className={`px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-primary-500 rounded-tr-sm'
            : 'bg-white dark:bg-gray-800 rounded-tl-sm'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          className={`text-base leading-6 ${
            isUser ? 'text-white' : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {message.content}
        </Text>
      </View>
      <Text
        className={`text-xs text-gray-400 mt-1 ${
          isUser ? 'text-right mr-1' : 'text-left ml-1'
        }`}
      >
        {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}
