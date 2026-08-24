import React from "react";
import { Heart } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import useWishlist from "../hook/useWishlist";
import { notify } from "../../../utils/toast";

const WishlistButton = ({ productId, variantSku, className = "" }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const { handleToggleWishlist } = useWishlist();

  const isWishlisted = useSelector((state) => {
    const skus = state.wishlist?.variantSkus || [];
    const items = state.wishlist?.items || [];
    if (variantSku && skus.includes(variantSku)) return true;
    return items.some(
      (item) =>
        item.variantSku === variantSku ||
        item.product?._id === productId ||
        item.product === productId ||
        item.productId === productId
    );
  });

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If user is not logged in, redirect to login page immediately
    if (!user) {
      navigate("/login");
      return;
    }

    const wasWishlisted = isWishlisted;
    try {
      await handleToggleWishlist(productId, variantSku);
      if (wasWishlisted) {
        notify.success("Removed from wishlist");
      } else {
        notify.success("Added to wishlist");
      }
    } catch (err) {
      notify.error(err, "Could not update wishlist");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur border border-[#EAEAEA] shadow-sm hover:bg-white transition-all cursor-pointer ${className}`}
    >
      <Heart
        size={15}
        strokeWidth={isWishlisted ? 0 : 1.75}
        className={
          isWishlisted
            ? "fill-[#C43D3D] text-[#C43D3D] scale-110 transition-all duration-200"
            : "text-[#666666] hover:text-[#111111] transition-colors"
        }
      />
    </button>
  );
};

export default WishlistButton;