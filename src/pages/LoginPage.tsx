import { useState } from "react";
import { Link } from "react-router-dom";
import { useUsers } from "../hooks/useUsers";
import LoadingOverlay from "../components/LoadingOverlay/LoadingOverlay";
import miLogo from "../assets/logo2.png";

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
    <div className="min-h-screen bg-[#0a0a08]">
      <LoadingOverlay isLoading={isLoading} />

      <div className="min-h-screen grid grid-rows-[42px_1fr] bg-[#f2ede4] border-[3px] border-[#0a0a08]">

        <header className="bg-[#0a0a08] flex items-stretch border-b-[3px] border-[#0a0a08]">
          <div className="flex items-center gap-2 px-5 font-mono font-bold text-[15px] tracking-[-0.5px] text-[#e8a020] border-r-2 border-[#2a2a2a] lowercase whitespace-nowrap">
            <img src={miLogo} className="w-5 h-5" alt="capyflow" />
            capyflow
          </div>

          <div className="hidden sm:flex items-center px-5 font-mono text-[11px] text-[#555] gap-1 border-r-2 border-[#2a2a2a]">
            <span className="text-[#333]">~/</span>
            <span className="text-[#888]">login</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-stretch">
            <Link
              to="/docs"
              className="hidden sm:flex items-center gap-2 px-5 font-mono text-[11px] font-medium tracking-[0.5px] uppercase text-[#666] border-l-2 border-[#2a2a2a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150"
            >
              Documentation
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 px-5 font-mono text-[11px] font-medium tracking-[0.5px] uppercase text-[#666] border-l-2 border-[#2a2a2a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150"
            >
              Register →
            </Link>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 overflow-hidden">

<div className="relative flex flex-col justify-center items-center px-8 sm:px-12 md:px-16 lg:px-[72px] py-12 border-r-0 lg:border-r-[3px] border-[#0a0a08] animate-[slideInLeft_0.5s_cubic-bezier(.2,1,.4,1)_both]">

  <div className="w-full max-w-md mx-auto">

    <div className="absolute top-5 left-5 w-[18px] h-[18px] border-t-2 border-l-2 border-[#c8c0b0]" />
    <div className="absolute bottom-5 right-5 w-[18px] h-[18px] border-b-2 border-r-2 border-[#c8c0b0]" />

    <div className="flex items-center gap-3 font-mono text-[10px] font-bold tracking-[3px] uppercase text-[#7a7060] mb-5">
      <div className="w-5 h-[2px] bg-[#e8a020]" />
      System Access
    </div>

    <div className="mb-3">
      <div className="font-sans text-[18px] font-black tracking-[-0.5px] text-[#e8a020] mb-1">CapyFlow</div>
      <div className="w-12 h-[2px] bg-[#0a0a08]"></div>
    </div>

    <h1 className="font-sans text-[42px] font-extrabold leading-none tracking-[-2px] text-[#0a0a08] mb-2">
      Welcome<br />back.
    </h1>

    <p className="font-mono text-[11px] text-[#7a7060] mb-9 flex items-center gap-1">
      No account?{" "}
      <Link
        to="/register"
        className="text-[#0a0a08] font-bold border-b-2 border-[#e8a020] pb-[1px] hover:bg-[#e8a020] hover:text-[#0a0a08] transition-all duration-100"
      >
        Register here
      </Link>
    </p>

    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px] w-full">

      <div className="flex flex-col gap-[6px]">
        <label className="font-mono text-[9px] font-bold tracking-[2px] uppercase text-[#7a7060]">
          Email
        </label>
        <input
          type="email"
          placeholder="user@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="
            w-full bg-[#f2ede4] border-2 border-[#0a0a08]
            px-4 py-[11px] font-mono text-[13px] text-[#0a0a08]
            placeholder:text-[#c8c0b0] outline-none
            focus:border-[#e8a020] focus:shadow-[3px_3px_0_#e8a020]
            focus:-translate-x-[1px] focus:-translate-y-[1px]
            transition-all duration-150
          "
        />
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className="font-mono text-[9px] font-bold tracking-[2px] uppercase text-[#7a7060]">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="
            w-full bg-[#f2ede4] border-2 border-[#0a0a08]
            px-4 py-[11px] font-mono text-[13px] text-[#0a0a08]
            placeholder:text-[#c8c0b0] outline-none
            focus:border-[#e8a020] focus:shadow-[3px_3px_0_#e8a020]
            focus:-translate-x-[1px] focus:-translate-y-[1px]
            transition-all duration-150
          "
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-[9px] font-mono text-[11px] text-[#7a7060] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-[14px] h-[14px]"
          />
          Remember me
        </label>

        <Link
          to="/forgot-password"
          className="font-mono text-[11px] text-[#7a7060] border-b border-dashed border-[#c8c0b0] pb-[1px] hover:text-[#0a0a08] hover:border-[#0a0a08] transition-all duration-150"
        >
          Forgot password?
        </Link>
      </div>

      {loginError && (
        <div className="border-l-4 border-[#b71c1c] bg-[#fff5f5] px-4 py-3 font-mono text-[11px] font-semibold text-[#b71c1c]">
          {loginError instanceof Error ? loginError.message : "Could not log in"}
        </div>
      )}

      <button
        type="submit"
        className="
          w-full py-[13px]
          bg-[#0a0a08] text-[#e8a020]
          border-[2.5px] border-[#0a0a08]
          font-mono text-[13px] font-bold tracking-[2px] uppercase
          hover:text-[#0a0a08] hover:border-[#e8a020]
          hover:shadow-[4px_4px_0_#e8a020]
          hover:-translate-x-[2px] hover:-translate-y-[2px]
          transition-all duration-150
        "
      >
        Log In
      </button>

    </form>
  </div>
</div>

          <div className="relative hidden lg:flex items-center justify-center bg-[#e8e3d8] overflow-hidden animate-[slideInRight_0.5s_0.1s_cubic-bezier(.2,1,.4,1)_both]">

            <div className="absolute inset-0 [background-image:repeating-linear-gradient(0deg,transparent,transparent_27px,rgba(0,0,0,0.05)_27px,rgba(0,0,0,0.05)_28px),repeating-linear-gradient(90deg,transparent,transparent_27px,rgba(0,0,0,0.05)_27px,rgba(0,0,0,0.05)_28px)] [background-size:28px_28px]" />

            <div className="absolute top-5 right-5 w-[18px] h-[18px] border-t-2 border-r-2 border-[#c8c0b0]" />
            <div className="absolute bottom-5 left-5 w-[18px] h-[18px] border-b-2 border-l-2 border-[#c8c0b0]" />

            <div className="relative flex flex-col items-start">
              <MiniNode type="trigger" title="Start Process"    sub="manual_trigger"   active animDelay="0.2s"  rotation="-1.5deg" offsetX="10px" />
              <Connector delay="0s" />
              <MiniNode type="data"    title="Define List"      sub="user_list[]" animDelay="0.32s" rotation="0.8deg"  offsetX="-8px" />
              <Connector delay="0.5s" />
              <MiniNode type="logic"   title="Iterate Users"    sub="forEach(user)" animDelay="0.44s" rotation="-0.5deg" offsetX="4px" />
              <Connector delay="1s" />
              <MiniNode type="io"      title="Log Message"  sub="log(msg, user)" animDelay="0.56s" rotation="1.2deg"  offsetX="-14px" />
            </div>

            <div className="absolute bottom-6 right-7 font-mono text-[10px] tracking-[3px] uppercase text-[#c8c0b0]">
              capyflow v1.0
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes stampIn {
          from { opacity: 0; transform: scale(0.88) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes dropPulse {
          0%   { top: 0;    opacity: 1; }
          80%  { top: 16px; opacity: 1; }
          81%  { opacity: 0; }
          82%  { top: 0;   opacity: 0; }
          100% { top: 0;   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

type NodeType = "trigger" | "data" | "logic" | "io";

const nodeStyles: Record<NodeType, { badge: string; bar: string }> = {
  trigger: { badge: "bg-[#fff3e0] text-[#b05000] border-[#b05000]",  bar: "bg-[#b05000]" },
  data:    { badge: "bg-[#e8f0fa] text-[#1a4f8a] border-[#1a4f8a]",  bar: "bg-[#1a4f8a]" },
  logic:   { badge: "bg-[#f3eafa] text-[#5a1a8a] border-[#5a1a8a]",  bar: "bg-[#5a1a8a]" },
  io:      { badge: "bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]",  bar: "bg-[#2e7d32]" },
};

function MiniNode({
  type, title, sub, active = false, animDelay = "0s", rotation = "0deg", offsetX = "0px",
}: {
  type: NodeType; title: string; sub: string;
  active?: boolean; animDelay?: string; rotation?: string; offsetX?: string;
}) {
  const s = nodeStyles[type];
  return (
    <div
      className="w-[220px] bg-[#faf8f4] border-[2.5px] border-[#0a0a08] relative cursor-pointer hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_#0a0a08] transition-all duration-200"
      style={{
        transform: `rotate(${rotation}) translateX(${offsetX})`,
        animation: `stampIn 0.3s cubic-bezier(.2,1,.4,1) ${animDelay} both`,
      }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${s.bar}`} />

      <div className="flex items-center justify-between px-3 py-[7px] border-b-2 border-[#0a0a08]">
        <span className={`font-mono text-[9px] font-bold uppercase tracking-[2px] px-[6px] py-[2px] border-[1.5px] ${s.badge}`}>
          {type === "io" ? "i / o" : type}
        </span>
        <span className={`w-[7px] h-[7px] rounded-full border-[1.5px] ${active ? "bg-[#2e7d32] border-[#2e7d32] shadow-[0_0_5px_#2e7d32]" : "border-[#0a0a08]"}`} />
      </div>

      <div className="px-[10px] py-[10px]">
        <div className="font-sans text-[13px] font-bold tracking-[-0.3px] text-[#0a0a08]">{title}</div>
        <div className="font-mono text-[10px] text-[#7a7060] mt-[3px]">{sub}</div>
      </div>
    </div>
  );
}

function Connector({ delay }: { delay: string }) {
  return (
    <div className="relative w-[2.5px] h-[26px] bg-[#0a0a08] ml-8">
      <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#0a0a08]" />
      <div
        className="absolute w-[8px] h-[8px] bg-[#e8a020] border-2 border-[#0a0a08] left-1/2 -translate-x-1/2"
        style={{ animation: `dropPulse 2s linear infinite`, animationDelay: delay }}
      />
    </div>
  );
}