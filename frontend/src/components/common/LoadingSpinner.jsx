import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 40 }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <Loader2 size={size} className="spin" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
