import type React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Ai from '../assets/Ai.png';
import { useUsers } from '../hooks/useUsers';

export default function RegisterPage() {
  const { register, error, isRegistering } = useUsers();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) return;

    try {
      await register({
        name: username,
        email,
        password,
      });

      navigate('/login');
    } catch {
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <motion.div
        initial={{ x: '40%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="hidden lg:flex flex-1 items-center justify-center bg-white p-12"
      >
        <div className="relative w-full max-w-3xl aspect-square">
          <img
            src={Ai}
            alt="Artificial Intelligence illustration"
            className="object-contain"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ x: '-140%', opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="flex-1 flex flex-col px-12 py-8 max-w-4xl"
      >
        <div className="flex items-center gap-3 mb-16">
          <span className="text-2xl font-medium text-foreground">
            Project
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-2xl">
          <h1 className="text-7xl font-normal mb-12 text-foreground">
            Create an account
          </h1>

          <p className="text-2xl mb-16 text-foreground">
            Already have an account?{' '}
            <Link to="/login" className="underline hover:no-underline">
              Click here
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2"
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              <label htmlFor="terms" className="text-base text-foreground">
                I agree to the terms and conditions
              </label>
            </div>

            {error && (
              <div className="text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isRegistering || !agreeTerms}
              className="w-full bg-black hover:bg-black/90 text-white rounded-lg h-14 disabled:opacity-50"
            >
              {isRegistering ? 'Loading...' : 'Register'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
