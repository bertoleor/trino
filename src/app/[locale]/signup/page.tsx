import { SignupForm } from './signup-form';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <main data-purpose="auth-signup-page" className="bg-cream text-ink w-full flex-1">
      <SignupForm />
    </main>
  );
}