import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { generateAISummary } from '../hooks/ai-helper-logic';
import { syncVisit } from '../hooks/utilizesync';

//The AI summary is stored as an object containing the following fields so it is easy to parse and display
type AISummary = {
    meetingSummary: string;
    painPoints: string;
    actionItems: string;
    recommendedNextStep: string;
};

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

export default function ViewLog() {
    const { id } = useLocalSearchParams();  //We receive the id of the Visit object from homepage
    const [visit, setVisit] = useState<Visit | null>(null);

    const [isEditing, setIsEditing] = useState(false); //The user will click on the Edit button and then it will show TextInputs instead of Text Labels
    
    //Editing state variables
    const [editCustomerName, setEditCustomerName] = useState('');
    const [editContactPerson, setEditContactPerson] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editVisitDateTime, setEditVisitDateTime] = useState(new Date());
    const [showEditDatePicker, setShowEditDatePicker] = useState(false);
    const [editRawNotes, setEditRawNotes] = useState('');
    const [editOutcomeStatus, setEditOutcomeStatus] = useState('');
    const [editFollowUpDateTime, setEditFollowUpDateTime] = useState(new Date());
    const [showEditOutcomePicker, setShowEditOutcomePicker] = useState(false);
    const [showEditFollowUpPicker, setShowEditFollowUpPicker] = useState(false);
    const outcomeOptions = ['Successful', 'Follow-up needed', 'Not interested'];

    const handleGenerateSummary = async () => {
        if (!visit) return;
            const summary = await generateAISummary(visit.id, visit.rawNotes);
            setVisit({ ...visit, aiSummary: summary });
    };

    //Read through the local storage to find the Visit object
    useEffect(() => {
        const loadVisit = async () => {
            const data = await AsyncStorage.getItem('visits');
            if (data) {
                const visits = JSON.parse(data);
                const found = visits.find((v: Visit) => v.id === id);
                setVisit(found);
            }
        };
        loadVisit();
    }, []);

    if (!visit) return <Text>Loading...</Text>;


    //For editing we need to refill the text inputs so that the user can edit it
    const handleEdit = () => {
        if (!visit) return;
        setEditCustomerName(visit.customerName);
        setEditContactPerson(visit.contactPerson);
        setEditLocation(visit.location);
        setEditVisitDateTime(new Date(visit.visitDateTime));
        setEditRawNotes(visit.rawNotes);
        setEditOutcomeStatus(visit.outcomeStatus);
        if (visit.followUpDateTime) {
            setEditFollowUpDateTime(new Date(visit.followUpDateTime));
        }
        setIsEditing(true);
    };

    //Save the information to local storage once user has finished editing.
    //We do need to get the whole array from the storage since we are not adding, we are editing the array
    const handleSave = async () => {
        if (!visit) return;

        const updatedVisit = {
            ...visit,
            customerName: editCustomerName,
            contactPerson: editContactPerson,
            location: editLocation,
            visitDateTime: editVisitDateTime.toISOString(),
            rawNotes: editRawNotes,
            outcomeStatus: editOutcomeStatus,
            followUpDateTime: editOutcomeStatus === 'Follow-up needed' ? editFollowUpDateTime.toISOString() : null,
        };

        const data = await AsyncStorage.getItem('visits');
        if (data) {
            const visits = JSON.parse(data);
            const index = visits.findIndex((v: Visit) => v.id === visit.id);
            visits[index] = updatedVisit;
            await AsyncStorage.setItem('visits', JSON.stringify(visits));
        }
        
        //Sync to the firestore database
        setVisit(updatedVisit);
        setIsEditing(false);

        const status = await syncVisit(updatedVisit);
        setVisit({ ...updatedVisit, syncStatus: status || 'failed' });
    };


    return (
        <ScrollView style={styles.container}>
        <Text style={styles.title}>Visit Details</Text>
        <View style={styles.container}>

            <Text style={styles.label}>Customer Name</Text>
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={editCustomerName}
                    onChangeText={setEditCustomerName}
                />
            ) : (
                <Text style={styles.value}>{visit.customerName}</Text>
            )}


            <Text style={styles.label}>Contact Person</Text>
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={editContactPerson}
                    onChangeText={setEditContactPerson}
                />
            ) : (
                <Text style={styles.value}>{visit.contactPerson}</Text>
            )}

            <Text style={styles.label}>Location</Text>
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={editLocation}
                    onChangeText={setEditLocation}
                />
            ) : (
                <Text style={styles.value}>{visit.location}</Text>
            )}

            <Text style={styles.label}>Visit Date</Text>
            {isEditing ? (
                <TouchableOpacity onPress={() => setShowEditDatePicker(true)} style={styles.input}>
                    <Text>{editVisitDateTime.toLocaleString()}</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.value}>{new Date(visit.visitDateTime).toLocaleString()}</Text>
            )}

            {showEditDatePicker && (
                <DateTimePicker
                    value={editVisitDateTime}
                    mode="datetime"
                    onChange={(event, date) => {
                        setShowEditDatePicker(false);
                        if (date) setEditVisitDateTime(date);
                    }}
                />
            )}
            

            <Text style={styles.label}>Meeting Notes</Text>
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={editRawNotes}
                    onChangeText={setEditRawNotes}
                />
            ) : (
                <Text style={styles.value}>{visit.rawNotes}</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleGenerateSummary}>
                <Text style={styles.buttonText}>Generate AI Summary</Text>
            </TouchableOpacity>

            {visit.aiSummary && (
                <>
                    <Text style={styles.label}>Meeting Summary</Text>
                    <Text style={styles.value}>{visit.aiSummary.meetingSummary}</Text>

                    <Text style={styles.label}>Pain Points</Text>
                    <Text style={styles.value}>{visit.aiSummary.painPoints}</Text>

                    <Text style={styles.label}>Action Items</Text>
                    <Text style={styles.value}>{visit.aiSummary.actionItems}</Text>

                    <Text style={styles.label}>Recommended Next Step</Text>
                    <Text style={styles.value}>{visit.aiSummary.recommendedNextStep}</Text>
                </>
            )}

            <Text style={styles.label}>Outcome</Text>
            {isEditing ? (
                <TouchableOpacity onPress={() => setShowEditOutcomePicker(true)} style={styles.input}>
                    <Text>{editOutcomeStatus || 'Select outcome...'}</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.value}>{visit.outcomeStatus}</Text>
            )}

            {showEditOutcomePicker && (
                <View style={styles.dropdown}>
                    {outcomeOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            onPress={() => {
                                setEditOutcomeStatus(option);
                                setShowEditOutcomePicker(false);
                            }}
                            style={styles.dropdownItem}
                        >
                            <Text>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={styles.label}>Follow-up Date</Text>
            {isEditing ? (
                editOutcomeStatus === 'Follow-up needed' ? (
                    <TouchableOpacity onPress={() => setShowEditFollowUpPicker(true)} style={styles.input}>
                        <Text>{editFollowUpDateTime.toLocaleString()}</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.value}>Not required</Text>
                )
            ) : (
                <Text style={styles.value}>
                    {visit.followUpDateTime ? new Date(visit.followUpDateTime).toLocaleString() : 'N/A'}
                </Text>
            )}

            {showEditFollowUpPicker && (
                <DateTimePicker
                    value={editFollowUpDateTime}
                    mode="datetime"
                    onChange={(event, date) => {
                        setShowEditFollowUpPicker(false);
                        if (date) setEditFollowUpDateTime(date);
                    }}
                />
            )}

            {isEditing ? (
                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleEdit}>
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
            )}

            {visit.syncStatus === 'failed' && (
                <TouchableOpacity style={styles.button} onPress={async () => {
                    const status = await syncVisit(visit);
                    setVisit({ ...visit, syncStatus: status || 'failed' });
                }}>
                    <Text style={styles.buttonText}>Retry Sync</Text>
                </TouchableOpacity>
            )}


            <Text style={styles.label}>Sync Status</Text>
            <Text style={styles.syncStatus}>{visit.syncStatus}</Text>
        </View>
        </ScrollView>
    );


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
        marginTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
    value: {
        fontSize: 16,
        marginTop: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        marginTop: 4,
    },
    syncStatus: {
        fontSize: 14,
        marginTop: 12,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginTop: 4,
        backgroundColor: '#fff',
    },
    dropdownItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});