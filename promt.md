# ROLE

You are a Principal Frontend Engineer with over 15 years of experience building enterprise-scale React applications.

You specialize in:

- React 19
- TypeScript
- Vite
- Material UI v7
- Redux Toolkit
- RTK Query
- React Router v7
- React Hook Form
- Zod
- Axios
- Enterprise UI/UX
- Account Management Systems
- Security Best Practices
- Clean Architecture
- Feature-Based Architecture

You are building the Customer Portal of the Smart Park platform.

---

# PROJECT CONTEXT

Project:

SMART PARK
Smart Amusement Park Management & Business Intelligence Platform

Completed modules:

✅ Frontend Architecture

✅ Project Setup

✅ Authentication

✅ Layout & Navigation

✅ Home Page

✅ Ticket Catalog

✅ Booking & Shopping Cart

✅ Checkout & Payment

✅ My Tickets

✅ Membership & Loyalty

Now implement the **User Profile & Account Management Module**.

This module must integrate with:

- Authentication
- Membership
- Booking
- My Tickets
- Notifications
- Payment
- Customer Support

Everything must integrate directly with the Spring Boot backend.

All business logic must strictly follow:

- Software Requirement Specification (SRS)
- OpenAPI Specification
- Backend Contract

Never invent APIs.

Never invent business rules.

---

# INPUT

I will provide:

- Software Requirement Specification (SRS)
- OpenAPI Specification
- Backend Contract
- Existing React Project

Analyze all documents before implementation.

---

# OBJECTIVE

Implement a complete User Profile & Account Management module.

Customers must be able to:

- View profile
- Edit profile
- Upload avatar
- Change password
- Manage contact information
- Manage emergency contact (if supported)
- Manage preferences
- Manage language
- Manage notification preferences
- Manage privacy settings
- View connected accounts
- Delete account (if supported)

Everything must be production-ready.

---

# TASKS

## 1. Analyze Business Rules

Analyze all profile-related requirements.

Identify:

- Editable fields
- Read-only fields
- Required information
- Password policy
- Avatar rules
- Notification preferences
- Privacy rules
- Account deletion rules

Explain all business rules before implementation.

---

## 2. API Analysis

Analyze OpenAPI.

Identify every Profile endpoint.

Map:

Profile Page

↓

Endpoint

↓

Request DTO

↓

Response DTO

↓

Permission

Do not modify backend APIs.

---

## 3. Folder Structure

Create:

features/profile/

pages/

components/

hooks/

services/

schemas/

types/

store/

constants/

utils/

index.ts

---

## 4. Profile Dashboard

Display:

- Avatar
- Full Name
- Email
- Phone Number
- Date of Birth
- Gender
- Membership Level
- Reward Points
- Current Status
- Joined Date

Display only data returned by backend.

---

## 5. Edit Profile

Allow editing:

- Full Name
- Phone Number
- Address
- Date of Birth
- Gender
- Avatar
- Preferences

Validate using backend rules.

---

## 6. Avatar Management

Implement:

- Upload Avatar
- Replace Avatar
- Remove Avatar
- Preview Image
- File Validation
- Upload Progress

Follow backend upload APIs.

---

## 7. Change Password

Implement:

- Current Password
- New Password
- Confirm Password

Display password strength.

Validation must match backend.

---

## 8. Account Preferences

Implement:

- Language
- Theme
- Time Zone
- Preferred Park
- Preferred Communication

Load available options from backend whenever supported.

---

## 9. Notification Preferences

Allow users to enable or disable:

- Email Notifications
- SMS Notifications
- Push Notifications
- Promotional Notifications
- Membership Notifications
- Booking Notifications

---

## 10. Privacy & Security

Display:

- Last Login
- Active Sessions (if supported)
- Connected Devices
- Connected Accounts
- Login History (if supported)

Allow:

- Logout Other Devices
- Revoke Sessions (if backend supports)

---

## 11. Account Deletion

If supported:

Display:

- Warning
- Confirmation Dialog
- Delete Confirmation
- Final Confirmation

Never delete locally.

Always call backend APIs.

---

## 12. Cross Module Integration

Synchronize profile updates with:

Authentication

↓

Membership

↓

Booking

↓

Checkout

↓

My Tickets

↓

Notifications

↓

Header User Information

Any profile update must immediately refresh dependent modules.

---

## 13. Components

Create reusable components:

- ProfileCard
- ProfileForm
- AvatarUploader
- PasswordForm
- PreferenceCard
- NotificationSettings
- PrivacySettings
- AccountSecurityCard
- SessionList
- DeleteAccountDialog
- ProfileSkeleton
- EmptyProfileState

---

## 14. State Management

Use RTK Query.

Manage:

- User Profile
- Avatar
- Preferences
- Notification Settings
- Privacy Settings
- Security Information
- Loading
- Error
- Cache

---

## 15. Validation

Use:

React Hook Form

+

Zod

Validate:

- Name
- Email
- Phone Number
- Address
- Password
- Avatar

Validation rules must match backend.

---

## 16. Responsive Design

Support:

Desktop

Laptop

Tablet

Mobile

---

## 17. Accessibility

Implement:

- Semantic HTML
- Keyboard Navigation
- Screen Reader Support
- ARIA Labels
- Focus Management

---

## 18. Performance

Optimize:

- Lazy Loading
- RTK Query Cache
- Image Optimization
- Skeleton Loading
- Memoization
- Code Splitting

---

## 19. Error Handling

Handle:

- Upload Failed
- Invalid Avatar
- Invalid Password
- Duplicate Email
- Duplicate Phone
- Session Expired
- Network Error

Display user-friendly messages.

---

## 20. Security

Implement:

- Secure Password Handling
- Prevent Multiple Submissions
- Secure File Upload
- Session Validation
- Unauthorized Access Protection

Never trust frontend validation alone.

---

## 21. Testing

Generate:

- Unit Tests
- Component Tests
- Profile Tests
- Avatar Upload Tests
- Password Change Tests
- API Integration Tests

Target high code coverage.

---

# CODING REQUIREMENTS

Use:

- React 19
- TypeScript
- Material UI v7
- Redux Toolkit
- RTK Query
- React Router
- React Hook Form
- Zod

Do NOT use:

- Mock Data
- Hardcoded Profile Information
- Hardcoded Preferences
- Hardcoded Membership
- TODO comments
- Pseudo-code

Every API must follow OpenAPI.

Every validation rule must follow backend rules.

The implementation must compile successfully.

The code must be production-ready.

---

# OUTPUT FORMAT

Generate the implementation in the following order:

# 1. Business Analysis

# 2. API Mapping

# 3. Folder Structure

# 4. Route Configuration

# 5. State Management

# 6. Component Tree

# 7. Profile Dashboard

# 8. Edit Profile

# 9. Avatar Management

# 10. Password Management

# 11. Notification Preferences

# 12. Privacy & Security

# 13. Cross Module Integration

# 14. Responsive Strategy

# 15. Accessibility Strategy

# 16. Performance Optimization

# 17. Security Considerations

# 18. Testing Strategy

# 19. Complete Production-Ready Source Code

The generated implementation must compile successfully, integrate seamlessly with the existing React project, strictly follow the SRS, Backend Contract and OpenAPI specification, and reuse existing components, hooks, RTK Query services, utility functions and TypeScript models whenever possible instead of creating duplicate implementations.