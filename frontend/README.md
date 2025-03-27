# Atomic Habits Agent - Frontend

This is the frontend for the Atomic Habits Agent application, built with Next.js.

## GitHub Pages Deployment

This project is configured to deploy automatically to GitHub Pages using GitHub Actions. The deployment workflow is set up to build and deploy the frontend whenever changes are pushed to the `main` branch.

### How It Works

1. When you push changes to the `main` branch, a GitHub Action will trigger
2. The action will build the Next.js application with static export
3. The built files will be deployed to GitHub Pages
4. The site will be available at `https://yourusername.github.io/atomic-habits-agent/`

### Environment Configuration

The application uses environment variables for configuration:

- `NEXT_PUBLIC_API_URL` - The URL of the backend API
  - In development: http://localhost:8000
  - In production: Update `.env.production` with your deployed backend URL

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Backend Integration

Since GitHub Pages only hosts static files, you'll need to deploy the Python backend separately. Update the `.env.production` file with the URL of your deployed backend before deploying the frontend.

### Demo Mode

The application supports a demo mode that uses mock data instead of connecting to a real backend:

- Set environment variable `NEXT_PUBLIC_DEMO_MODE=true`
- Or enable in browser: `localStorage.setItem('demoMode', 'true')`

This is useful for testing the frontend in isolation or for demonstration purposes.
