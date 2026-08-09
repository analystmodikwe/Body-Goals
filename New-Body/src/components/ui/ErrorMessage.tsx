// Shared inline error text, used under form fields and for failed fetches.
interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p className="mt-1 text-xs font-body text-brick" role="alert">
      {message}
    </p>
  );
}