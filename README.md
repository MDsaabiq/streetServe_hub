# 🍜 StreetServe Hub

**Your Complete Street Food Ecosystem** 🚀

StreetServe Hub is a comprehensive platform that connects street food vendors, buyers, and property owners in one unified marketplace. Whether you're a vendor looking to source ingredients, a buyer seeking fresh products, or a landowner wanting to rent commercial spaces, StreetServe Hub has you covered.

## ✨ Features

### 🛒 **For Buyers**
- Browse and purchase fresh ingredients and supplies
- Advanced search and filtering
- Shopping cart with step-by-step checkout
- Order tracking and history
- Property rental requests
- Comprehensive user profiles

### 🏪 **For Vendors**
- List and manage products with inventory tracking
- Real-time order management
- Sales analytics and revenue tracking
- Customer management
- Business profile with GST integration
- Automatic inventory updates

### 🏢 **For Landowners**
- List commercial properties for rent
- Manage lease requests and approvals
- Property analytics and revenue tracking
- Tenant management
- Business documentation support

## 🚀 **Key Highlights**

- **Real-time Inventory Management**: Automatic stock updates when orders are placed
- **Step-by-step Checkout**: Professional e-commerce experience with multiple payment options
- **Role-based Dashboards**: Customized interfaces for each user type
- **Comprehensive Analytics**: Business insights and performance metrics
- **Secure Transactions**: Firebase-powered backend with transaction safety
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ **Tech Stack**

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Radix UI + shadcn/ui
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

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
1. **Browse Marketplace** → Discover products from various vendors
2. **Add to Cart** → Select quantities and manage cart
3. **Checkout Process** → Step-by-step order placement
4. **Order Tracking** → Monitor order status and delivery
5. **Property Search** → Find commercial spaces for rent

### 🏪 **Vendor Journey**
1. **Product Management** → Add/edit products with inventory
2. **Order Processing** → Manage incoming orders
3. **Analytics Dashboard** → Track sales and performance
4. **Customer Relations** → View customer information
5. **Business Profile** → Maintain professional presence

### 🏢 **Landowner Journey**
1. **Property Listing** → Add commercial properties
2. **Lease Management** → Handle rental requests
3. **Tenant Screening** → Review and approve applications
4. **Revenue Tracking** → Monitor rental income
5. **Property Analytics** → Occupancy and performance metrics

## 🎨 **Design System**

- **Color Scheme**: Modern orange/red gradient theme representing food and energy
- **Typography**: Clean, readable fonts optimized for all screen sizes
- **Components**: Consistent design language across all interfaces
- **Accessibility**: WCAG compliant with proper contrast ratios
- **Responsive**: Mobile-first design approach

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

## 📊 **Project Structure**
```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configs
├── pages/              # Route components
├── types/              # TypeScript type definitions
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

- Built with modern React ecosystem
- UI components powered by Radix UI and shadcn/ui
- Icons by Lucide React
- Styling with Tailwind CSS

---

**Made with ❤️ for the street food community** 🍜🚀
