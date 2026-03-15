import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { syncVisit } from '../hooks/utilizesync';


export default function CreateLog() {

    // user inputs
    const [customerName, setCustomerName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [location, setLocation] = useState('');

    //visit date input process
    const [visitDateTime, setVisitDateTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [rawNotes, setRawNotes] = useState('');

    //outcome status input process
    const outcomeOptions = ['Successful', 'Follow-up needed', 'Not interested'];
    const [outcomeStatus, setOutcomeStatus] = useState('');
    const [showOutcomePicker, setShowOutcomePicker] = useState(false);

    //follow up input process
    const [followUpDateTime, setFollowUpDateTime] = useState(new Date());
    const [showDatePicker2, setShowDatePicker2] = useState(false);

    

    const router = useRouter(); //Page transition fucnction


    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
            if (selectedDate) {
                setVisitDateTime(selectedDate);
            }
    };

    //Only if follow up is needed on the client then we set follow up date but we account this in the JSX UI return output
    const onDateChange2 = (event: any, selectedDate?: Date) => {
        setShowDatePicker2(false);
            if (selectedDate) {
                setFollowUpDateTime(selectedDate);
            }
    };

    //async describes a function that takes a certain amount of time to complete (like a delay)
    const logCreate = async () => {
        if (!customerName.trim()) {
            alert('Customer name is required');
            return;
        }
        if (!contactPerson.trim()) {
            alert('Contact person is required');
            return;
        }
        if (!location.trim()) {
            alert('Location is required');
            return;
        }
        if (!rawNotes.trim()) {
            alert('Raw notes are required');
            return;
        }
        if (!outcomeStatus) {
            alert('Please select an outcome status');
            return;
        }
        if (outcomeStatus === 'Follow-up needed' && !followUpDateTime) {
            alert('Follow-up date is required');
            return;
        }

        // Store the data in local storage as a Visit Log Object instead of a set of data of 7. This is for more easier and efficient parsing when we will read this data in the home page
        const newVisit = {
            id: Date.now().toString(),
            customerName,
            contactPerson,
            location,
            visitDateTime: visitDateTime.toISOString(),
            rawNotes,
            outcomeStatus,
            followUpDateTime: outcomeStatus === 'Follow-up needed' ? followUpDateTime.toISOString() : null,
            syncStatus: 'draft',
            aiSummary: null,
        };

        // We need to get existing visits because we cannot directly add in the new visit object. We have to combine them and only then we can push it all back in the local storage
        const existing = await AsyncStorage.getItem('visits');
        const visits = existing ? JSON.parse(existing) : [];
        visits.push(newVisit);

        // Save all of it to the local storage now
        await AsyncStorage.setItem('visits', JSON.stringify(visits));

        //Sync to the firestore database
        await syncVisit(newVisit);

        router.replace('/homepage');
    }
    
    // As long as none of the fields are empty we have validated and can continue returning the JSX

    return (
        <View style={styles.container}>
          <Text style={styles.title}>Create Visit Log</Text>
    
          <TextInput
            style={styles.input}
            placeholder="Customer Name"
            value={customerName}
            onChangeText={setCustomerName}
            keyboardType="default"
            autoCapitalize="words"
          />
    
          <TextInput
            style={styles.input}
            placeholder="Contact Person"
            value={contactPerson}
            onChangeText={setContactPerson}
            keyboardType="default"
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
            keyboardType="default"
            autoCapitalize="sentences"
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text>{visitDateTime.toLocaleString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
                value={visitDateTime}
                mode="date"
                onChange={onDateChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Raw Meeting Notes"
            value={rawNotes}
            onChangeText={setRawNotes}
            keyboardType="default"
            autoCapitalize="sentences"
          />

          <TouchableOpacity onPress={() => setShowOutcomePicker(true)} style={styles.input}>
            <Text>{outcomeStatus || 'Select outcome...'}</Text>
          </TouchableOpacity>

          {showOutcomePicker && (
            <View style={styles.dropdown}>
                {outcomeOptions.map((option) => (
                    <TouchableOpacity
                        key={option}
                        onPress={() => {
                            setOutcomeStatus(option);
                            setShowOutcomePicker(false);
                        }}
                        style={styles.dropdownItem}
                    >

                        <Text>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
          )}

          {outcomeStatus === 'Follow-up needed' && (
            <TouchableOpacity onPress={() => setShowDatePicker2(true)} style={styles.input}>
                <Text>{followUpDateTime.toLocaleString()}</Text>
            </TouchableOpacity>
          )}

          {showDatePicker2 && (
            <DateTimePicker
                value={followUpDateTime}
                mode="date"
                onChange={onDateChange2}
            />
          )}


    
          <TouchableOpacity style={styles.button} onPress={logCreate}>
            <Text style={styles.buttonText}>Create Log</Text>
          </TouchableOpacity>
        </View>

        
      );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: '600',
    },

    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    dropdownItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    }
});