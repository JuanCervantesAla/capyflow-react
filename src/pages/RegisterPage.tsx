import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@mantine/core";

import Ai from "../assets/Ai.png";
import { useUsers } from "../hooks/useUsers";
import miLogo from "../assets/logo2.png";

export default function RegisterPage() {
  const { register, registerError, isRegistering } = useUsers();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;

    await register({ name: username, email, password });
    navigate("/home");
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col lg:flex-row">
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="hidden lg:flex w-1/2 items-center justify-center p-12"
      >
        <img src={Ai} alt="AI" className="max-w-lg w-full object-contain" />
      </motion.div>

      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex flex-col w-full lg:w-1/2 px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 py-4 sm:py-6 lg:py-8"
      >
        <div className="flex items-center gap-2 sm:gap-3 h-12 sm:h-14 mb-6">
          <img src={miLogo} alt="Logo" className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px]" />
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
            CapyFlow
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
            <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold mb-2">
              Create an account
            </h1>

            <p className="text-xs sm:text-sm md:text-base mb-4 sm:mb-5 lg:mb-6 text-foreground/70">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold underline">
                Sign in
              </Link>
            </p>

            <form className="space-y-3 sm:space-y-3.5 lg:space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-foreground/10 py-2 sm:py-2.5 text-sm sm:text-base lg:text-lg focus:border-foreground focus:outline-none"
              />

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-foreground/10 py-2 sm:py-2.5 text-sm sm:text-base lg:text-lg focus:border-foreground focus:outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-foreground/10 py-2 sm:py-2.5 text-sm sm:text-base lg:text-lg focus:border-foreground focus:outline-none"
              />

              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-foreground/10 py-2 sm:py-2.5 text-sm sm:text-base lg:text-lg focus:border-foreground focus:outline-none"
              />

              <label className="flex items-start gap-2 pt-1 text-xs sm:text-sm">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="w-4 h-4 accent-foreground mt-0.5"
                />
                I agree to the terms and conditions
              </label>

              {registerError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 rounded-lg p-2.5"
                >
                  <p className="text-xs sm:text-sm text-red-700 font-medium">
                    {registerError instanceof Error ? registerError.message : "Error al registrarse"}
                  </p>
                </motion.div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isRegistering}
                disabled={!agreeTerms}
                className="
                  !bg-white !text-black !border-2 !border-black
                  h-10 sm:h-11
                  text-sm sm:text-base
                  font-semibold

                  transition-all duration-200 ease-out
                  shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]
                  hover:!-translate-y-1
                  hover:!shadow-[4px_4px_0px_0px_rgba(0,0,0,0.35)]

                  active:translate-y-0
                  active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]

                  disabled:opacity-50
                  disabled:hover:translate-y-0
                  disabled:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]
                "
              >
                Create account
              </Button>

            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
