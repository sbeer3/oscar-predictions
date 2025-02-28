# Oscar Predictions Project Commands & Guidelines

## Build & Run Commands
- **Frontend**: `cd oscar-frontend && npm start` (runs on port 3000)
- **Backend**: `cd backend && npm start` (runs on port 5000)
- **Build Frontend**: `cd oscar-frontend && npm run build`
- **Test Frontend**: `cd oscar-frontend && npm test`
- **Run Single Test**: `cd oscar-frontend && npm test -- -t "test name"`

## Code Style Guidelines
- **Frontend**: React 19 with hooks-based components
- **Backend**: Express routes with controller pattern
- **Import Order**: React/libraries first, then local components
- **Error Handling**: Use try/catch with specific error messages
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Component Structure**: Hooks first, handlers next, render last
- **API Calls**: Use fetch with async/await pattern
- **State Management**: useState/useEffect with callback optimizations
- **CSS**: Component-scoped classes in separate style files

## Project Structure
- **Frontend**: React application with component-based architecture
- **Backend**: Express server with route-based API endpoints
- **Data**: JSON-based storage in backend/data directory