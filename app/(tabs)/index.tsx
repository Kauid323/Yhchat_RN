import ConversationList from '@/components/chat/ConversationList';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

interface Conversation {
  chat_id: string;
  chat_type: number;
  name: string;
  chat_content: string;
  timestamp_ms: number;
  unread_message: number;
  at: number;
  avatar_id: number;
  avatar_url: string;
  do_not_disturb: number;
  timestamp: number;
  certification_level?: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleConversationPress = (conversation: Conversation) => {
    // 直接导航到聊天详情页面
    router.push({
      pathname: '/chat/[chatId]',
      params: {
        chatId: conversation.chat_id,
        chatType: conversation.chat_type.toString(),
        name: conversation.name,
      },
    });
  };

  if (isLoading || !isAuthenticated) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <ConversationList onConversationPress={handleConversationPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});