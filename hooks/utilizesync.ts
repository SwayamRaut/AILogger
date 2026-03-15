import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// There are 2 cases. We sync when we CREATE or EDIT. Either case, we take all the output for 1 visit log and sync it to Firestore 
export const syncVisit = async (visit: any) => {
    await updateSyncStatus(visit.id, 'syncing');

    try {
        await setDoc(doc(db, 'visits', visit.id), { ...visit, syncStatus: 'synced' });
        await updateSyncStatus(visit.id, 'synced');
        return 'synced';
    } catch (error) {
        await updateSyncStatus(visit.id, 'failed');
        return 'failed';
    }
};

// I have written a helper function to update only the sync status in local storage nothing else
const updateSyncStatus = async (visitId: string, status: string) => {
    const data = await AsyncStorage.getItem('visits');
    if (data) {
        const visits = JSON.parse(data);
        const index = visits.findIndex((v: any) => v.id === visitId);
        if (index !== -1) {
            visits[index].syncStatus = status;
            await AsyncStorage.setItem('visits', JSON.stringify(visits));
        }
    }
};