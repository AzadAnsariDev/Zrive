import React from "react";
import { Heart } from "lucide-react";
import { useSelector } from "react-redux";
import useWishlist from "../hook/useWishlist";

// Drop this on any product card or the product detail page — it reads
// its own wishlisted state from Redux, so no prop-drilling of
// isWishlisted needed from the parent.
const WishlistButton = ({ productId, variantSku, className = "" }) => {
  const { handleToggleWishlist } = useWishlist();
  const isWishlisted = useSelector((state) =>
    state.wishlist.variantSkus.includes(variantSku)
  );

  const onClick = (e) => {
    // product cards are usually wrapped in an onClick that navigates to
    // the product page — stop that from firing when the heart is tapped
    e.preventDefault();
    e.stopPropagation();
    handleToggleWishlist(productId, variantSku);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      className={`w-8 h-8 rounded-full flex items-center justify-center bg-cream/90 backdrop-blur border border-border hover:bg-cream transition-colors ${className}`}
    >
      <Heart
        size={15}
        strokeWidth={1.75}
        className={isWishlisted ? "fill-error text-error" : "text-ink-soft"}
      />
    </button>
  );
};

export default WishlistButton;