import { Link } from "react-router-dom";
import miLogo from "../assets/logo2.png";

const featureCards = [
  {
    tag: "Visual editor",
    title: "Clear nodes",
    desc: "Create, modify and visualize workflows with an intuitive drag-and-drop interface.",
  },
  {
    tag: "AI assist",
    title: "Natural language",
    desc: "Describe your process in plain text and get an executable workflow ready to review.",
  },
  {
    tag: "Execution",
    title: "Traceability",
    desc: "Run flows, inspect history, and understand state updates in real time from one place.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a08] p-2 sm:p-3 font-sans">
      {/* Outer frame */}
      <div
        className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] bg-[#f2ede4] border-[3px] border-[#0a0a08]"
        style={{ display: "grid", gridTemplateRows: "48px 1fr auto 48px" }}
      >

        {/* ── NAV ── */}
        <nav
          className="border-b-[3px] border-[#0a0a08] bg-[#0a0a08]"
          style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "stretch" }}
        >
          <div className="flex items-center gap-2 px-5 border-r-2 border-[#2a2a2a]">
            <img src={miLogo} className="w-4 h-4" alt="capyflow" />
            <span className="font-mono font-bold text-[13px] tracking-[-0.3px] text-[#e8a020] lowercase">
              capyflow
            </span>
          </div>

          <div className="hidden md:flex items-center px-4 font-mono text-[10px] text-[#555] tracking-[0.4px] border-r-2 border-[#2a2a2a]">
            <span className="text-[#3a3a3a]">~/</span>&nbsp;home
          </div>

          <Link
            to="/login"
            className="flex items-center px-5 border-l-2 border-[#2a2a2a] font-mono text-[10px] font-bold tracking-[1.5px] uppercase text-[#888] hover:bg-[#1a1a1a] hover:text-white transition-all duration-150"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex items-center px-5 bg-[#e8a020] border-l-2 border-[#2a2a2a] font-mono text-[10px] font-bold tracking-[1.5px] uppercase text-[#0a0a08] hover:brightness-95 transition-all duration-150"
          >
            Get started
          </Link>
        </nav>

        {/* ── HERO ── */}
        <div className="min-h-0 grid lg:grid-cols-[1.2fr_1fr]">
          {/* LEFT */}
          <section className="relative lg:border-r-[3px] border-[#0a0a08] px-6 sm:px-9 lg:px-12 pt-10 lg:pt-12 overflow-hidden border-b-[3px] lg:border-b-0">
            {/* Grid background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-80"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 31px,rgba(0,0,0,0.04) 31px,rgba(0,0,0,0.04) 32px),repeating-linear-gradient(90deg,transparent,transparent 31px,rgba(0,0,0,0.04) 31px,rgba(0,0,0,0.04) 32px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative max-w-4xl">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 font-mono text-[11px] font-bold tracking-[2px] uppercase text-[#8a7f6e] mb-6">
                <div className="w-7 h-[2px] bg-[#e8a020]" />
                Visual workflow automation platform
              </div>

              {/* Headline */}
              <h1
                className="uppercase text-[#0d0d0a] mb-5 leading-[0.95] font-black tracking-[-2px]"
                style={{ fontSize: "clamp(42px, 8vw, 86px)" }}
              >
                Build flows.
                <br />
                <span className="text-[#e8a020]">Describe.</span>
                <br />
                Execute.
              </h1>

              {/* Sub */}
              <p className="font-mono text-[13px] leading-[1.9] text-[#6a5f4e] max-w-[56ch] mb-8">
                CapyFlow turns plain-language descriptions into executable workflows,
                combining AI-assisted generation with a visual editor so teams can
                review, refine and understand every node.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-11">
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-6 py-3 bg-[#0d0d0a] text-[#e8a020] border-[2.5px] border-[#0d0d0a] font-mono text-[11px] font-bold tracking-[1.6px] uppercase hover:shadow-[5px_5px_0_#e8a020] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150"
                >
                  Go to register
                </Link>
                <Link
                  to="/login"
                  className="flex items-center px-6 py-3 bg-transparent text-[#0d0d0a] border-[2.5px] border-[#0d0d0a] font-mono text-[11px] font-bold tracking-[1.6px] uppercase hover:bg-[#0d0d0a] hover:text-[#e8a020] transition-all duration-150"
                >
                  I have an account
                </Link>
              </div>

              {/* Feature cards */}
              <div
                className="border-t-[2.5px] border-[#0d0d0a]"
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))" }}
              >
                {featureCards.map((item, i) => (
                  <article
                    key={item.title}
                    className={`group px-5 py-5 bg-[#f0ead9] hover:bg-[#0d0d0a] transition-colors duration-200 ${
                      i < featureCards.length - 1 ? "border-r-[2.5px] border-[#0d0d0a]" : ""
                    }`}
                  >
                    <div className="font-mono text-[11px] font-bold tracking-[1.5px] uppercase text-[#8a7f6e] group-hover:text-[#e8a020] mb-2 transition-colors duration-200">
                      {item.tag}
                    </div>
                    <h2 className="font-sans text-[18px] font-bold text-[#0d0d0a] group-hover:text-[#f0ead9] mb-2 transition-colors duration-200">
                      {item.title}
                    </h2>
                    <p className="font-mono text-[12px] leading-[1.8] text-[#6a5f4e] group-hover:text-[#777] transition-colors duration-200">
                      {item.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <div className="bg-[#e4ddc9]">
            <section className="relative p-7 sm:p-9 lg:p-11">
              {/* Corner decorations */}
              <div className="absolute top-[18px] left-[18px] w-5 h-5 border-t-2 border-l-2 border-[#c8bfaf]" />
              <div className="absolute bottom-[18px] right-[18px] w-5 h-5 border-b-2 border-r-2 border-[#c8bfaf]" />

              <div className="font-mono text-[11px] font-bold tracking-[2px] uppercase text-[#8a7f6e] mb-6">
                Who we are
              </div>

              <div className="font-mono text-[13px] leading-[1.95] text-[#665b4a] space-y-5">
                <p>
                  CapyFlow is focused on democratizing automation. Students,
                  small teams and non-technical profiles can design workflows
                  without friction.
                </p>
                <p>
                  Our approach is hybrid: AI proposes and you decide. You can
                  generate a flow quickly, then edit it visually to understand,
                  validate and improve it.
                </p>
                <p>
                  It is an open and lightweight project designed for academic
                  environments and organizations that need practical results
                  without complex infrastructure.
                </p>
              </div>

              <div className="mt-8 p-5 bg-[#f0ead9] border-[2px] border-dashed border-[#c0b49e] font-mono text-[12px] leading-[1.75] text-[#7a7060]">
                CapyFlow combines assisted generation and manual editing so
                creating, refining and executing workflows remains a clear,
                teachable process.
              </div>
            </section>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="border-t-[3px] border-[#0a0a08] bg-[#f2ede4] flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center justify-between px-4 sm:px-6 py-2">
          <span className="font-mono text-[9.5px] text-[#9a8e7a]">
            CapyFlow - Visual workflow automation with AI
          </span>
          <div className="flex gap-5 font-mono text-[9.5px] tracking-[1px] uppercase">
            <span className="text-[#9a8e7a]">Home</span>
            <span className="text-[#9a8e7a]">Project</span>
            <span className="text-[#9a8e7a]">Team</span>
          </div>
        </footer>

      </div>
    </div>
  );
}