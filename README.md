# Find-a-doc

Find-a-doc is a web application that allows registered users to book appointments with doctors efficiently. Built with **Angular** and **Firebase (Firestore, Firebase Auth)**, the platform ensures secure authentication, real-time data handling, and a seamless user experience. The application features an interactive calendar system, role-based access, and integrated payment options.

![image alt](https://github.com/KamilMleczko/ConsultingApp/blob/master/screenshots.png?raw=true)

## Features

### Patient Features
- **Doctor Appointment Booking** – Patients can book, cancel, and reschedule appointments via dedicated calendar.
- **Interactive Calendar** – Google-like monthly and weekly views that sync seamlessly and provide all necessary information about appointments.
- **Shopping Basket** - reserved appointments are stored in client's shopping basket where he may finalize booking process by purchase.
- **Payment System** – Simulated payments via **credit/debit card, PayPal, and bank transfer**.
- **Doctor Reviews & Ratings** – Patients can leave comments and rate doctors after they completed appointment with them.

### Doctor Features
- **Schedule Management** – Doctors can easily add, delete and modify (via exceptions) their schedules.
- **Your appointments view** - Doctor can see all appointments he has for a given week along with Patient info.
- **Comment Section** – Doctors can respond to user feedback and see their ratings.

### Admin Features
- **User & Content Management** – Admins can ban/unban users, delete comments, and create new Doctor Accounts.
- **Session Persistence Control** – Configurable session storage options (**Local, Session, None**).

## Technologies Used
- **Frontend:** Angular, TypeScript, Bootstrap, SCSS
- **Backend & Database:** Firebase (Firestore)
- **Security and Access Control:** Firebase Auth
  

## Project Structure
The application is modularized into:
- **Components** – UI elements for pages and features
- **Services** :
   * Database Facade Service - Centralized error handling and consistent database access
   * Database Service - Direct communication with firestore
   * Guard Service – Implements route protection to control access based on user authentication and roles:
   * Auth Service - User Authentication via email and password handled by Firebase Auth.
- **Interfaces** – Data models corresponding to Firestore document structure
- **Enviroments** - Here you should paste your firebase config
## Installation & Setup
Most importantly ensure you have Angular of version [18.0.0](https://github.com/angular/angular-cli)
```sh
# Clone the repository
git clone https://github.com/yourusername/find-a-doc.git
cd find-a-doc

# Install dependencies
npm install

# Run the application
ng serve
```
The app will be available at `http://localhost:4200/`.

To log as admin user use credentials in `admin-credentials.txt`

## License
This project is licensed under [MIT License](LICENSE).
