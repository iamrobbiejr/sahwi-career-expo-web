# SahwiCareerExpo Platform - Frontend

A modern, community-focused platform for the African Professionalisation Initiative (API) PFM community built with
React, Vite, and TailwindCSS.

## 🚀 Features

- **Personalized Dashboards** - Role-based dashboards for Students, Professionals, Company Reps, and Universities
- **Event Management** - Browse, register, and manage event attendance (In-Person & Virtual)
- **Community Forums** - Engage in discussions with admin-regulated forums
- **Articles & Learning** - Read and comment on professional articles
- **Messaging System** - Direct messaging between community members
- **Donation Campaigns** - Support community initiatives
- **Responsive Design** - Mobile-first, works beautifully on all devices
- **Smooth Animations** - Powered by Framer Motion for delightful interactions
- **Real-time Updates** - React Query for optimal data fetching and caching

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management
- **Framer Motion** - Animation library
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Beautiful icon library

## 📦 Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd api-pfm-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and set your Laravel API URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

4. **Start development server**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (buttons, cards, etc.)
│   ├── layout/          # Layout components (Header, Sidebar)
│   ├── home/            # Home page specific components
│   ├── events/          # Event related components
│   ├── forums/          # Forum components
│   ├── articles/        # Article components
│   ├── messages/        # Messaging components
│   └── donations/       # Donation components
├── pages/               # Page components (routes)
├── layouts/             # Layout wrappers
├── store/               # Zustand stores
├── services/            # API services
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── App.jsx              # Main app component with routing
├── main.jsx             # Entry point
└── index.css            # Global styles with Tailwind

```

## 🎨 Design System

### Colors

- **Primary**: Blue (#2563EB) - Trust, professionalism
- **Secondary**: Orange (#F59E0B) - Energy, innovation
- **Accent**: Green (#10B981) - Growth, connections

### Components

- Custom button styles: `.btn-primary`, `.btn-secondary`, `.btn-outline`
- Card component: `.card`
- Input fields: `.input-field`

## 📱 User Roles & Permissions

### Student

- Register for events
- Participate in forums
- Comment on articles
- Send messages
- Make donations

### Professional

- All student permissions
- Create talks/presentations
- Post in forums
- Message other members

### Company Representative

- Edit organization profile
- Register company for events
- Create talks
- Add team members
- Message community

### University

- Create and manage events
- Create articles
- Host talks
- Message community

## 🔌 API Integration

The app connects to a Laravel backend. API endpoints are configured in `src/services/api.js`:

- Authentication: `/auth/login`, `/auth/register`
- Events: `/events`, `/events/:id/register`
- Forums: `/forums`, `/forums/:id/replies`
- Articles: `/articles`, `/articles/:id/comments`
- Messages: `/messages`
- Donations: `/donations/campaigns`

## 🚀 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Build & Deployment

```bash
# Build for production
npm run build

# The build output will be in the `dist` folder
```

Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

### Environment Variables for Production

Make sure to set `VITE_API_BASE_URL` to your production API URL.

## 🎯 Roadmap

### Phase 1: Core Features (Current)

- [x] Authentication & Authorization
- [x] Dashboard with personalized feed
- [x] Basic routing structure
- [x] Layout components
- [ ] Events listing and registration
- [ ] Forums with threading
- [ ] Articles with comments

### Phase 2: Engagement Features

- [ ] Real-time messaging
- [ ] Notifications system
- [ ] Connection/networking features
- [ ] Calendar integration
- [ ] Search functionality

### Phase 3: Advanced Features

- [ ] Video calls for mentorship
- [ ] Job board integration
- [ ] Certificate management
- [ ] Analytics dashboards
- [ ] Progressive Web App (PWA)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- SahwiCareerExpo Summit Team
- African Professionalisation Initiative
- All contributors and community members

---

Built with ❤️ for the SahwiCareerExpo Community
