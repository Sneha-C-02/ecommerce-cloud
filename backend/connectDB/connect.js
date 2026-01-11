const mongoose = require('mongoose');

const connectDB = async (URI) => {
    try {
        await mongoose.connect(URI);
        console.log("Database connected succesfully!");
    } catch (error) {
        console.log("Error in connectDB function: ", error.message);
        console.log("Retrying in 5 seconds...");
        setTimeout(() => connectDB(URI), 5000);
    }
}

module.exports = connectDB;