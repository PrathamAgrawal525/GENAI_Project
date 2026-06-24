# AI-Powered Custom Interview Planner 🚀

An intelligent, full-stack web application designed to help job seekers generate custom interview preparation strategies, tailor resumes, and practice role-specific technical and behavioral questions using Google's Gemini AI.

---

## 🌟 Key Features

*   **Custom Interview Strategy Generation**: Input any target Job Description alongside either your uploaded Resume (PDF/DOCX) or a quick self-description.
*   **Structured AI Strategy Reports**:
    *   **Match Score & Skill Gap Analysis**: A percentage match between your profile and the target job, detailing skill gaps with severity ratings (low, medium, high).
    *   **Day-by-Day Preparation Plan**: A customized roadmap detailing daily study focuses and actionable tasks.
    *   **Targeted Question Banks**: Curated lists of technical and behavioral questions, each with the interviewer's intention and model answers.
*   **Tailored Resume Builder**: Generates an ATS-friendly, professional resume formatted in HTML and tailored for the specified job description.
*   **Resume PDF Export**: Uses headless Puppeteer on the backend to render and export your tailored resume as a high-quality PDF.
*   **Secure Authentication**: JWT-based user authentication (Register, Login, Logout) with token storage via HTTP-only cookies.

---

## 🛠️ Tech Stack

### Frontend
*   **Core**: React 19, Vite (Dev Server)
*   **Routing**: React Router 8
*   **Styling**: Sass / SCSS (Custom layouts, CSS Grid/Flexbox)
*   **API Client**: Axios with credential sharing

### Backend
*   **Server**: Node.js, Express
*   **Database**: MongoDB (Mongoose ODM)
*   **Authentication**: JSON Web Tokens (JWT) & HTTP-Only Cookie Session Management
*   **AI Integration**: Google GenAI SDK (`@google/genai`) utilizing the Gemini model
*   **Document Generation**: Puppeteer (Headless browser HTML-to-PDF rendering)

---

## 📁 Project Structure

```text
GENAI/
├── Backend/                    # Express.js Server
│   ├── src/
│   │   ├── config/             # DB Connection Config
│   │   ├── controllers/        # Auth & Interview API Business Logic
│   │   ├── middlewares/        # JWT Authentication & Multer File Uploads
│   │   ├── models/             # Mongoose Schemas (User, InterviewReport, Blacklist)
│   │   ├── routes/             # Express API Endpoints
│   │   ├── services/           # Gemini AI Prompts & Puppeteer PDF Generation
│   │   └── app.js              # Express Middleware Configuration
│   ├── server.js               # Backend Entrypoint
│   ├── .env                    # Backend Secrets & Configuration
│   └── package.json
│
└── Frontend/                   # React Vite SPA
    ├── src/
    │   ├── features/
    │   │   ├── auth/           # Login, Register & Protected Route components/hooks
    │   │   └── interview/      # Plan Creation Form & Report Presentation Screens
    │   ├── style/              # Global SCSS variables & layouts
    │   ├── app.routes.jsx      # React Router Navigation Configurations
    │   ├── App.jsx             # Auth Provider & Router Entrypoint
    │   └── main.jsx            # React SPA DOM Mount
    ├── vite.config.js          # Vite Compiler Configurations
    └── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v18 or higher recommended)
*   MongoDB Atlas account or local MongoDB instance
*   Google Gemini API Key (obtain from [Google AI Studio](https://aistudio.google.com/))

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd Backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `Backend/` root and populate the following environment variables:
    ```env
    PORT=3000
    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yourdb?retryWrites=true&w=majority
    JWT_SECRET=your_jwt_secret_key_here
    GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
    ```
4.  Start the backend server:
    ```bash
    npm run dev
    ```
    The server will start running on `http://localhost:3000`.

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../Frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend local development server:
    ```bash
    npm run dev
    ```
    Vite will start the dev server, typically running at `http://localhost:5173`.

---

## 🔑 API Endpoints

### Authentication
*   `POST /api/auth/register` - Create new user account.
*   `POST /api/auth/login` - Authenticate user & set session cookie.
*   `GET /api/auth/logout` - Clear cookies & revoke session.
*   `GET /api/auth/get-me` - Get current session user details (Protected).

### Interview Strategy
*   `POST /api/interview/generate` - Generate new strategy report (Protected).
*   `GET /api/interview/reports` - Fetch all generated reports for the current user (Protected).
*   `GET /api/interview/report/:id` - Fetch details of a single report by ID (Protected).
*   `GET /api/interview/resume-pdf/:id` - Retrieve the AI-tailored resume rendered as PDF (Protected).

---

## 🤝 Contributing
Feel free to fork this project, open issues, or submit pull requests with improvements.
