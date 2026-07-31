import { Router } from "express";
import { validateCreateAddress, validateUpdateAddress } from "../validators/address.validator.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { createAddress, deleteAddress, getAddressById, getAllAddresses, updateAddress } from "../controllers/address.controller.js";

const addressRouter = Router()


addressRouter.post("/createAddress",authenticateUser , validateCreateAddress, createAddress)

addressRouter.patch("/updateAddress/:addressId",authenticateUser , validateUpdateAddress, updateAddress)

addressRouter.get("/getAllAddresses",authenticateUser , getAllAddresses)

addressRouter.get("/getAddress/:addressId" , authenticateUser, getAddressById)

addressRouter.delete("/deleteAddress/:addressId", authenticateUser, deleteAddress)


export default addressRouter