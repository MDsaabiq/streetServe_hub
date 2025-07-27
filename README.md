# 🍜 StreetServe Hub

**Your Complete Street Food Ecosystem** 🚀

StreetServe Hub is a comprehensive, production-ready platform that connects street food vendors, buyers, and property owners in one unified marketplace. Built with modern React and Firebase, it provides a seamless experience for managing products, orders, properties, and business operations in the street food industry.

## ✨ Features

### 🛒 **For Buyers**
- **Browse Marketplace**: Discover products from trusted vendors with advanced search and filtering
- **Smart Shopping Cart**: Add multiple items with real-time inventory checking
- **Seamless Checkout**: Step-by-step checkout process with multiple payment options
- **Order Management**: Track orders, view history, and cancel pending orders
- **Property Discovery**: Browse and request commercial spaces for street food business
- **Mobile-First Experience**: Optimized mobile interface with hamburger navigation

### 🏪 **For Vendors**
- **Inventory Management**: Add products with photos, descriptions, and real-time stock tracking
- **Order Processing**: Receive, confirm, and manage customer orders with status updates
- **Product Analytics**: Track sales performance and inventory levels
- **Customer Communication**: View customer details and manage order fulfillment
- **Business Dashboard**: Comprehensive vendor dashboard with order notifications
- **Mobile Order Management**: Touch-optimized interface for managing orders on-the-go

### 🏢 **For Landowners**
- **Property Listings**: Add commercial properties with detailed descriptions and photos
- **Lease Management**: Handle rental requests from street food entrepreneurs
- **Property Analytics**: Track occupancy, revenue, and property performance
- **Tenant Relations**: Manage lease agreements and tenant communications
- **Business Documentation**: Support for legal and business documentation
- **Revenue Tracking**: Monitor rental income and property ROI

## 🚀 **Key Highlights**

### 🎯 **Core Features**
- **Real-time Inventory Management**: Automatic stock updates with transaction safety
- **Advanced Order System**: Complete order lifecycle from placement to delivery
- **Smart Cancellation**: Buyers can cancel orders with automatic inventory restoration
- **Role-based Authentication**: Secure user management with Firebase Auth
- **Mobile-First Design**: Hamburger navigation and touch-optimized interface
- **Professional UI/UX**: Modern design system with consistent branding

### 📱 **Mobile Experience**
- **Responsive Navigation**: Hamburger menu for mobile, traditional navbar for desktop
- **Touch Optimization**: 44px minimum touch targets for accessibility
- **Mobile Cart**: Optimized shopping cart experience on mobile devices
- **Gesture Support**: Swipe and tap interactions for natural mobile feel
- **Viewport Awareness**: Adapts to device orientation and screen size

### 🔒 **Security & Performance**
- **Firebase Transactions**: Atomic operations for data consistency
- **Secure Authentication**: Multi-role user management system
- **Error Handling**: Comprehensive error management and user feedback
- **Performance Optimized**: Fast loading and smooth animations
- **Cross-browser Support**: Works on all modern browsers and devices

## 🛠️ **Tech Stack**

### 🎨 **Frontend**
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Tailwind CSS + Radix UI + shadcn/ui
- **State Management**: React Context API + Custom Hooks
- **Routing**: React Router v6 with protected routes
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React (500+ icons)

### 🔥 **Backend & Database**
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Database**: Firestore with real-time updates
- **Authentication**: Firebase Auth with role-based access
- **File Storage**: Firebase Storage for images
- **Security**: Firestore security rules and transactions

### 📱 **Mobile & Performance**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Touch Optimization**: Custom CSS for mobile interactions
- **Performance**: Vite for fast builds and hot reload
- **PWA Ready**: Service worker and manifest support
- **Cross-platform**: Works on iOS, Android, and desktop browsers

## 🏁 **Getting Started**

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, or bun
- Firebase project setup

