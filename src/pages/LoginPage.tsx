import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useNavigate, Link } from 'react-router-dom';
import brain from '../assets/brain.png';
import { motion } from 'framer-motion';
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay';

export default function LoginPage() {
  const { login, error, isLoggingIn } = useUsers();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });

      if (rememberMe) {
        localStorage.setItem('userEmail', email);
      }

      navigate('/home');
    } catch {
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <LoadingOverlay isLoading={isLoggingIn} />

      <motion.div
        initial={{ x: '140%', opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="flex-1 flex flex-col px-12 py-8 max-w-4xl"
      >
        <div className="flex items-center gap-3 mb-16">
          <span className="text-2xl font-medium text-foreground">Project</span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-2xl ml-32">
          <h1 className="text-7xl font-normal mb-12 text-foreground">
            Welcome to system
          </h1>

          <p className="text-2xl mb-16 text-foreground">
            Don’t you have an account?{' '}
            <Link to="/register" className="underline hover:no-underline">
              Click here
            </Link>{' '}
            to sign up.
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="remember"
                  className="text-base text-foreground cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-base text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-black hover:bg-black/90 text-white rounded-lg h-14 text-base font-normal"
            >
              {isLoggingIn ? 'Loading...' : 'Login'}
            </button>
          </form>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: '-40%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="hidden lg:flex flex-1 items-center justify-center bg-white p-12"
      >
        <div className="relative w-full max-w-3xl aspect-square">
          <img
            src={brain}
            alt="Brain and circuit board illustration"
            className="object-contain"
          />
        </div>
      </motion.div>
    </div>
  );
}
