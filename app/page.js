"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-blue-600">Scholars</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="workspace/explore"
              className="text-gray-600 hover:text-blue-700 hover:font-bold font-medium"
            >
              Courses
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-blue-700 hover:font-bold font-medium"
            >
              How It Works
            </Link>
            <Link
              href="workspace/billing"
              className="text-gray-600 hover:text-blue-700 hover:font-bold font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-blue-700 hover:font-bold font-medium"
            >
              Contact Us
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/workspace"><Button>Get Started</Button></Link>
          </div>

          {/* Mobile Actions (Button + Hamburger) */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link href="/workspace"><Button size="sm">Get Started</Button></Link>
            <button
              className="p-2 rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="w-6 h-6 text-blue-600" />
              ) : (
                <Menu className="w-6 h-6 text-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-md px-6 py-4 space-y-4">
            <Link
              href="workspace/explore"
              className="block text-gray-700 hover:text-blue-600"
            >
              Courses
            </Link>
            <Link
              href="#how-it-works"
              className="block text-gray-700 hover:text-blue-600"
            >
              How It Works
            </Link>
            <Link
              href="workspace/billing"
              className="block text-gray-700 hover:text-blue-600"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="block text-gray-700 hover:text-blue-600"
            >
              Contact Us
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-section-gradient">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
  Learn Smarter with{" "}
  <span className="text-blue-700">AI-Powered</span>{" "}
  Education
</h1>


              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform your learning journey with personalized AI tutors,
                adaptive coursework, and intelligent insights that help you
                master any subject faster than ever before.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  
                  size="lg"
                  className="text-lg px-8 py-4 w-full"
                ><Link href="workspace/explore">
                  Start Learning for Free</Link>
                </Button>
                
              </div>

              <div className="flex items-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">500K+</div>
                  <div className="text-sm text-muted-foreground">
                    Active Learners
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm text-muted-foreground">
                    Success Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.9/5</div>
                  <div className="text-sm text-muted-foreground">
                    User Rating
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-elegant">
                <img
                  src="/assets/heromg.jpg"
                  alt="AI-powered learning"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-hero-gradient opacity-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How Scholars Works
            </h2>
            <p className="text-lg text-gray-600">
              Start your AI-powered learning journey in just a few simple steps
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0">
            {[
              {
                number: "1",
                title: "Sign Up & Set Goals",
                description:
                  "Create your account and tell us about your learning objectives.",
              },
              {
                number: "2",
                title: "Get AI Assessment",
                description:
                  "Complete our initial assessment to understand your knowledge level.",
              },
              {
                number: "3",
                title: "Receive Learning Path",
                description:
                  "Get a personalized curriculum designed for your needs.",
              },
              {
                number: "4",
                title: "Learn & Grow",
                description:
                  "Start learning with adaptive content that evolves as you progress.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center w-full md:w-56"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                  <span className="text-white text-2xl font-bold">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold">Scholars</span>
              </div>
              <p className="text-gray-400">
                AI-powered learning platform designed to help you master new
                skills efficiently.
              </p>
            </div>

            {[
              {
                title: "Navigation",
                links: [
                  { name: "Home", href: "/" },
                  { name: "Courses", href: "/courses" },
                  { name: "Features", href: "#features" },
                  { name: "Pricing", href: "workspace/billing" },
                  { name: "About", href: "/about" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { name: "Blog", href: "/blog" },
                  { name: "Webinars", href: "/webinars" },
                  { name: "Tutorials", href: "/tutorials" },
                  { name: "Documentation", href: "/docs" },
                  { name: "FAQ", href: "/faq" },
                ],
              },
              {
                title: "Connect",
                links: [
                  { name: "Twitter", href: "https://twitter.com" },
                  { name: "LinkedIn", href: "https://linkedin.com" },
                  { name: "Facebook", href: "https://facebook.com" },
                  { name: "Instagram", href: "https://instagram.com" },
                  { name: "Contact Us", href: "/contact" },
                ],
              },
            ].map((column, index) => (
              <div key={index}>
                <h3 className="font-semibold text-lg mb-6">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>Created by Priyanshu Bhadauriya & Abhishek Gupta</p>
            <p>© {new Date().getFullYear()} Scholars. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
