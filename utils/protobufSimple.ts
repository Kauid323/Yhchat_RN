// 简化的ProtoBuf处理器，基于文章 https://www.freesion.com/article/1350750446/
import * as protobuf from 'protobufjs';

// 创建根命名空间
const root = new protobuf.Root();

// 定义基础消息结构
const Status = new protobuf.Type("Status")
  .add(new protobuf.Field("number", 1, "uint64"))
  .add(new protobuf.Field("code", 2, "int32"))
  .add(new protobuf.Field("msg", 3, "string"));

const ConversationData = new protobuf.Type("ConversationData")
  .add(new protobuf.Field("chat_id", 1, "string"))
  .add(new protobuf.Field("chat_type", 2, "uint64"))
  .add(new protobuf.Field("name", 3, "string"))
  .add(new protobuf.Field("chat_content", 4, "string"))
  .add(new protobuf.Field("timestamp_ms", 5, "uint64"))
  .add(new protobuf.Field("unread_message", 6, "uint64"))
  .add(new protobuf.Field("at", 7, "uint64"))
  .add(new protobuf.Field("avatar_id", 8, "uint64"))
  .add(new protobuf.Field("avatar_url", 9, "string"))
  .add(new protobuf.Field("do_not_disturb", 11, "uint64"))
  .add(new protobuf.Field("timestamp", 12, "uint64"))
  .add(new protobuf.Field("certification_level", 16, "uint64"));

const ConversationList = new protobuf.Type("ConversationList")
  .add(new protobuf.Field("status", 1, "Status"))
  .add(new protobuf.Field("data", 2, "ConversationData", "repeated"))
  .add(new protobuf.Field("total", 3, "uint64"))
  .add(new protobuf.Field("request_id", 4, "string"));

const UserInfoData = new protobuf.Type("UserInfoData")
  .add(new protobuf.Field("id", 1, "string"))
  .add(new protobuf.Field("name", 2, "string"))
  .add(new protobuf.Field("avatar_url", 4, "string"))
  .add(new protobuf.Field("avatar_id", 5, "uint64"))
  .add(new protobuf.Field("phone", 6, "string"))
  .add(new protobuf.Field("email", 7, "string"))
  .add(new protobuf.Field("coin", 8, "double"))
  .add(new protobuf.Field("is_vip", 9, "int32"))
  .add(new protobuf.Field("vip_expired_time", 10, "uint64"))
  .add(new protobuf.Field("invitation_code", 12, "string"));

const UserInfo = new protobuf.Type("UserInfo")
  .add(new protobuf.Field("status", 1, "Status"))
  .add(new protobuf.Field("data", 2, "UserInfoData"));

// 消息相关类型
const MessageSender = new protobuf.Type("MessageSender")
  .add(new protobuf.Field("chat_id", 1, "string"))
  .add(new protobuf.Field("chat_type", 2, "uint64"))
  .add(new protobuf.Field("name", 3, "string"))
  .add(new protobuf.Field("avatar_url", 4, "string"))
  .add(new protobuf.Field("tag_old", 6, "string", "repeated"))
  .add(new protobuf.Field("tag", 7, "MessageTag", "repeated"));

const MessageTag = new protobuf.Type("MessageTag")
  .add(new protobuf.Field("id", 1, "uint64"))
  .add(new protobuf.Field("text", 3, "string"))
  .add(new protobuf.Field("color", 4, "string"));

const MessageContent = new protobuf.Type("MessageContent")
  .add(new protobuf.Field("text", 1, "string"))
  .add(new protobuf.Field("buttons", 2, "string"))
  .add(new protobuf.Field("image_url", 3, "string"))
  .add(new protobuf.Field("file_name", 4, "string"))
  .add(new protobuf.Field("file_url", 5, "string"))
  .add(new protobuf.Field("form", 7, "string"))
  .add(new protobuf.Field("quote_msg_text", 8, "string"))
  .add(new protobuf.Field("sticker_url", 9, "string"))
  .add(new protobuf.Field("post_id", 10, "string"))
  .add(new protobuf.Field("post_title", 11, "string"))
  .add(new protobuf.Field("post_content", 12, "string"))
  .add(new protobuf.Field("post_content_type", 13, "string"))
  .add(new protobuf.Field("expression_id", 15, "string"))
  .add(new protobuf.Field("quote_image_url", 16, "string"))
  .add(new protobuf.Field("quote_image_name", 17, "string"))
  .add(new protobuf.Field("file_size", 18, "uint64"))
  .add(new protobuf.Field("video_url", 19, "string"))
  .add(new protobuf.Field("audio_url", 21, "string"))
  .add(new protobuf.Field("audio_time", 22, "uint64"))
  .add(new protobuf.Field("quote_video_url", 23, "string"))
  .add(new protobuf.Field("quote_video_time", 24, "uint64"))
  .add(new protobuf.Field("sticker_item_id", 25, "uint64"))
  .add(new protobuf.Field("sticker_pack_id", 26, "uint64"))
  .add(new protobuf.Field("call_text", 29, "string"))
  .add(new protobuf.Field("call_status_text", 32, "string"))
  .add(new protobuf.Field("width", 33, "uint64"))
  .add(new protobuf.Field("height", 34, "uint64"))
  .add(new protobuf.Field("tip", 37, "string"));

