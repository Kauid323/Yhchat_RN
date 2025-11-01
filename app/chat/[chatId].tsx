import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { messageAPI } from '@/utils/apiClientMixed';
import Avatar from '@/components/ui/Avatar';
import ImageWithReferer from '@/components/ui/ImageWithReferer';

interface Message {
  msg_id: string;
  sender: {
    chat_id: string;
    chat_type: number;
    name: string;
    avatar_url: string;
    tag?: Array<{
      id: number;
      text: string;
      color: string;
    }>;
  };
  direction: string; // 'left' | 'right'
  content_type: number;
  content: {
    text?: string;
    image_url?: string;
    file_name?: string;
    file_url?: string;
    quote_msg_text?: string;
    sticker_url?: string;
    video_url?: string;
    audio_url?: string;
    audio_time?: number;
    width?: number;
    height?: number;
    tip?: string;
  };
  send_time: number;
  msg_seq: number;
  edit_time?: number;
  msg_delete_time?: number;
  quote_msg_id?: string;
}

export default function ChatDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { chatId, chatType, name } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      console.log('加载消息:', { chatId, chatType });

      const response = await messageAPI.listMessages(
        chatId as string,
        parseInt(chatType as string),
        30
      );

      console.log('消息列表响应:', response);

      if (response.status?.code === 1) {
        // 检查不同的响应结构
        let messageData = [];
        if (response.msg && Array.isArray(response.msg)) {
          messageData = response.msg;
        } else if (response.data && Array.isArray(response.data)) {
          messageData = response.data;
        } else if (response.messages && Array.isArray(response.messages)) {
          messageData = response.messages;
        }
        
        console.log('解析到的消息数据:', messageData);
        
        // 检查每条消息的结构
        if (messageData.length > 0) {
          console.log('第一条消息结构:', JSON.stringify(messageData[0], null, 2));
        }
        
        // 按时间排序，最新的在下面
        const sortedMessages = messageData
          .filter((msg: any) => msg && typeof msg === 'object') // 过滤无效消息
          .sort((a: Message, b: Message) => 
            (a.send_time || 0) - (b.send_time || 0)
          );
        setMessages(sortedMessages);
      } else {
        const errorMsg = response.status?.msg || '获取消息失败';
        Alert.alert('错误', errorMsg);
      }
    } catch (error) {
      console.error('获取消息错误:', error);
      Alert.alert('错误', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [chatId, chatType]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };

  const getContentTypeText = (contentType: number) => {
    switch (contentType) {
      case 1: return '文本';
      case 2: return '图片';
      case 3: return 'Markdown';
      case 4: return '文件';
      case 5: return '表单';
      case 6: return '文章';
      case 7: return '表情';
      case 8: return 'HTML';
      case 11: return '语音';
      case 13: return '语音通话';
      default: return `类型${contentType}`;
    }
  };

  const renderMessageContent = (message: Message) => {
    const { content, content_type } = message;

    // 如果content不存在，显示默认内容
    if (!content) {
      return (
        <Text style={styles.messageText}>
          [消息内容为空]
        </Text>
      );
    }

    switch (content_type) {
      case 1: // 文本
        return (
          <Text style={styles.messageText}>
            {content.text || '[文本消息]'}
          </Text>
        );
      case 2: // 图片
        if (content.image_url) {
          return (
            <ImageWithReferer
              uri={content.image_url}
              style={[
                styles.messageImage,
                content.width && content.height ? {
                  width: Math.min(content.width / 2, 200),
                  height: Math.min(content.height / 2, 200),
                } : {}
              ]}
            />
          );
        }
        return <Text style={styles.messageText}>[图片]</Text>;
      case 4: // 文件
        return (
          <View style={styles.fileMessage}>
            <Text style={styles.fileName}>{content.file_name || '未知文件'}</Text>
            <Text style={styles.fileUrl}>{content.file_url || ''}</Text>
          </View>
        );
      case 7: // 表情
        if (content.sticker_url) {
          return (
            <ImageWithReferer
              uri={content.sticker_url}
              style={styles.stickerImage}
            />
          );
        }
        return <Text style={styles.messageText}>[表情]</Text>;
      case 11: // 语音
        return (
          <View style={styles.audioMessage}>
            <Text style={styles.audioText}>🎵 语音消息</Text>
            {content.audio_time && (
              <Text style={styles.audioDuration}>{content.audio_time}秒</Text>
            )}
          </View>
        );
      default:
        return (
          <Text style={styles.messageText}>
            [{getContentTypeText(content_type)}] {content.text || content.tip || ''}
          </Text>
        );
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // 安全检查
    if (!item || !item.sender) {
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>[消息数据错误]</Text>
        </View>
      );
    }

    const isMyMessage = item.direction === 'right';
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && (
          <Avatar
            uri={item.sender?.avatar_url}
            size={40}
            fallbackIcon="👤"
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {!isMyMessage && (
            <View style={styles.senderInfo}>
              <Text style={styles.senderName}>{item.sender?.name || '未知用户'}</Text>
              {item.sender?.tag && item.sender.tag.length > 0 && (
                <View style={styles.tagContainer}>
                  {item.sender.tag.map((tag, index) => (
                    <Text
                      key={index}
                      style={[styles.tag, { backgroundColor: tag?.color || '#999' }]}
                    >
                      {tag?.text || ''}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
          
          {renderMessageContent(item)}
          
          <Text style={styles.messageTime}>
            {formatTime(item.send_time || 0)}
            {item.edit_time && item.edit_time > (item.send_time || 0) && ' (已编辑)'}
          </Text>
        </View>
        
        {isMyMessage && (
          <Avatar
            uri={item.sender?.avatar_url}
            size={40}
            fallbackIcon="👤"
            style={styles.messageAvatar}
          />
        )}
      </View>
    );
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      setSending(true);
      const response = await messageAPI.sendMessage(
        chatId as string,
        parseInt(chatType as string),
        1, // 文本消息
        { text: inputText.trim() }
      );

      if (response.status?.code === 1) {
        setInputText('');
        // 重新加载消息
        loadMessages();
      } else {
        Alert.alert('发送失败', response.status?.msg || '发送消息失败');
      }
    } catch (error) {
      console.error('发送消息错误:', error);
      Alert.alert('发送失败', '网络错误，请稍后重试');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载消息中...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || '聊天'}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.msg_id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无消息</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入消息..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>发送</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  senderInfo: {
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  tag: {
    fontSize: 10,
    color: '#fff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  messageImage: {
    borderRadius: 8,
    minWidth: 100,
    minHeight: 100,
  },
  fileMessage: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  fileUrl: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  stickerImage: {
    width: 80,
    height: 80,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  audioText: {
    fontSize: 14,
    color: '#333',
  },
  audioDuration: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
