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

3. Initialize the database:
   The application now features **Automatic Seeding**. On the first launch, the system will automatically populate roles, administrative accounts, and the initial item catalog.
   
   > [!IMPORTANT]
   > For the best experience and to ensure the item catalog is correctly synchronized with all metadata (like sheet sizes), it is highly recommended to use a **fresh database** or ensure the `catalog_items` table is empty before launching the API for the first time.
   
   **Default Credentials:**
   - **Admin:** `admin@laundry.com` / `admin123`
   - **Manager:** `manager@laundry.com` / `manager123`
   - **Employee:** `employee@laundry.com` / `employee123`

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
- **Independent Mobile RBAC:** The system now features a bifurcated permission plane. In addition to standard web permissions, each role contains a `permissions_mobile` JSON field. This allows administrators to toggle feature visibility (View, Add, Edit, etc.) specifically for the mobile application without affecting the web dashboard.

### Form Management (Forms)
- **Core Logic:** The `FormsService` facilitates the complete lifecycle of laundry reports, including creation, draft persistence, and manager approval.
- **Approval Workflow:** Once a report is submitted, managers can approve it, triggering automated notifications to relevant users.
- **Soft-Delete:** Reports can be deactivated via `DELETE /forms/:id`. The record is flagged `isActive: false` and excluded from all queries. Approved reports remain protected. This ensures full data traceability while keeping active listings clean.

### Analytics and Reporting (Reports)
- **Aggregation Logic:** The `ReportsService` performs complex data aggregation, calculating totals for standard and colored items, sheet sizes, and processing metrics across defined temporal ranges.

### Event Gateway (Events)
- **Real-time Synchronization:** A dedicated WebSocket gateway manages bidirectional communication, providing immediate system feedback and notifications to connected clients.

## Available Scripts

- `npm run start:dev`: Starts the application in development mode.
- `npm run seed`: Populates the database with essential initial data.
- `npm run lint`: Executes static analysis to ensure code quality.
- `npm run test`: Runs the automated test suite.
