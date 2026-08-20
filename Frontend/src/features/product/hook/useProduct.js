import { setError } from "../../auth/state/authSlice"
import {
    addNewVariant,
    updateVariant,
    createProduct,
    getProductDetail,
    getProducts,
    getSellerProducts,
    searchProducts
} from "../services/product.api"
import { useDispatch } from 'react-redux'
import {
    setCreateLoading,
    setFetchLoading,
    setProducts,
    setSellerProducts,
    setSearchResults,
    setSearchLoading,
    clearSearchResults
} from "../state/productSlice"

export const useProduct = () => {

    const dispacth = useDispatch()

    const handleCreateProduct = async (formData) => {
        dispacth(setCreateLoading(true))
        try {
            const result = await createProduct(formData)
            return result
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
            throw err
        } finally {
            dispacth(setCreateLoading(false))
        }
    }

    const handleGetSellerProducts = async () => {
        dispacth(setFetchLoading(true))
        try {
            const result = await getSellerProducts()
            dispacth(setSellerProducts(result.products))
            return result.products
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
            throw err
        } finally {
            dispacth(setFetchLoading(false))
        }
    }

    const handleGetProducts = async (search) => {
        dispacth(setFetchLoading(true))
        try {
            const result = await getProducts(search)
            dispacth(setProducts(result.products))
            return result.products
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
            throw err
        } finally {
            dispacth(setFetchLoading(false))
        }
    }

    const handleGetProductDetail = async (productId) => {
        dispacth(setFetchLoading(true))
        try {
            const result = await getProductDetail(productId)
            return result.product
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
            throw err
        } finally {
            dispacth(setFetchLoading(false))
        }
    }

    const handleAddVariant = async (productId, formData) => {
        dispacth(setCreateLoading(true))
        try {
            const result = await addNewVariant(productId, formData)
            return result.product
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
            throw err
        } finally {
            dispacth(setCreateLoading(false))
        }
    }

    const handleUpdateVariant = async (productId, variantId, formData) => {
        dispacth(setCreateLoading(true))
        try {
            const result = await updateVariant(productId, variantId, formData)
            return result.product
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
            throw err
        } finally {
            dispacth(setCreateLoading(false))
        }
    }

    const handleSearchProducts = async (query) => {
        dispacth(setSearchLoading(true))
        try {
            const result = await searchProducts(query)
            dispacth(setSearchResults(result.products))
            return result.products
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
            throw err
        } finally {
            dispacth(setSearchLoading(false))
        }
    }

    const handleClearSearchResults = () => {
        dispacth(clearSearchResults())
    }

    return {
        handleCreateProduct,
        handleGetSellerProducts,
        handleGetProducts,
        handleGetProductDetail,
        handleAddVariant,
        handleUpdateVariant,
        handleSearchProducts,
        handleClearSearchResults
    }
}