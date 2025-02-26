# Google Sheets Clone

A powerful spreadsheet application with features like formula support, cell formatting, and real-time updates.

## Setup Instructions

### Prerequisites
- Node.js v20 or higher
- npm (comes with Node.js)

### Installation

1. Clone or download this repository to your local machine
2. Open the project folder in Visual Studio Code
3. Install dependencies:
```bash
npm install
```

### Running the Application

The application consists of both a backend server and a frontend client. To run both:

1. Development mode (runs both client and server):
```bash
npm run dev
```

This will start:
- Backend server on port 5000
- Frontend development server with hot reloading

### Available Scripts

- `npm run dev` - Starts both frontend and backend in development mode
- `npm run build` - Builds the application for production
- `npm run start` - Runs the production build
- `npm run check` - Runs TypeScript type checking

### Features

1. Spreadsheet Interface
   - Google Sheets-like UI with toolbar and formula bar
   - Cell drag functionality
   - Column and row resizing
   - Cell formatting (bold, italic, font size, color)

2. Mathematical Functions
   - SUM: Calculate sum of a range
   - AVERAGE: Calculate average of a range
   - MAX: Find maximum value
   - MIN: Find minimum value
   - COUNT: Count numeric values

3. Data Quality Functions
   - TRIM: Remove whitespace
   - UPPER: Convert to uppercase
   - LOWER: Convert to lowercase
   - REMOVE_DUPLICATES: Remove duplicate values
   - FIND_AND_REPLACE: Find and replace text

4. Data Entry and Validation
   - Support for numbers, text, and dates
   - Formula validation
   - Cell dependency tracking

### Project Structure

```
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── pages/
├── server/           # Backend Express server
├── shared/           # Shared types and schemas
└── package.json      # Project configuration
```

### Tech Stack
- React + TypeScript
- Express backend
- ShadcN UI components
- React Query for data fetching
- Zod for validation
