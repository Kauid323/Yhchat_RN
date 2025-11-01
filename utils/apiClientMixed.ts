import AsyncStorage from '@react-native-async-storage/async-storage';
import { simpleProtobufHandler } from './protobufSimple';

// 云湖API基础URL
const BASE_URL = 'https://chat-go.jwzhd.com';

// JSON请求函数
const jsonRequest = async (url: string, options: any = {}) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'token': token } : {}),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(BASE_URL + url, defaultOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem('userToken');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// ProtoBuf请求函数
const protobufRequest = async (url: string, messageType: string, data?: any, responseType?: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');

    let body: Uint8Array | undefined;
    if (data && messageType) {
      try {
        // 使用simpleProtobufHandler序列化请求数据
        body = simpleProtobufHandler.serialize(messageType, data);
        console.log('ProtoBuf序列化成功:', messageType, data);
      } catch (error) {
        console.error('ProtoBuf序列化失败:', error);
        // 如果序列化失败，尝试不发送body
      }
    }

    const response = await fetch(BASE_URL + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-protobuf',
        ...(token ? { 'token': token } : {}),
      },
      body: body as BodyInit,
    });

    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem('userToken');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (responseType) {
      return await simpleProtobufHandler.parseResponse(responseType, response);
    } else {
      const arrayBuffer = await response.arrayBuffer();
      return { status: { code: 1, msg: 'success' } };
    }
  } catch (error) {
    throw error;
  }
};

// 用户相关API
export const userAPI = {
  // JSON接口 - 邮箱登录
  emailLogin: async (email: string, password: string, deviceId: string, platform: string = 'android') => {
    try {
      const response = await jsonRequest('/v1/user/email-login', {
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

  // JSON接口 - 验证码登录
  verificationLogin: async (mobile: string, captcha: string, deviceId: string, platform: string = 'android') => {
    try {
      const response = await jsonRequest('/v1/user/verification-login', {
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

  // JSON接口 - 获取图片验证码
  getCaptcha: async (deviceId: string) => {
    try {
      const response = await jsonRequest('/v1/user/captcha', {
        method: 'POST',
        body: JSON.stringify({
          deviceId
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // JSON接口 - 获取短信验证码
  getVerificationCode: async (mobile: string, code: string, id: string) => {
    try {
      const response = await jsonRequest('/v1/verification/get-verification-code', {
        method: 'POST',
        body: JSON.stringify({
          mobile,
          code,
          id
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 获取用户信息
  getUserInfo: async () => {
    try {
      // 直接使用GET请求，不通过protobufRequest
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(BASE_URL + '/v1/user/info', {
        method: 'GET',
        headers: {
          ...(token ? { 'token': token } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.removeItem('userToken');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await simpleProtobufHandler.parseResponse('UserInfo', response);
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 获取指定用户信息
  getUser: async (userId: string) => {
    try {
      const data = { id: userId };
      const response = await protobufRequest('/v1/user/get-user', 'GetUserSend', data, 'GetUser');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 修改昵称
  editNickname: async (name: string) => {
    try {
      const data = { name };
      const response = await protobufRequest('/v1/user/edit-nickname', 'EditNicknameSend', data, 'EditNickname');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 修改头像
  editAvatar: async (url: string) => {
    try {
      const data = { url };
      const response = await protobufRequest('/v1/user/edit-avatar', 'EditAvatarSend', data, 'EditAvatar');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // JSON接口 - 登出
  logout: async (deviceId: string) => {
    try {
      const response = await jsonRequest('/v1/user/logout', {
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

// 消息相关API (大部分是ProtoBuf)
export const messageAPI = {
  // ProtoBuf接口 - 发送消息
  sendMessage: async (chatId: string, chatType: number, contentType: number, content: any) => {
    try {
      const data = {
        msg_id: Date.now().toString(), // 生成消息ID
        chat_id: chatId,
        chat_type: chatType,
        content_type: contentType,
        data: content
      };
      const response = await protobufRequest('/v1/msg/send-message', 'SendMessage', data, 'SendMessageResponse');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 获取消息列表
  listMessages: async (chatId: string, chatType: number, msgCount: number = 20, msgId: string = '') => {
    try {
      const data = {
        chat_id: chatId,
        chat_type: chatType,
        msg_count: msgCount,
        msg_id: msgId
      };
      const response = await protobufRequest('/v1/msg/list-message', 'ListMessageSend', data, 'ListMessage');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 根据序列号获取消息
  listMessagesBySeq: async (chatId: string, chatType: number, msgSeq: number = 0) => {
    try {
      const data = {
        chat_id: chatId,
        chat_type: chatType,
        msg_seq: msgSeq
      };
      const response = await protobufRequest('/v1/msg/list-message-by-seq', 'ListMessageBySeqSend', data, 'ListMessageBySeq');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 撤回消息
  recallMessage: async (chatId: string, chatType: number, msgId: string) => {
    try {
      const data = {
        chat_id: chatId,
        chat_type: chatType,
        msg_id: msgId
      };
      const response = await protobufRequest('/v1/msg/recall-msg', 'RecallMsgSend', data, 'RecallMsg');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 编辑消息
  editMessage: async (chatId: string, chatType: number, msgId: string, contentType: number, content: any) => {
    try {
      const data = {
        msg_id: msgId,
        chat_id: chatId,
        chat_type: chatType,
        content_type: contentType,
        content: content
      };
      const response = await protobufRequest('/v1/msg/edit-message', 'EditMessageSend', data, 'EditMessage');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // JSON接口 - 获取消息编辑记录
  listMessageEditRecord: async (msgId: string, size: number = 10, page: number = 1) => {
    try {
      const response = await jsonRequest('/v1/msg/list-message-edit-record', {
        method: 'POST',
        body: JSON.stringify({
          msgId,
          size,
          page
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
  // ProtoBuf接口 - 获取对话列表
  getConversationList: async () => {
    try {
      // 直接使用POST请求
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(BASE_URL + '/v1/conversation/list', {
        method: 'POST',
        headers: {
          ...(token ? { 'token': token } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.removeItem('userToken');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await simpleProtobufHandler.parseResponse('ConversationList', response);
    } catch (error) {
      throw error;
    }
  },

  // JSON接口 - 将对话设为已读
  dismissNotification: async (chatId: string) => {
    try {
      const response = await jsonRequest('/v1/conversation/dismiss-notification', {
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

  // JSON接口 - 更改对话排序
  sortChange: async (userId: string) => {
    try {
      const response = await jsonRequest('/v1/conversation/sort-change', {
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
  // ProtoBuf接口 - 获取群组信息
  getGroupInfo: async (groupId: string) => {
    try {
      const data = { group_id: groupId };
      const response = await protobufRequest('/v1/group/info', 'GroupInfoSend', data, 'GroupInfo');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 获取群组成员列表
  listGroupMembers: async (groupId: string, size: number = 50, page: number = 1) => {
    try {
      const data = {
        group_id: groupId,
        data: { size, page }
      };
      const response = await protobufRequest('/v1/group/list-member', 'ListMemberSend', data, 'ListMember');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ProtoBuf接口 - 编辑群组信息
  editGroup: async (groupId: string, data: any) => {
    try {
      const requestData = {
        group_id: groupId,
        ...data
      };
      const response = await protobufRequest('/v1/group/edit-group', 'EditGroupSend', requestData, 'EditGroup');
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
  jsonRequest,
  protobufRequest
};