### Installation
```bash
# Clone the repository
git clone https://github.com/SaiManjith07/streetserve-hub.git
cd streetserve-hub

# Install dependencies
npm install
# or
yarn install
# or
bun install
```

### Environment Setup
Create a `.env` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the App
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

## 📱 **User Roles & Workflows**

### 🛍️ **Buyer Journey**
1. **🏠 Home Dashboard** → Personalized welcome with quick actions
2. **🛒 Browse Marketplace** → Discover products with advanced search and filters
3. **🛍️ Shopping Cart** → Add multiple items with real-time inventory checking
4. **💳 Checkout Process** → Step-by-step order placement with payment options
5. **📦 Order Management** → Track orders, view history, and cancel if needed
6. **🏢 Property Discovery** → Browse commercial spaces and submit lease requests
7. **📱 Mobile Experience** → Full functionality on mobile with hamburger navigation

### 🏪 **Vendor Journey**
1. **🏠 Vendor Dashboard** → Welcome screen with inventory management options
2. **📦 Add Inventory** → Upload products with photos, descriptions, and pricing
3. **🛒 Manage Products** → Edit existing products, update prices and availability
4. **📊 Order Processing** → Receive notifications, confirm/decline orders
5. **🚚 Order Fulfillment** → Update order status from processing to delivered
6. **📱 Mobile Management** → Complete order management on mobile devices
7. **📈 Business Analytics** → Track sales performance and customer data

### 🏢 **Landowner Journey**
1. **🏠 Property Dashboard** → Personalized interface for property management
2. **➕ Add Properties** → List commercial spaces with detailed descriptions
3. **🏢 Manage Properties** → View and edit existing property listings
4. **📋 Lease Requests** → Handle rental applications from entrepreneurs
5. **💰 Revenue Tracking** → Monitor rental income and property performance
6. **📱 Mobile Access** → Full property management on mobile devices
7. **📊 Analytics Dashboard** → Occupancy rates and business insights

## 🎨 **Design System**

### 🎯 **Visual Identity**
- **Color Scheme**: Modern orange/red gradient theme representing food and energy
- **Typography**: Clean, readable fonts optimized for all screen sizes
- **Branding**: Custom favicon and professional meta tags
- **Components**: Consistent design language across all interfaces
- **Accessibility**: WCAG 2.1 AA compliant with proper contrast ratios

### 📱 **Mobile-First Approach**
- **Responsive Breakpoints**: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- **Touch Optimization**: 44px minimum touch targets for accessibility
- **Hamburger Navigation**: Collapsible menu for mobile with smooth animations
- **Gesture Support**: Swipe, tap, and touch interactions
- **Viewport Awareness**: Adapts to device orientation and screen size

### 🎨 **UI Components**
- **Cards**: Gradient backgrounds with hover effects and shadows
- **Buttons**: Touch-optimized with loading states and feedback
- **Forms**: Step-by-step wizards with validation and error handling
- **Navigation**: Role-based menus with conditional rendering
- **Modals**: Mobile-friendly dialogs with backdrop blur effects

## 🆕 **Recent Updates**

### 🔄 **Order Management System**
- **Smart Cancellation**: Buyers can cancel orders with automatic inventory restoration
- **Transaction Safety**: Firebase transactions ensure data consistency
- **Real-time Updates**: Order status changes reflect immediately
- **Mobile Optimization**: Touch-friendly order management interface

### 📱 **Mobile Navigation Overhaul**
- **Hamburger Menu**: Professional mobile navigation with smooth animations
- **Touch Targets**: All interactive elements meet 44px accessibility standards
- **Responsive Design**: Seamless experience across all device sizes
- **Performance**: Hardware-accelerated animations and optimized rendering

### 🏠 **Role-Based Home Pages**
- **Personalized Dashboards**: Custom content for buyers, vendors, and landowners
- **Feature Sections**: Detailed capability overviews for each user type
- **Quick Actions**: Direct access to main functionality from home page
- **Professional Branding**: Consistent visual identity across all pages

