# 🚀 AI Content Generator

An advanced, full-stack web application designed to revolutionize English language learning. By leveraging Artificial Intelligence, this platform generates personalized reading materials, stories, and exercises tailored specifically to the user's interests and proficiency level (A1-C2).

## 🌟 Key Features

### 👤 User Experience
-   **Personalized Profile**: Users can set their English proficiency level (CEFR standards) and select specific interests (e.g., Technology, Sports, Arts).
-   **Gamification**: Earn points and maintain daily streaks to stay motivated.
-   **Responsive Design**: A premium, mobile-first interface built with modern aesthetic principles (Glassmorphism, Gradients).

### 🤖 AI-Powered Learning
-   **Dynamic Content Generation**: Uses OpenAI's GPT models to create unique articles, stories, and dialogues on demand.
-   **Smart Adaptation**: Content difficulty automatically adjusts to match the user's selected language level.
-   **Interactive Exercises**: Generates comprehension questions and exercises based on the created text.

### 🛠 Technical Capabilities
-   **Secure Authentication**: JWT-based authentication with password hashing (Bcrypt).
-   **Data Persistence**: robust MongoDB database to store user profiles, history, and progress.
-   **History Tracking**: Users can revisit previously generated content at any time.

## 🏗️ Technology Stack

### Backend (API)
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (with Mongoose ODM)
-   **Auth**: JSON Web Tokens (JWT)
-   **AI Integration**: OpenAI API

### Frontend (Client)
-   **Framework**: React.js (Vite)
-   **Styling**: Tailwind CSS
-   **State Management**: React Context API
-   **HTTP Client**: Axios
-   **Icons**: Lucide React

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)

### 1. Clone the Repository
```bash
git clone https://github.com/YakupTekeli/AI-Content-Generator.git
cd AI-Content-Generator
```

### 2. Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-content-generator
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_openai_api_key_here
```

Start the backend server:
```bash
npm run dev
```
> Server will run on `http://localhost:5000`

### 3. Frontend Configuration
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend application:
```bash
npm run dev
```
> Application will open at `http://localhost:5173`

## 📖 Usage Guide

1.  **Sign Up**: Create a new account on the Register page.
2.  **Dashboard**: Check your current level, points, and daily streak.
3.  **Generate**:
    -   Go to the "Generate" page.
    -   Enter a topic (e.g., "The History of Jazz").
    -   Select a type (Article, Story, etc.) and your Level.
    -   Click "Generate" and wait for the AI to create your lesson.
4.  **Profile**: Update your interests to get better recommendations.

## 🤝 Contributing
1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
