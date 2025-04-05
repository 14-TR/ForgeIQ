# ConflictIQ Project

## Overview

ConflictIQ is a full-stack application designed for visualizing and querying geographical event data, built on the ForgeIQ platform and tech stack. It features a React frontend with deck.gl for map rendering and a Python FastAPI backend that serves data and handles natural language queries.

## Features

*   **Interactive Map:** Displays various event data (battles, explosions, VIIRS satellite readings) on an interactive map powered by deck.gl.
*   **Data Endpoints:** Backend API provides endpoints to fetch recent data for:
    *   Battles (`/battles`)
    *   Explosions (`/explosions`)
    *   VIIRS Satellite Data (`/viirs`)
*   **Natural Language Query (NLQ):** Allows users to query the event database using natural language. The backend uses OpenAI to translate the query into SQL, validates it, executes it, and returns the results.
*   **Component Demo:** Includes a separate view for demonstrating UI components.

## Tech Stack

*   **Frontend:**
    *   React
    *   Vite
    *   deck.gl (for map visualization)
    *   Material UI (MUI) for UI components
*   **Backend:**
    *   Python
    *   FastAPI
    *   Pandas (likely for data manipulation)
    *   OpenAI API (for NLQ translation)
    *   AWS Secrets Manager (for database credentials)
    *   Database (likely PostgreSQL based on query syntax, e.g., `::TEXT`)
*   **Shared:** Configuration and secrets management.

## Project Structure

```
.
├── backend/         # FastAPI backend application
│   ├── app.py       # Main FastAPI application file
│   ├── db/          # Database interaction logic
│   ├── nlq/         # Natural Language Query processing logic
│   ├── pipeline/    # Data pipeline components (structure suggests this)
│   └── requirements.txt
├── frontend/        # React frontend application
│   ├── src/         # Source files
│   │   ├── App.jsx  # Main application component
│   │   ├── main.jsx # Application entry point
│   │   └── ...
│   ├── pages/       # Page components (e.g., DeckMap, ComponentDemo)
│   ├── components/  # Reusable UI components
│   ├── context/     # React context providers (e.g., MapProvider)
│   ├── hooks/       # Custom React hooks
│   ├── utils/       # Utility functions
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── shared/          # Shared configuration and secrets
│   ├── config/
│   └── secrets/
├── tests/           # Automated tests
├── .cursorignore
├── .cursorrules
├── cursor_project_rules/ # Custom rules for Cursor AI
└── README.md
```

## Setup and Running

*(Instructions for setting up the development environment, installing dependencies, and running the frontend and backend servers should be added here.)*

### Prerequisites

*   Node.js (Specify version, e.g., v18+)
*   Python (Specify version, e.g., v3.9+)
*   npm or yarn
*   pip
*   Configured AWS Credentials (e.g., via environment variables, shared credentials file, or IAM role) with permissions to access the necessary secrets in AWS Secrets Manager for database credentials, API keys (e.g., OpenAI), and other configuration. (Specify the required Secret names or ARN patterns and IAM permissions here).

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd ForgeIQ
    ```
2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
3.  **Create and activate a virtual environment:** (Recommended)
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```
4.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Configure AWS Credentials:**
    *   Ensure your environment has AWS credentials configured (e.g., via environment variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, or an assumed IAM role) with sufficient permissions to retrieve the required secrets from AWS Secrets Manager. The application will fetch database credentials, API keys (like OpenAI), and other necessary configurations directly from Secrets Manager during startup.
6.  **Run the backend server:**
    ```bash
    # Specify the exact command, e.g.:
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
    ```
    The API should be available at `http://localhost:8000` (or the configured host/port).

### Frontend Setup

1.  **Navigate to the frontend directory:** (From the project root)
    ```bash
    cd frontend
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    # or: yarn install
    ```
3.  **Configure Frontend:**
    *   Verify or update the API endpoint configuration (e.g., in `frontend/config.js` or environment variables) to point to your running backend (e.g., `http://localhost:8000` for local development).
4.  **Run the frontend development server:**
    ```bash
    npm run dev
    # or: yarn dev
    ```
    The application should be available at `http://localhost:5173` (or the port specified by Vite).

## Deployment

*(Information about how the application is deployed, e.g., EC2, S3, should be added here based on CORS settings and potential infrastructure.)*

Based on backend CORS settings, the deployment likely involves AWS:

*   **Frontend:** The React application is probably built for production (e.g., `npm run build` in the `frontend` directory) and the resulting static files (often in a `dist` or `build` folder) are hosted on **Amazon S3** configured for static website hosting. The S3 endpoint mentioned in CORS is `http://cm-react-app.s3-website.us-east-2.amazonaws.com`.
*   **Backend:** The FastAPI application appears to run on an **Amazon EC2** instance. The instance IP mentioned in CORS is `18.218.227.30` on port `8000`. Deployment might involve:
    *   Setting up a reverse proxy (like Nginx or Caddy) on the EC2 instance.
    *   Running the FastAPI app using a process manager (like systemd or Supervisor) or within a container (like Docker).
    *   Ensuring the EC2 instance has an appropriate IAM role attached, granting it permissions to retrieve all necessary secrets (database credentials, API keys, etc.) from AWS Secrets Manager.
    *   No separate configuration of environment variables for secrets is needed on the instance if the IAM role is correctly configured.
*   **Database:** The database (likely PostgreSQL) needs to be accessible from the EC2 instance (e.g., using Amazon RDS or running on another instance).

**(Provide specific build commands, deployment scripts, infrastructure-as-code details (e.g., Terraform, CloudFormation templates), CI/CD pipeline information, and configuration management instructions here.)**

## Contributing

*(Guidelines for contributing to the project, if applicable.)*

Contributions are welcome! Please follow these general guidelines:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix (e.g., `git checkout -b feature/your-feature-name` or `bugfix/description`).
3.  **Make your changes.** Adhere to the existing code style. (Specify any required linters or formatters, e.g., Black, Flake8 for Python; Prettier, ESLint for JS/React, and how to run them).
4.  **Add tests** for your changes if applicable. (Specify testing frameworks, e.g., pytest, Jest, and how to run tests).
5.  **Commit your changes** with clear and descriptive messages. (Specify any commit message conventions).
6.  **Push your branch** to your fork (e.g., `git push origin feature/your-feature-name`).
7.  **Submit a pull request** to the main repository's primary branch (e.g., `main` or `develop`).
8.  Ensure your PR passes any configured CI checks.

**(Add specific details about code style guides, testing requirements, the branching model, issue tracking (e.g., GitHub Issues), and communication channels for contributors.)**
