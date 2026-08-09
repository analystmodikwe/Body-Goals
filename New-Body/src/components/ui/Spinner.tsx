// Small loading spinner, used while a meal's image is being fetched from
// TheMealDB. Pure CSS animation (Tailwind's animate-spin), no JS needed.
export default function Spinner() {
  return (
    <div
      className="w-6 h-6 border-2 border-ink/15 border-t-gold rounded-full animate-spin"
      role="status"
      aria-label="Loading"
    />
  );
}