import protobuf from 'protobufjs/minimal';

// ProtoBuf 消息类型定义
interface ProtoBufMessage {
  [key: string]: any;
}

// 状态信息结构
interface Status {
  number?: number;
  code: number;
  msg: string;
}

// 通用响应结构
interface ProtoBufResponse {
  status: Status;
  data?: any;
  [key: string]: any;
}

class ProtoBufHandler {
  private static instance: ProtoBufHandler;
  private root: protobuf.Root | null = null;

  private constructor() {}

  public static getInstance(): ProtoBufHandler {
    if (!ProtoBufHandler.instance) {
      ProtoBufHandler.instance = new ProtoBufHandler();
    }
    return ProtoBufHandler.instance;
  }

  // 初始化ProtoBuf定义（使用内联定义）
  public async initialize() {
    try {
      this.root = new protobuf.Root();
      
      // 定义基础消息结构
      const statusType = new protobuf.Type('Status')
        .add(new protobuf.Field('number', 1, 'uint64', 'optional'))
        .add(new protobuf.Field('code', 2, 'int32', 'required'))
        .add(new protobuf.Field('msg', 3, 'string', 'required'));

      // 会话列表相关消息
      const atDataType = new protobuf.Type('AtData')
        .add(new protobuf.Field('unknown', 1, 'uint64', 'optional'))
        .add(new protobuf.Field('mentioned_id', 2, 'string', 'optional'))
        .add(new protobuf.Field('mentioned_name', 3, 'string', 'optional'))
        .add(new protobuf.Field('mentioned_in', 4, 'string', 'optional'))
        .add(new protobuf.Field('mentioner_id', 6, 'string', 'optional'))
        .add(new protobuf.Field('mentioner_name', 7, 'string', 'optional'))
        .add(new protobuf.Field('msg_seq', 8, 'uint64', 'optional'));

      const conversationDataType = new protobuf.Type('ConversationData')
        .add(new protobuf.Field('chat_id', 1, 'string', 'required'))
        .add(new protobuf.Field('chat_type', 2, 'uint64', 'required'))
        .add(new protobuf.Field('name', 3, 'string', 'required'))
        .add(new protobuf.Field('chat_content', 4, 'string', 'optional'))
        .add(new protobuf.Field('timestamp_ms', 5, 'uint64', 'optional'))
        .add(new protobuf.Field('unread_message', 6, 'uint64', 'optional'))
        .add(new protobuf.Field('at', 7, 'uint64', 'optional'))
        .add(new protobuf.Field('avatar_id', 8, 'uint64', 'optional'))
        .add(new protobuf.Field('avatar_url', 9, 'string', 'optional'))
        .add(new protobuf.Field('do_not_disturb', 11, 'uint64', 'optional'))
        .add(new protobuf.Field('timestamp', 12, 'uint64', 'optional'))
        .add(new protobuf.Field('at_data', 14, 'AtData', 'optional'))
        .add(new protobuf.Field('certification_level', 16, 'uint64', 'optional'));

      const conversationListType = new protobuf.Type('ConversationList')
        .add(new protobuf.Field('status', 1, 'Status', 'required'))
        .add(new protobuf.Field('data', 2, 'ConversationData', 'repeated'))
        .add(new protobuf.Field('total', 3, 'uint64', 'optional'))
        .add(new protobuf.Field('request_id', 4, 'string', 'optional'));

      // 用户信息相关消息
      const userInfoDataType = new protobuf.Type('UserInfoData')
        .add(new protobuf.Field('id', 1, 'string', 'required'))
        .add(new protobuf.Field('name', 2, 'string', 'required'))
        .add(new protobuf.Field('avatar_url', 4, 'string', 'optional'))
        .add(new protobuf.Field('avatar_id', 5, 'uint64', 'optional'))
        .add(new protobuf.Field('phone', 6, 'string', 'optional'))
        .add(new protobuf.Field('email', 7, 'string', 'optional'))
        .add(new protobuf.Field('coin', 8, 'double', 'optional'))
        .add(new protobuf.Field('is_vip', 9, 'int32', 'optional'))
        .add(new protobuf.Field('vip_expired_time', 10, 'uint64', 'optional'))
        .add(new protobuf.Field('invitation_code', 12, 'string', 'optional'));

      const userInfoType = new protobuf.Type('UserInfo')
        .add(new protobuf.Field('status', 1, 'Status', 'required'))
        .add(new protobuf.Field('data', 2, 'UserInfoData', 'optional'));

      // 消息发送相关
      const sendMessageDataType = new protobuf.Type('SendMessageData')
        .add(new protobuf.Field('text', 1, 'string', 'optional'))
        .add(new protobuf.Field('buttons', 2, 'string', 'optional'))
        .add(new protobuf.Field('file_name', 4, 'string', 'optional'))
        .add(new protobuf.Field('file_key', 5, 'string', 'optional'))
        .add(new protobuf.Field('mentioned_id', 6, 'string', 'repeated'))
        .add(new protobuf.Field('form', 7, 'string', 'optional'))
        .add(new protobuf.Field('quote_msg_text', 8, 'string', 'optional'))
        .add(new protobuf.Field('image', 9, 'string', 'optional'));

      const sendMessageType = new protobuf.Type('SendMessage')
        .add(new protobuf.Field('msg_id', 2, 'string', 'required'))
        .add(new protobuf.Field('chat_id', 3, 'string', 'required'))
        .add(new protobuf.Field('chat_type', 4, 'uint64', 'required'))
        .add(new protobuf.Field('data', 5, 'SendMessageData', 'optional'))
        .add(new protobuf.Field('content_type', 6, 'uint64', 'required'))
        .add(new protobuf.Field('quote_msg_id', 8, 'string', 'optional'));

      // 添加到根命名空间
      this.root
        .add(statusType)
        .add(atDataType)
        .add(conversationDataType)
        .add(conversationListType)
        .add(userInfoDataType)
        .add(userInfoType)
        .add(sendMessageDataType)
        .add(sendMessageType);

      console.log('ProtoBuf 初始化完成');
    } catch (error) {
      console.error('ProtoBuf 初始化失败:', error);
      throw error;
    }
  }

