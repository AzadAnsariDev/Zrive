import { connectToDB } from '../config/database.js'
import { processRefund } from '../services/orderRejection.service.js'
import '../models/payment.model.js'   // ⬅️ ye line add karo — sirf import karne se hi model register ho jaata hai
import '../models/order.model.js'  

const orderId = process.argv[2] // command line se orderId lo

if (!orderId) {
  console.log("Usage: node src/scripts/testRefund.js <orderId>")
  process.exit(1)
}

const run = async () => {
  await connectToDB()
  try {
    const order = await processRefund(orderId)
    console.log("✅ Refund result:", order.refund)
  } catch (err) {
    console.error("❌ Refund failed:", err.message)
  }
  process.exit(0)
}

run()