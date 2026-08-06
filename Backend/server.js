import config from './src/config/config.js'
import { connectToDB } from './src/config/database.js'
import app from './src/app.js'
import { startOrderTimeoutCron } from './src/jobs/orderTimeout.job.js'
import { startSellerUnbanCron } from './src/jobs/sellerUnban.job.js'
import { startRefundRetryCron } from './src/jobs/retryRefund.job.js'

const PORT = config.PORT || "5000"


const startServer = async()=>{
    await connectToDB()

    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`)
        startOrderTimeoutCron();
        startSellerUnbanCron();
        startRefundRetryCron();
    })

}

startServer()


