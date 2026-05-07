import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center px-4">
      <div className="text-7xl font-bold gradient-text">404</div>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button variant="gradient" asChild>
        <Link to="/app">Back to dashboard</Link>
      </Button>
    </div>
  );
}
