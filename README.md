# JobTrack — Job Application Tracker

A full-stack job application tracking system built to help users organise, manage and monitor their job search.

## Live Demo

[Open JobTrack](https://jobtrack-58gq.onrender.com)

## GitHub Repository

[View the source code](https://github.com/harisamaan789-cyber/jobtrack)

## Features

- Add new job applications.
- View saved job applications.
- Edit existing applications.
- Delete applications.
- Search applications by company or job position.
- Filter applications by application status.
- Dashboard displaying application statistics.
- SQLite database for persistent local storage.
- Form validation and error handling.
- Responsive interface for different screen sizes.

## Technologies Used

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- SQLite
- better-sqlite3

**Development Tools**
- Visual Studio Code
- Git
- GitHub
- Render

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | Retrieve job applications |
| GET | `/api/stats` | Retrieve dashboard statistics |
| POST | `/api/jobs` | Create a job application |
| PUT | `/api/jobs/:id` | Update a job application |
| DELETE | `/api/jobs/:id` | Delete a job application |

## Running Locally

1. Clone the repository:

```bash
git clone https://github.com/harisamaan789-cyber/jobtrack.git
```

2. Open the project folder:

```bash
cd jobtrack
```

3. Install dependencies:

```bash
npm install
```

4. Start the application:

```bash
npm start
```

5. Open your browser:

```text
http://localhost:3000
```

The SQLite database and jobs table are created automatically when the backend starts.

## Database and Hosting

JobTrack uses SQLite for local database storage. The live demonstration is hosted on Render. Render's free service does not guarantee persistent storage for local SQLite files, so the live demo should be treated as a demonstration rather than a permanent data-storage service.

## Project Purpose

This project was developed as part of my independent full-stack software development learning. It helped me practise backend development, REST APIs, database integration, CRUD operations, frontend development and deployment.

## Author

Haris Amaan

[GitHub](https://github.com/harisamaan789-cyber)
