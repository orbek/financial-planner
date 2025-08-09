# Financial Planner - React Edition

A modern, full-stack financial planning application built with React, TypeScript, Express.js, and powered by AI for intelligent financial insights.

## 🚀 Features

### Core Features
- **Multi-account Management** - Track checking, savings, credit cards, investments, and more
- **Transaction Tracking** - Automatic categorization and comprehensive transaction history
- **AI-Powered Statement Processing** - Upload PDF statements for automatic transaction extraction
- **Real-time Dashboard** - Visual insights into your financial health
- **Microsoft OAuth Authentication** - Secure login with your Microsoft account

### New Features (React Edition)
- **🎯 Financial Goals** - Set and track savings goals with visual progress indicators
- **📊 Budget Tracking** - Create budgets and monitor spending against targets
- **🧠 AI Financial Health Score** - Get personalized recommendations for financial improvement
- **📈 Advanced Charts** - Interactive visualizations powered by Recharts
- **🎨 Modern UI/UX** - Beautiful interface with smooth animations using Framer Motion
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualizations
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **Microsoft MSAL** for authentication

### Backend
- **Express.js** with TypeScript
- **Supabase** for database and real-time features
- **Microsoft Azure AD** for OAuth authentication
- **Google Gemini AI** for PDF processing and insights
- **JWT** for session management
- **Joi** for API validation

### DevOps & Deployment
- **Docker** and Docker Compose for containerization
- **GitHub Actions** ready for CI/CD
- **Environment-based configuration**

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional)
- Supabase account
- Microsoft Azure AD app registration
- Google AI API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-planner-1
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Copy the example files and fill in your credentials:
   ```bash
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

4. **Configure environment variables**
   
   **Client (.env):**
   ```env
   VITE_CLIENT_ID=your_azure_client_id
   VITE_API_URL=http://localhost:5000
   ```

   **Server (.env):**
   ```env
   CLIENT_ID=your_azure_client_id
   CLIENT_SECRET=your_azure_client_secret
   TENANT_ID=your_azure_tenant_id
   JWT_SECRET=your_secure_jwt_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   GOOGLE_API_KEY=your_google_ai_api_key
   ```

5. **Set up database**
   
   Create the following tables in your Supabase database:
   ```sql
   -- Accounts table
   CREATE TABLE accounts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     name TEXT NOT NULL,
     type TEXT NOT NULL,
     balance NUMERIC DEFAULT 0,
     currency TEXT DEFAULT 'USD',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Transactions table
   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     account_id UUID REFERENCES accounts(id),
     date DATE NOT NULL,
     amount NUMERIC NOT NULL,
     type TEXT NOT NULL,
     description TEXT NOT NULL,
     category TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Docker Deployment

1. **Set up environment variables**
   Create a `.env` file in the root directory with all required variables.

2. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

## 🏗 Architecture

