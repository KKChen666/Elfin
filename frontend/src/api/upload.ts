import client from './client';
import { BackendRelative } from './relatives';

export const uploadApi = {
  uploadAvatarImage(relativeId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<BackendRelative>(
      `/relatives/${relativeId}/avatar-image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};
