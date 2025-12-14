import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

export const uploadTripPhotos = async (tripId: string, files: File[]): Promise<string[]> => {
  if (!storage) {
    return [];
  }
  const urls: string[] = [];
  for (const file of files) {
    const ts = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `trips/${tripId}/${ts}-${safeName}`;
    const r = ref(storage, path);
    await uploadBytes(r, file, { contentType: file.type });
    const url = await getDownloadURL(r);
    urls.push(url);
  }
  return urls;
};
