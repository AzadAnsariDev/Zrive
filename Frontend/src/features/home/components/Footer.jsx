import React from "react";
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
  },
  {
    icon: RefreshCw,
    label: "7-Day Returns",
    sub: "Hassle-free exchange",
  },
  {
    icon: Shield,
    label: "Secure Payments",
    sub: "Escrow protection",
  },
  {
    icon: CreditCard,
    label: "Easy EMI",
    sub: "No-cost options",
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#111111] text-white">
      {/* Trust Badges */}
      <div className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#B08D57]/10 border border-[#B08D57]/30 flex items-center justify-center flex-shrink-0">
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className="text-[#B08D57]"
                  />
                </div>

                <div>
                  <p className="text-[12.5px] font-semibold text-white">
                    {label}
                  </p>
                  <p className="text-[11px] text-white/50">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
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

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-white/8 border border-white/15 rounded-[6px] px-3 py-2.5 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-[#B08D57] transition-colors min-w-0"
                />

                <button
                  type="button"
                  className="px-4 py-2.5 bg-[#B08D57] text-[#0e0e0e] text-[12px] font-semibold rounded-[6px] hover:bg-[#D4B982] transition-colors flex-shrink-0"
                >
                  Join
                </button>
              </div>
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
                className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all"
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
  );
};

export default Footer;