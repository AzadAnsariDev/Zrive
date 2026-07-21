import { createBrowserRouter } from 'react-router'
import Register from '../features/auth/pages/Register'
import Login from '../features/auth/pages/Login'
import SellerLayout from '../features/layout/SellerLayout'
import ProductList from '../features/product/pages/ProductList'
import CreateProduct from '../features/product/pages/CreateProduct'
import Protected from '../features/auth/components/Protected'


const router = createBrowserRouter([
    {
        path : '/',
        element : <h1>Hello to Zrive</h1>
    },
    {
        path : '/register',
        element : <Register />
    },
    {
        path : '/login',
        element : <Login />
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
        ]
    }
])

export default router