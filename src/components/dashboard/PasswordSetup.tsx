// src/components/dashboard/PasswordSetup.tsx
'use client';

import SetupPasswordForm from '@/components/SetupPasswordForm';

export default function PasswordSetup() {
  return (
    <div className="mb-6 p-4 rounded-lg bg-brand-secondary border border-gray-300">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-brand-text">
            Set up email & password sign-in
          </h3>
          <div className="mt-2 text-sm text-gray-700">
            <p>
              You&apos;re currently signed in via a social provider. Add a password to enable email sign-in as a backup option.
            </p>
          </div>
          <div className="mt-3">
            <details>
              <summary className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 ring-brand-primary cursor-pointer">
                Set up password
              </summary>
              <div className="mt-4">
                <SetupPasswordForm />
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}