const mongoose = require('mongoose');

require('dotenv').config();

// Create a database connection
async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_URL
        );
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        
    }
}
module.exports = connectDB;