const MessageCmd = new protobuf.Type("MessageCmd")
  .add(new protobuf.Field("name", 2, "string"))
  .add(new protobuf.Field("type", 4, "uint64"));

const MessageData = new protobuf.Type("MessageData")
  .add(new protobuf.Field("msg_id", 1, "string"))
  .add(new protobuf.Field("sender", 2, "MessageSender"))
  .add(new protobuf.Field("direction", 3, "string"))
  .add(new protobuf.Field("content_type", 4, "uint64"))
  .add(new protobuf.Field("content", 5, "MessageContent"))
  .add(new protobuf.Field("send_time", 6, "uint64"))
  .add(new protobuf.Field("cmd", 7, "MessageCmd"))
  .add(new protobuf.Field("msg_delete_time", 8, "uint64"))
  .add(new protobuf.Field("quote_msg_id", 9, "string"))
  .add(new protobuf.Field("msg_seq", 10, "uint64"))
  .add(new protobuf.Field("edit_time", 12, "uint64"));

const ListMessage = new protobuf.Type("ListMessage")
  .add(new protobuf.Field("status", 1, "Status"))
  .add(new protobuf.Field("msg", 2, "MessageData", "repeated"));

const ListMessageSend = new protobuf.Type("ListMessageSend")
  .add(new protobuf.Field("msg_count", 2, "uint64"))
  .add(new protobuf.Field("msg_id", 3, "string"))
  .add(new protobuf.Field("chat_type", 4, "uint64"))
  .add(new protobuf.Field("chat_id", 5, "string"));

// 添加到根命名空间
root.add(Status);
root.add(ConversationData);
root.add(ConversationList);
root.add(UserInfoData);
root.add(UserInfo);
root.add(MessageTag);
root.add(MessageSender);
root.add(MessageContent);
root.add(MessageCmd);
root.add(MessageData);
root.add(ListMessage);
root.add(ListMessageSend);

class SimpleProtoBufHandler {
  private static instance: SimpleProtoBufHandler;

  private constructor() {}

  public static getInstance(): SimpleProtoBufHandler {
    if (!SimpleProtoBufHandler.instance) {
      SimpleProtoBufHandler.instance = new SimpleProtoBufHandler();
    }
    return SimpleProtoBufHandler.instance;
  }

  // 序列化消息
  public serialize(messageType: string, data: any): Uint8Array {
    try {
      const MessageType = root.lookupType(messageType);
      const message = MessageType.create(data);
      return MessageType.encode(message).finish();
    } catch (error) {
      console.error(`序列化 ${messageType} 失败:`, error);
      throw error;
    }
  }

  // 反序列化消息
  public deserialize(messageType: string, buffer: Uint8Array): any {
    try {
      const MessageType = root.lookupType(messageType);
      const message = MessageType.decode(buffer);
      return MessageType.toObject(message);
    } catch (error) {
      console.error(`反序列化 ${messageType} 失败:`, error);
      throw error;
    }
  }

  // 从响应数据中解析
  public async parseResponse(messageType: string, response: Response): Promise<any> {
    try {
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      return this.deserialize(messageType, uint8Array);
    } catch (error) {
      console.error(`解析响应 ${messageType} 失败:`, error);
      throw error;
    }
  }

  // 检查响应状态
  public isSuccess(response: any): boolean {
    return response.status && response.status.code === 1;
  }

  // 获取错误消息
  public getErrorMessage(response: any): string {
    return response.status?.msg || '未知错误';
  }
}

// 导出单例实例
export const simpleProtobufHandler = SimpleProtoBufHandler.getInstance();

export default simpleProtobufHandler;
