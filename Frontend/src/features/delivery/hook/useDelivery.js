import { useDispatch } from "react-redux";
import {
  getDeliveryByOrder,
  schedulePickup,
  generateLabel,
  trackDelivery,
  assignAWB,
  getAllDeliveries,
  retryDelivery,
  cancelDelivery,
  getDeliveryByOrderBuyer,
  trackDeliveryBuyer,
} from "../services/delivery.api.js";
import {
  setDeliveryLoading,
  setDeliveryError,
  setCurrentDelivery,
  setDeliveries,
  updateDeliveryInList,
} from "../state/deliverySlice.js";

const useDelivery = () => {
  const dispatch = useDispatch();

  const handleGetAllDeliveries = async () => {
    dispatch(setDeliveryLoading(true));
    dispatch(setDeliveryError(null));
    try {
      const res = await getAllDeliveries();
      dispatch(setDeliveries(res.deliveries));
      return true;
    } catch (err) {
      dispatch(
        setDeliveryError(
          err.response?.data?.message || "Failed to fetch deliveries",
        ),
      );
      return false;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  const handleRetryDelivery = async (deliveryId) => {
    dispatch(setDeliveryLoading(true));
    dispatch(setDeliveryError(null));
    try {
      const res = await retryDelivery(deliveryId);
      dispatch(
        updateDeliveryInList({ oldId: deliveryId, updated: res.delivery }),
      );
      return true;
    } catch (err) {
      dispatch(setDeliveryError(err.response?.data?.message || "Retry failed"));
      return false;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  const handleGetDeliveryByOrder = async (orderId) => {
    dispatch(setDeliveryLoading(true));
    dispatch(setDeliveryError(null));
    try {
      const res = await getDeliveryByOrder(orderId);
      dispatch(setCurrentDelivery(res.delivery));
      return true;
    } catch (err) {
      // 404 ka matlab delivery abhi tak sync nahi hui — error mat dikhao, bas null rakho
      if (err.response?.status === 404) {
        dispatch(setCurrentDelivery(null));
        return false;
      }
      dispatch(
        setDeliveryError(
          err.response?.data?.message || "Failed to fetch delivery",
        ),
      );
      return false;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  const handleSchedulePickup = async (deliveryId) => {
    dispatch(setDeliveryLoading(true));
    dispatch(setDeliveryError(null));
    try {
      const res = await schedulePickup(deliveryId);
      dispatch(setCurrentDelivery(res.delivery));
      return true;
    } catch (err) {
      dispatch(
        setDeliveryError(
          err.response?.data?.message || "Failed to schedule pickup",
        ),
      );
      return false;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  const handleGenerateLabel = async (deliveryId) => {
    dispatch(setDeliveryLoading(true));
    dispatch(setDeliveryError(null));
    try {
      const res = await generateLabel(deliveryId);
      dispatch(setCurrentDelivery(res.delivery));
      return true;
    } catch (err) {
      dispatch(
        setDeliveryError(
          err.response?.data?.message || "Failed to generate label",
        ),
      );
      return false;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  const handleTrackDelivery = async (deliveryId) => {
    dispatch(setDeliveryLoading(true));
    dispatch(setDeliveryError(null));
    try {
      const res = await trackDelivery(deliveryId);
      dispatch(setCurrentDelivery(res.delivery));
      return res.delivery;
    } catch (err) {
      dispatch(
        setDeliveryError(
          err.response?.data?.message || "Failed to fetch tracking",
        ),
      );
      return null;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  // ⚠️ Real Shiprocket cost — UI se abhi kahi call mat karna
  const handleAssignAWB = async (deliveryId) => {
    dispatch(setDeliveryLoading(true));
    try {
      const res = await assignAWB(deliveryId);
      dispatch(setCurrentDelivery(res.delivery));
      return true;
    } catch (err) {
      dispatch(
        setDeliveryError(err.response?.data?.message || "Failed to assign AWB"),
      );
      return false;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  const handleCancelDelivery = async (deliveryId) => {
    dispatch(setDeliveryLoading(true));
    dispatch(setDeliveryError(null));
    try {
      const res = await cancelDelivery(deliveryId);
      dispatch(setCurrentDelivery(res.delivery));
      return true;
    } catch (err) {
      dispatch(
        setDeliveryError(err.response?.data?.message || "Cancel failed"),
      );
      return false;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  const handleGetDeliveryByOrderBuyer = async (orderId) => {
    dispatch(setDeliveryLoading(true));
    dispatch(setDeliveryError(null));
    try {
      const res = await getDeliveryByOrderBuyer(orderId);
      dispatch(setCurrentDelivery(res.delivery));
      return true;
    } catch (err) {
      if (err.response?.status === 404) {
        dispatch(setCurrentDelivery(null));
        return false;
      }
      dispatch(
        setDeliveryError(
          err.response?.data?.message || "Failed to fetch delivery",
        ),
      );
      return false;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  const handleTrackDeliveryBuyer = async (deliveryId) => {
    dispatch(setDeliveryLoading(true));
    dispatch(setDeliveryError(null));
    try {
      const res = await trackDeliveryBuyer(deliveryId);
      dispatch(setCurrentDelivery(res.delivery));
      return res.delivery;
    } catch (err) {
      dispatch(
        setDeliveryError(
          err.response?.data?.message || "Failed to fetch tracking",
        ),
      );
      return null;
    } finally {
      dispatch(setDeliveryLoading(false));
    }
  };

  // ── Buyer list-page ke liye ──────────────────────────────────────
  // AllOrders jaise list-view mein har active order ke liye delivery
  // fetch + live-track karta hai, phir store ki `deliveries` list set
  // kar deta hai (jise AllOrders.jsx pehle se orderId → delivery map
  // banane ke liye use kar raha hai). Koi naya backend route ya slice
  // change nahi kiya — sirf existing buyer endpoints ko loop mein
  // reuse kiya hai. Loading/error state background-refresh hone ki
  // wajah se dispatch nahi karte, taaki page pe flicker na ho.
  const handleSyncOrderDeliveries = async (orderIds = []) => {
    if (!orderIds.length) return [];

    const results = await Promise.allSettled(
      orderIds.map(async (orderId) => {
        const res = await getDeliveryByOrderBuyer(orderId);
        const delivery = res?.delivery;
        if (!delivery) return null;

        // shipment already terminal state mein hai to dobara track mat karo (cost bachao)
        if (["delivered", "cancelled"].includes(delivery.status)) {
          return delivery;
        }

        try {
          const trackRes = await trackDeliveryBuyer(delivery._id);
          return trackRes?.delivery || delivery;
        } catch {
          // tracking call fail ho to bhi jo delivery mil chuki thi wahi use karo
          return delivery;
        }
      }),
    );

    const deliveries = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value);

    if (deliveries.length) {
      dispatch(setDeliveries(deliveries));
    }
    return deliveries;
  };

  return {
    handleGetDeliveryByOrder,
    handleSchedulePickup,
    handleGenerateLabel,
    handleTrackDelivery,
    handleAssignAWB,
    handleGetAllDeliveries,
    handleRetryDelivery,
    handleCancelDelivery,
    handleTrackDeliveryBuyer,
    handleGetDeliveryByOrderBuyer,
    handleSyncOrderDeliveries,
  };
};

export default useDelivery;