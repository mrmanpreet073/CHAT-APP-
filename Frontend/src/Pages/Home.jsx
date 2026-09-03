import React from 'react';
import { 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  ArrowRight, 
  Globe 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#111b21] text-[#e9edef] font-sans flex flex-col justify-between selection:bg-[#00a884] selection:text-[#111b21]">
      
      {/* Navigation Header */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-[#111b21]">
            <MessageSquare size={24} className="fill-current" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">ChatApp</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm text-[#8696a0] hover:text-[#e9edef] transition-colors font-medium hidden sm:block">
            Features
          </button>
          <button className="bg-[#00a884] hover:bg-[#029071] text-[#111b21] font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-200"
          onClick={()=>navigate("/signUp")}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Left Column - Content */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#202c33] text-[#00a884] text-xs font-semibold uppercase tracking-wider mb-6">
            <Globe size={14} />
            <span>Simple. Reliable. Private.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight mb-6">
            Message privately with <br className="hidden sm:block" />
            <span className="font-semibold text-[#00a884]">anyone, anywhere.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#8696a0] max-w-xl mx-auto md:mx-0 mb-8 leading-relaxed">
            With simple, secure, and reliable messaging, you’ll get the full feel of instant communication right in your browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00a884] hover:bg-[#029071] text-[#111b21] font-bold px-8 py-3.5 rounded-full text-base transition-all duration-200 shadow-lg hover:shadow-emerald-900/20">
              <span>Start Chatting Now</span>
              <ArrowRight size={18} />
            </button>
            <button className="w-full sm:w-auto border border-[#222d34] hover:bg-[#202c33] text-[#e9edef] font-medium px-8 py-3.5 rounded-full text-base transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Column - Hero Graphic/Image Card */}
        <div className="flex-1 w-full max-w-lg">
          <div className="relative bg-[#202c33] border border-[#222d34] rounded-2xl p-6 shadow-2xl overflow-hidden">
            
            {/* Mock Chat Preview */}
            <div className="flex items-center gap-3 border-b border-[#222d34] pb-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">John Doe</h3>
                <p className="text-xs text-[#00a884]">online</p>
              </div>
            </div>

            <div className="space-y-4 mb-6 text-sm">
              <div className="bg-[#111b21] p-3 rounded-lg rounded-tl-none max-w-[80%] text-[#e9edef]">
                Hey! How is the new chat app coming along?
              </div>
              <div className="bg-[#005c4b] p-3 rounded-lg rounded-tr-none max-w-[80%] ml-auto text-white">
                It's working great! Smooth, fast, and feels just like WhatsApp. 🚀
              </div>
            </div>

            {/* Simulated Input Bar */}
            <div className="bg-[#111b21] rounded-lg p-2.5 flex items-center justify-between text-[#8696a0] text-xs">
              <span>Type a message...</span>
              <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center text-[#111b21]">
                <ArrowRight size={14} />
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Feature Highlights Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-[#222d34]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-[#202c33]/50 p-6 rounded-xl border border-[#222d34]/60">
            <div className="w-10 h-10 rounded-lg bg-[#00a884]/10 text-[#00a884] flex items-center justify-center mb-4">
              <ShieldCheck size={22} />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Private & Secure</h2>
            <p className="text-sm text-[#8696a0]">End-to-end security ensures your conversations stay strictly between you and your contacts.</p>
          </div>

          <div className="bg-[#202c33]/50 p-6 rounded-xl border border-[#222d34]/60">
            <div className="w-10 h-10 rounded-lg bg-[#00a884]/10 text-[#00a884] flex items-center justify-center mb-4">
              <Zap size={22} />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Real-time Speed</h2>
            <p className="text-sm text-[#8696a0]">Instant message delivery with minimal latency across all devices.</p>
          </div>

          <div className="bg-[#202c33]/50 p-6 rounded-xl border border-[#222d34]/60">
            <div className="w-10 h-10 rounded-lg bg-[#00a884]/10 text-[#00a884] flex items-center justify-center mb-4">
              <Smartphone size={22} />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Fully Responsive</h2>
            <p className="text-sm text-[#8696a0]">Designed to look perfectly native on desktop, tablet, and mobile screens.</p>
          </div>

        </div>
      </section>

      {/* Simple Footer */}
      <footer className="w-full border-t border-[#222d34] py-6 text-center text-xs text-[#8696a0]">
        <p>© {new Date().getFullYear()} ChatApp. Built with React & Tailwind CSS.</p>
      </footer>

    </div>
  );
}