  // 序列化消息
  public serialize(messageType: string, data: ProtoBufMessage): Uint8Array {
    if (!this.root) {
      throw new Error('ProtoBuf 未初始化');
    }

    try {
      const MessageType = this.root.lookupType(messageType);
      const message = MessageType.create(data);
      return MessageType.encode(message).finish();
    } catch (error) {
      console.error(`序列化 ${messageType} 失败:`, error);
      throw error;
    }
  }

  // 反序列化消息
  public deserialize(messageType: string, buffer: Uint8Array): ProtoBufResponse {
    if (!this.root) {
      throw new Error('ProtoBuf 未初始化');
    }

    try {
      const MessageType = this.root.lookupType(messageType);
      const message = MessageType.decode(buffer);
      return MessageType.toObject(message) as ProtoBufResponse;
    } catch (error) {
      console.error(`反序列化 ${messageType} 失败:`, error);
      throw error;
    }
  }

  // 从响应数据中解析
  public parseResponse(messageType: string, response: Response): Promise<ProtoBufResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const result = this.deserialize(messageType, uint8Array);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  // 检查响应状态
  public isSuccess(response: ProtoBufResponse): boolean {
    return response.status && response.status.code === 1;
  }

  // 获取错误消息
  public getErrorMessage(response: ProtoBufResponse): string {
    return response.status?.msg || '未知错误';
  }
}

// 导出单例实例
export const protobufHandler = ProtoBufHandler.getInstance();

// 导出类型
export type { ProtoBufMessage, ProtoBufResponse, Status };
