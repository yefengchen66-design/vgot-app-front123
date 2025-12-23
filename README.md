
  # Review Vgot.ai Page

  This is a Vite + React (web) project for the Review Vgot.ai page, not a React Native app. The original design is available at https://www.figma.com/design/LlYKJPNex2tmpIwJYzl7IC/Review-Vgot.ai-Page.

  ## Running the code

  1) Install dependencies: `npm i`

  2) Start the dev server: `npm run dev`

  By default, the app runs at http://localhost:3000 and Vite will try to open your browser automatically.

  ## Google OAuth Setup

  This app supports Google Sign-In. To enable it:

  1) Create a Google OAuth Client ID:
     - Go to [Google Cloud Console](https://console.cloud.google.com/)
     - Create a new project or select an existing one
     - Enable Google+ API
     - Go to "Credentials" and create OAuth 2.0 Client ID
     - Add authorized JavaScript origins (e.g., `http://localhost:5173` for dev)

  2) Create a `.env` file in the project root (see `.env.example`):
     ```env
     VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
     ```

  3) Restart the dev server to load the environment variables

  **Note**: The backend also needs the same Google Client ID set as `GOOGLE_CLIENT_ID` environment variable.


  ## Need a mobile app?

  This repository is a web UI. To build a mobile app you have two common options:

  - Build a true native app with React Native/Expo (recommended). You can reuse business logic (TypeScript utilities, API code) but will need to rebuild UI with React Native components.
  - Wrap this web app as a mobile app using Capacitor. This is quickest for a web-first experience but runs inside a WebView.

  If you want, we can scaffold an Expo app in a new folder and set up a shared package to reuse logic from this web project.

  ## Mobile web and PWA

  - Mobile helpers are included in `src/index.css` (safe-area padding, `100svh`, touch scrolling). The root container uses the `app-fullscreen` class in `App.tsx`.
  - A minimal PWA setup is added:
    - `public/manifest.webmanifest` linked from `index.html`
    - `public/sw.js` registered in `src/main.tsx`
    - Add icons at `public/icons/icon-192.png` and `public/icons/icon-512.png` for install prompts.
    - During development, the service worker is registered but can be ignored; it's fail-safe and optional.
  
  ## Single entry (mobile PWA)

  - This project now uses a single entry point:
    - `index.html` → SPA + PWA, optimized for mobile use
  - Dev:
    - `npm run dev` then open http://localhost:3000/
  - Build:
    - `npm run build` outputs the app under `build/`
  - Deployment:
    - Serve `index.html` at your chosen domain. The app talks to the same backend API and shares DB/Storage with any other frontends you deploy.
  