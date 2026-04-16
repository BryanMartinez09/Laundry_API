# Laundry Management API

The Laundry Management API is a robust backend service designed to digitize and streamline laundry facility operations. Built with NestJS, the system provides a scalable architecture for managing reports, users, and organizational data.

## Technical Stack

- **Framework:** NestJS
- **ORM:** TypeORM
- **Database:** MySQL
- **Real-time Communication:** WebSockets (Socket.io)
- **Security:** Passport.js with JWT Strategy

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- MySQL Server

### Installation

1. Clone the repository and install system dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables by creating a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_secure_password
   DB_NAME=laundry-db
   PORT=8080
   JWT_SECRET=your_jwt_secret_key
   ```

3. Initialize the database schema and seed initial data:
   - Create a database named `laundry-db` in your MySQL instance.
   - Execute the seeding script to populate roles, administrative accounts, and the initial item catalog:
     ```bash
     npm run seed
     ```

4. Launch the application:
   ```bash
   # Development mode with hot-reload
   npm run start:dev
   ```

## System Architecture

The application is structured through functional modules to ensure maintainability and high cohesion.

### Identity and Access Management (Auth, Users, Roles)
- **Controllers:** Handle authentication requests, specifically login and profile retrieval.
- **Services:** Manage credential validation using bcrypt hashing and issue 24-hour JSON Web Tokens (JWT). Authorization is enforced via role-based access control (Admin, Manager, Employee).

### Form Management (Forms)
- **Core Logic:** The `FormsService` facilitates the complete lifecycle of laundry reports, including creation, draft persistence, and manager approval.
- **Approval Workflow:** Once a report is submitted, managers can approve it, triggering automated notifications to relevant users.

### Analytics and Reporting (Reports)
- **Aggregation Logic:** The `ReportsService` performs complex data aggregation, calculating totals for standard and colored items, sheet sizes, and processing metrics across defined temporal ranges.

### Event Gateway (Events)
- **Real-time Synchronization:** A dedicated WebSocket gateway manages bidirectional communication, providing immediate system feedback and notifications to connected clients.

## Available Scripts

- `npm run start:dev`: Starts the application in development mode.
- `npm run seed`: Populates the database with essential initial data.
- `npm run lint`: Executes static analysis to ensure code quality.
- `npm run test`: Runs the automated test suite.
