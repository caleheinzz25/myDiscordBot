import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

/**
 * Connect to the database
 */
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_CONNECT);
        console.log("\n✅ MongoDB connected successfully!");
        
        // Handle connection events for advanced monitoring
        mongoose.connection.on("connected", () => {
            console.log("🟢 Mongoose connection is open.");
        });
    
        mongoose.connection.on("error", (err) => {
            console.error("🔴 Mongoose connection error:", err);
        });
    
        mongoose.connection.on("disconnected", () => {
            console.warn("🟠 Mongoose connection is disconnected.");
        });
    
        // Close Mongoose connection when the Node.js process ends
        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log("🔵 Mongoose connection is closed due to application termination.");
            process.exit(0);
        });

    } catch (err) {
        console.error("\n❌ MongoDB connection failed:", err, "\n");
        process.exit(1);
    }
};


export { 
    connect
};