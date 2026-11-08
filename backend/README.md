# QuizRank Backend (React + Spring Boot + MySQL)

Java 21 / Spring Boot 4.1.2. Uses the existing `quizrank` database. The source package is `src/main/java/com/quizrank/backend`.

## Run
1. Start MySQL and import your existing `quizrank.sql` database (do not import it again if the tables/data already exist).
2. Check `src/main/resources/application.properties`. Defaults: localhost:3306, database quizrank, username root, blank password. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` environment variables if needed.
3. Open this folder in VS Code/IntelliJ, then run `mvn spring-boot:run` in the folder containing `pom.xml`. Or run `BackendApplication.java`.
4. API base URL: `http://localhost:8080/api`.

## API summary
- `POST /auth/login` JSON `{ "userId":"...", "password":"..." }`
- `GET /users/{id}`, `/users/students`, `/users/teachers`, `/users/batch/{batch}`
- `GET /subjects`, `/subjects/{id}`, `/subjects/batch/{batch}`, `/subjects/teacher/{id}`
- `GET /student-courses/student/{studentId}`
- `GET /academic-records/student/{id}`, `/academic-records/student/{id}/current`
- `GET /quizzes`, `/quizzes/{id}`, `/quizzes/subject/{id}`, `/quizzes/teacher/{id}`
- `POST /quizzes` (teacher creates quiz + 1–10 questions in one request)
- `GET /quizzes/{id}/questions` (student-safe; no answer key)
- `GET /quizzes/{id}/questions/teacher` (teacher question list; correct answer is intentionally hidden from JSON too)
- `POST /attempts/start?studentId=7&quizId=1`
- `POST /attempts/{attemptId}/answer` JSON `{ "questionId":1, "selectedAnswer":"A" }`
- `POST /attempts/{attemptId}/finish`
- `GET /quiz-results/student/{id}`, `/quiz-results/quiz/{id}`
- `GET /leaderboard/department`, `/leaderboard/batch/{batch}`
- `GET /notices`, `/notices/teacher/{id}`; `POST /notices`, `PUT /notices/{id}`, `DELETE /notices/{id}`

## Important limitations / security
- This is an initial working API layer, not production authentication. The legacy database stores plaintext passwords; login compares them only to support your current sample DB. Do not deploy this publicly. Before real use, migrate passwords to BCrypt and add Spring Security with role-based authorization/JWT or session authentication. Do not return passwords to React.
- The schema does not have a quiz duration column, so this code does not enforce a server-side countdown. The browser timer alone is not secure. Add a duration column and server-side expiry before production.
- There is no admin role, matching the agreed Student/Teacher-only roles.
- `ddl-auto=none` prevents Hibernate from altering your existing database.
- CORS currently permits `http://localhost:5173`; change it for your deployed frontend.
- The current login endpoint is a learning-stage starter and should not be treated as secure authorization. Client-supplied IDs in endpoints must be protected by authentication before deployment.
