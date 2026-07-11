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
- Axios
- Zod
- Clean Architecture
- Feature-Based Architecture
- Enterprise UI/UX

You are building a production-ready Customer Portal for the Smart Park platform.

---

# PROJECT CONTEXT

Project:

SMART PARK
Smart Amusement Park Management & Business Intelligence Platform

Current Progress:

✅ Frontend Architecture completed

✅ Project Setup completed

✅ Authentication Module completed

✅ Layout & Navigation completed

✅ Home Page completed

Now implement the **Ticket Catalog & Ticket Detail Module**.

This module must integrate directly with the existing Spring Boot backend.

All business logic must follow:

- Software Requirement Specification (SRS)
- OpenAPI Specification
- Backend Contract

Do NOT invent APIs.

Do NOT invent business rules.

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

Implement a complete Ticket Module for Customer Portal.

The module must allow customers to:

- Browse ticket categories
- Browse available tickets
- Search tickets
- Filter tickets
- Sort tickets
- View ticket details
- View ticket availability
- View pricing
- View promotions
- Navigate to booking

Everything must be production-ready.

---

# TASKS

## 1. Analyze Business Requirements

Analyze the SRS.

Identify:

- Ticket Types
- Combo Tickets
- Full Park Tickets
- Attraction Tickets
- Seasonal Tickets
- Promotions
- Membership Discounts

Explain every business rule before coding.

---

## 2. API Analysis

Analyze OpenAPI.

Identify every Ticket-related endpoint.

Map:

Page

↓

Endpoint

↓

Request DTO

↓

Response DTO

↓

Permission

Do NOT modify backend APIs.

---

## 3. Folder Structure

Create a Feature-based module.

Example:

features/ticket/

components/

pages/

services/

hooks/

schemas/

types/

store/

constants/

utils/

index.ts

---

## 4. Ticket List Page

Implement a production-ready page.

Include:

- Search Bar
- Category Filter
- Price Filter
- Ticket Type Filter
- Sort Options
- Grid/List View
- Pagination
- Empty State
- Error State
- Skeleton Loading

---

## 5. Ticket Card

Create reusable TicketCard.

Display:

- Image
- Ticket Name
- Category
- Short Description
- Current Price
- Original Price (if discounted)
- Promotion Badge
- Membership Discount Badge
- Availability Status
- "View Details" button

---

## 6. Ticket Detail Page

Display complete ticket information.

Include:

- Gallery
- Ticket Description
- Available Attractions
- Validity Period
- Pricing
- Promotion Information
- Membership Benefits
- Terms & Conditions
- Availability
- Related Tickets
- Recommended Tickets

---

## 7. Search & Filter

Support:

- Keyword Search
- Category Filter
- Price Range
- Ticket Type
- Availability
- Promotion
- Membership Eligible

Search and filter must work with backend APIs.

---

## 8. Sorting

Support:

- Price Ascending
- Price Descending
- Newest
- Most Popular
- Highest Rated

Use backend sorting if available.

---

## 9. Pagination

Follow backend pagination standard exactly.

Support:

- Page Number
- Page Size
- Total Pages
- Total Records

---

## 10. State Management

Use RTK Query.

Handle:

- Loading
- Error
- Refetch
- Cache
- Optimistic Updates (only if appropriate)

---

## 11. Components

Create reusable components:

- TicketCard
- TicketGrid
- TicketList
- TicketFilter
- SearchBar
- PriceFilter
- CategoryFilter
- TicketGallery
- TicketPrice
- PromotionBadge
- MembershipBadge
- AvailabilityChip
- RelatedTickets
- TicketSkeleton
- EmptyTicketState

---

## 12. Responsive Design

Support:

- Desktop
- Laptop
- Tablet
- Mobile

Use Material UI responsive utilities.

---

## 13. Accessibility

Implement:

- Semantic HTML
- Keyboard Navigation
- ARIA Labels
- Screen Reader Support
- Proper Focus Management

---

## 14. Performance

Optimize:

- Lazy Loading
- Memoization
- Image Optimization
- API Caching
- Skeleton Loading
- Code Splitting

---

## 15. Error Handling

Handle:

- Network Errors
- API Errors
- Empty Results
- Invalid Ticket ID
- Expired Ticket
- Unavailable Ticket

Display user-friendly messages.

---

## 16. Testing

Generate:

- Unit Tests
- Component Tests
- API Tests
- Integration Tests

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
- Hardcoded APIs
- Hardcoded Business Rules
- TODO comments
- Pseudo-code

Every page must compile successfully.

Every component must be reusable.

Every API call must match the OpenAPI specification.

---

# OUTPUT FORMAT

Generate the implementation in the following order:

# 1. Business Analysis

# 2. API Mapping

# 3. Folder Structure

# 4. Route Configuration

# 5. State Management

# 6. Component Tree

# 7. Reusable Components

# 8. Ticket List Page

# 9. Ticket Detail Page

# 10. Search & Filter

# 11. Pagination

# 12. Responsive Strategy

# 13. Accessibility Strategy

# 14. Performance Optimization

# 15. Testing Strategy

# 16. Complete Production-Ready Source Code

The generated code must integrate seamlessly with the existing React project and the Spring Boot backend.