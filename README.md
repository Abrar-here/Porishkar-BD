# PorishkarBD – Smart Waste Management & Recycling Platform

A MERN-stack smart waste management and recycling platform designed to improve waste reporting, collection coordination, and recycling activities in Bangladesh.

🌐 **Live Application:** https://porishkar-bd.vercel.app/  
📂 **GitHub Repository:** https://github.com/Abrar-here/Porishkar-BD

---

## 📝 What I Built

PorishkarBD is a web-based platform that connects citizens, waste collectors, recycling companies, and administrators through a centralized waste management system.

The platform allows citizens to report waste-related issues, schedule waste pickups, and earn Eco Points. Waste collectors can manage collection tasks, while recycling companies can participate in a marketplace to purchase recyclable materials. Administrators oversee platform operations, manage reports, monitor waste hotspots, and analyze collection activities.

The main goal is to make waste management more organized, efficient, and accessible through technology.

## 🔑 Access Instructions

**Live Application:** https://porishkar-bd.vercel.app/

1. Visit the live application.
2. Register for an account or log in if you already have one.
3. Access the platform according to your assigned user role.
4. Explore the available features through the relevant dashboard.

### User Roles

- **Citizen:** Report waste, schedule pickups, list recyclable materials, and earn Eco Points.
- **Waste Collector:** Manage assigned collection tasks and update pickup statuses.
- **Recycling Company:** Browse recyclable material listings and submit bids.
- **Administrator:** Manage users, reports, collection operations, and platform analytics.

> No shared login credentials are published in this repository. Users can register through the application. Role-specific access depends on the account's assigned role.

## ⚙️ Implemented Features

### 1. Smart Waste Reporting
- Submit waste reports with descriptions, categories, and locations.
- Capture GPS-based locations.
- Upload up to five images per report.
- Generate unique report IDs.
- Track report status and manage submitted reports.

### 2. Automatic Waste Prioritization
- Automatically classify reports into Low, Medium, High, and Critical priorities.
- Consider waste category, estimated volume, and nearby unresolved reports.
- Allow administrators to override priorities with an audit reason.

### 3. Pickup Scheduling
- Schedule waste collection pickups.
- Reschedule or cancel pickup requests within the allowed time limit.
- Coordinate collection activities between citizens, administrators, and collectors.

### 4. Waste Collection Management
- Assign collection tasks to waste collectors.
- Optimize collection routes using a nearest-neighbor approach.
- Allow administrators to manually override routes.
- Require photo evidence before completing a pickup.

### 5. Recycling Marketplace
- Allow citizens to list recyclable materials with images.
- Enable recycling companies to browse listings and submit bids.
- Support interactions between recyclable material sellers and buyers.

### 6. Recycling Centre Locator
- Locate recycling centres based on material type.
- Calculate distances using the Haversine formula.
- Allow users to rate recycling centres.

### 7. Eco Points and Rewards
- Award Eco Points for eligible platform activities.
- Display user rankings through a leaderboard.
- Provide badges to encourage environmentally responsible participation.

### 8. Waste Hotspot Detection
- Visualize waste-report concentrations through a map-based heatmap.
- Detect clusters containing more than five unresolved reports within a 500-metre radius over the previous 30 days.
- Allow administrators to review and escalate detected hotspots.

### 9. Notifications
- Provide in-app notifications.
- Send email notifications using Resend.
- Support user notification preferences.

### 10. Admin Dashboard and Analytics
- Monitor waste reports and collection activities.
- View collector performance statistics.
- Identify top and bottom-performing collectors.
- Generate PDF reports.

### 11. Payment Integration
- Integrate SSLCommerz for payment processing.
- Support configurable platform commission settings.

## 💡 How the Key Features Work

### Smart Waste Reporting and Prioritization

When a citizen submits a waste report, the system collects its category, description, estimated volume, and location. Uploaded images are stored using Cloudinary.

Each report receives a unique ID following a year-based format, such as `PBD-2026-00042`.

The platform automatically determines the report's priority by considering the waste type, estimated volume, and nearby unresolved reports. Administrators can manually change the assigned priority when necessary, providing a reason for the change.

### Pickup Scheduling and Collection

Citizens can request waste pickups and manage their scheduled requests. Rescheduling and cancellation are subject to a four-hour cutoff.

Administrators coordinate collection assignments, while collectors receive tasks and manage their progress. The platform uses a nearest-neighbor approach to optimize collection routes, with an option for administrators to override the suggested routes.

Collectors must upload photo evidence before marking a pickup as completed.

### Recycling Marketplace

Citizens can publish recyclable material listings with descriptions and images. Recycling companies can explore available listings and submit bids.

This creates a connection between people who want to dispose of recyclable materials and companies interested in collecting or purchasing them.

### Recycling Centre Locator

Users can find recycling centres based on the type of material they want to recycle.

The platform uses the Haversine formula to calculate geographical distances between users' locations and recycling centres, helping users identify nearby options.

### Waste Hotspot Detection

The system analyzes unresolved waste reports within a geographical area.

When more than five unresolved reports are found within a 500-metre radius during the previous 30 days, the system identifies the area as a potential waste hotspot.

Administrators can review these areas and take further action.

### Eco Points and Leaderboard

The platform rewards eligible activities with Eco Points. Users can track their points, view leaderboard rankings, and earn badges.

This encourages citizens to participate actively in waste management and recycling activities.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, JavaScript, Redux |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Maps | Leaflet |
| Image Storage | Cloudinary |
| Email Notifications | Resend |
| Payment Gateway | SSLCommerz |
| Charts and Analytics | Recharts |

## 📁 Project Structure

```text
Porishkar-BD/
├── client/
├── server/
├── .gitignore
└── README.md
```

The project is organized into separate frontend and backend applications.

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- Node.js and npm
- MongoDB or a MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Abrar-here/Porishkar-BD.git
cd Porishkar-BD
```

### 2. Install Dependencies

Install the backend and frontend dependencies separately:

```bash
cd server
npm install
```

Then:

```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create the required `.env` files for the backend and frontend.

Use the project's environment variable examples or configuration requirements. You will need to configure the relevant service credentials, such as:

- MongoDB connection string
- Authentication secret
- Cloudinary credentials
- Resend API key
- SSLCommerz credentials

**Important:** Never commit actual API keys, database credentials, passwords, or other secrets to GitHub.

### 4. Run the Application

Start the backend and frontend using the development scripts defined in their respective `package.json` files.

Once both services are running, open the frontend's local development URL in your browser.

## 🔌 External Services

PorishkarBD integrates with the following external services:

- **MongoDB Atlas:** Database hosting.
- **Cloudinary:** Image upload and storage.
- **Resend:** Email notifications.
- **SSLCommerz:** Payment processing.
- **Leaflet:** Interactive maps and geographical visualization.

Some features may require valid service credentials and configuration before they work locally.

## ⚠️ Known Limitations

- Resend's sandbox configuration may restrict email delivery to verified recipients.
- GPS inaccuracies can affect location-based calculations and waste prioritization.
- External integrations require valid API credentials and service configuration.

## 🔮 Future Improvements

- Improve route optimization for larger collection areas.
- Enhance location accuracy and waste hotspot analysis.
- Expand analytics and reporting capabilities.
- Improve scalability and application security.
- Introduce additional features to encourage recycling participation.
