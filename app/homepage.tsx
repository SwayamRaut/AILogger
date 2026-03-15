import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AISummary = {
    meetingSummary: string;
    painPoints: string;
    actionItems: string;
    recommendedNextStep: string;
};

//Object definition for each Visit Log because we cannot directly read custom object types from local storage we need to explicity define it
type Visit = {
        id: string;
        customerName: string;
        contactPerson: string;
        location: string;
        visitDateTime: string;
        rawNotes: string;
        outcomeStatus: string;
        followUpDateTime: string | null;
        syncStatus: string;
        aiSummary: AISummary | null;
};

export default function HomePage() {

    

    //We need to retrieve the data in the local storage but we cannot make the screen component async so we load data using a useEffect
    const [visits, setVisits] = useState<Visit[]>([]);
    const router = useRouter();

    
    
    useEffect(() => {
        const loadVisits = async () => {
            const data = await AsyncStorage.getItem('visits');
            if (data) {
                setVisits(JSON.parse(data));
            }
        };
        loadVisits();
    }, []);


    //FlatList here is doing the automatic iteration while assigning unique key for each Item.
    //Then when we choose a card to click on, it is passing the id of the Card to the next page which is viewlog.tsx where we in detail look at each log
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Visit Logs</Text>

            <FlatList
                data={visits}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => router.push(`/viewlog?id=${item.id}` as any)}>
                        <Text style={styles.cardTitle}>{item.customerName}</Text>
                        <Text>{new Date(item.visitDateTime).toLocaleString()}</Text>
                        <Text numberOfLines={1}>{item.rawNotes}</Text>
                        <Text>Status: {item.syncStatus}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
                        No visits yet. Tap + to create one.
                    </Text>
                }
            />

            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/createlog')}>
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

        </View>
    );






}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    card: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#007AFF',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },


});