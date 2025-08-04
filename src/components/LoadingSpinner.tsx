// src/components/LoadingSpinner.tsx
export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary"></div>
        <p className="mx-auto mt-8 text-lg font-semibold text-brand-text">{message}</p>
      </div>
    );
}