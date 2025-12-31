interface ValidationProps {
  message?: string;
  isValid: boolean | null;
}

export const ValidationMessage = ({ message, isValid }: ValidationProps) => {
  if (isValid === null) return null;

  return (
    <div className={`mt-1 ${isValid ? "text-success" : "text-danger"}`}>
      {message}
    </div>
  );
};
