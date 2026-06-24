import { create } from 'zustand';
import { Relative, AvatarConfig, ChatStyle, DEFAULT_AVATAR } from '../types';
import { storageService } from '../services/storageService';

interface RelativeStore {
  relatives: Relative[];
  loadRelatives: () => void;
  addRelative: (data: Omit<Relative, 'id' | 'createdAt' | 'updatedAt' | 'avatar'> & { avatar?: Partial<AvatarConfig> }) => string;
  updateRelative: (id: string, data: Partial<Relative>) => void;
  deleteRelative: (id: string) => void;
  getRelative: (id: string) => Relative | undefined;
  updateAvatar: (id: string, avatar: Partial<AvatarConfig>) => void;
  updateChatStyle: (id: string, chatStyle: ChatStyle) => void;
}

export const useRelativeStore = create<RelativeStore>((set, get) => ({
  relatives: [],

  loadRelatives: () => {
    const relatives = storageService.getRelatives();
    set({ relatives });
  },

  addRelative: (data) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    const now = new Date().toISOString();
    const newRelative: Relative = {
      ...data,
      id,
      avatar: { ...DEFAULT_AVATAR, ...data.avatar },
      createdAt: now,
      updatedAt: now
    };
    const relatives = [...get().relatives, newRelative];
    set({ relatives });
    storageService.saveRelatives(relatives);
    return id;
  },

  updateRelative: (id, data) => {
    const relatives = get().relatives.map(r =>
      r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
    );
    set({ relatives });
    storageService.saveRelatives(relatives);
  },

  deleteRelative: (id) => {
    const relatives = get().relatives.filter(r => r.id !== id);
    set({ relatives });
    storageService.saveRelatives(relatives);
  },

  getRelative: (id) => {
    return get().relatives.find(r => r.id === id);
  },

  updateAvatar: (id, avatar) => {
    const relatives = get().relatives.map(r =>
      r.id === id ? { ...r, avatar: { ...r.avatar, ...avatar }, updatedAt: new Date().toISOString() } : r
    );
    set({ relatives });
    storageService.saveRelatives(relatives);
  },

  updateChatStyle: (id, chatStyle) => {
    const relatives = get().relatives.map(r =>
      r.id === id ? { ...r, chatStyle, updatedAt: new Date().toISOString() } : r
    );
    set({ relatives });
    storageService.saveRelatives(relatives);
  }
}));
