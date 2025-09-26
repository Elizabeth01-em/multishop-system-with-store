# Multishop System - Complete Setup and Feature Guide

This document provides step-by-step instructions on how to run and showcase all features of the multishop system, which consists of three main components:
1. Admin Dashboard (React)
2. Backend API (NestJS)
3. E-commerce Store (Next.js)

## System Architecture Overview

The multishop system is designed to handle multiple shops with centralized administration. It includes:
- An admin dashboard for owners and shop managers to manage inventory, orders, and analytics
- A backend API that handles all business logic and data storage
- A customer-facing e-commerce store for browsing and purchasing products

## Prerequisites

Before running the application, ensure you have installed:
- Node.js (v16 or higher)
- PostgreSQL database
- Git (optional, for cloning the repository)

## Database Setup

1. Install PostgreSQL on your system
2. Create a new database for the application:
   ```sql
   CREATE DATABASE multishop_db;
   ```
3. Create a database user with appropriate permissions:
   ```sql
   CREATE USER multishop_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE multishop_db TO multishop_user;
   ```

## Backend Setup (API Server)

### 1. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=multishop_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=multishop_db

# JWT Secret - CHANGE THIS TO A SECURE RANDOM STRING IN PRODUCTION
JWT_SECRET=my_very_secret_key_that_should_be_changed_in_production

# Application Port
PORT=3002
```

### 2. Install Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Run the Backend

Start the backend server in development mode:

```bash
npm run start:dev
```

The backend will be available at `http://localhost:3002`.

During the first run, the system will automatically:
- Create an initial owner user with credentials:
  - Email: `owner@test.com`
  - Password: `password123`
- Seed default system settings

## Admin Dashboard Setup

### 1. Install Dependencies

Navigate to the admin-dashboard directory and install dependencies:

```bash
cd admin-dashboard
npm install
```

### 2. Run the Admin Dashboard

Start the development server:

```bash
npm start
```

The admin dashboard will be available at `http://localhost:3000`.

## E-commerce Store Setup

### 1. Install Dependencies

Navigate to the ecommerce-store directory and install dependencies:

```bash
cd ecommerce-store
npm install
```

### 2. Run the E-commerce Store

Start the development server:

```bash
npm run dev
```

The e-commerce store will be available at `http://localhost:3001`.

## Accessing All Components

Once all components are running, you can access:

1. **Admin Dashboard**: http://localhost:3000
2. **E-commerce Store**: http://localhost:3001
3. **Backend API**: http://localhost:3002

## Feature Showcase Guide

### Admin Dashboard Features

#### 1. Authentication & Roles
- Login as the owner using:
  - Email: `owner@test.com`
  - Password: `password123`
- Different roles have different access levels:
  - OWNER: Full access to all features
  - MANAGER: Shop-specific management
  - STAFF: Basic operational tasks

#### 2. Dashboard Overview
- Main dashboard with widgets showing key metrics
- Role-based access control for different views

#### 3. Inventory Management
- View and manage inventory across all shops
- Add, edit, and delete products
- Barcode scanning functionality
- Stock level monitoring with threshold alerts

#### 4. Order Management
- View and process customer orders
- Order status tracking
- Print functionality for order documents

#### 5. Transfer Management
- Request and manage stock transfers between shops
- Track transfer status and history

#### 6. Shop Management (Owner Only)
- Create and manage multiple shops
- Assign staff to specific shops

#### 7. User Management (Owner Only)
- Create and manage users
- Assign roles and permissions

#### 8. Analytics & Reporting (Owner Only)
- Sales analytics and reporting
- Export data to Excel/PDF formats

#### 9. Global Inventory (Owner Only)
- Centralized view of inventory across all shops
- Manage product catalog globally

#### 10. Settings (Owner Only)
- Configure system-wide settings
- Tax rates, shipping fees, and notification preferences

### E-commerce Store Features

#### 1. Customer Authentication
- Customer registration and login
- Profile management

#### 2. Product Catalog
- Browse products by category
- Search and filter functionality
- Product detail pages with images

#### 3. Shopping Cart
- Add/remove products
- Adjust quantities
- Real-time price calculation

#### 4. Checkout Process
- Secure checkout flow
- Order placement and confirmation

#### 5. Order History
- View past orders
- Order status tracking

## Presentation Tips for Client Demo

### 1. Preparation
- Ensure all three components are running before the demo
- Have the owner credentials ready
- Prepare sample data if needed

### 2. Demo Flow
1. Start with the admin dashboard to show system management capabilities
2. Demonstrate owner-specific features like shop and user management
3. Show inventory management and order processing workflows
4. Switch to the e-commerce store to demonstrate the customer experience
5. Place a sample order and show how it appears in the admin panel

### 3. Key Points to Highlight
- Multi-shop capability with centralized management
- Role-based access control
- Real-time inventory tracking
- Comprehensive reporting and analytics
- Seamless integration between all components
- Mobile-responsive interfaces

## Troubleshooting Common Issues

### Database Connection Errors
- Verify PostgreSQL is running
- Check database credentials in the .env file
- Ensure the database user has proper permissions

### JWT Secret Error
- If you see "JWT_SECRET is not defined in environment variables", ensure you have created the .env file in the backend directory with the JWT_SECRET variable defined
- The JWT secret should be a strong random string in production environments

### Port Conflicts
- Change the PORT value in the backend .env file
- Update the API base URLs in the frontend applications if changing ports

### Dependency Installation Issues
- Delete node_modules folders and package-lock.json files
- Reinstall dependencies with `npm install`

### CORS Issues
- The backend is configured to allow CORS by default
- If experiencing issues, verify the cors configuration in `backend/src/main.ts`

## Deployment Considerations

For production deployment:

1. **Database Security**
   - Use strong passwords for database users
   - Restrict database access to application servers only

2. **Environment Variables**
   - Use secure, randomly generated secrets for JWT
   - Store environment variables securely in production

3. **HTTPS Configuration**
   - Enable HTTPS for all components
   - Use valid SSL certificates

4. **Performance Optimization**
   - Use production builds for frontend applications
   - Configure appropriate caching strategies
   - Optimize database queries and indexes

5. **Backup Strategy**
   - Implement regular database backups
   - Backup uploaded product images

## Conclusion

This multishop system provides a comprehensive solution for managing multiple retail locations with a centralized administration interface. The modular architecture allows for easy maintenance and future enhancements.

For any questions or support, please refer to the individual component README files or contact the development team.