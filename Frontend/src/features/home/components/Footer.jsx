import React, { useState } from "react";
import { Link } from "react-router";
import {
  Shield,
  Truck,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import {
  FaInstagram,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";
import { notify } from "../../../utils/toast";

const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", to: "/new-arrivals" },
      { label: "Men's Shirts", to: "/all-products?category=shirts" },
      { label: "T-Shirts", to: "/all-products?category=tshirts" },
      { label: "Jeans & Trousers", to: "/all-products?category=jeans" },
      { label: "Jackets", to: "/all-products?category=jackets" },
      { label: "Accessories", to: "/all-products?category=accessories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About ZRIVE", to: "#" },
      { label: "Sell on ZRIVE", to: "/become-seller" },
      { label: "Sustainability", to: "#" },
      { label: "Careers", to: "#" },
      { label: "Press", to: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "#" },
      { label: "Shipping & Returns", to: "#" },
      { label: "Track Order", to: "/orders" },
      { label: "Size Guide", to: "#" },
      { label: "Contact Us", to: "#" },
    ],
  },
];

const TRUST_BADGES = [
  {
    icon: Truck,
    label: "Free Shipping",
    sub: "On orders above ₹999",
    bg: "bg-[#FDF6EC]",
    border: "border-[#F5E5CE]",
    iconColor: "text-[#B08D57]",
    badgeBg: "bg-[#B08D57]/15",
  },
  {
    icon: RefreshCw,
    label: "7-Day Returns",
    sub: "Hassle-free exchange",
    bg: "bg-[#EDF8F1]",
    border: "border-[#D3EEDC]",
    iconColor: "text-[#287A4B]",
    badgeBg: "bg-[#287A4B]/15",
  },
  {
    icon: Shield,
    label: "Secure Payments",
    sub: "Escrow protection",
    bg: "bg-[#EDF3FC]",
    border: "border-[#D4E3FA]",
    iconColor: "text-[#2962FF]",
    badgeBg: "bg-[#2962FF]/15",
  },
  {
    icon: CreditCard,
    label: "Easy EMI",
    sub: "No-cost options",
    bg: "bg-[#F7EEFA]",
    border: "border-[#EED7F4]",
    iconColor: "text-[#8E24AA]",
    badgeBg: "bg-[#8E24AA]/15",
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      notify.error("Please enter a valid email address.");
      return;
    }
    notify.success("Thank you for subscribing to ZRIVE!");
    setEmail("");
  };

  return (
    <div className="w-full">
      {/* Colorful, Compact Trust Badges Strip with Margin Gap */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 my-6 md:my-8">
        <div className="bg-gradient-to-r from-[#FAF8F5] via-[#FFFDF9] to-[#FAF8F5] border border-[#EAE4D7] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {TRUST_BADGES.map(({ icon: Icon, label, sub, bg, border, iconColor, badgeBg }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl ${bg} border ${border} transition-all duration-200 hover:shadow-sm`}
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${badgeBg} flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon
                    size={16}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[12px] sm:text-[13px] font-bold text-[#111111] truncate">
                    {label}
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-medium text-[#666666] truncate">
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer (Pure Black) */}
      <footer className="bg-[#111111] text-white">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 md:gap-12 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-[24px] font-semibold tracking-[0.12em] text-white">
              ZRIVE
            </span>

            <p className="text-[13px] leading-relaxed text-white/55 mt-4 max-w-xs">
              India's premium men's marketplace. Curated brands, verified
              sellers, and an unmatched shopping experience — powered by
              trust.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#B08D57] mb-3">
                Stay in the loop
              </p>

              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-white/8 border border-white/15 rounded-[6px] px-3 py-2.5 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-[#B08D57] transition-colors min-w-0"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#B08D57] text-[#0e0e0e] text-[12px] font-semibold rounded-[6px] hover:bg-[#D4B982] transition-colors flex-shrink-0 cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_LINKS.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#B08D57] mb-5">
                {title}
              </h4>

              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-[13px] text-white/55 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-[11.5px] text-white/35 order-2 sm:order-1">
            © 2026 ZRIVE Technologies Pvt. Ltd. · All rights reserved.
          </p>

          <div className="flex items-center gap-5 order-1 sm:order-2">

            {/* Social */}
            {[
              {
                icon: FaInstagram,
                label: "Instagram",
              },
              {
                icon: FaTwitter,
                label: "Twitter",
              },
              {
                icon: FaYoutube,
                label: "YouTube",
              }
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              >
                <Icon
                  size={14}
                  className={label === "YouTube" ? "" : "fill-current"}
                  strokeWidth={1.75}
                />
              </button>
            ))}

            <span className="w-px h-4 bg-white/15" />

            <Link
              to="#"
              className="text-[11px] text-white/35 hover:text-white/70 transition-colors"
            >
              Privacy
            </Link>

            <Link
              to="#"
              className="text-[11px] text-white/35 hover:text-white/70 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;