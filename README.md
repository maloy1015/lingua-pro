# LINGUA PRO — Premium Education Platform

Full React + Firebase education platform: 330 real lessons (210 English, 120 Math), exam preparation (CEFR/IELTS/TOEFL), 4 skills, progress tracking, PWA and automated video production pipeline.

## Stack
- React 18 + Vite + JavaScript
- Tailwind CSS (dark navy, neon purple/blue, glassmorphism)
- Firebase Auth (email/password + Google), Firestore, Storage, Cloud Messaging
- Firebase Cloud Functions (video generation & notifications)
- FFmpeg + Sharp + AI TTS (Google Cloud TTS / ElevenLabs configurable)
- PWA (manifest, service worker, offline, install, update)

## Content (all original, generated in-app)
- **English**: Starter, A1, A2, B1, B2, C1, C2 — 30 unique lessons each (210 total). Each lesson has its own script, narrated slides, subtitles (VTT), vocabulary, grammar, examples, exercises, 6–8 quiz questions and progress tracking.
- **Math**: Mathematics from Zero, Elementary, Intermediate, Advanced — 30 unique lessons each (120 total) with concept, worked example, steps, exercises and quiz.
- **Exams**: CEFR (A1–C2), IELTS (Listening, Reading, Writing Task 1/2, Speaking 1–3, Grammar & Vocabulary), TOEFL (Reading, Listening, Speaking, Writing, Academic Vocabulary) with realistic tasks and automatic scoring where applicable.
- **Skills**: Writing (editor + rubric + word count, saved for review), Speaking (microphone recording to Storage + history), Listening (audio + auto-scored questions), Reading (passage + auto-scored questions).
- *Note*: Automatic AI grading for writing/speaking is not claimed; responses are saved and can be reviewed by an instructor/admin.

## Automated Video Generation (no manual upload)
1. Admin opens **Admin → Video zavodi**, selects course/level and voice, clicks **30 darsni navbatga qo‘shish** (or single lesson). Bulk queue supported.
2. A `videoJobs` document is created (status: pending → processing → completed/failed) with retry.
3. Cloud Function `processVideoJob` picks the job and: generates original narration via configurable TTS (Google Cloud TTS or ElevenLabs), renders animated PNG slides with Sharp, aligns subtitles (SRT/VTT), composes MP4 with FFmpeg, uploads MP4/audio/subtitles to Firebase Storage, and writes the public URL to `lessons/{id}.video` in Firestore.
4. Lesson player automatically displays the generated MP4 when `video.url` is set; otherwise it shows a narrated slide presentation with browser TTS + subtitles as a preview (not a fake URL).
5. Voices: English female, English male, Uzbek female, Uzbek male (see configuration below).

## Setup

### 1. Frontend
```bash
npm install
cp .env.example .env   # fill Firebase keys
npm run dev
npm run build
```

### 2. Firebase Console
- **Authentication**: enable Email/Password and Google. Add your Render domain to Authorized domains.
- **Firestore**: create database and publish `firestore.rules`.
- **Storage**: enable and publish `storage.rules`.
- **Cloud Messaging**: generate Web Push certificate (VAPID key) and set `VITE_FIREBASE_VAPID_KEY`.

### 3. Admin account
1. Register normally in the app.
2. In Firestore Console set `users/{uid}.role = "admin"`.

### 4. Seed content to Firestore
Login as admin → **Admin → Umumiy → Katalogni Firestore’ga yuklash (330 dars)**. This creates all course and lesson metadata documents (videos remain `not-generated` until queued).

### 5. Cloud Functions (video pipeline & push)
```bash
cd functions
npm install
# configure TTS (one of):
#   Google Cloud TTS: set Application Default Credentials for the project
#   ElevenLabs: set ELEVENLABS_API_KEY and voice IDs in functions env
firebase functions:secrets:set ELEVENLABS_API_KEY   # if using ElevenLabs
firebase deploy --only functions
```
Required env/secrets for functions: `TTS_PROVIDER` (`google`|`elevenlabs`), Google ADC or ElevenLabs keys (see `functions/.env.example`). FFmpeg/ffprobe are bundled via `ffmpeg-static`/`ffprobe-static`. If your Cloud Functions runtime cannot execute bundled binaries, deploy with a custom image/layer that provides FFmpeg.

### 6. Render deploy
Repo already contains `render.yaml` (static site). In Render dashboard set env vars: `VITE_FIREBASE_*` and `VITE_FIREBASE_VAPID_KEY`. Build: `npm install && npm run build`, publish `dist`. SPA rewrite `/* -> /index.html` is configured.

## Security
- Admin-only writes for courses/lessons/tests/video jobs (enforced in `firestore.rules`).
- Users can read/write only their own progress/attempts/notifications/tokens.
- No secrets committed; all keys via env vars. `.env` is gitignored.

## Project structure (key)
- `src/data/*Seeds*.js` — 330 original lesson seeds
- `src/lib/content.js` — script/slide/subtitle/quiz builder
- `src/pages/*` — Dashboard, Courses, Lesson player, Exams, Skills, Placement, Results, Notifications, Admin
- `src/services/*` — Firestore, progress, video jobs, notifications
- `functions/index.mjs` — `processVideoJob`, `sendNotification`, `dailyReminders`