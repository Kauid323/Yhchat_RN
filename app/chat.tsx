import { messageAPI, userAPI } from '@/utils/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId, setDeviceId] = useState(''); // 设备ID
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [chatId, setChatId] = useState('group-123'); // 默认群组ID，实际使用时需要替换
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    // 生成设备ID
    setDeviceId('device-' + Date.now());
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setIsLoggedIn(true);
        await loadUserInfo();
        loadMessages();
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const response = await userAPI.getUserInfo();
      console.log('用户信息响应:', response);
      if (response?.status?.code === 1) {
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 如果token过期，清除登录状态
      setIsLoggedIn(false);
      await AsyncStorage.removeItem('userToken');
    }
  };

  const loadMessages = async () => {
    if (!chatId) return;
    
    try {
      setLoading(true);
      // 获取消息列表 (聊天类型: 2=群组)
      const response = await messageAPI.listMessages(chatId, 2, 20);
      console.log('消息列表响应:', response);
      
      if (response?.status?.code === 1) {
        // 反转消息顺序以正确显示
        const reversedMessages = response.msg ? [...response.msg].reverse() : [];
        setMessages(reversedMessages);
      }
    } catch (error) {
      console.error('加载消息失败:', error);
      Alert.alert('错误', '加载消息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    try {
      setLoading(true);
      // 使用邮箱登录
      const response = await userAPI.emailLogin(email, password, deviceId, 'android');
      console.log('登录响应:', response);
      
      if (response?.code === 1) {
        // 保存token
        await AsyncStorage.setItem('userToken', response.data.token);
        setIsLoggedIn(true);
        setUserInfo(response.data.user);
        Alert.alert('成功', '登录成功');
        // 加载消息
        loadMessages();
      } else {
        Alert.alert('错误', response?.msg || '登录失败');
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      Alert.alert('错误', error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!chatId) {
      Alert.alert('错误', '请设置聊天ID');
      return;
    }

    try {
      setLoading(true);
      // 发送文本消息 (内容类型: 1=文本)
      const response = await messageAPI.sendMessage(
        chatId, 
        2, // 群组聊天
        1, // 文本消息
        { text: newMessage.trim() }
      );
      
      console.log('发送消息响应:', response);
      
      if (response?.status?.code === 1) {
        setNewMessage('');
        // 重新加载消息
        loadMessages();
      } else {
        Alert.alert('错误', response?.status?.msg || '发送消息失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      Alert.alert('错误', '发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await userAPI.logout(deviceId);
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      // 清除本地数据
      await AsyncStorage.removeItem('userToken');
      setIsLoggedIn(false);
      setUserInfo(null);
      setMessages([]);
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.sender}>{item.sender?.name || '未知用户'}</Text>
      <Text style={styles.message}>{item.content?.text || ''}</Text>
      <Text style={styles.timestamp}>
        {item.create_time ? new Date(item.create_time * 1000).toLocaleTimeString() : ''}
      </Text>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>云湖聊天登录</Text>
        <TextInput
          style={styles.input}
          placeholder="邮箱"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="密码"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button 
          title={loading ? "登录中..." : "登录"} 
          onPress={handleLogin} 
          disabled={loading}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>云湖聊天</Text>
        {userInfo && <Text style={styles.userInfo}>欢迎, {userInfo.name}</Text>}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>登出</Text>
        </TouchableOpacity>
      </View>
      
      {/* 聊天ID输入 */}
      <View style={styles.chatIdContainer}>
        <Text>聊天ID:</Text>
        <TextInput
          style={styles.chatIdInput}
          value={chatId}
          onChangeText={setChatId}
          placeholder="输入群组ID"
        />
        <Button title="加载" onPress={loadMessages} disabled={loading} />
      </View>
      
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id || Math.random().toString()}
        style={styles.messagesList}
        refreshing={loading}
        onRefresh={loadMessages}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="输入消息..."
          value={newMessage}
          onChangeText={setNewMessage}
          editable={!loading}
        />
        <Button 
          title="发送" 
          onPress={handleSendMessage} 
          disabled={loading || !newMessage.trim()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#ff4444',
    borderRadius: 4,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  chatIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  chatIdInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  messagesList: {
    flex: 1,
    marginBottom: 16,
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
});