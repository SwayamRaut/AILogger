# Architecture Notes

## Data Flow

The app follows an offline first approach. When a user creates or edits a visit log, the data is saved to local storage on the device first. After the local save completes, the app attempts to sync that data to Firebase Firestore in the cloud. The sync status of each visit is tracked and displayed to the user so they always know if their data has been backed up or not.

When viewing a visit, the app reads from local storage to display the details. The AI summary feature sends the raw meeting notes to a Firebase Cloud Function which forwards the request to the Claude API. The structured response is then saved back into local storage alongside the visit data.

The general flow looks like this: User Input > Local Storage (AsyncStorage) > Firebase Firestore (sync) and separately User triggers AI > Firebase Cloud Function > Claude API > Response saved to Local Storage.

## Local Persistence Approach

I used AsyncStorage which is a key value storage system built for React Native. It works similarly to SharedPreferences in Android. All visit logs are stored under a single key called "visits" as a JSON array. Each visit is an object containing all the form fields, the sync status, and the AI summary if one has been generated.

I chose AsyncStorage because it is simple, works well with Expo, and handles the offline requirement without needing a full local database like SQLite. For this use case where we are storing a list of visit objects, key value storage is sufficient.

## Sync Approach

Syncing is handled by a custom hook called utilizesync.ts. When a visit is created or edited, the app calls the syncVisit function which takes the visit object and pushes it directly to Firebase Firestore using setDoc. The sync status goes through these stages: draft when first created locally, syncing when the upload starts, synced when it succeeds, and failed if something goes wrong.

If a sync fails the user can tap a Retry Sync button on the visit detail screen which calls the same syncVisit function again. The sync status is updated in local storage at each stage so the homepage always shows the current state of each visit.

I used setDoc instead of addDoc because it lets me use the visit ID as the document ID in Firestore. This means both create and edit operations use the same function since setDoc will create a new document or overwrite an existing one.

## AI Integration Approach

The AI feature uses the Claude API through Anthropic. The API key is not stored in the app itself. Instead it is stored as a secret in a Firebase Cloud Function. The app makes a POST request to the cloud function URL with the raw meeting notes embedded in a prompt. The cloud function then forwards this to the Claude API and returns the response.

The prompt instructs Claude to return a structured JSON object with four specific fields: meetingSummary, painPoints, actionItems, and recommendedNextStep. The app parses this JSON response and saves it as part of the visit object in local storage. If the JSON parsing fails for any reason there is a fallback that prevents the app from crashing.

This approach keeps the API key secure on the server side and means the app never has direct access to it. It also means the AI feature works through a single endpoint that could be rate limited or modified without updating the app.

## Tools Used

React Native with Expo for the mobile framework. TypeScript for type safety across the codebase. AsyncStorage for local data persistence. Firebase Firestore for cloud sync and backup. Firebase Cloud Functions for securely proxying requests to the Claude API. Claude API (Haiku model) for generating meeting summaries. VS Code as the code editor. Claude AI assistant for help with learning React Native patterns and debugging since I was transitioning from Android Studio and Java.

## What I Manually Corrected From AI Generated Code

I had to fix several things that the AI got wrong or that did not work in practice.

The DateTimePicker mode was initially set to datetime which caused a crash on Android with a "cannot read property dismiss of undefined" error. I changed it to date mode to get it working.

The AI helper function was originally sending the notes and prompt as separate fields in the request body but my Firebase function only reads the prompt field. I had to combine the notes into the prompt string itself.

The initial AI prompt was too vague and Claude was just echoing back the meeting notes instead of generating a structured summary. I had to rewrite the prompt to be very specific about returning only a JSON object with exact field names and no extra text.

The sync function was originally reading from local storage to find the visit before syncing which was unnecessary since we already had the visit object available. I simplified it to accept the visit object directly.

Component function names were lowercase which works but is bad practice in React. I corrected these to start with uppercase letters.

There were duplicate state update calls in the handleSave function that I had to clean up. The AI generated the setVisit and setIsEditing calls in two places inside the same function.

Several small bugs like a missing hash in a color value, a wrong variable name in a TextInput value prop, and a date picker closing the wrong picker state variable were all caught and fixed manually during development.
