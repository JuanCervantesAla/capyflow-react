import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@mantine/core";

import { useUsers } from "../hooks/useUsers";
import LoadingOverlay from "../components/LoadingOverlay/LoadingOverlay";
import brain from "../assets/brain.png";

export default function LoginPage() {
  const { login, loginError, isLoading } = useUsers();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await login({ email, password });

    if (rememberMe) {
      localStorage.setItem("userEmail", email);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <LoadingOverlay isLoading={isLoading} />

      <motion.div
        initial={{ x: "140%", opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex-1 flex flex-col px-12 py-8 max-w-4xl"
      >
        <div className="flex items-center gap-3 mb-16">
          <span className="text-2xl font-medium text-foreground">
            Project
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-2xl ml-32">
          <h1 className="text-7xl font-normal mb-12 text-foreground">
            Welcome to system
          </h1>

          <p className="text-2xl mb-16 text-foreground">
            Don’t you have an account?{" "}
            <Link
              to="/register"
              className="underline hover:no-underline"
            >
              Click here
            </Link>{" "}
            to sign up.
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2 text-base placeholder:text-foreground/40 focus:border-foreground focus:outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-0 border-b border-foreground/20 px-0 py-2 text-base placeholder:text-foreground/40 focus:border-foreground focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-base text-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-base text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {loginError && (
              <p className="text-sm text-destructive">
                {loginError instanceof Error
                  ? loginError.message
                  : "Error al iniciar sesión"}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              className="bg-black hover:bg-black/90"
            >
              Login
            </Button>
          </form>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: "-40%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="hidden lg:flex flex-1 items-center justify-center bg-white p-12"
      >
        <img
          src={brain}
          alt="Brain illustration"
          className="max-w-3xl object-contain"
        />
      </motion.div>
    </div>
  );
}
