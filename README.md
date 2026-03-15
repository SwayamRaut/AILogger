# AILogger

React Native Demo Assignment: AI Sales Visit Logger

A mobile app built for field sales reps to log their customer visits and get AI powered follow up summaries. Built with React Native and Expo.

 

## What this app does

 

Sales reps can log visits with customers, track meeting notes, and use AI to generate structured summaries from their raw notes. Everything saves locally first so it works offline, then syncs to Firebase when there is internet.

 

## How to set it up

 

Make sure you have Node.js installed and an Expo account. You also need Android Studio if you want to run it on an emulator.

 

1. Clone this repo and go into the project folder

 

git clone https://github.com/YOUR_USERNAME/AILogger.git

cd AILogger

 

2. Install all the dependencies

 

npm install

 

3. Install the Expo CLI if you do not have it

 

npm install -g eas-cli

 

4. Build the development version for Android

 

eas build --platform android --profile development

 

5. Once the build finishes, download the APK and install it on your emulator or phone

 

6. Start the dev server

 

npx expo start --dev-client

 

7. Open the app on your device or emulator

 

## Test account

 

Email: test@test.com

Password: test123

 

## Tech stack

 

React Native with Expo for the mobile app. TypeScript for type safety. AsyncStorage for local persistence. Firebase Firestore for cloud sync. Firebase Cloud Functions for the AI integration which calls the Claude API to generate meeting summaries.

 

## Project structure

 

The app folder contains all the screens. index.tsx is the login screen, homepage.tsx shows all visit logs, createlog.tsx is the form to create a new visit, and viewlog.tsx shows the full details where you can also edit and generate AI summaries.

 

The hooks folder has the business logic. firebase.ts handles the Firebase connection, useSync.ts handles syncing visits to Firestore, and ai-helper-logic.ts handles calling the AI to generate summaries.

 

## Features

 

You can create visit logs with customer name, contact person, location, date, meeting notes, outcome status, and follow up date. Everything saves to the phone first so it works without internet.

 

Each visit syncs to Firebase and shows its status as draft, syncing, synced, or failed. If sync fails you can retry it.

 

The AI summary feature takes your raw meeting notes and generates a structured breakdown with meeting summary, pain points, action items, and recommended next steps.

 

You can edit any visit from the detail screen. All fields become editable and changes save locally then sync to Firebase.

 

## Notes

 

The Firestore database is currently in test mode for development purposes. In a production environment this would use proper security rules to restrict access based on authenticated users.

