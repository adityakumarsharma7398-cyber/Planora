import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Calendar, Bot, ShieldCheck } from 'lucide-react';
import { AlexText } from '../components/AlexText';
import { BrandLogo } from '../components/BrandLogo';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7FC] text-[#29213F] flex flex-col font-sans overflow-x-hidden">
      {/* Top Navigation Bar matching reference */}
      <header className="border-b border-[#E8DFF5]/70 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <BrandLogo size="md" />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#71677F]">
            <Link to="/" className="text-[#7C4DCE] hover:text-[#6035C4] transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-[#7C4DCE] transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-[#7C4DCE] transition-colors">
              Pricing
            </a>
            <a href="#about" className="hover:text-[#7C4DCE] transition-colors">
              About
            </a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/dashboard"
              className="text-xs sm:text-sm font-bold text-[#29213F] hover:text-[#7C4DCE] px-3.5 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-1.5 px-4 sm:px-5 py-2.5 rounded-asym bg-gradient-to-r from-[#7C4DCE] to-[#6035C4] hover:from-[#6035C4] hover:to-[#7C4DCE] text-white text-xs sm:text-sm font-bold shadow-soft hover:shadow-soft-lg transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section matching reference */}
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 lg:py-20 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Description, Buttons, Metrics */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F3EBFB] border border-[#E8DFF5] text-[#7C4DCE] text-xs font-bold tracking-wide">
                <Sparkles className="h-3.5 w-3.5 text-[#BA3E91]" />
                <span>Plan beautifully. Celebrate effortlessly.</span>
              </div>

              <AlexText
                as="h1"
                scale="text-[1.25em]"
                className="text-5xl sm:text-6xl lg:text-7xl font-normal text-[#29213F] leading-[1.08] tracking-tight block"
              >
                Make every moment extraordinary.
              </AlexText>

              <p className="text-base sm:text-lg text-[#71677F] leading-relaxed max-w-xl font-normal pt-2">
                From the first idea to the final detail, plan unforgettable celebrations with Planora — an AI assistant that keeps your budget, timeline, and decisions in sync.
              </p>
            </div>

            {/* CTAs matching reference */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/events/new"
                className="inline-flex items-center space-x-2 px-6 sm:px-7 py-3.5 rounded-asym bg-gradient-to-r from-[#7C4DCE] via-[#A477E8] to-[#E8A0D4] hover:opacity-95 text-white font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all transform hover:-translate-y-0.5"
              >
                <AlexText scale="text-[1.18em]" className="text-white">Plan Your Event</AlexText>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 px-6 sm:px-7 py-3.5 rounded-asym bg-white border border-[#E8DFF5] text-[#29213F] hover:bg-[#F9F5FD] font-bold text-sm shadow-soft transition-all"
              >
                <span>Explore Features</span>
              </Link>
            </div>

            {/* 3 Metrics Row matching reference */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8DFF5]/80">
              {/* Metric 1 */}
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#6035C4]">3+</div>
                <div className="text-xs sm:text-sm font-bold text-[#29213F] mt-0.5">Event Types</div>
                <div className="text-[11px] text-[#71677F] mt-0.5 leading-tight">Birthdays, Weddings, Community Events</div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#7C4DCE] flex items-center">
                  <AlexText scale="text-[1.2em]">AI</AlexText>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#29213F] mt-0.5">Smart Planning</div>
                <div className="text-[11px] text-[#71677F] mt-0.5 leading-tight">Personalized Recommendations</div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#6035C4]">100%</div>
                <div className="text-xs sm:text-sm font-bold text-[#29213F] mt-0.5">Your Control</div>
                <div className="text-[11px] text-[#71677F] mt-0.5 leading-tight">You decide, we support</div>
              </div>
            </div>
          </div>

          {/* Right Column: Floral Banquet Arch Celebration Visual with Floating Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Main Visual Image Container with Asymmetric Corners */}
              <div className="relative overflow-hidden rounded-asym-xl shadow-soft-lg border-2 border-white/60 bg-gradient-to-tr from-[#A477E8]/20 to-[#E8A0D4]/20 aspect-4/3 sm:aspect-16/11">
                <img
                  src="/images/hero-banquet.jpg"
                  alt="Celebration banquet arch under sunset sky"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#29213F]/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Badge Card matching reference: "Turn ideas into beautiful celebrations" */}
              <div className="absolute -top-4 -left-4 sm:-left-6 p-3 sm:p-4 rounded-asym bg-white/95 backdrop-blur-md border border-[#E8DFF5] shadow-soft-lg flex items-center space-x-3 animate-fade-in max-w-xs">
                <div className="h-9 w-9 rounded-asym-sm bg-gradient-to-tr from-[#7C4DCE] to-[#E8A0D4] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#29213F] leading-tight">
                    <AlexText scale="text-[1.2em]">Turn ideas into beautiful celebrations</AlexText>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Summary Section */}
        <section id="features" className="mt-20 pt-12 border-t border-[#E8DFF5]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <AlexText as="h2" scale="text-[1.25em]" className="text-3xl sm:text-4xl font-normal text-[#29213F]">
              Everything you need for seamless celebrations
            </AlexText>
            <p className="text-sm text-[#71677F] mt-2">
              Coordinated budgeting, task timelines, and vendor quotation comparisons in one unified space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-asym p-6 space-y-3 hover:shadow-soft-lg transition-all">
              <div className="h-10 w-10 rounded-asym-sm bg-[#F3EBFB] text-[#7C4DCE] flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <AlexText as="h3" scale="text-[1.2em]" className="text-lg font-bold text-[#29213F]">
                Adaptive Timelines
              </AlexText>
              <p className="text-xs text-[#71677F] leading-relaxed">
                Stay on top of critical dates, RSVP counts, and venue setup milestones with automated reminders.
              </p>
            </div>

            <div className="card-asym p-6 space-y-3 hover:shadow-soft-lg transition-all">
              <div className="h-10 w-10 rounded-asym-sm bg-[#F5D9EF] text-[#BA3E91] flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <AlexText as="h3" scale="text-[1.2em]" className="text-lg font-bold text-[#29213F]">
                AI Planning Partner
              </AlexText>
              <p className="text-xs text-[#71677F] leading-relaxed">
                Gemini-powered recommendations for themes, menus, and budget trade-offs that never modify your plan without approval.
              </p>
            </div>

            <div className="card-asym p-6 space-y-3 hover:shadow-soft-lg transition-all">
              <div className="h-10 w-10 rounded-asym-sm bg-[#F3EBFB] text-[#6035C4] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <AlexText as="h3" scale="text-[1.2em]" className="text-lg font-bold text-[#29213F]">
                Guaranteed Budgets
              </AlexText>
              <p className="text-xs text-[#71677F] leading-relaxed">
                Deterministic calculations and category breakdowns prevent budget surprises before contracts are signed.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8DFF5] py-8 bg-white/50 text-center text-xs text-[#71677F]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" showSubtitle={false} />
          <p>© 2026 Planora — AI-Powered Celebration Planner. All rights reserved.</p>
          <div className="flex space-x-6 font-semibold">
            <Link to="/dashboard" className="hover:text-[#7C4DCE]">Dashboard</Link>
            <Link to="/events/new" className="hover:text-[#7C4DCE]">Create Event</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
