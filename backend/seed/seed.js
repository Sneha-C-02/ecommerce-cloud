const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../connectDB/connect');
const Product = require('../modals/ProductSchema');
const User = require('../modals/UserSchema');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const products = [
    {
        name: "Laptop Pro",
        description: "High performance laptop for professionals.",
        price: 1200,
        category: "Electronics",
        Stock: 50,
        images: [{ public_id: "test_id_1", url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }]
    },
    {
        name: "Smartphone X",
        description: "Latest smartphone with amazing camera.",
        price: 800,
        category: "Electronics",
        Stock: 100,
        images: [{ public_id: "test_id_2", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }]
    },
    {
        name: "Wireless Headphones",
        description: "Noise cancelling headphones.",
        price: 200,
        category: "Electronics",
        Stock: 30,
        images: [{ public_id: "test_id_3", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }]
    },
    {
        name: "Running Shoes",
        description: "Comfortable running shoes.",
        price: 80,
        category: "Footwear",
        Stock: 20,
        images: [{ public_id: "test_id_4", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }]
    },
    {
        name: "Casual T-Shirt",
        description: "100% Cotton T-Shirt.",
        price: 25,
        category: "Clothing",
        Stock: 200,
        images: [{ public_id: "test_id_5", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }]
    },
    {
        name: "Smart Watch",
        description: "Track your fitness.",
        price: 150,
        category: "Electronics",
        Stock: 40,
        images: [{ public_id: "test_id_6", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }]
    },
    {
        name: "Backpack",
        description: "Durable backpack for travel.",
        price: 60,
        category: "Accessories",
        Stock: 60,
        images: [{ public_id: "test_id_7", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }]
    },
    {
        name: "Gaming Mouse",
        description: "Precision gaming mouse.",
        price: 50,
        category: "Electronics",
        Stock: 80,
        images: [{ public_id: "test_id_8", url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }]
    }
];

const seedData = async () => {
    try {
        await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce");

        console.log("Clearing existing data...");
        await Product.deleteMany();
        await User.deleteMany();

        console.log("Creating Admin User...");
        const adminUser = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "Admin123", // Will be hashed by pre-save hook
            role: "admin",
            avatar: {
                public_id: "default_avatar",
                url: "https://icon-library.com/images/default-user-icon/default-user-icon-4.jpg"
            }
        });
        console.log("Admin User created: admin@example.com / Admin123");

        console.log("Creating Products...");
        const productsWithUser = products.map(product => ({
            ...product,
            user: adminUser._id
        }));

        await Product.insertMany(productsWithUser);
        console.log(`${products.length} products added.`);

        console.log("Seeding complete!");
        process.exit();
    } catch (error) {
        console.error("Error with seeding:", error);
        process.exit(1);
    }
};

seedData();
