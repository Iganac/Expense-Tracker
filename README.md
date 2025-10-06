# Expense-Tracker
Scope and Features:\
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






