# 🏭 KJ Somaiya Industrial Visits Management System

A comprehensive web application for managing industrial visits at KJ Somaiya College of Engineering. This system enables students to browse, register for, and track industrial visits while providing administrators with tools to manage visit schedules, registrations, and content.

![Industrial Visits](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-38B2AC)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎓 Student Features
- **Browse Industrial Visits**: View upcoming and past industrial visits with detailed information
- **Search & Filter**: Search visits by title, location, industry, or filter by department
- **Registration System**: Register for upcoming visits with student information
- **Visit Details**: Comprehensive view of each visit with images, descriptions, and learning outcomes
- **Responsive Design**: Mobile-friendly interface for easy access

### 👨‍💼 Admin Features
- **Admin Dashboard**: Comprehensive dashboard with visit management tools
- **Add New Visits**: Create and schedule new industrial visits with detailed information
- **Visit Management**: View, edit, and manage all visits (upcoming and past)
- **Registration Tracking**: Monitor student registrations for each visit
- **Image Upload**: Upload and manage visit images with Supabase storage
- **Role-based Access**: Faculty and Super Admin roles with different permissions

### 🔧 Technical Features
- **Real-time Data**: Dynamic data fetching from Supabase database
- **Authentication**: Secure admin login system
- **Image Storage**: Cloud-based image storage with Supabase
- **Responsive UI**: Modern, responsive design with TailwindCSS
- **Type Safety**: Full TypeScript implementation
- **SEO Optimized**: Proper meta tags and structured data

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **React Router 6** - Client-side routing
- **TailwindCSS 3** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling and validation
- **React Query** - Data fetching and caching

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Express.js** - Server-side API (for additional functionality)
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Development Tools
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing
- **Prettier** - Code formatting
- **ESLint** - Code linting

## 📁 Project Structure

```
my-app/
├── client/                     # React frontend application
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Radix UI components
│   │   ├── Navigation.tsx    # Main navigation
│   │   ├── Footer.tsx        # Footer component
│   │   ├── AdminPanel.tsx    # Admin dashboard
│   │   └── Sidebar.tsx       # Admin sidebar
│   ├── pages/                # Route components
│   │   ├── Index.tsx         # Homepage
│   │   ├── UpcomingVisits.tsx # Upcoming visits listing
│   │   ├── PastVisits.tsx    # Past visits archive
│   │   ├── VisitDetails.tsx  # Individual visit details
│   │   ├── NotFound.tsx      # Student registration form
│   │   └── admin/            # Admin pages
│   │       ├── AddVisit.tsx  # Add new visit form
│   │       └── Login.tsx     # Admin login
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   └── supabase.ts       # Supabase client
│   └── data/                 # Static data (legacy)
├── server/                   # Express server
│   ├── index.ts              # Server entry point
│   └── node-build.ts         # Build configuration
├── shared/                   # Shared types and utilities
├── public/                   # Static assets
└── netlify/                  # Netlify deployment config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kj-somaiya-industrial-visits.git
   cd kj-somaiya-industrial-visits/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials (see [Environment Variables](#-environment-variables))

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🗄️ Database Setup

### Supabase Configuration

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Create the database table**
   ```sql
   -- Create the iv_visits table
   CREATE TABLE iv_visits (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     location_city VARCHAR(100) NOT NULL,
     location_state VARCHAR(100) NOT NULL,
     visit_date DATE NOT NULL,
     department VARCHAR(100) NOT NULL,
     industry VARCHAR(100) NOT NULL,
     available_seats INTEGER NOT NULL,
     image_url TEXT,
     registration_url TEXT,
     learning_outcomes TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE iv_visits ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Allow public read access" ON iv_visits
   FOR SELECT USING (true);

   CREATE POLICY "Allow authenticated insert" ON iv_visits
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

   CREATE POLICY "Allow authenticated update" ON iv_visits
   FOR UPDATE USING (auth.role() = 'authenticated');
   ```

3. **Set up Storage for Images**
   - Create a storage bucket named `images`
   - Set it as public
   - Configure storage policies (see [SETUP_STORAGE.md](my-app/SETUP_STORAGE.md))

## 🔐 Environment Variables

Create a `.env` file in the `my-app` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Secret (for admin authentication)
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=8080
NODE_ENV=development
```

## 📖 Usage

### For Students

1. **Browse Visits**
   - Visit the homepage to see recent and upcoming visits
   - Use the "Upcoming Visits" page to see all available visits
   - Filter by department or search for specific visits

2. **Register for Visits**
   - Click "Register for Visit" on any upcoming visit
   - Fill out the registration form with your details
   - Submit to register for the visit

3. **View Visit Details**
   - Click on any visit card to see detailed information
   - View images, descriptions, and learning outcomes

### For Administrators

1. **Admin Login**
   - Navigate to `/admin`
   - Use your admin credentials to log in

2. **Manage Visits**
   - View all upcoming and past visits
   - Add new visits with the "Add New Visit" button
   - Edit existing visits
   - Monitor student registrations

3. **Add New Visit**
   - Fill out the comprehensive visit form
   - Upload visit images
   - Set visit details, location, and capacity

## 🔌 API Endpoints

### Public Endpoints
- `GET /` - Homepage
- `GET /upcoming` - Upcoming visits listing
- `GET /past` - Past visits archive
- `GET /visit/:id` - Individual visit details
- `GET /register-visit/:id` - Student registration form

### Admin Endpoints
- `GET /admin` - Admin dashboard
- `GET /admin/login` - Admin login page
- `GET /admin/add-visit` - Add new visit form

### API Routes (Express Server)
- `GET /api/ping` - Health check
- `POST /api/auth/login` - Admin authentication
- `POST /api/visits` - Create new visit
- `GET /api/visits` - Get all visits

## 🚀 Deployment

### Netlify Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Configure environment variables in Netlify dashboard

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

### Manual Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use TailwindCSS for styling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **KJ Somaiya College of Engineering** - For the opportunity to build this system
- **Supabase** - For the excellent backend-as-a-service platform
- **Radix UI** - For the accessible UI components
- **TailwindCSS** - For the utility-first CSS framework

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Email: manassuple163@gmail.com

---

**Built with ❤️ for KJ Somaiya Institute Of Technology**
