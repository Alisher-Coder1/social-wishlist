"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signUp } from "@/services/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setErrorText("");

    const cleanEmail = email.trim();

    const { error } = await signUp(cleanEmail, password);

    if (error) {
      setErrorText(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Registration successful. Check your email if confirmation is enabled.",
    );
    setEmail("");
    setPassword("");
    setLoading(false);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-md rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create your account to manage wishlists.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border px-4 py-3 font-medium disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {message ? (
          <p className="mt-4 text-sm text-green-600">{message}</p>
        ) : null}

        {errorText ? (
          <p className="mt-4 text-sm text-red-600">{errorText}</p>
        ) : null}

        <p className="mt-6 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
