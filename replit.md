# Neta - Political Accountability Platform

## Overview
Neta is a production-ready political accountability platform designed to enhance civic engagement and transparency. It automatically fetches real politician data, offers real-time event-driven synchronization between administration and users, and integrates multi-provider AI support for various functionalities. The platform aims to provide a comprehensive toolset for citizens to interact with political processes and for administrators to manage civic data efficiently.

## Recent Changes (November 2025)
- Fixed package.json dependencies for React 18 compatibility with framer-motion 11
- Added Vite proxy configuration to properly route API requests from frontend to backend
- Fixed apiService.ts and dataService.ts to use `/api` prefix (proxied to backend)
- Enhanced AuthContext to integrate with backend JWT authentication
- Improved StandardAuthForm with loading states and error handling
- Configured dual workflows: Backend Server (port 3001) and Frontend (port 5000)

## User Preferences
I prefer iterative development with clear, concise explanations at each step. Please ask for confirmation before making significant changes or architectural decisions. I value code that is clean, well-documented, and follows modern best practices.

## System Architecture
Neta features a robust, event-driven architecture ensuring real-time data synchronization across the platform.

### UI/UX Decisions
- The frontend is built with React 18, TypeScript, and Vite, using TailwindCSS for styling to ensure a modern and responsive design.
- Framer Motion is used for animations, and Recharts for data visualizations, providing an engaging user experience.
- The design prioritizes instant feedback and live updates for all user interactions.

### Technical Implementations
- **Real-Time Event Bus**: A custom event bus (`services/eventBus.ts`) facilitates instant communication and data propagation between the backend and all connected frontend clients. This ensures that any change made by an administrator or user is immediately reflected across the platform without manual refreshes.
- **Data Flow**: User actions trigger frontend cache updates, an event is emitted via the event bus, data is saved by the backend API, and the event propagates to all listeners, updating all user screens instantly.
- **Frontend Component Pattern**: React components subscribe to specific events and update their state based on incoming data, enabling real-time UI updates.
- **JSON-based Persistence**: The backend uses JSON files (`data.json`) for data storage, simplifying setup and allowing for rapid development.
- **Multi-Provider AI Integration**: The platform automatically detects and utilizes API keys for Anthropic Claude, Google Gemini, or OpenRouter, providing fallback support and flexibility for AI-powered features like politician profile insights and complaint categorization.
- **Authentication**: JWT-based authentication with bcrypt for password hashing and role-based access control secures sensitive endpoints.

### Feature Specifications
- **Voting System**: Allows users to vote, with approval ratings updating in real-time.
- **Complaint Management**: Users can file complaints, which instantly appear on a public Civic Wall and are visible to administrators.
- **Volunteer System**: Manages volunteer registrations and updates a real-time leaderboard.
- **RTI Tasks & Games**: Functionality for creating/tracking RTI tasks and updating game play counts across the platform in real-time.
- **Admin Dashboard**: Provides a comprehensive interface for managing all aspects of the platform, with changes instantly reflecting on user-facing pages.

### System Design Choices
- The platform is designed for high responsiveness, with event propagation latency under 100ms and API response times under 200ms.
- A service-oriented structure within the `services/` directory centralizes logic for data management, AI interactions, and external data fetching.

## External Dependencies
- **MyNeta.info**: Used for fetching real Indian politician data, including photos.
- **Anthropic Claude API**: For AI capabilities, specifically `claude-3-5-sonnet-20241022`.
- **Google Gemini API**: For AI capabilities, specifically `gemini-2.0-flash`.
- **OpenRouter API**: Provides auto-routing for various AI models, enhancing flexibility and fallback options.
- **Node.js (Express.js)**: Backend server.
- **React 19 (Vite)**: Frontend framework.
- **TailwindCSS**: CSS framework.
- **Framer Motion**: Animation library.
- **Recharts**: Charting library for data visualization.
- **React Router DOM**: For client-side routing.
- **JWT (JSON Web Tokens)**: For secure authentication.
- **bcrypt**: For password hashing.