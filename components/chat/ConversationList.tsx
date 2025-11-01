import { conversationAPI } from '@/utils/apiClientMixed';
import Avatar from '@/components/ui/Avatar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Conversation {
  chat_id: string;
  chat_type: number; // 1-用户 2-群聊 3-机器人
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
  at_data?: {
    mentioned_id: string;
    mentioned_name: string;
    mentioned_in: string;
    mentioner_id: string;
    mentioner_name: string;
    msg_seq: number;
  };
}

interface ConversationListProps {
  onConversationPress: (conversation: Conversation) => void;
}

export default function ConversationList({ onConversationPress }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const response = await conversationAPI.getConversationList();
      console.log('会话列表响应:', response);
      
      // 根据实际API响应结构调整
      if (response.code === 1 || (response.status && response.status.code === 1)) {
        const conversationData = response.data || response.conversations || [];
        
        if (Array.isArray(conversationData)) {
          // 按时间戳排序，最新的在前面
          const sortedConversations = conversationData.sort((a: Conversation, b: Conversation) => 
            (b.timestamp_ms || 0) - (a.timestamp_ms || 0)
          );
          setConversations(sortedConversations);
        } else {
          console.log('会话数据不是数组格式:', conversationData);
          setConversations([]);
        }
      } else {
        const errorMsg = response.msg || response.status?.msg || '获取会话列表失败';
        Alert.alert('错误', errorMsg);
      }
    } catch (error) {
      console.error('获取会话列表错误:', error);
      Alert.alert('错误', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const formatTime = (timestamp: number) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diffInHours < 24 * 7) {
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      return `周${days[messageTime.getDay()]}`;
    } else {
      return messageTime.toLocaleDateString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit' 
      });
    }
  };


  const getChatTypeIcon = (chatType: number) => {
    switch (chatType) {
      case 1: return '👤';
      case 2: return '👥';
      case 3: return '🤖';
      default: return '❓';
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    // 调试头像URL
    if (item.avatar_url) {
      console.log('会话头像URL:', item.name, item.avatar_url);
    }
    
    return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => onConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          uri={item.avatar_url}
          size={50}
          fallbackIcon={getChatTypeIcon(item.chat_type)}
        />
        {item.unread_message > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unread_message > 99 ? '99+' : item.unread_message}
            </Text>
          </View>
        )}
        {item.do_not_disturb === 1 && (
          <View style={styles.muteIcon}>
            <Text style={styles.muteText}>🔕</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.certification_level === 1 && (
              <Text style={styles.officialBadge}>官方</Text>
            )}
            {item.certification_level === 2 && (
              <Text style={styles.regionBadge}>地区</Text>
            )}
          </View>
          <Text style={styles.time}>
            {formatTime(item.timestamp_ms)}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.at === 1 && item.at_data ? (
              <Text style={styles.atMessage}>
                [@{item.at_data.mentioner_name}] {item.chat_content}
              </Text>
            ) : (
              item.chat_content || '暂无消息'
            )}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载会话列表...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.chat_id}
        renderItem={renderConversationItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无会话</Text>
            <Text style={styles.emptySubtext}>开始一段新的对话吧</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  muteIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteText: {
    fontSize: 10,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  officialBadge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: '500',
  },
  regionBadge: {
    backgroundColor: '#34c759',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  atMessage: {
    color: '#ff9500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginLeft: 78,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
