import AsyncStorage from '@react-native-async-storage/async-storage';

// 云湖API基础URL
const BASE_URL = 'https://chat-go.jwzhd.com';

// 创建请求函数
const request = async (url: string, options: any = {}) => {
  try {
    // 获取token
    const token = await AsyncStorage.getItem('userToken');
    
    // 设置默认选项
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'token': token } : {}),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(BASE_URL + url, defaultOptions);
    
    // 检查响应状态
    if (!response.ok) {
      if (response.status === 401) {
        // token过期或无效，清除本地存储
        await AsyncStorage.removeItem('userToken');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 尝试解析JSON响应
    try {
      const data = await response.json();
      return data;
    } catch (jsonError) {
      // 如果不是JSON响应，返回文本
      const text = await response.text();
      return { data: text };
    }
  } catch (error) {
    throw error;
  }
};

// 用户相关API
export const userAPI = {
  // 邮箱登录
  emailLogin: async (email: string, password: string, deviceId: string, platform: string = 'android') => {
    try {
      const response = await request('/v1/user/email-login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          deviceId,
          platform
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取用户信息
  getUserInfo: async () => {
    try {
      const response = await request('/v1/user/info', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取指定用户信息
  getUser: async (userId: string) => {
    try {
      const response = await request('/v1/user/get-user', {
        method: 'POST',
        body: JSON.stringify({
          id: userId
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取验证码
  getCaptcha: async () => {
    try {
      const response = await request('/v1/user/captcha', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 验证码登录
  verificationLogin: async (mobile: string, captcha: string, deviceId: string, platform: string = 'android') => {
    try {
      const response = await request('/v1/user/verification-login', {
        method: 'POST',
        body: JSON.stringify({
          mobile,
          captcha,
          deviceId,
          platform
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 修改昵称
  editNickname: async (name: string) => {
    try {
      const response = await request('/v1/user/edit-nickname', {
        method: 'POST',
        body: JSON.stringify({
          name
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 修改头像
  editAvatar: async (url: string) => {
    try {
      const response = await request('/v1/user/edit-avatar', {
        method: 'POST',
        body: JSON.stringify({
          url
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 登出
  logout: async (deviceId: string) => {
    try {
      const response = await request('/v1/user/logout', {
        method: 'POST',
        body: JSON.stringify({
          deviceId
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// 消息相关API
export const messageAPI = {
  // 发送消息
  sendMessage: async (chatId: string, chatType: number, contentType: number, content: any) => {
    try {
      const response = await request('/v1/msg/send-message', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: chatId,
          chat_type: chatType,
          content_type: contentType,
          content: content
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取消息列表
  listMessages: async (chatId: string, chatType: number, msgCount: number = 20, msgId: string = '') => {
    try {
      const response = await request('/v1/msg/list-message', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: chatId,
          chat_type: chatType,
          msg_count: msgCount,
          msg_id: msgId
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 根据序列号获取消息
  listMessagesBySeq: async (chatId: string, chatType: number, msgSeq: number = 0) => {
    try {
      const response = await request('/v1/msg/list-message-by-seq', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: chatId,
          chat_type: chatType,
          msg_seq: msgSeq
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 撤回消息
  recallMessage: async (chatId: string, chatType: number, msgId: string) => {
    try {
      const response = await request('/v1/msg/recall-msg', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: chatId,
          chat_type: chatType,
          msg_id: msgId
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 编辑消息
  editMessage: async (chatId: string, chatType: number, msgId: string, contentType: number, content: any) => {
    try {
      const response = await request('/v1/msg/edit-message', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: chatId,
          chat_type: chatType,
          msg_id: msgId,
          content_type: contentType,
          content: content
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// 会话相关API
export const conversationAPI = {
  // 获取对话列表
  getConversationList: async () => {
    try {
      const response = await request('/v1/conversation/list', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 将对话设为已读
  dismissNotification: async (chatId: string) => {
    try {
      const response = await request('/v1/conversation/dismiss-notification', {
        method: 'POST',
        body: JSON.stringify({
          chatId
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 更改对话排序
  sortChange: async (userId: string) => {
    try {
      const response = await request('/v1/conversation/sort-change', {
        method: 'POST',
        body: JSON.stringify({
          userId
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// 群组相关API
export const groupAPI = {
  // 获取群组信息
  getGroupInfo: async (groupId: string) => {
    try {
      const response = await request('/v1/group/info', {
        method: 'POST',
        body: JSON.stringify({
          group_id: groupId
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取群组成员列表
  listGroupMembers: async (groupId: string, size: number = 50, page: number = 1) => {
    try {
      const response = await request('/v1/group/list-member', {
        method: 'POST',
        body: JSON.stringify({
          group_id: groupId,
          data: {
            size,
            page
          }
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 编辑群组信息
  editGroup: async (groupId: string, data: any) => {
    try {
      const response = await request('/v1/group/edit-group', {
        method: 'POST',
        body: JSON.stringify({
          group_id: groupId,
          ...data
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 邀请用户加入群组
  inviteToGroup: async (groupId: string, chatId: string, chatType: number) => {
    try {
      const response = await request('/v1/group/invite', {
        method: 'POST',
        body: JSON.stringify({
          group_id: groupId,
          chat_id: chatId,
          chat_type: chatType
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 禁言群成员
  gagMember: async (groupId: string, userId: string, time: number) => {
    try {
      const response = await request('/v1/group/gag-member', {
        method: 'POST',
        body: JSON.stringify({
          group_id: groupId,
          user_id: userId,
          gag: time
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 移除群成员
  removeMember: async (groupId: string, userId: string) => {
    try {
      const response = await request('/v1/group/remove-member', {
        method: 'POST',
        body: JSON.stringify({
          group_id: groupId,
          user_id: userId
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default {
  userAPI,
  messageAPI,
  conversationAPI,
  groupAPI,
  request
};
