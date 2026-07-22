import { MapPinOff } from 'lucide-react';

export default function EmptyState({ icon: Icon = MapPinOff, title, description, action }) {
  return (
    <div className="empty-state">
      <Icon size={48} strokeWidth={1.5} aria-hidden="true" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
