# FCSIT BookIt

Frontend UI/UX prototype for the FCSIT Space & Facility Management System. It covers room booking with a 2-hour limit, QR check-in, live crowd status for common areas, and separate student and admin interfaces.

This is a static prototype. All data is kept in memory and resets when you reload the page.

**Demo logins**
- Student: `U2100123` / `bookit123`
- Admin: `admin@fsktm.um.edu.my` / `admin123` (use "Faculty administrator? Log in here")

## Project structure

```
index.html            page shell, loads the files below
css/styles.css        all styles (student + admin)
assets/sofa.png       room illustration from the Figma design
js/utils.js           time/date formatting, HTML escaping
js/icons.js           inline SVG icons, QR graphic, sofa image tag
js/data.js            demo data (users, rooms, areas, bookings, logs) + status rules
js/ui.js              toast + modal helpers
js/views-student.js   Home, Book, Rooms, Time slots, Layout, Summary, Confirmed, Areas, My Bookings, Profile, Login, Register
js/views-admin.js     Admin dashboard, Users, Rooms, Bookings, Logs, Common Areas
js/router.js          hash routing + login guards
js/actions.js         click/form handlers
js/app.js             live countdown tick + first render
```

Run it locally by opening `index.html`, or with `python3 -m http.server`.
