import React from 'react'
import './ProductDispaly.css'
import ProductCard from '../ProductCard/ProductCard'
import Loader from '../Loader/Loder';

const ProductDisplay = ({ loading, error, product }) => {

    if (loading) return <Loader />;

    return (
        <div className='product-section' id='product-section'>
            <div className="product-container">
                <div className="heading">
                    <h2>Featured Products</h2>
                </div>

                <div className="content">
                    {
                        product && product.length > 0
                            ? product.map((item) => (
                                item?._id && <ProductCard item={item} key={item._id} />
                              ))
                            : <p>No products found</p>
                    }
                </div>

            </div>
        </div>
    );
};

export default ProductDisplay;
