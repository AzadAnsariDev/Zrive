import config from './src/config/config.js'
import { connectToDB } from './src/config/database.js'
import app from './src/app.js'

const PORT = config.PORT || "5000"


const startServer = async()=>{
    await connectToDB()

    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`)
    })

}

startServer()


