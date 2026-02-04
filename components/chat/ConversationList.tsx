import AvatarCustom from '@/components/ui/Avatar';
import { conversationAPI } from '@/utils/apiClientMixed';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Badge,
    Divider,
    IconButton,
    List,
    Text,
    useTheme
} from 'react-native-paper';

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
  const theme = useTheme();
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
    return (
      <List.Item
        title={item.name}
        titleStyle={[styles.name, { color: theme.colors.onSurface }]}
        description={
          item.at === 1 && item.at_data ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              [@{item.at_data.mentioner_name}] {item.chat_content}
            </Text>
          ) : (
            item.chat_content || '暂无消息'
          )
        }
        descriptionNumberOfLines={1}
        onPress={() => onConversationPress(item)}
        left={props => (
          <View style={styles.avatarWrapper}>
            <AvatarCustom
              uri={item.avatar_url}
              size={50}
              fallbackIcon={getChatTypeIcon(item.chat_type)}
            />
            {item.unread_message > 0 && (
              <Badge
                size={18}
                style={styles.badge}
              >
                {item.unread_message > 99 ? '99+' : item.unread_message}
              </Badge>
            )}
            {item.do_not_disturb === 1 && (
              <IconButton
                icon="bell-off"
                size={12}
                style={styles.muteIcon}
                iconColor={theme.colors.onSurfaceVariant}
              />
            )}
          </View>
        )}
        right={props => (
          <View style={styles.rightContainer}>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              {formatTime(item.timestamp_ms)}
            </Text>
            {item.certification_level === 1 && (
              <Badge style={[styles.officialBadge, { backgroundColor: theme.colors.primary }]}>
                官方
              </Badge>
            )}
          </View>
        )}
        style={{ backgroundColor: theme.colors.surface }}
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>加载会话列表...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.chat_id}
        renderItem={renderConversationItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>暂无会话</Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>开始一段新的对话吧</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 8,
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  muteIcon: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    margin: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  officialBadge: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginBottom: 8,
    opacity: 0.7,
  },
  emptySubtext: {
    opacity: 0.5,
  },
});
