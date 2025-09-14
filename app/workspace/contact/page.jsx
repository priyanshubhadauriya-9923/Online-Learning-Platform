"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaFacebookF, FaLinkedinIn, FaInstagram, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import emailjs from "@emailjs/browser";
import { Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, email, subject, message } = formData;

    if (!name || !email || !subject || !message) {
      alert("Please fill in all fields");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const templateParams = {
        from_name: name,
        from_email: email,
        subject,
        message,
      };

      await emailjs.send(
        "service_mz2zq3r",   
        "template_aw0vfkr",  
        templateParams,
        "HeEff2dNV6atmoQ3v"   
      );

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Email send error:", error);
      alert("Oops! Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-5 lg:py-10">
          <div className="text-center">
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 leading-tight">
              Get in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our courses or platform? We're here to help you succeed. 
              Reach out and let's start a conversation.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24 -mt-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Info Cards */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3 flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                Contact Information
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We'd love to hear from you. Choose the most convenient way to reach us.
              </p>

              <div className="space-y-6">
                <ContactCard 
                  icon={<FaEnvelope className="w-5 h-5" />} 
                  title="Email Us" 
                  subtitle="Get in touch via email"
                  lines={["support@scholars.com", "info@scholars.com"]}
                  gradient="from-blue-500 to-blue-600"
                />
                <ContactCard 
                  icon={<FaPhoneAlt className="w-5 h-5" />} 
                  title="Call Us" 
                  subtitle="Speak directly with our team"
                  lines={["+1 (555) 123-4567", "+1 (555) 765-4321"]}
                  gradient="from-emerald-500 to-emerald-600"
                />
                <ContactCard 
                  icon={<FaMapMarkerAlt className="w-5 h-5" />} 
                  title="Visit Us" 
                  subtitle="Come see us in person"
                  lines={["123 Education Street", "Gurgaon - 122001, India"]}
                  gradient="from-purple-500 to-purple-600"
                />
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Follow Our Journey
                </h3>
                <div className="flex flex-wrap gap-3">
                  <SocialIcon href="#" icon={<FaXTwitter />} color="hover:bg-black" />
                  <SocialIcon href="#" icon={<FaFacebookF />} color="hover:bg-blue-600" />
                  <SocialIcon href="#" icon={<FaLinkedinIn />} color="hover:bg-blue-700" />
                  <SocialIcon href="#" icon={<FaInstagram />} color="hover:bg-pink-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="xl:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FaPaperPlane className="mr-3 w-6 h-6" />
                  Send Us a Message
                </h2>
                <p className="text-blue-100 mt-2">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>

              <div className="p-8">
                {success ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg">
                      <FaCheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600 text-lg mb-6">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      suppressHydrationWarning={true}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <InputField 
                        id="name" 
                        label="Full Name" 
                        value={formData.name} 
                        onChange={handleChange}
                        
                      />
                      <InputField 
                        id="email" 
                        label="Email Address" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        icon={<FaEnvelope className="w-4 h-4" />}
                      />
                    </div>

                    <InputField 
                      id="subject" 
                      label="Subject" 
                      value={formData.subject} 
                      onChange={handleChange}
                      icon={<FaPaperPlane className="w-4 h-4" />}
                    />

                    <div>
                      <label htmlFor="message" className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        suppressHydrationWarning={true}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none text-gray-700 placeholder-gray-400"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      suppressHydrationWarning={true}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="mr-3 w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- Enhanced Components ---------- */
function InputField({ id, label, type = "text", value, onChange, icon }) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          suppressHydrationWarning={true}
          className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-700 placeholder-gray-400"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, subtitle, lines, gradient }) {
  return (
    <div className="group">
      <div className="flex items-start space-x-4">
        <div className={`bg-gradient-to-r ${gradient} text-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200 flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 mb-2 font-medium">{subtitle}</p>
          {lines.map((line, i) => (
            <p key={i} className="text-gray-700 font-medium hover:text-blue-600 transition-colors cursor-pointer">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialIcon({ href, icon, color }) {
  return (
    <Link
      href={href}
      suppressHydrationWarning={true}
      className={`bg-gray-100 text-gray-600 p-3 rounded-xl hover:text-white ${color} transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 inline-flex items-center justify-center group`}
    >
      <div className="w-5 h-5 transition-transform group-hover:scale-110">
        {icon}
      </div>
    </Link>
  );
}