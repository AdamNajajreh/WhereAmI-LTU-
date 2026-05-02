# LTU Campus Navigator — Mobile App

React Native (Expo) app that identifies LTU campus buildings from a photo using a MobileNetV2 model served via a FastAPI backend on AWS EC2.

## Features

- Live camera scan or gallery upload
- AI prediction with confidence score
- Recent scan history (last 3 results)
- Dark / light mode
- Health check before every prediction with a clear error message if the server is down

## Prerequisites

- Node.js 18+
- Expo Go installed on your phone, or an iOS simulator via Xcode

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Create your environment file

   ```bash
   cp .env.example .env
   ```

   Open `.env` and set `EXPO_PUBLIC_API_URL` to the backend server address:

   ```
   EXPO_PUBLIC_API_URL=http://<your-ec2-ip>:8000
   ```

3. Start the dev server

   ```bash
   npx expo start
   ```

   Scan the QR code with Expo Go, or press `i` to open the iOS simulator.

## Sharing with others (no build required)

```bash
npx expo start --tunnel
```

Classmates scan the QR code with Expo Go — no Apple Developer account needed.

## Project structure

```
app/
  _layout.tsx   # Tab navigator + font loading
  index.tsx     # Dashboard (scan history, quick actions)
  scan.tsx      # Camera, loading, and result screens
  settings.tsx  # Dark mode toggle, model info
  about.tsx     # Project info
```

## Backend

The backend is a FastAPI server running in Docker on AWS EC2. See [`../backend/`](../backend/) for the server code and Dockerfile.
