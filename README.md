# AI Content Generator

This project is an AI Content Generator application with a Node.js backend.

## Project Structure

- `backend/`: Contains the Node.js express server and API routes.

## Setup and Running

### Backend

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    - Ensure you have a `.env` file or valid configuration in `config/openai.js` (or wherever env vars are loaded).
    - typically: `OPENAI_API_KEY=your_key_here`

4.  Start the server:
    ```bash
    npm start
    ```

    The server will run on `http://localhost:3000`.

## API Endpoints

- `POST /api/content`: Endpoint to generate content (check `routes/contentRoutes.js` for details).
