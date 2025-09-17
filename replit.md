# SecurePass - Password Manager

## Overview

SecurePass is a modern, secure password management application built with React frontend and Express backend. The application allows users to store, organize, and manage their passwords with military-grade encryption. It features a clean, responsive interface built with shadcn/ui components and Tailwind CSS, providing users with secure password storage, generation capabilities, and organizational tools through categories.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Theme System**: Custom theme provider supporting light/dark modes with CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect using Passport.js
- **Session Management**: Express sessions with PostgreSQL store for persistent login state
- **Security**: AES-256 encryption for password storage using crypto-js

### Database Design
- **Users Table**: Stores user profile information (mandatory for Replit Auth)
- **Sessions Table**: Handles session persistence (mandatory for Replit Auth)
- **Passwords Table**: Encrypted password storage with metadata (website, username, notes, favorites)
- **Categories Table**: User-defined categories for password organization
- **Relationships**: Foreign key constraints ensuring data integrity and cascade deletes

### Security Architecture
- **Encryption**: Client-side and server-side AES-256 encryption for sensitive data
- **Authentication**: OAuth 2.0/OpenID Connect through Replit's identity provider
- **Password Strength**: Real-time password strength calculation and feedback
- **Session Security**: Secure HTTP-only cookies with proper expiration handling

### Development Environment
- **Hot Reload**: Vite development server with HMR for fast development cycles
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Organization**: Monorepo structure with shared types and schemas between client and server
- **Path Aliases**: Configured import aliases for clean, maintainable code structure

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection and serverless compatibility
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives for accessibility
- **wouter**: Lightweight React router

### Authentication & Security
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **crypto-js**: Cryptographic functions for password encryption

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the application
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema definition