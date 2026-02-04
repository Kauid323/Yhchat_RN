import AvatarCustom from '@/components/ui/Avatar';
import ImageWithReferer from '@/components/ui/ImageWithReferer';
import { messageAPI } from '@/utils/apiClientMixed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import {
  ActivityIndicator,
  Appbar,
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';

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
  const theme = useTheme();
  const params = useLocalSearchParams();

  const { chatId, chatType, name } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 图片预览相关状态
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageList, setImageList] = useState<Array<{ uri: string }>>([]);

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

        // 提取所有图片消息用于预览
        const images = sortedMessages
          .filter((msg: Message) => msg.content_type === 2 && msg.content?.image_url)
          .map((msg: Message) => ({ uri: msg.content.image_url! }));
        setImageList(images);

        // 延迟滚动到底部，确保消息已渲染
        setTimeout(() => {
          if (sortedMessages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }, 100);
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

  // 监听键盘事件
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // 键盘弹出时，滚动到底部
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // 键盘收起时，也可以滚动到底部保持在最新消息位置
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

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

  // 处理图片点击事件
  const handleImagePress = (imageUrl: string) => {
    const imageIndex = imageList.findIndex(img => img.uri === imageUrl);
    if (imageIndex !== -1) {
      setCurrentImageIndex(imageIndex);
      setImageViewVisible(true);
    }
  };

  const renderMessageContent = (message: Message) => {
    const { content, content_type } = message;

    if (!content) {
      return (
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          [消息内容为空]
        </Text>
      );
    }

    switch (content_type) {
      case 1: // 文本
        return (
          <Text
            variant="bodyLarge"
            style={[
              styles.messageText,
              { color: message.direction === 'right' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }
            ]}
          >
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
              onPress={() => handleImagePress(content.image_url!)}
            />
          );
        }
        return <Text variant="bodyMedium">[图片]</Text>;
      case 4: // 文件
        return (
          <Surface style={[styles.fileMessage, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
            <Text variant="titleSmall" numberOfLines={1}>{content.file_name || '未知文件'}</Text>
            <Text variant="bodySmall" numberOfLines={1}>{content.file_url || ''}</Text>
          </Surface>
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
        return <Text variant="bodyMedium">[表情]</Text>;
      case 11: // 语音
        return (
          <Surface style={[styles.audioMessage, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
            <Text variant="bodyMedium">🎵 语音消息</Text>
            {content.audio_time && (
              <Text variant="labelSmall" style={{ marginLeft: 8 }}>{content.audio_time}秒</Text>
            )}
          </Surface>
        );
      default:
        return (
          <Text variant="bodyMedium">
            [{getContentTypeText(content_type)}] {content.text || content.tip || ''}
          </Text>
        );
    }
  };

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    if (!item || !item.sender) {
      return (
        <View style={styles.messageContainer}>
          <Text variant="bodySmall">[消息数据错误]</Text>
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
          <AvatarCustom
            uri={item.sender?.avatar_url}
            size={40}
            fallbackIcon="👤"
            style={styles.messageAvatar}
          />
        )}

        <Surface
          style={[
            styles.messageBubble,
            isMyMessage ?
              [styles.myMessageBubble, { backgroundColor: theme.colors.primary }] :
              [styles.otherMessageBubble, { backgroundColor: theme.colors.surfaceVariant }]
          ]}
          elevation={isMyMessage ? 2 : 1}
        >
          {!isMyMessage && (
            <View style={styles.senderInfo}>
              <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {item.sender?.name || '未知用户'}
              </Text>
              {item.sender?.tag && item.sender.tag.length > 0 && (
                <View style={styles.tagContainer}>
                  {item.sender.tag.map((tag, index) => (
                    <Surface
                      key={index}
                      style={[styles.tag, { backgroundColor: tag?.color || theme.colors.outline }]}
                      elevation={0}
                    >
                      <Text variant="labelSmall" style={{ color: '#fff', fontSize: 8 }}>
                        {tag?.text || ''}
                      </Text>
                    </Surface>
                  ))}
                </View>
              )}
            </View>
          )}

          {renderMessageContent(item)}

          <Text
            variant="labelSmall"
            style={[
              styles.messageTime,
              { color: isMyMessage ? theme.colors.onPrimary : theme.colors.outline, opacity: 0.7 }
            ]}
          >
            {formatTime(item.send_time || 0)}
            {item.edit_time && item.edit_time > (item.send_time || 0) && ' (已编辑)'}
          </Text>
        </Surface>

        {isMyMessage && (
          <AvatarCustom
            uri={item.sender?.avatar_url}
            size={40}
            fallbackIcon="👤"
            style={styles.messageAvatar}
          />
        )}
      </View>
    );
  }, [theme]);

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
        await loadMessages();
        // 发送消息后滚动到底部
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>加载消息中...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={name || '聊天'} />
        <Appbar.Action icon="dots-vertical" onPress={() => { }} />
      </Appbar.Header>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.msg_id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={15}
        windowSize={10}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={{ opacity: 0.5 }}>暂无消息</Text>
          </View>
        )}
      />

      <Surface style={styles.inputContainer} elevation={4}>
        <TextInput
          mode="flat"
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入消息..."
          multiline
          maxLength={1000}
          dense
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          onFocus={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }}
        />
        <IconButton
          icon="send"
          mode="contained"
          size={24}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}
          loading={sending}
        />
      </Surface>

      {/* 图片预览器 */}
      <ImageView
        images={imageList}
        imageIndex={currentImageIndex}
        visible={imageViewVisible}
        onRequestClose={() => setImageViewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
        animationType="fade"
      />
    </KeyboardAvoidingView>
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
    marginHorizontal: 4,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  senderInfo: {
    marginBottom: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 4,
  },
  messageText: {
    lineHeight: 22,
  },
  messageImage: {
    borderRadius: 8,
    minWidth: 100,
    minHeight: 100,
  },
  fileMessage: {
    padding: 12,
    borderRadius: 8,
    width: 200,
  },
  stickerImage: {
    width: 80,
    height: 80,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  messageTime: {
    marginTop: 4,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: 'transparent',
  },
});
