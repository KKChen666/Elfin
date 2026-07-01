import { create } from 'zustand';
import { Relative, AvatarConfig, ChatStyle, ChatMessage, DEFAULT_AVATAR } from '../types';
import { relativesApi, BackendRelative, RelativeCreateData } from '../api/relatives';
import { chatApi, ChatMessageOut } from '../api/chat';

// 后端 snake_case -> 前端 camelCase 转换
function fromBackend(r: BackendRelative): Relative {
  return {
    id: String(r.id),
    name: r.name,
    birthday: r.birthday,
    isLunar: r.is_lunar,
    relation: r.relation,
    phone: r.phone || undefined,
    hobbies: r.hobbies || undefined,
    clothingSize: r.clothing_size || undefined,
    shoeSize: r.shoe_size || undefined,
    notes: r.notes || undefined,
    mbti: r.mbti || undefined,
    address: r.address || undefined,
    zodiac: r.zodiac || undefined,
    chineseZodiac: r.chinese_zodiac || undefined,
    avatar: r.avatar as unknown as AvatarConfig,
    avatarImage: r.avatar_image_url || undefined,
    chatStyle: r.chat_style ? (r.chat_style as unknown as ChatStyle) : undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// 前端 camelCase -> 后端 snake_case 转换
function toCreateData(
  data: Omit<Relative, 'id' | 'createdAt' | 'updatedAt' | 'avatar'> & {
    avatar?: Partial<AvatarConfig>;
  }
): RelativeCreateData {
  return {
    name: data.name,
    birthday: data.birthday,
    is_lunar: data.isLunar,
    relation: data.relation,
    phone: data.phone,
    hobbies: data.hobbies,
    clothing_size: data.clothingSize,
    shoe_size: data.shoeSize,
    notes: data.notes,
    mbti: data.mbti,
    address: data.address,
    zodiac: data.zodiac,
    chinese_zodiac: data.chineseZodiac,
    avatar: { ...DEFAULT_AVATAR, ...data.avatar } as Record<string, unknown>,
  };
}

function chatMsgFromBackend(m: ChatMessageOut): ChatMessage {
  return {
    id: String(m.id),
    content: m.content,
    sender: m.sender,
    timestamp: m.timestamp,
  };
}

interface RelativeStore {
  relatives: Relative[];
  chatMessages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  hasLoaded: boolean;
  loadRelatives: () => Promise<void>;
  addRelative: (
    data: Omit<Relative, 'id' | 'createdAt' | 'updatedAt' | 'avatar'> & {
      avatar?: Partial<AvatarConfig>;
    }
  ) => Promise<string>;
  updateRelative: (id: string, data: Partial<Relative>) => Promise<void>;
  deleteRelative: (id: string) => Promise<void>;
  getRelative: (id: string) => Relative | undefined;
  updateAvatar: (id: string, avatar: Partial<AvatarConfig>, avatarImage?: string) => Promise<void>;
  updateChatStyle: (id: string, chatStyle: ChatStyle) => Promise<void>;
  loadChatMessages: (relativeId: string) => Promise<void>;
  addChatMessage: (relativeId: string, message: ChatMessage) => Promise<void>;
  clearChatMessages: (relativeId: string) => Promise<void>;
  requestAvatarResponse: (relativeId: string, content: string) => Promise<string>;
}

export const useRelativeStore = create<RelativeStore>((set, get) => ({
  relatives: [],
  chatMessages: {},
  isLoading: false,
  hasLoaded: false,

  loadRelatives: async () => {
    set({ isLoading: true });
    try {
      const res = await relativesApi.getAll();
      const relatives = res.data.map(fromBackend);
      set({ relatives, hasLoaded: true });
    } catch {
      set({ relatives: [], hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  addRelative: async (data) => {
    const res = await relativesApi.create(toCreateData(data));
    const newRelative = fromBackend(res.data);
    set((state) => ({ relatives: [...state.relatives, newRelative] }));
    return newRelative.id;
  },

  updateRelative: async (id, data) => {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.birthday !== undefined) updateData.birthday = data.birthday;
    if (data.isLunar !== undefined) updateData.is_lunar = data.isLunar;
    if (data.relation !== undefined) updateData.relation = data.relation;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.hobbies !== undefined) updateData.hobbies = data.hobbies;
    if (data.clothingSize !== undefined) updateData.clothing_size = data.clothingSize;
    if (data.shoeSize !== undefined) updateData.shoe_size = data.shoeSize;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.mbti !== undefined) updateData.mbti = data.mbti;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.zodiac !== undefined) updateData.zodiac = data.zodiac;
    if (data.chineseZodiac !== undefined) updateData.chinese_zodiac = data.chineseZodiac;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const res = await relativesApi.update(Number(id), updateData);
    const updated = fromBackend(res.data);
    set((state) => ({
      relatives: state.relatives.map((r) => (r.id === id ? updated : r)),
    }));
  },

  deleteRelative: async (id) => {
    await relativesApi.delete(Number(id));
    set((state) => ({
      relatives: state.relatives.filter((r) => r.id !== id),
    }));
  },

  getRelative: (id) => {
    return get().relatives.find((r) => r.id === id);
  },

  updateAvatar: async (id, avatar, avatarImage) => {
    const updateData: Record<string, unknown> = { avatar };
    if (avatarImage !== undefined) {
      // avatarImage 是 base64，需要通过 upload API 上传
      // 这里先更新 avatar 配置，图片上传由调用方处理
    }
    const res = await relativesApi.update(Number(id), updateData);
    const updated = fromBackend(res.data);
    set((state) => ({
      relatives: state.relatives.map((r) => (r.id === id ? updated : r)),
    }));
  },

  updateChatStyle: async (id, chatStyle) => {
    const res = await relativesApi.update(Number(id), {
      chat_style: chatStyle as unknown as Record<string, unknown>,
    });
    const updated = fromBackend(res.data);
    set((state) => ({
      relatives: state.relatives.map((r) => (r.id === id ? updated : r)),
    }));
  },

  loadChatMessages: async (relativeId) => {
    try {
      const res = await chatApi.getMessages(Number(relativeId));
      const messages = res.data.map(chatMsgFromBackend);
      set((state) => ({
        chatMessages: { ...state.chatMessages, [relativeId]: messages },
      }));
    } catch {
      set((state) => ({
        chatMessages: { ...state.chatMessages, [relativeId]: [] },
      }));
    }
  },

  addChatMessage: async (relativeId, message) => {
    // 先乐观更新本地
    const currentMessages = get().chatMessages[relativeId] || [];
    const updatedMessages = [...currentMessages, message];
    set((state) => ({
      chatMessages: { ...state.chatMessages, [relativeId]: updatedMessages },
    }));
    // 同步到后端
    try {
      await chatApi.addMessage(Number(relativeId), message.content, message.sender);
    } catch {
      // 静默失败
    }
  },

  clearChatMessages: async (relativeId) => {
    set((state) => ({
      chatMessages: { ...state.chatMessages, [relativeId]: [] },
    }));
    try {
      await chatApi.clearMessages(Number(relativeId));
    } catch {
      // 静默失败
    }
  },

  requestAvatarResponse: async (relativeId, content) => {
    const res = await chatApi.getAvatarResponse(Number(relativeId), content);
    const reply = res.data.content;
    // 保存 avatar 回复到本地状态
    const avatarMsg: ChatMessage = {
      id: `avatar_${Date.now()}`,
      content: reply,
      sender: 'avatar',
      timestamp: new Date().toISOString(),
    };
    const currentMessages = get().chatMessages[relativeId] || [];
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [relativeId]: [...currentMessages, avatarMsg],
      },
    }));
    return reply;
  },
}));
