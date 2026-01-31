# Bhavani Digitals

Bhavani Digitals is a comprehensive digital agency platform built with Next.js 15, Firebase, and AI integration. It serves as a hub for booking services (photography, videography), managing events, and showcasing creative work, enhanced by an advanced AI assistant named "Lumina".

## 🚀 Features

### 🧠 Lumina AI
- **Advanced AI Interface**: A powerful chat interface powered by Google's Genkit and Vercel AI SDK.
- **Intelligent Assistance**: Helps users navigate services and provides information about the studio.
- **Generative Capabilities**: Leverages advanced models for rich interactions.

### 📅 Service Booking
- **Seamless Scheduling**: Integrated booking system for scheduling shoots and consultations.
- **Real-time Availability**: Check slots and confirm bookings instantly.
- **Service Management**: Admin tools to manage service offerings and pricing.

### 🎥 Media Gallery
- **Cinematic Films**: Dedicated section for high-quality video showcases.
- **Photography Portfolio**: Responsive image galleries organized by categories/events.
- **Immersive Viewer**: High-quality media playback and viewing experience.

### 🔴 Live Events
- **Live Streaming**: Capabilities for broadcasting events in real-time.
- **Event Updates**: Real-time notifications and updates for ongoing events.

### 🛡️ Admin Dashboard
- **Comprehensive Management**: Central hub for managing bookings, users, and content.
- **Analytics**: Insights into user engagement and service metrics.

### 👤 User Dashboard
- **Personalized Experience**: Users can track their bookings, view their media, and manage preferences.
- **Secure Authentication**: Powered by Supabase and Firebase Auth.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **CMS**: [React Markdown](https://github.com/remarkjs/react-markdown)

### Backend & Database
- **Primary Backend**: [Firebase](https://firebase.google.com/)
  - **Firestore**: NoSQL database for application data.
  - **Cloud Functions**: Serverless backend logic.
  - **Storage**: Media asset hosting.
  - **App Hosting**: Deployment and hosting.
- **Authentication**: [Supabase Auth](https://supabase.com/) / Firebase Auth.
- **Data Connect**: Connectors for seamless data integration.

### AI & Intelligence
- **SDK**: [Vercel AI SDK](https://sdk.vercel.ai/docs)
- **Engine**: [Google Genkit](https://firebase.google.com/docs/genkit)
- **Models**: Integration with Gemini and other advanced LLMs.

### Tools & Quality
- **Validation**: [Zod](https://zod.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Linting**: ESLint, Prettier

---

## 📂 Architecture Overview

The project follows a modular feature-based architecture within the Next.js App Router structure.

```
src/
├── ai/                 # AI configuration, flows, and Genkit setup
├── app/                # Next.js App Router (pages & layouts)
│   ├── admin/          # Admin dashboard routes
│   ├── api/            # API routes (Next.js server functions)
│   ├── booking/        # Booking related pages
│   ├── lumina/         # Lumina AI feature pages
│   └── ...             # Other feature routes
├── components/         # Reusable UI components
│   ├── ui/             # Core UI elements (buttons, inputs, etc.)
│   └── ...             # Feature-specific components
├── features/           # Domain-specific business logic & state
├── hooks/              # Custom React hooks
├── lib/                # Shared utilities and helper functions
├── services/           # External service integrations (API calls)
└── styles/             # Global styles and tailwind config
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or pnpm
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/bhavani-digitals.git
    cd bhavani-digitals
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and configure your keys:
    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    GOOGLE_GENERATIVE_AI_API_KEY=...
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

### Building for Production
To create a production build:
```bash
npm run build
npm start
```

---

## 📄 Scripts

- `npm run dev`: Starts the local development server with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Runs the production build.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run typecheck`: Runs TypeScript compiler to check for type errors.

---

## 🤝 Contributing
1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

Designed & Developed for **Bhavani Digitals**.
