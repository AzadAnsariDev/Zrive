import { createBrowserRouter } from 'react-router'
import Register from '../features/auth/pages/Register'
import Login from '../features/auth/pages/Login'
import SellerLayout from '../features/layout/SellerLayout'
import ProductList from '../features/product/pages/ProductList'
import CreateProduct from '../features/product/pages/CreateProduct'
import Protected from '../features/auth/components/Protected'
import Home from '../features/home/pages/Home'
import UserLayout from '../features/layout/UserLayout'
import AllProducts from '../features/product/pages/AllProducts'
import SingleProduct from '../features/product/pages/SingleProduct'
import AddVariant from '../features/product/pages/SellerProductDetail'



const router = createBrowserRouter([
{
    path: '/',
    element: <UserLayout />,
    children: [
        { index: true, element: <Home /> },
        { path: 'categories', element: <div>Categories page</div> },
        { path: 'new-arrivals', element: <div>New Arrivals page</div> },  // ← add
        { path: 'cart', element: <div>Cart page</div> },
        { path: 'orders', element: <div>Orders page</div> },
        { path: 'sale', element: <div>Sale page</div> },  // ← add
        { path: 'profile', element: <div>Profile page</div> },
        { path: 'wishlist', element: <div>Wishlist page</div> },
        { path: 'all-products', element: <AllProducts /> },
        { path: 'product/:productId', element: <SingleProduct /> },

    ],
},
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        // Every seller page lives under here. SellerLayout renders the
        // sidebar (desktop/tablet) + bottom nav (mobile) once, and each
        // child route below renders inside it via <Outlet />.
        // Adding a new seller page later = adding one line here + one
        // line in SIDEBAR_LINKS / MOBILE_NAV_LINKS inside SellerLayout.jsx.
        path : '/seller',
        element : <Protected role='seller'> <SellerLayout /> </Protected>,
        children : [
            {
                path : 'inventory',
                element : <ProductList /> 
            },
            {
                path : 'inventory/new',
                element : <CreateProduct />
            },
            {
                index:true,
                path : 'dashboard',
                element : <div>Dashboard page</div>
            },
            {
                path : 'orders',
                element : <div>Orders page</div>
            },
            {
                path : 'analytics',
                element : <div>Analytics page</div>
            },
            {
                path : 'payments',
                element : <div>Payments page</div>
            },
            {
                path : 'settings',
                element : <div>Settings page</div>
            },
            {
                path : 'inventory/:productId/addVariant',
                element : <AddVariant />
            },
        ]
    }
])

export default router