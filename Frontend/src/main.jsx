import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/app.store.js'
import {RouterProvider} from 'react-router'
import router from './router/routes.jsx'
import './app/App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}  />
    </Provider>
  </StrictMode>,
)
