"use client";

import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoggedIn(true);
      setMessage("Połączono z Firebase! Logowanie działa.");
    } catch {
      setMessage("Błąd logowania. Sprawdź e-mail i hasło.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setLoggedIn(false);
    setPassword("");
    setMessage("Wylogowano.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C0D0D] p-6">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#1A1B1A] p-8 text-[#F2EFE8]">
        <h1 className="mb-2 text-center font-serif text-3xl">
          Janczak i Synowie
        </h1>

        <p className="mb-8 text-center text-sm text-white/50">
          Panel administracyjny
        </p>

        {loggedIn ? (
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-[#B79B68] p-3 text-black"
          >
            Wyloguj
          </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Adres e-mail"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/20 bg-transparent p-3"
            />

            <input
              type="password"
              placeholder="Hasło"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/20 bg-transparent p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#B79B68] p-3 font-medium text-black disabled:opacity-50"
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </button>
          </form>
        )}

        {message && <p className="mt-5 text-center text-sm">{message}</p>}
      </div>
    </main>
  );
}
