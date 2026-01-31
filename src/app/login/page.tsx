import { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { LoginForm } from "@/components/auth/LoginForm";
export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Succession account",
};
export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20 bg-cream-100">
        <div className="container-luxury">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl md:text-4xl text-charcoal-900 mb-4">
                Welcome Back
              </h1>
              <p className="text-charcoal-600">
                Access your account, view your curated selections, and enjoy a personalized experience.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}