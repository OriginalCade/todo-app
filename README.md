# Todo App

## How to run Backend

- type "cd backend" in the terminal
- type "npm install" for the dependencies
- type "npm start" to run the server

## How to run frontend

- type "cd frontend" in the terminal
- type "npm install" for the dependencies
- type "npm run dev" to run the front end

## ENV Variables

JWT_SECRET=(your_secret_here)
PORT=5001

## Test commands

### Manual tests (using curl):

Sign up a user:
curl -X POST http://localhost:5001/api/auth/signup \
 -H "Content-Type: application/json" \
 -d '{"email":"test@example.com","password":"password123"}' \
 -c cookies.txt

Login:
curl -X POST http://localhost:5001/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"test@example.com","password":"password123"}' \
 -c cookies.txt -b cookies.txt

Create a todo:
curl -X POST http://localhost:5001/api/todos \
 -H "Content-Type: application/json" \
 -d '{"title":"Test Todo","description":"My test","due_date":"2026-02-10"}' \
 -b cookies.txt

List todos:
curl -X GET http://localhost:5001/api/todos \
 -b cookies.txt

Attempt to read another user's todo:
curl -X GET http://localhost:5001/api/todos/<OTHER_USER_TODO_ID> \
 -b cookies.txt

## Seed user credentials

Email: seeduser@example.com
Password: password123
Todos: 5 sample todos created automatically
