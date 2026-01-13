import type React from "react"
import Ai from '../assets/Ai.png';
import { useState } from "react"
import {  Link } from 'react-router-dom';
import { motion } from "framer-motion"
import { useUsers } from "../hooks/useUsers";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register, error } = useUsers();
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setLoading(false);
      return;
    }

    try {
      await register(username, email, password);

      // Solo para ver el loader
      await new Promise(res => setTimeout(res, 1200));

      navigate("/login");
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Illustration */}
      <motion.div
        initial={{ x: "40%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
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

      {/* Right Section - Register Form */}
      <motion.div
        initial={{ x: "-140%", opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex-1 flex flex-col px-12 py-8 max-w-4xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <span className="text-2xl font-medium text-foreground">Project</span>
        </div>

        {/* Register Form */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl">
          <h1 className="text-7xl font-normal mb-12 text-foreground">Create an account</h1>

          <p className="text-2xl mb-16 text-foreground">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:no-underline">
              Click here
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Username Field */}
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2 text-base placeholder:text-foreground/40 focus:border-foreground focus:outline-none focus:ring-0 transition-colors"
              />
            </div>

            {/* Email Field */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2 text-base placeholder:text-foreground/40 focus:border-foreground focus:outline-none focus:ring-0 transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2 text-base placeholder:text-foreground/40 focus:border-foreground focus:outline-none focus:ring-0 transition-colors"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2 text-base placeholder:text-foreground/40 focus:border-foreground focus:outline-none focus:ring-0 transition-colors"
              />
            </div>

            {/* Agree to Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="border-foreground/30 mt-1"
                required
              />
              <label htmlFor="terms" className="text-base text-foreground cursor-pointer select-none">
                I agree to the terms and conditions
              </label>
            </div>

            {/* Error Message */}
            {error && <div className="text-destructive text-sm">{error}</div>}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading || !agreeTerms}
              className="w-full bg-black hover:bg-black/90 text-white rounded-lg h-14 text-base font-normal disabled:opacity-50"
            >
              {loading ? "Loading..." : "Register"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
