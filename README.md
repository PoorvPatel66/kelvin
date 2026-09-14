# Kelvin Eco Products

Enterprise B2B website foundation for Kelvin Eco Products, an eco-friendly packaging manufacturer and exporter.

## Projects

```text
kelvin/
|-- frontend/
`-- backend/
```

## Installation Commands

### Frontend

Create the Vite React project:

```bash
npm create vite@latest frontend -- --template react
```

Install frontend packages:

```bash
cd frontend
npm install
npm install axios react-router-dom react-icons
```

Run frontend:

```bash
npm run dev
```

### Backend

Create the backend project:

```bash
mkdir backend
cd backend
npm init -y
```

Install backend packages:

```bash
npm install express mongoose dotenv cors bcrypt jsonwebtoken multer cloudinary
npm install -D nodemon
```

Run backend:

```bash
npm run dev
```

## Folder Structure

### Frontend

```text
frontend/
|-- public/
|-- src/
|   |-- assets/
|   |-- components/
|   |   |-- admin/
|   |   |-- common/
|   |   |-- forms/
|   |   |-- layout/
|   |   `-- product/
|   |-- context/
|   |-- hooks/
|   |-- pages/
|   |   |-- admin/
|   |   `-- public/
|   |-- routes/
|   |-- services/
|   |-- styles/
|   |-- utils/
|   |-- App.jsx
|   `-- main.jsx
|-- .env.example
|-- index.html
`-- package.json
```

### Backend

```text
backend/
|-- src/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   |-- validators/
|   `-- server.js
|-- .env.example
`-- package.json
```

## Package Overview

### Frontend

- `react`: UI library.
- `react-dom`: Renders React into the browser.
- `vite`: Fast development server and production build tool.
- `@vitejs/plugin-react`: React support for Vite.
- `axios`: API calls to the backend.
- `react-router-dom`: Website and admin routing.
- `react-icons`: Icons for navigation, buttons, product sections, and admin UI.

### Backend

- `express`: HTTP API framework.
- `mongoose`: MongoDB object modeling.
- `dotenv`: Loads environment variables.
- `cors`: Controls frontend access to the API.
- `bcrypt`: Password hashing for admin users.
- `jsonwebtoken`: JWT authentication.
- `multer`: File upload handling.
- `cloudinary`: Product, certificate, and inquiry file storage.
- `nodemon`: Development server auto-restart.

## Environment Variables

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SITE_NAME=Kelvin Eco Products
```

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kelvin_eco_products
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Development URLs

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/v1/health`

## Recommended Startup Order

1. Start MongoDB Atlas or confirm the Atlas connection string.
2. Start backend with `npm run dev`.
3. Start frontend with `npm run dev`.
4. Connect frontend services to `VITE_API_BASE_URL`.

## Notes

This repository is initialized as a clean full-stack foundation. The current files define the project structure, package manifests, environment templates, and a minimal backend health endpoint. Product APIs, authentication, Cloudinary upload services, inquiry management, and admin modules can be built inside the folders already prepared.
