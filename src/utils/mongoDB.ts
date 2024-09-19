import mongoose from "mongoose";

export async function connectToMongoDB() {
    const MONGO_URI = process.env.MONGO_URI
    if (!MONGO_URI) return console.log((`Mongo URI not found, skipping.`))
    mongoose.connect(`${MONGO_URI}/${process.env.MONGO_DATABASE_NAME}`)
        .then(() => console.log((`MongoDB connection has been established.`)))
        .catch(() => console.log((`MongoDB connection has been failed.`)))
}

export async function isConnected() {
    if (mongoose.connection.readyState === mongoose.STATES.connected) return true
    return false
}