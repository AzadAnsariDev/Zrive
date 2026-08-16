import React from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, ArrowLeft, Sparkles, Layers } from "lucide-react";

const COLLECTIONS = [
  {
    id: "shirts",
    name: "Everyday Shirts",
    tag: "Core Essential",
    desc: "Crisp linen, Oxford cotton, and relaxed camp-collar fits for work & leisure.",
    span: "md:col-span-2 md:row-span-2",
    bg: "bg-[#111111] text-white",
  },
  {
    id: "jeans",
    name: "Denim & Trousers",
    tag: "Tailored Fits",
    desc: "Japanese selvedge denim, pleated trousers, and structured chinos.",
    span: "md:col-span-1 md:row-span-2",
    bg: "bg-[#FAFAFA] text-[#111111] border border-[#E5E5E5]",
  },
  {
    id: "jackets",
    name: "Outerwear & Blazers",
    tag: "Structured",
    desc: "Double-breasted blazers, leather jackets, and lightweight overshirts.",
    span: "md:col-span-1 md:row-span-1",
    bg: "bg-[#FAFAFA] text-[#111111] border border-[#E5E5E5]",
  },
  {
    id: "tshirts",
    name: "Premium T-Shirts",
    tag: "Heavyweight Cotton",
    desc: "240 GSM organic cotton tees with relaxed, boxy silhouettes.",
    span: "md:col-span-1 md:row-span-1",
    bg: "bg-[#FAFAFA] text-[#111111] border border-[#E5E5E5]",
  },
  {
    id: "accessories",
    name: "Leather & Accessories",
    tag: "Details",
    desc: "Handcrafted leather belts, wallets, and minimalist timepieces.",
    span: "md:col-span-1 md:row-span-1",
    bg: "bg-[#FAFAFA] text-[#111111] border border-[#E5E5E5]",
  },
  {
    id: "sale",
    name: "The Luxury Sale Edit",
    tag: "Flat 20% OFF",
    desc: "Curated seasonal pieces at exclusive prices.",
    span: "md:col-span-2 md:row-span-1",
    bg: "bg-[#F5EFE5] text-[#111111] border border-[#B08D57]",
    accent: true,
  },
];

const Collections = () => {
  const navigate = useNavigate();

  const handleSelectCollection = (id) => {
    navigate(`/all-products?category=${id}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header bar */}
      <div className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Home
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Curated Lookbooks
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-[#111111] text-white py-12 px-5 md:px-8 lg:px-12 border-b border-[#E5E5E5]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#B08D57] block mb-2">
              CURATED CATEGORIES · 2026
            </span>
            <h1 className="font-display text-[32px] md:text-[42px] font-bold leading-tight">
              Featured Collections
            </h1>
            <p className="text-[13.5px] text-white/70 mt-1.5 max-w-lg leading-relaxed">
              Discover Wardrobe edits built for every occasion — from effortless weekend leisure to sharp evening tailoring.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 pt-10">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
          {COLLECTIONS.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectCollection(c.id)}
              className={`${c.span} ${c.bg} rounded-[10px] p-6 md:p-8 flex flex-col justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300 shadow-sm relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full ${c.accent ? 'bg-[#B08D57] text-[#0e0e0e]' : 'bg-black/10 text-[#B08D57]'}`}>
                  {c.tag}
                </span>

                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#B08D57] group-hover:text-white transition-all">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              <div>
                <h3 className="font-display text-[22px] md:text-[28px] font-bold leading-tight mb-2">
                  {c.name}
                </h3>
                <p className="text-[13px] opacity-80 leading-relaxed max-w-md">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collections;