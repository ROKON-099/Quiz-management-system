# QuizRank React Frontend

Responsive React + Vite frontend for the QuizRank department quiz platform. It uses Tailwind CSS v4, React Router, Axios and Lucide React. No image assets are required; profile placeholders and UI symbols are rendered with Lucide icons.

## Requirements
- Node.js 20.19+ or 22.12+
- npm
- QuizRank Spring Boot backend running on `http://localhost:8080`
- MySQL/MariaDB database connected to the backend

## Install and run (Windows PowerShell)
```powershell
cd QuizTank\frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Open `http://localhost:5173`.

## Production build
```powershell
npm run build
npm run preview
```
The production files are generated in `dist/`.

## API configuration
Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```
Restart Vite after changing `.env`.

## Main routes
- `/login`, `/register`
- `/leaderboard`
- `/student/dashboard`, `/student/my-course`, `/student/notice`, `/student/profile`, `/student/quiz/:id`, `/student/result/:id`
- `/teacher/dashboard`, `/teacher/my-course`, `/teacher/create-quiz`, `/teacher/notice`, `/teacher/results`, `/teacher/profile`

## Important integration notes
1. Login expects `POST /api/auth/login` with JSON `{ "userId": "...", "password": "..." }` and a response containing `{ "user": { ... } }` (or a user object with a `role` field). Roles must be `STUDENT` or `TEACHER`.
2. The logged-in user is stored in localStorage for this development frontend. This is not production-grade authentication. Use server-side authentication, secure HttpOnly cookies or a properly implemented token flow before deployment.
3. The quiz UI expects quiz question fields `id`, `questionText`, `optionA`, `optionB`, `optionC`, `optionD`. The answer API expects `{ "questionId": id, "selectedAnswer": "A" }`. Verify these names against your Spring Boot DTOs.
4. The quiz countdown is a client-side display timer. It is not secure enforcement. The backend must enforce quiz/question deadlines.
5. The current Spring Boot project does not expose a dedicated student-facing teacher-results summary, total attempt count, or profile update endpoint. The frontend displays only what the current endpoints return; some dashboard metrics are marked unavailable instead of inventing data.
6. The current quiz-results API returns entity data. If student names are not included in that response, enrich results through a backend DTO endpoint before relying on name display.
7. Department leaderboard currently uses current academic CGPA records; it is not the same as a quiz-score leaderboard. The UI reflects the current backend contract.
8. The register page is an information page because the supplied backend has no public registration API.
9. Existing local development login may use plaintext seed passwords from the database. Do not use this authentication approach in production.

## Installed packages
Runtime:
- `react`, `react-dom`
- `react-router-dom`
- `axios`
- `lucide-react`
- `tailwindcss`
Development:
- `vite`
- `@vitejs/plugin-react`
- `@tailwindcss/vite`

## Folder map
- `src/pages`: page components grouped by auth/common/student/teacher
- `src/components`: shared UI and dashboard shell
- `src/layouts`: role-specific application layouts
- `src/context`: authentication state
- `src/services`: Spring Boot API clients
- `src/routes`: route protection and routing
- `src/styles`: global Tailwind and reusable CSS classes