### Frontend Architecture
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── charts/         # Chart components (Recharts)
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   └── Header.tsx      # Top navigation bar
│   ├── pages/              # Route components
│   │   ├── LandingPage.tsx # Marketing landing page
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Accounts.tsx    # Account management
│   │   ├── Transactions.tsx# Transaction management
│   │   ├── Budget.tsx      # Budget tracking (NEW)
│   │   ├── Goals.tsx       # Financial goals (NEW)
│   │   ├── Statements.tsx  # PDF upload
│   │   └── Settings.tsx    # User settings
│   ├── hooks/              # Custom React hooks
│   │   └── useApi.ts       # API integration with React Query
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   └── utils/              # Utility functions
```

### Backend Architecture
```
server/
├── src/
│   ├── routes/             # API route handlers
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── accounts.ts     # Account CRUD operations
│   │   ├── transactions.ts # Transaction management
│   │   ├── dashboard.ts    # Dashboard data (NEW)
│   │   └── statements.ts   # PDF upload processing
│   ├── middleware/         # Express middleware
│   │   └── auth.ts         # JWT authentication
│   ├── services/           # Business logic
│   │   └── pdfExtractor.ts # AI-powered PDF processing
│   ├── config/             # Configuration
│   │   └── database.ts     # Supabase client
│   └── index.ts            # Express app entry point
```

## 🎨 New Features Showcase

### 1. Financial Goals Tracking
- Set savings targets with deadlines
- Visual progress indicators
- Monthly contribution suggestions
- Achievement celebrations

### 2. Budget Management
- Category-based budgets
- Real-time spending vs. budget tracking
- Visual progress bars
- Smart alerts and recommendations

### 3. AI Financial Health Score
- Comprehensive financial wellness assessment
- Personalized recommendations
- Multiple factors analysis (savings rate, debt ratio, etc.)
- Monthly trend tracking

### 4. Enhanced Dashboard
- Interactive charts with Recharts
- Real-time financial metrics
- Account balance trends
- Spending pattern analysis

### 5. Modern UI/UX
- Smooth animations with Framer Motion
- Responsive design for all devices
- Dark mode support (coming soon)
- Accessibility optimizations

## 🔧 Performance Optimizations

### Frontend Optimizations
- **Code Splitting** - Lazy loading of route components
- **React Query** - Intelligent caching and background updates
- **Virtual Scrolling** - For large transaction lists
- **Image Optimization** - Optimized assets and lazy loading
- **Bundle Analysis** - Vite's built-in optimization

### Backend Optimizations
- **Database Indexing** - Optimized queries with proper indexes
- **Rate Limiting** - API protection against abuse
- **Compression** - Gzip compression for responses
- **Caching** - Redis-ready caching layer
- **Connection Pooling** - Efficient database connections

## 🔐 Security Features

- **OAuth 2.0** - Microsoft authentication
- **JWT Tokens** - Secure session management
- **Input Validation** - Joi validation on all endpoints
- **CORS Protection** - Configured for production
- **Helmet.js** - Security headers
- **Rate Limiting** - DDoS protection
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Sanitized inputs

## 📊 Monitoring & Analytics

- **Error Tracking** - Comprehensive error handling
- **Performance Monitoring** - Built-in metrics
- **User Analytics** - Privacy-respecting usage tracking
- **Health Checks** - System status endpoints

## 🚀 Deployment

### Production Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy backend** (choose one):
   - Heroku
   - Vercel
   - Railway
   - DigitalOcean App Platform

3. **Deploy frontend** (choose one):
   - Vercel (recommended)
   - Netlify
   - Cloudflare Pages

4. **Configure environment variables** in your deployment platform

### Environment Variables Checklist
- [ ] Microsoft Azure AD credentials
- [ ] Supabase database URL and key
- [ ] Google AI API key
- [ ] JWT secret key
- [ ] Client URL for CORS
- [ ] Redirect URIs for OAuth

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆚 Streamlit vs React Comparison

| Feature | Streamlit (Old) | React (New) |
|---------|----------------|-------------|
| UI Framework | Streamlit | React + TypeScript |
| Styling | Limited CSS | Tailwind CSS + Custom |
| Animations | None | Framer Motion |
| Charts | Altair | Recharts |
| Responsiveness | Basic | Fully Responsive |
| Performance | Server-rendered | Client-side optimized |
| User Experience | Simple | Professional |
| Scalability | Limited | Highly scalable |
| Customization | Restricted | Unlimited |
| New Features | - | Goals, Budget, Health Score |

## 🎯 Future Roadmap

### Phase 1 (Next 3 months)
- [ ] Dark mode support
- [ ] Mobile app (React Native)
- [ ] Investment portfolio tracking
- [ ] Bill reminders and notifications

### Phase 2 (Next 6 months)
- [ ] Advanced AI insights and predictions
- [ ] Multi-currency support
- [ ] Bank API integrations (Plaid)
- [ ] Collaborative budgets (family accounts)

### Phase 3 (Next year)
- [ ] Machine learning spending predictions
- [ ] Tax optimization suggestions
- [ ] Financial advisor integration
- [ ] Cryptocurrency tracking

## 📞 Support

For support, email support@financeplanner.com or create an issue in this repository.

---

Built with ❤️ by the Financial Planner Team
