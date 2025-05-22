# VideoTube Backend

A full-featured backend for a video-sharing platform, inspired by YouTube, built with Node.js, Express, and MongoDB. This API supports user authentication, video uploads, playlists, comments, likes, subscriptions, and more.

---

## 🚀 Features

- **User Authentication** — Register, login, logout, JWT-based auth.
- **Video Management** — Upload, update, delete, and fetch videos (with Cloudinary integration).
- **Playlists** — Create, update, and manage playlists.
- **Comments & Likes** — Comment system, like/unlike videos/comments/tweets.
- **Subscriptions** — Subscribe/unsubscribe to channels; view subscriber stats.
- **Dashboard** — Channel insights: views, likes, and content counts.
- **Microblogging** — Tweet-like feature for short user posts.
- **Watch History** — Tracks and retrieves user watch history.

---

## 🛠️ Tech Stack

- **Node.js** / **Express.js**
- **MongoDB** & Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for media storage
- **Joi** for schema validation

---

## 📦 Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/your-username/videotube-backend.git
cd videotube-backend
```

### 2. Install dependencies

```sh
npm install
```

### 3. Setup environment variables

Copy `.env.example` to `.env` and fill in your:

* MongoDB URI
* JWT Secret
* Cloudinary Credentials

### 4. Run the development server

```sh
npm run dev
```

---

## 📡 API Base URL

```
http://localhost:8000/api/v1/
```

📎 [See the Data Model Diagram](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

---

## 🗂️ Folder Structure

```sh
src/
  app.js
  index.js
  controllers/
  models/
  routes/
  middlewares/
  utils/
  validators/

public/
  temp/
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> 🔍 For more details, refer to comments and code inside each file.

```

Let me know if you’d like this turned into a downloadable file or want help generating a public GitHub README with badges etc.
```
