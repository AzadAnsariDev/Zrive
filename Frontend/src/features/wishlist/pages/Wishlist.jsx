import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  Heart,
  X,
  ShoppingBag,
  Square,
  CheckSquare,
  PackageX,
  AlertTriangle,
  Link2,
  Check,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import useWishlist from "../hook/useWishlist";
import useCart from "../../cart/hook/useCart";

const SECTION_X = "px-5 md:px-6 lg:px-10";
const SECTION_Y = "py-6 md:py-8";
const CONTAINER = "max-w-[1100px] mx-auto";

const formatPrice = (priceObj) => {
  if (priceObj === null || priceObj === undefined) return "";
  const amount = typeof priceObj === "object" ? priceObj.amount : priceObj;
  const currency = (typeof priceObj === "object" && priceObj.currency) || "INR";
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${Number(amount || 0).toLocaleString("en-IN")}`;
};

// pulls the matching variant out of the populated product using the sku
// the wishlist entry stores — every card/section below leans on this
const getVariant = (item) =>
  item.product?.variants?.find((v) => v.sku === item.variantSku);

/* ============================= Card ============================= */

const WishlistCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-cream-dark rounded-[3px] mb-2.5" />
    <div className="h-3 w-16 bg-cream-dark rounded-[3px] mb-2" />
    <div className="h-4 w-3/4 bg-cream-dark rounded-[3px]" />
  </div>
);

const WishlistCard = ({
  item,
  onRemove,
  onMoveToCart,
  removing,
  addingToCart,
  selectMode,
  selected,
  onToggleSelect,
}) => {
  const navigate = useNavigate();
  const product = item.product;
  const variant = getVariant(item);
  const image = variant?.images?.[0]?.url || product?.images?.[0]?.url;
  const price = variant?.price || product?.price;
  const outOfStock = variant ? variant.stock <= 0 : false;
  const lowStock = variant ? variant.stock > 0 && variant.stock <= 3 : false;

  const handleImageClick = () => {
    if (selectMode) {
      onToggleSelect(item.variantSku);
      return;
    }
    if (product) navigate(`/product/${product._id}`);
  };

  return (
    <div className="group">
      <div
        className={`relative aspect-[3/4] overflow-hidden bg-cream-dark rounded-[3px] mb-2.5 cursor-pointer transition-shadow ${
          selected ? "ring-2 ring-charcoal ring-offset-2 ring-offset-cream" : ""
        }`}
        onClick={handleImageClick}
      >
        <img
          src={image}
          alt={product?.title}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {selectMode && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-[3px] flex items-center justify-center bg-cream/90 backdrop-blur border border-border text-ink">
            {selected ? <CheckSquare size={14} strokeWidth={2} /> : <Square size={14} strokeWidth={2} />}
          </div>
        )}

        {!selectMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.variantSku);
            }}
            disabled={removing}
            aria-label="Remove from wishlist"
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-cream/90 backdrop-blur border border-border hover:bg-cream transition-colors disabled:opacity-50"
          >
            <X size={14} strokeWidth={2} className="text-ink" />
          </button>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-cream/70 flex items-center justify-center">
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft bg-cream px-2.5 py-1 rounded-[3px] border border-border">
              Out of Stock
            </span>
          </div>
        )}
        {!outOfStock && lowStock && (
          <span className="absolute bottom-2 left-2 text-[9px] font-semibold tracking-[0.08em] uppercase text-cream bg-charcoal/90 px-2 py-1 rounded-[3px]">
            Only {variant.stock} left
          </span>
        )}
      </div>

      <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-0.5 truncate">
        {variant?.size ? `${variant.size}${variant.color ? ` · ${variant.color}` : ""}` : product?.category}
      </p>
      <h3 className="font-display text-[13.5px] text-ink mb-1 truncate">
        {product?.title || "Product no longer available"}
      </h3>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-sans text-[13px] font-semibold text-ink">{formatPrice(price)}</span>
      </div>
      <button
        type="button"
        onClick={() => onMoveToCart(product?._id, variant?._id)}
        disabled={outOfStock || !variant || addingToCart}
        className="w-full bg-charcoal text-cream text-[10.5px] font-semibold tracking-[0.08em] uppercase py-2.5 rounded-[3px] hover:bg-ink transition-colors disabled:bg-cream-dark disabled:text-ink-soft disabled:cursor-not-allowed"
      >
        {outOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
};

/* ======================= Stock Watch section ======================= */
// the only signal we can honestly surface from wishlist data — no price
// history is tracked, so this stays limited to current stock state

const StockWatch = ({ items }) => {
  const flagged = useMemo(
    () =>
      items
        .map((item) => {
          const variant = getVariant(item);
          if (!variant) return null;
          if (variant.stock <= 0) return { item, variant, status: "out" };
          if (variant.stock <= 3) return { item, variant, status: "low" };
          return null;
        })
        .filter(Boolean),
    [items]
  );

  if (flagged.length === 0) return null;

  return (
    <section className={`${SECTION_X}`}>
      <div className={`${CONTAINER} border-t border-border pt-6 md:pt-8`}>
        <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
          Stock Watch
        </p>
        <h2 className="font-display text-[19px] text-ink mb-4">
          {flagged.length} saved {flagged.length > 1 ? "pieces need" : "piece needs"} a decision
        </h2>
        <div className="flex flex-col divide-y divide-border border border-border rounded-[3px] overflow-hidden">
          {flagged.map(({ item, variant, status }) => (
            <div key={item._id} className="flex items-center gap-3 px-4 py-3 bg-cream">
              <div className="w-9 h-9 rounded-[3px] overflow-hidden bg-cream-dark flex-shrink-0">
                {(variant?.images?.[0]?.url || item.product?.images?.[0]?.url) && (
                  <img
                    src={variant?.images?.[0]?.url || item.product?.images?.[0]?.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="flex-1 text-[13px] text-ink truncate">
                {item.product?.title || "Product no longer available"}
              </p>
              {status === "out" ? (
                <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.06em] uppercase text-ink-soft">
                  <PackageX size={13} strokeWidth={1.75} />
                  Sold out
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.06em] uppercase text-gold">
                  <AlertTriangle size={13} strokeWidth={1.75} />
                  {variant.stock} left
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ========================= Share section ========================= */

const ShareWishlist = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <section className={`${SECTION_X}`}>
      <div className={`${CONTAINER} border-t border-border pt-6 md:pt-8`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-cream-dark rounded-[3px] px-5 py-5 md:px-7 md:py-6">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
              Share
            </p>
            <h2 className="font-display text-[17px] text-ink mb-1">Send this edit to someone</h2>
            <p className="text-[13px] text-ink-soft">
              Copy the link and hand it off — handy for a gift list, or a second opinion before you buy.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-5 py-3 rounded-[3px] hover:bg-ink transition-colors flex-shrink-0"
          >
            {copied ? <Check size={13} strokeWidth={2} /> : <Link2 size={13} strokeWidth={1.75} />}
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>
    </section>
  );
};

/* ============================ FAQ section ============================ */

const FAQ_ITEMS = [
  {
    q: "How long do items stay in my wishlist?",
    a: "Indefinitely — saved items stay here until you remove them or move them to your cart, even across sessions.",
  },
  {
    q: "Will I know if something sells out?",
    a: "The Stock Watch section above flags anything running low or already sold out, right on this page — no need to check the product page separately.",
  },
  {
    q: "Can I move several pieces to my bag at once?",
    a: "Yes — tap Select above the grid, choose your pieces, then Add to Bag. Anything out of stock is skipped automatically.",
  },
  {
    q: "Can someone else see my wishlist?",
    a: "Only if you share the link yourself using the Copy Link option above. It isn't visible to anyone else by default.",
  },
];

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className={`${SECTION_X}`}>
      <div className={`${CONTAINER} border-t border-border pt-6 md:pt-8 pb-2`}>
        <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
          A Few Things to Know
        </p>
        <h2 className="font-display text-[19px] text-ink mb-4">Wishlist, answered</h2>
        <div className="border-t border-border">
          {FAQ_ITEMS.map((faq, i) => {
            const open = openIndex === i;
            return (
              <div key={faq.q} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="font-display text-[14px] text-ink">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    strokeWidth={1.75}
                    className={`text-ink-soft flex-shrink-0 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open && (
                  <p className="text-[13px] text-ink-soft leading-relaxed pb-4 pr-8">{faq.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ============================== Page ============================== */

const Wishlist = () => {
  const navigate = useNavigate();
  const { handleGetWishlist, handleRemoveFromWishlist } = useWishlist();
  const { handleAddToCart } = useCart();
  const items = useSelector((state) => state.wishlist.items);
  const fetchLoading = useSelector((state) => state.wishlist.loading.fetch);
  const createLoading = useSelector((state) => state.wishlist.loading.create);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    handleGetWishlist();
  }, []);

  // dropping out of select mode always clears the selection so it can't
  // silently carry over into a later session of picking items
  useEffect(() => {
    if (!selectMode) setSelected(new Set());
  }, [selectMode]);

  const totalValue = useMemo(
    () =>
      items.reduce((sum, item) => {
        const variant = getVariant(item);
        const price = variant?.price || item.product?.price;
        const amount = typeof price === "object" ? price?.amount : price;
        return sum + Number(amount || 0);
      }, 0),
    [items]
  );

  const onRemove = async (variantSku) => {
    await handleRemoveFromWishlist(variantSku);
    toast.success("Removed from wishlist");
  };

  const onMoveToCart = async (productId, variantId) => {
    if (!productId || !variantId) return;
    const result = await handleAddToCart(productId, variantId);
    if (result) toast.success("Added to cart");
  };

  const onToggleSelect = (variantSku) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(variantSku)) next.delete(variantSku);
      else next.add(variantSku);
      return next;
    });
  };

  const selectedItems = items.filter((item) => selected.has(item.variantSku));

  const onBulkMoveToCart = async () => {
    const movable = selectedItems.filter((item) => {
      const variant = getVariant(item);
      return variant && variant.stock > 0;
    });
    if (movable.length === 0) {
      toast.error("Nothing selected is in stock");
      return;
    }
    setBulkBusy(true);
    await Promise.all(
      movable.map((item) => handleAddToCart(item.product._id, getVariant(item)._id))
    );
    setBulkBusy(false);
    toast.success(`Added ${movable.length} item${movable.length > 1 ? "s" : ""} to cart`);
    setSelectMode(false);
  };

  const onBulkRemove = async () => {
    setBulkBusy(true);
    await Promise.all(selectedItems.map((item) => handleRemoveFromWishlist(item.variantSku)));
    setBulkBusy(false);
    toast.success(`Removed ${selectedItems.length} item${selectedItems.length > 1 ? "s" : ""}`);
    setSelectMode(false);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ---------- hero ---------- */}
      <section className={`${SECTION_X} ${SECTION_Y}`}>
        <div className={CONTAINER}>
          <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">
            Saved For Later
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-1">
            <h1 className="font-display text-[28px] md:text-[34px] font-medium text-ink">
              Your Edit
            </h1>
            {items.length > 0 && !fetchLoading && (
              <button
                type="button"
                onClick={() => setSelectMode((s) => !s)}
                className="text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-soft hover:text-ink transition-colors self-start md:self-auto"
              >
                {selectMode ? "Cancel" : "Select"}
              </button>
            )}
          </div>
          <p className="text-[13px] text-ink-soft">
            {items.length > 0
              ? `${items.length} piece${items.length > 1 ? "s" : ""} saved · worth ${formatPrice(totalValue)} altogether`
              : "The pieces you circle back to will show up here."}
          </p>
        </div>
      </section>

      {/* ---------- grid ---------- */}
      <section className={`${SECTION_X} pb-6 md:pb-8`}>
        <div className={CONTAINER}>
          {fetchLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <WishlistCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!fetchLoading && items.length === 0 && (
            <div className="py-20 text-center">
              <Heart className="mx-auto mb-4 text-ink-soft" size={26} strokeWidth={1.2} />
              <p className="font-display text-[16px] text-ink mb-1">Your wishlist is empty</p>
              <p className="text-[13px] text-ink-soft mb-5">
                Save items you like by tapping the heart on any product.
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] hover:bg-ink transition-colors"
              >
                <ShoppingBag size={13} strokeWidth={1.75} />
                Start Shopping
              </button>
            </div>
          )}

          {!fetchLoading && items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
              {items.map((item) => (
                <WishlistCard
                  key={item._id}
                  item={item}
                  onRemove={onRemove}
                  onMoveToCart={onMoveToCart}
                  removing={createLoading}
                  addingToCart={createLoading}
                  selectMode={selectMode}
                  selected={selected.has(item.variantSku)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {!fetchLoading && items.length > 0 && (
        <>
          <StockWatch items={items} />
          <ShareWishlist />
        </>
      )}
      <FAQAccordion />

      {/* ---------- sticky bulk action bar ---------- */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-charcoal text-cream z-30">
          <div className={`${SECTION_X} py-3.5`}>
            <div className={`${CONTAINER} flex items-center justify-between gap-4`}>
              <span className="text-[12px] font-semibold tracking-[0.04em]">
                {selected.size} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBulkRemove}
                  disabled={bulkBusy}
                  className="text-[11px] font-semibold tracking-[0.08em] uppercase text-cream/70 hover:text-cream transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={onBulkMoveToCart}
                  disabled={bulkBusy}
                  className="bg-gold text-charcoal text-[11px] font-semibold tracking-[0.08em] uppercase px-5 py-2.5 rounded-[3px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;