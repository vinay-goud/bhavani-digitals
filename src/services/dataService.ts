import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";

// Generic fetch function
export async function getData(collectionName: string) {
    try {
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
}

export async function getDataById(collectionName: string, id: string) {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log(`No such document in ${collectionName} with id: ${id}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching document ${id} from ${collectionName}:`, error);
        return null;
    }
}

// Generic save function
export async function saveData(collectionName: string, id: string, data: any) {
    try {
        await setDoc(doc(db, collectionName, id), data);
        return { success: true, id };
    } catch (error) {
        console.error(`Error saving data to ${collectionName}:`, error);
        return { success: false, error: (error as Error).message };
    }
}

// Generic delete function
export async function deleteData(collectionName: string, id: string) {
    try {
        await deleteDoc(doc(db, collectionName, id));
        return { success: true };
    } catch (error) {
        console.error(`Error deleting data from ${collectionName}:`, error);
        return { success: false, error: (error as Error).message };
    }
}

// Batch update for arrays
export async function saveOrderedData(collectionName: string, data: any[]) {
     const batch = writeBatch(db);
     data.forEach(item => {
         const docRef = doc(db, collectionName, item.id);
         batch.set(docRef, item);
     });
     try {
        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error(`Error batch saving to ${collectionName}:`, error);
        return { success: false, error: (error as Error).message };
    }
}

// Upload file from data URL
export async function uploadFile(path: string, dataUrl: string) {
    const storageRef = ref(storage, path);
    try {
        const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return { success: true, url: downloadUrl };
    } catch (error) {
        console.error(`Error uploading file to ${path}:`, error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteFile(path: string) {
    const storageRef = ref(storage, path);
    try {
        await deleteObject(storageRef);
        return { success: true };
    } catch (error) {
        console.error(`Error deleting file from ${path}:`, error);
        return { success: false, error: (error as Error).message };
    }
}

// Specific functions for gallery which is nested
export async function getGalleryData() {
    const defaultGallery = {
      weddings: { name: 'Weddings', items: [] },
      'pre-weddings': { name: 'Pre-Weddings', items: [] },
      receptions: { name: 'Receptions', items: [] },
      others: { name: 'Others', items: [] },
    };
    try {
        const docRef = doc(db, 'content', 'gallery');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return defaultGallery;
    } catch (error) {
        console.error("Error fetching gallery data:", error);
        return defaultGallery;
    }
}

export async function saveGalleryData(data: any) {
    try {
        await setDoc(doc(db, 'content', 'gallery'), data);
        return { success: true };
    } catch (error) {
        console.error(`Error saving gallery data:`, error);
        return { success: false, error: (error as Error).message };
    }
}

// Live Events Functions
export type LiveEvent = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  status: 'upcoming' | 'live' | 'ended';
  scheduledFor?: Date;
};

export async function getEventData(id: string): Promise<LiveEvent | null> {
  return await getDataById('events', id) as LiveEvent | null;
}

export async function saveEventData(id: string, data: Omit<LiveEvent, 'id'>) {
  return await saveData('events', id, data);
}

export async function getAllEvents() {
  return await getData('events') as LiveEvent[];
}
