import React from "react";

const SECTION_X = "px-5 md:px-8 lg:px-14";
const CONTAINER = "max-w-[1440px] mx-auto";

const Footer = () => {
  return (
    <footer className={`bg-charcoal text-cream ${SECTION_X} pt-16 md:pt-24 pb-12`}>
      <div className={CONTAINER}>
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 md:gap-12 mb-12 md:mb-16">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-[22px] md:text-[24px] font-medium tracking-[0.06em]">
              ZRIVE
            </span>
            <p className="text-[13px] leading-relaxed text-cream/70 mt-4 max-w-xs">
              Elevated apparel for the modern professional. Defined by
              quality, driven by ambition.
            </p>
          </div>
          {[
            {
              title: "Shop",
              links: ["Men's Collection", "New Arrivals", "Accessories", "Sale"],
            },
            {
              title: "Company",
              links: ["About ZRIVE", "Sustainability", "Stores", "Careers"],
            },
            {
              title: "Support",
              links: ["Shipping & Returns", "Privacy Policy", "Contact Us", "Size Guide"],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-4 md:mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-[13px] text-cream/70 hover:text-cream transition-colors"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-cream/10 pt-6 md:pt-8 flex items-center justify-between">
          <p className="text-[11px] text-cream/50">
            © 2026 ZRIVE. All rights reserved.
          </p>
          <div className="hidden md:flex items-center gap-6">
            {["Instagram", "Twitter", "Facebook"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {}}
                className="text-[11px] font-medium uppercase tracking-[0.1em] text-cream/50 hover:text-cream transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;