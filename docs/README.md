# Expense-Tracker

# Scope and Features:
User Authentication: 
Users should be able to register and log in.
I will use something like JWT or sessions, but I still need to learn how this works properly.
Passwords should not be stored directly; I will figure out how to use hashing for them.


Expense Tracking:
Users can add, see, update, and delete their expenses.
Each expense should at least have: amount, category, date, notes, and it should belong to the user who created it.
Every expense should belong only to the user who created it.


Categorization:
Expenses should be grouped under categories like Food, Travel, Utilities.
Admin can manage categories (add, edit, delete). I still need to decide how this is different from user categories.


Reporting & Analysis:
Show a summary of expenses, maybe by month or week.
Add charts (pie or bar) to see categories more clearly. I’ll look into Chart.js or Recharts.
Add filters by date, category, or maybe by user (if multi-user).


Optional Features (for later, if I learn more):
Export expenses to CSV or Excel,
Add budgeting alerts (if someone spends too much in one category),
Multi-currency support (I don’t know how to do this yet),
I read that Postgres has a policy to block cross-user access with user_id = current_user_id(), but I’ll also have to learn how to do this properly in the app.


## Stack
- Backend: Java 17, Spring Boot 3 (Web, Data JPA, Validation, PostgreSQL Driver)
- DB: PostgreSQL (local dev)
- Frontend: React (Create React App)
- Build tools: Maven, npm

## Local Setup

### Database
- DB: `expense_tracker`
- User: `expense_user`
- URL: `jdbc:postgresql://localhost:5432/expense_tracker`
- Put credentials in `backend/src/main/resources/application.properties`

### Backend
```bash
cd backend
mvn spring-boot:run
# visit http://localhost:8080/api/health -> OK

### Frontend
cd frontend
npm start
# visit http://localhost:3000

### CORS
Allowed origin: http://localhost:3000

### Config: 
backend/.../config/WebConfig.java

### Project Structure
/backend    # Spring Boot app
/frontend   # React app
/docs       # ERD, schema notes





