import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useSelector } from "react-redux";
import {
  Heart,
  X,
  ShoppingBag,
  ArrowLeft,
  Trash2,
  PackageX,
  Sparkles,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { notify } from "../../../utils/toast";
import useWishlist from "../hook/useWishlist";
import useCart from "../../cart/hook/useCart";

const formatPrice = (priceObj) => {
  if (priceObj === null || priceObj === undefined) return "";
  const amount = typeof priceObj === "object" ? priceObj.amount : priceObj;
  const currency = (typeof priceObj === "object" && priceObj.currency) || "INR";
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${Number(amount || 0).toLocaleString("en-IN")}`;
};

const getVariant = (item) =>
  item.product?.variants?.find((v) => v.sku === item.variantSku);

const Wishlist = () => {
  const navigate = useNavigate();
  const { handleGetWishlist, handleRemoveFromWishlist } = useWishlist();
  const { handleAddToCart } = useCart();

  const items = useSelector((state) => state.wishlist.items || []);
  const [loading, setLoading] = useState(true);
  const [movingSku, setMovingSku] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        await handleGetWishlist();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const onRemoveItem = async (sku) => {
    try {
      await handleRemoveFromWishlist(sku);
      notify.success("Removed from wishlist");
    } catch (err) {
      notify.error(err, "Could not remove item from wishlist");
    }
  };

  const onMoveToBag = async (item) => {
    setMovingSku(item.variantSku);
    try {
      const variant = getVariant(item);
      if (item.product?._id && variant?._id) {
        await handleAddToCart(item.product._id, variant._id);
        await handleRemoveFromWishlist(item.variantSku);
        notify.success("Moved to Shopping Bag!");
      } else {
        notify.error("Unable to add item to bag. Please select a size.");
      }
    } catch (err) {
      notify.error(err, "Could not move item to bag.");
    } finally {
      setMovingSku(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header bar */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Saved Collection ({items.length})
          </span>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-6">
        <div className="mb-6 border-b border-[#EAEAEA] pb-3 flex items-baseline justify-between">
          <div>
            <h1 className="font-display text-[24px] md:text-[28px] font-bold text-[#111111]">
              My Wishlist
            </h1>
            <p className="text-[12.5px] text-[#666666] mt-0.5">
              Items saved for future orders.
            </p>
          </div>
          <span className="text-[12px] font-bold text-[#B08D57]">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[3/4] bg-[#FAFAFA] rounded-[8px] animate-pulse border border-[#EAEAEA]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[10px] max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#F5EFE5] flex items-center justify-center mb-4">
              <Heart size={26} className="text-[#B08D57]" />
            </div>
            <h2 className="text-[18px] font-bold text-[#111111] mb-1">Your Wishlist is Empty</h2>
            <p className="text-[12.5px] text-[#666666] mb-6 max-w-xs leading-relaxed">
              Explore our catalog and save your favorite styles to purchase later.
            </p>
            <Link
              to="/all-products"
              className="bg-[#111111] text-white px-6 py-3 rounded text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((item) => {
              const variant = getVariant(item);
              const product = item.product;
              if (!product) return null;

              const cover = variant?.images?.[0]?.url || product.images?.[0]?.url;
              const price = variant?.price || product.price;

              return (
                <div
                  key={item.variantSku}
                  className="bg-white border border-[#EAEAEA] rounded-[3px] overflow-hidden hover:border-[#B08D57] transition-all duration-300 shadow-sm flex flex-col justify-between group relative"
                >
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.variantSku)}
                    className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 text-[#111] flex items-center justify-center shadow hover:bg-[#C43D3D] hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>

                  <div className="cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                    <div className="aspect-[3/4] overflow-hidden bg-[#FAFAFA]">
                      {cover ? (
                        <img src={cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#999]">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#B08D57] truncate">
                        {product.brand || "ZRIVE"}
                      </p>
                      <h3 className="font-display text-[13px] font-semibold text-[#111111] truncate mb-1">
                        {product.name || product.title}
                      </h3>
                      {variant && (
                        <p className="text-[10.5px] text-[#666666] mb-1">
                          Size: {variant.size} · Color: {variant.color}
                        </p>
                      )}
                      <p className="text-[13.5px] font-bold text-[#111111]">
                        {formatPrice(price)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 pt-0">
                    <button
                      type="button"
                      disabled={movingSku === item.variantSku}
                      onClick={() => onMoveToBag(item)}
                      className="w-full py-2 bg-[#111111] text-white rounded text-[11px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <ShoppingBag size={13} />
                      {movingSku === item.variantSku ? "Moving..." : "Move to Bag"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;