## 🔧 **Development**

### Build for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## 🧪 **Testing & Quality Assurance**

### 📱 **Mobile Testing**
- **Device Testing**: Verified on iPhone, Android, and tablet devices
- **Browser Testing**: Chrome, Safari, Firefox, and Edge compatibility
- **Touch Interactions**: All buttons and gestures work smoothly
- **Responsive Design**: Layouts adapt perfectly to all screen sizes

### 🔒 **Security Testing**
- **Authentication**: Role-based access control verified
- **Data Validation**: Input sanitization and validation
- **Firebase Rules**: Secure database access rules
- **Transaction Safety**: Atomic operations for data consistency

### ⚡ **Performance Testing**
- **Load Times**: Optimized for fast initial page load
- **Mobile Performance**: Smooth animations and interactions
- **Database Queries**: Efficient Firestore queries and indexing
- **Image Optimization**: Compressed images for faster loading

## 🚀 **Deployment**

### 📦 **Build Process**
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### 🌐 **Deployment Options**
- **Vercel**: Recommended for React apps with automatic deployments
- **Netlify**: Easy deployment with continuous integration
- **Firebase Hosting**: Integrated with Firebase backend
- **GitHub Pages**: Free hosting for static sites

### 🔧 **Environment Variables**
Ensure all Firebase configuration variables are set in your deployment environment:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 📊 **Project Structure**
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (Button, Card, etc.)
│   ├── Cart.tsx        # Shopping cart component
│   ├── Navbar.tsx      # Mobile-responsive navigation
│   └── ProtectedRoute.tsx # Route protection
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── CartContext.tsx # Shopping cart state
├── hooks/              # Custom React hooks
│   └── use-toast.ts    # Toast notification hook
├── lib/                # Utility functions and configs
│   ├── firebase.ts     # Firebase configuration
│   └── utils.ts        # Utility functions
├── pages/              # Route components
│   ├── Home.tsx        # Role-based home pages
│   ├── Marketplace.tsx # Product browsing
│   ├── Orders.tsx      # Order management with cancellation
│   ├── VendorOrders.tsx # Vendor order processing
│   ├── Checkout.tsx    # Step-by-step checkout
│   └── [role]/         # Role-specific pages
├── styles/             # CSS and styling
│   ├── mobile-navbar.css # Mobile navigation styles
│   └── globals.css     # Global styles
├── assets/             # Static assets
│   └── images/         # Hero images and icons
└── main.tsx           # Application entry point
```

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

### 🛠️ **Technology Stack**
- **React Ecosystem**: Built with React 18, TypeScript, and Vite
- **UI Framework**: Powered by Radix UI and shadcn/ui components
- **Styling**: Tailwind CSS with custom mobile optimizations
- **Icons**: Lucide React icon library (500+ icons)
- **Backend**: Firebase for authentication, database, and storage

### 🎨 **Design & UX**
- **Mobile-First**: Responsive design principles and touch optimization
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design
- **Performance**: Optimized for fast loading and smooth interactions
- **User Experience**: Intuitive navigation and clear information architecture

### 🌟 **Special Features**
- **Real-time Updates**: Live order tracking and inventory management
- **Transaction Safety**: Atomic operations for data consistency
- **Role-Based Access**: Secure authentication and authorization
- **Cross-Platform**: Works seamlessly on all devices and browsers

---

## 📈 **Project Status**

✅ **Production Ready**: Fully functional with comprehensive features
✅ **Mobile Optimized**: Perfect mobile experience with hamburger navigation
✅ **Secure**: Firebase-powered backend with transaction safety
✅ **Scalable**: Built with modern architecture for growth
✅ **Accessible**: WCAG compliant with proper accessibility features

---

**Made with ❤️ for the street food community** 🍜🚀

*Connecting vendors, buyers, and landowners in the digital marketplace*
