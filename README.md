# DaviDice E-commerce Platform

A modern, high-performance e-commerce web application inspired by the polished, data-dense design systems of top-tier financial platforms (like Binance.US). 

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **Security:** Helmet, bcryptjs, jsonwebtoken
- **Validation:** express-validator

### Infrastructure
- **Containerization:** Docker & Docker Compose (for database)

## 📁 Project Structure

```text
.
├── backend/                # Node.js Express backend
│   ├── src/
│   │   ├── db/             # Database schema and seed files
│   │   └── server.js       # Express server entry point
│   └── package.json
├── frontend/               # React Vite frontend
│   ├── src/                # UI components and pages
│   └── package.json
├── DESIGN.md               # Comprehensive Design System guidelines
└── docker-compose.yml      # PostgreSQL database container configuration
```

## 🎨 Design System

The application features a custom design system that radiates the polished urgency of a digital trading floor:
- **Color Palette:** Two-tone light/dark alternation with **Binance Yellow (`#F0B90B`)** as the primary action color.
- **Typography:** Designed for data-dense interfaces with tabular numerals for perfect vertical alignment.
- **Components:** Pill-shaped CTA buttons, subtle elevation shadows (5% opacity), and sharp, trust-building layouts.

For full details, please refer to the [DESIGN.md](./DESIGN.md) file.

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for running the PostgreSQL database)

### 1. Database Setup

Start the PostgreSQL database using Docker Compose. This will automatically run the schema and seed scripts located in `backend/src/db/`.

```bash
docker-compose up -d
```
*The database will run on port `5433` (mapped from container port `5432`).*

### 2. Backend Setup

Open a new terminal and navigate to the backend directory. (Make sure to configure your `.env` file based on `.env.example`).

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```
*The frontend will be accessible at the local URL provided by Vite (usually `http://localhost:5173`).*

## 📜 License
ISC License
