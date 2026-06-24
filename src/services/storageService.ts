import { Relative, Reminder } from '../types';

const RELATIVES_KEY = 'companion_app_relatives';
const REMINDERS_KEY = 'companion_app_reminders';

export const storageService = {
  getRelatives(): Relative[] {
    const data = localStorage.getItem(RELATIVES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveRelatives(relatives: Relative[]): void {
    localStorage.setItem(RELATIVES_KEY, JSON.stringify(relatives));
  },

  addRelative(relative: Relative): void {
    const relatives = this.getRelatives();
    relatives.push(relative);
    this.saveRelatives(relatives);
  },

  updateRelative(updated: Relative): void {
    const relatives = this.getRelatives();
    const index = relatives.findIndex(r => r.id === updated.id);
    if (index !== -1) {
      relatives[index] = updated;
      this.saveRelatives(relatives);
    }
  },

  deleteRelative(id: string): void {
    const relatives = this.getRelatives().filter(r => r.id !== id);
    this.saveRelatives(relatives);
  },

  getReminders(): Reminder[] {
    const data = localStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveReminders(reminders: Reminder[]): void {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }
};
