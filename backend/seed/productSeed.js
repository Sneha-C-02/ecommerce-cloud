const mongoose = require("mongoose");
const Product = require("../modals/ProductSchema");
const User = require("../modals/UserSchema");
const dotenv = require("dotenv");
const path = require("path");

// Load from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDatabase = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI not found in environment variables");
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
        });
        console.log(`Mongodb connected with server: ${mongoose.connection.host}`);
    } catch (err) {
        console.error("Connection Error:", err);
        process.exit(1);
    }
};

const products = [
    {
        name: "Premium Wireless Headphones",
        description: "Experience crystal clear sound with our premium noise-cancelling headphones. 30-hour battery life and ultra-comfortable ear cushions.",
        price: 14999,
        ratings: 4.5,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Electronics",
        Stock: 50,
        numOfReviews: 12,
        user: "64e8e1e8c0c1c60000000000", // Placeholder ID, will be updated if needed or ignored
        reviews: []
    },
    {
        name: "Smart Watch Series 7",
        description: "Stay connected and healthy with the latest Smart Watch. Features heart rate monitoring, GPS, and water resistance up to 50m.",
        price: 24999,
        ratings: 4.8,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Electronics",
        Stock: 30,
        numOfReviews: 8,
        reviews: []
    },
    {
        name: "Professional DSLR Camera",
        description: "Capture life's moments in stunning detail. 24.2 MP sensor, 4K video recording, and included 18-55mm lens.",
        price: 45000,
        ratings: 4.9,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Electronics",
        Stock: 15,
        numOfReviews: 5,
        reviews: []
    },
    {
        name: "MacBook Pro 16-inch",
        description: "The ultimate pro laptop. M2 Pro chip, 16GB RAM, 512GB SSD. Incredible performance for creative professionals.",
        price: 199999,
        ratings: 5.0,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Laptops",
        Stock: 10,
        numOfReviews: 2,
        reviews: []
    },
    {
        name: "Gaming Laptop RTX 4060",
        description: "Dominate the game with high-performance graphics and a 144Hz display. RGB keyboard and advanced cooling system.",
        price: 89999,
        ratings: 4.6,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Laptops",
        Stock: 25,
        numOfReviews: 15,
        reviews: []
    },
    {
        name: "Men's Graphic T-Shirt",
        description: "100% Cotton, comfortable fit with a unique urban graphic design. Perfect for casual wear.",
        price: 999,
        ratings: 4.2,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Clothing",
        Stock: 100,
        numOfReviews: 20,
        reviews: []
    },
    {
        name: "Blue Denim Jeans",
        description: "Classic straight-fit denim jeans. Durable fabric with a comfortable stretch. Timeless style.",
        price: 2499,
        ratings: 4.4,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Clothing",
        Stock: 80,
        numOfReviews: 35,
        reviews: []
    },
    {
        name: "Running Shoes",
        description: "Lightweight and breathable running shoes with superior cushioning for long-distance runs.",
        price: 3999,
        ratings: 4.7,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Footwear",
        Stock: 40,
        numOfReviews: 42,
        reviews: []
    },
    {
        name: "Chronograph Watch",
        description: "Elegant chronograph watch with a stainless steel strap. Water-resistant and scratch-proof glass.",
        price: 8500,
        ratings: 4.9,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Accessories",
        Stock: 20,
        numOfReviews: 9,
        reviews: []
    },
    {
        name: "Office Chair",
        description: "Ergonomic office chair with lumbar support and adjustable height. Perfect for long working hours.",
        price: 7999,
        ratings: 4.5,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Furniture",
        Stock: 15,
        numOfReviews: 6,
        reviews: []
    },
    {
        name: "Yoga Mat",
        description: "Non-slip yoga mat with extra cushioning. Eco-friendly material, perfect for yoga and pilates.",
        price: 999,
        ratings: 4.6,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Sports",
        Stock: 100,
        numOfReviews: 25,
        reviews: []
    },
    {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with powerful bass and 12-hour battery life. Waterproof design.",
        price: 2999,
        ratings: 4.4,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Electronics",
        Stock: 45,
        numOfReviews: 30,
        reviews: []
    },
    {
        name: "Sunglasses",
        description: "Stylish aviator sunglasses with UV400 protection. Classic design suitable for all face shapes.",
        price: 1299,
        ratings: 4.7,
        images: [{ public_id: "sample_id", url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" }],
        category: "Accessories",
        Stock: 70,
        numOfReviews: 11,
        reviews: []
    }
];

const seedProducts = async () => {
    try {
        await connectDatabase();

        // 🔍 Fetch a valid user to assign products to
        const user = await User.findOne();
        if (!user) {
            console.error("Please register at least one user before seeding products!");
            process.exit(1);
        }

        await Product.deleteMany({});
        console.log("Existing Products deleted");

        const productsWithUser = products.map(p => ({
            ...p,
            user: user._id
        }));

        await Product.insertMany(productsWithUser);
        console.log("13 Products added successfully");

        process.exit();
    } catch (error) {
        console.error("Seeding Error Details:", error);
        process.exit(1);
    }
};

seedProducts();
