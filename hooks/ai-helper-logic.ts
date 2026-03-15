import AsyncStorage from '@react-native-async-storage/async-storage';

export const generateAISummary = async (visitId: string, rawNotes: string) => {
    // We use Claude API key to generate AI summary so we have stored it in a Firebase function
    // We make a POST request to the Firebase function with the notes embedded in the prompt
    const response = await fetch('https://us-central1-gazelyapi-2e5d0.cloudfunctions.net/callAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: `You are a sales meeting analyst. Given the following raw meeting notes, respond with ONLY a valid JSON object. Do not include any other text, markdown, or explanation. The JSON must have exactly these 4 fields:

{
  "meetingSummary": "2-3 sentence summary of the meeting",
  "painPoints": "customer pain points discussed",
  "actionItems": "specific action items from the meeting",
  "recommendedNextStep": "what should happen next"
}

Raw meeting notes: ${rawNotes}`
        }),
    });

    // Claude API returns a JSON string then response.json() parses it as an object
    const raw = await response.json();
    console.log('Claude raw response:', JSON.stringify(raw));

    // Claude's response structure is { content: [{ text: "..." }] } so we extract the text first then parse it as JSON
    const text = raw.content?.[0]?.text || '';
    console.log('Extracted text:', text);
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = {
            meetingSummary: text,
            painPoints: 'Could not parse',
            actionItems: 'Could not parse',
            recommendedNextStep: 'Could not parse'
        };
    }

    // Update the visit in local storage so that the AI summary is also included in there
    const existing = await AsyncStorage.getItem('visits');
    if (existing) {
        const visits = JSON.parse(existing);
        const index = visits.findIndex((v: any) => v.id === visitId);
        if (index !== -1) {
            visits[index].aiSummary = data;
            await AsyncStorage.setItem('visits', JSON.stringify(visits));
        }
    }

    return data;
};
