import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import SellerLayout from "../features/layout/SellerLayout";
import ProductList from "../features/product/pages/ProductList";
import CreateProduct from "../features/product/pages/CreateProduct";
import Protected from "../features/auth/components/Protected";
import Home from "../features/home/pages/Home";
import UserLayout from "../features/layout/UserLayout";
import AllProducts from "../features/product/pages/AllProducts";
import SingleProduct from "../features/product/pages/SingleProduct";
import AddVariant from "../features/product/pages/SellerProductDetail";
import Cart from "../features/cart/pages/Cart";
import OrderPlaced from "../features/order/pages/OrderPlaced";
import Address from "../features/address/pages/Address";
import AllOrders from "../features/order/pages/AllOrders";
import OrderDetail from "../features/order/pages/OrderDetail";
import OrderGroupItems from "../features/order/pages/OrderGroupItems";
import SellerOrders from "../features/seller/pages/SellerOrders";
import BecomeSeller from "../features/seller/pages/BecomeSeller";
import SellerKYC from "../features/seller/pages/SellerKYC";
import SellerDashboard from "../features/seller/pages/SellerDashboard";
import AdminLayout from "../features/layout/AdminLayout";
import AdminLogin from "../features/admin/pages/AdminLogin";
import ProtectedAdmin from "../features/admin/components/ProtectedAdmin";
import AdminSellers from "../features/admin/pages/AdminSellers";
import AdminSellerDetail from "../features/admin/pages/AdminSellerDetail";
import SellerOrderDetail from "../features/seller/pages/SellerOrderDetail";
import NewArrivals from "../features/home/pages/NewArrivals";
import Collections from "../features/home/pages/Collections";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "categories", element: <div>Categories page</div> },
      { path: "new-arrivals", element: <NewArrivals /> }, // ← add
      { path: "cart", element: <Cart /> },
      { path: "collections", element: <Collections /> }, // ← add
      { path: "profile", element: <div>Profile page</div> },
      { path: "wishlist", element: <div>Wishlist page</div> },
      { path: "all-products", element: <AllProducts /> },
      { path: "product/:productId", element: <SingleProduct /> },
      {
        path: "order-success",
        element: (
          <Protected>
            {" "}
            <OrderPlaced />{" "}
          </Protected>
        ),
      },
      {
        path: "address",
        element: (
          <Protected>
            {" "}
            <Address />{" "}
          </Protected>
        ),
      },
      {
        path: "orders",
        element: (
          <Protected>
            {" "}
            <AllOrders />{" "}
          </Protected>
        ),
      },
      {
        path: "orders/:orderId",
        element: (
          <Protected>
            {" "}
            <OrderDetail />{" "}
          </Protected>
        ),
      },
      {
        path: "/orders/group/:paymentId",
        element: (
          <Protected>
            {" "}
            <OrderGroupItems />{" "}
          </Protected>
        ),
      },
      {
        path: "/become-seller",
        element: (
          <Protected>
            {" "}
            <BecomeSeller />{" "}
          </Protected>
        ),
      },
    ],
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdmin>
        <AdminLayout />
      </ProtectedAdmin>
    ),
    children: [
      { index: true, element: <div>Overview page</div> },
      { path: "sellers", element: <AdminSellers /> },
      { path: "sellers/:sellerId", element: <AdminSellerDetail /> },
      { path: "commerce", element: <div>Commerce page</div> },
      { path: "marketplace", element: <div>Marketplace page</div> },
      { path: "finance", element: <div>Finance page</div> },
      { path: "marketing", element: <div>Marketing page</div> },
      { path: "system", element: <div>System page</div> },
    ],
  },
  {
    path: "/seller",
    element: (
      <Protected role={["basic_seller", "seller"]}>
        {" "}
        <SellerLayout />{" "}
      </Protected>
    ),
    children: [
      {
        path: "inventory",
        element: <ProductList />,
      },
      {
        path: "inventory/new",
        element: <CreateProduct />,
      },
      {
        index: true,
        element: <SellerDashboard />,
      },
      {
        path: "orders",
        element: <SellerOrders />,
      },
      {
        path: "orders/:orderId",
        element: <SellerOrderDetail />,
      },
      {
        path: "analytics",
        element: <div>Analytics page</div>,
      },
      {
        path: "payments",
        element: <div>Payments page</div>,
      },
      {
        path: "settings",
        element: <div>Settings page</div>,
      },
      {
        path: "inventory/:productId/addVariant",
        element: <AddVariant />,
      },
      {
        path: "become-seller/verify",
        element: <SellerKYC />,
      },
    ],
  },
]);

export default router;
