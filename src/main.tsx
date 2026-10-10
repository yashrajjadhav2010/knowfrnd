import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_bG92aW5nLXNxdWlkLTY2NDQuY2xlcmsuYWNjb3VudHMuZGV2JA';

createRoot(document.getElementById('root')!).render(
  clerkPubKey ? (
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  ) : (
    <App />
  )
);
