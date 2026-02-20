# Classroom Chat Interface

A fully styled school activity portal web app with:

- Animated landing page with smooth vertical scrolling
- Password gate (demo password: `0327`)
- Profile selection (Alli / Eddie)
- School activity dashboard + compact team update feed
- Compact feed with reactions, edit/delete, timestamps, and emoji support
- Light/Dark theme toggle with CSS variable-driven theming
- Framer Motion + GSAP animation support
- Zustand state management and persistence

## Stack

- **React + TypeScript + Vite**
- **Tailwind CSS**
- **Framer Motion**
- **GSAP**
- **Zustand**
- **Day.js**

## Quick Start

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Run production server locally (same entrypoint Railway uses):

```bash
npm run build
npm run start
```

## Deploy on Railway

This repo is configured for Railway out of the box.

### Included Railway-ready files

- `railway.json` (deploy config + healthcheck path)
- `server.js` (Express static server for `dist`)
- `package.json` `start` script (`node server.js`)

### One-click deployment steps

1. Push this repo/branch to GitHub.
2. In Railway, create **New Project → Deploy from GitHub Repo**.
3. Select this repository.
4. Railway will:
   - run `npm install`
   - run `npm run build`
   - run `npm run start`
5. Once deployed, open the generated Railway domain.

### Healthcheck

- Endpoint: `/health`
- Configured in `railway.json`

### Environment variables

- No required env vars for demo/local state mode.
- Railway provides `PORT` automatically; `server.js` reads it.

## Password Flow

Users must scroll to the bottom panel and enter the password.

- Correct: `0327` → enters profile selection.
- Incorrect: panel shakes and shows error feedback.

Implementation notes:

- Password is verified via SHA-256 hash in `src/utils/hash.ts`.
- Only gate state (`passwordUnlocked`) is persisted in local storage.

## Project Structure

```text
.
├─ src/
│  ├─ components/
│  │  ├─ landing/
│  │  │  ├─ HeroSection.tsx
│  │  │  ├─ AboutSection.tsx
│  │  │  ├─ ProfilePreviewSection.tsx
│  │  │  ├─ PasswordPanel.tsx
│  │  │  └─ LandingPage.tsx
│  │  ├─ profile/
│  │  │  └─ ProfileSelection.tsx
│  │  ├─ chat/
│  │  │  ├─ ChatHeader.tsx
│  │  │  ├─ MessageList.tsx
│  │  │  ├─ MessageBubble.tsx
│  │  │  ├─ TypingIndicator.tsx
│  │  │  ├─ ChatInput.tsx
│  │  │  └─ ChatRoom.tsx
│  │  └─ theme/
│  │     └─ ThemeToggle.tsx
│  ├─ data/profiles.ts
│  ├─ hooks/
│  │  ├─ useThemeEffect.ts
│  │  └─ useAutoScroll.ts
│  ├─ services/realtimeAdapter.ts
│  ├─ store/useAppStore.ts
│  ├─ types/chat.ts
│  ├─ utils/
│  │  ├─ hash.ts
│  │  └─ time.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
└─ tailwind.config.ts
```

## Features Checklist

- [x] Landing page with educational theme
- [x] Smooth vertical scroll sections
- [x] Hero with animated book/school icons (GSAP)
- [x] About section
- [x] Alli/Eddie profile preview section
- [x] Bottom password entry section
- [x] Wrong password shake animation
- [x] User profile selection screen
- [x] Responsive chat UI
- [x] Auto scroll to newest message
- [x] Sender/receiver bubble styles
- [x] Typing indicator
- [x] Message reactions
- [x] Edit/Delete messages
- [x] Timestamps + date separators
- [x] Emoji support
- [x] Light/Dark theme toggle

## Optional Backend Hook Integration

The app currently runs in local/demo mode. To connect real realtime messaging:

1. Implement a backend adapter that follows `RealtimeAdapter` in:
   - `src/services/realtimeAdapter.ts`
2. Replace `localRealtimeAdapter` usage in `src/components/chat/ChatRoom.tsx`.

Recommended backend options:

- Firebase Firestore + Presence
- Socket.io server
- Supabase Realtime

## Open-source UI Inspiration / Resources

- Framer Motion examples: https://www.framer.com/motion/examples/
- GSAP docs and patterns: https://gsap.com/docs/v3/
- React chat UI ideas: https://github.com/chatscope/chat-ui-kit-react
- Password input inspiration: https://github.com/devfolioco/react-otp-input
- Theme toggle patterns: https://github.com/pacocoursey/next-themes
- Lottie assets (optional): https://lottiefiles.com/

## Notes

- This is intentionally lightweight and front-end focused.
- Data is persisted in local storage via Zustand middleware.
- No simulated bot replies are used; feed messages are user-authored unless you wire a realtime backend adapter.
