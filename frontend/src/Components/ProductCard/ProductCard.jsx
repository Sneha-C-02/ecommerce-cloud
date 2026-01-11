import React from 'react'
import './ProductCard.css'
import { Link } from 'react-router-dom'
import { Rating } from '@mui/material'

const ProductCard = ({ item }) => {

    // 🛑 Guard: don’t render invalid products
    if (!item || !item._id) return null;

    const options = {
        size: "large",
        value: item.ratings || 0,
        readOnly: true,
        precision: 0.5,
    };

    const imageUrl =
        item.images && item.images.length > 0
            ? item.images[0].url
            : "https://via.placeholder.com/150";

    return (
        <Link to={`/product/${item._id}`} className='card-container'>
            <div className="img">
                <img src={imageUrl} alt={item.name} />
            </div>

            <p>{item.name}</p>

            <div className="rating-container">
                <div className="rating">
                    <Rating {...options} />
                </div>
                <div className="rating-count">
                    ({item.numOfReviews || 0} Reviews)
                </div>
            </div>

            <p className="price">&#8377;{item.price}</p>
        </Link>
    );
};

export default ProductCard;
