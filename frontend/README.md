# User Management System Assignment

This is not a production full-stack project.

This is an assignment project built to learn MongoDB and indexing concepts with a Node.js + Express + Mongoose backend and a React frontend.

## Learning Goals

- MongoDB schema design
- Index types and query performance
- Filtering, sorting, pagination
- Basic analytics and explain stats in UI

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- React + Vite + Tailwind CSS

## Run Backend

```bash
cd ..
npm install
npm run dev
```

## Run Frontend

```bash
npm install
npm run dev
```

## Environment

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/user_management_system
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

## API Routes

```txt
POST   /api/users
GET    /api/users
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/users/analytics
GET    /api/users/recommendations
GET    /api/users/logs
GET    /api/users/performance
GET    /api/users/export/csv
```

## Index Test Script

```bash
cd ..
node scripts/index-test.js
node scripts/index-test.js --compare
```

## Notes

- Built for learning and viva/demo purposes.
- Focus is MongoDB understanding, not enterprise production readiness.
