# Instagram Clone - React + Vite Frontend

A modern Instagram clone frontend built with React and Vite.

## Features

- User authentication (login/register)
- Create and share posts with images
- Like and comment on posts
- Follow/unfollow users
- View user profiles
- Explore feed
- Notifications
- Responsive design

## Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/    # Reusable components
│   │   ├── Layout.jsx
│   │   ├── PostCard.jsx
│   │   └── CreatePost.jsx
│   ├── pages/         # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   ├── PostDetail.jsx
│   │   ├── Explore.jsx
│   │   └── Notifications.jsx
│   ├── contexts/      # React contexts
│   │   └── AuthContext.jsx
│   ├── services/      # API services
│   │   └── api.js
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **CSS** - Styling

## Environment

Make sure the backend API is running at `http://localhost:8000` before starting the frontend.

## Features Breakdown

### Authentication
- JWT-based authentication
- Protected routes
- Persistent login (localStorage)

### Posts
- Create posts with images and captions
- Add tags to posts
- Like/unlike posts
- Comment on posts
- Delete your own posts

### Social Features
- Follow/unfollow users
- View followers and following lists
- User search
- Profile pages with post grids

### Notifications
- Real-time notifications for:
  - New likes on your posts
  - New comments on your posts
  - New followers
- Mark notifications as read
- Delete notifications

## API Integration

The frontend communicates with the FastAPI backend through a centralized API service (`src/services/api.js`) that handles:
- Authentication (login, register, current user)
- User operations (profiles, search)
- Post operations (CRUD)
- Social operations (likes, comments, follows, stories)
- Notifications

All API requests include JWT tokens for authenticated endpoints.

