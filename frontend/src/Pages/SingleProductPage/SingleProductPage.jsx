import React, { useEffect, useState } from 'react';
import './SingleProductPage.css';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, getSingleProducts, newReview } from '../../actions/productAction';
import { useParams } from 'react-router-dom';
import Carousel from 'react-material-ui-carousel';
import Loader from '../../Components/Loader/Loder';
import Review from '../../Components/Review/Review';
import { useAlert } from 'react-alert';
import { addItemToCart } from '../../actions/cartAction';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Rating
} from '@mui/material';
import { NEW_REVIEW_RESET } from '../../constants/productConstants';

const SingleProductPage = () => {

    const alert = useAlert();
    const dispatch = useDispatch();
    const { id } = useParams();

    const { product = {}, error, loading } = useSelector(state => state.singleProduct);
    const { success, error: reviewError } = useSelector(state => state.newReview);

    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState("");
    const [open, setOpen] = useState(false);

    // ⭐ FETCH PRODUCT ONLY WHEN ID EXISTS
    useEffect(() => {
        if (!id) return;
        dispatch(getSingleProducts(id));
    }, [dispatch, id]);

    // ⭐ HANDLE ERRORS & REVIEW SUCCESS
    useEffect(() => {
        if (error) {
            alert.error(error);
            dispatch(clearError());
        }

        if (reviewError) {
            alert.error(reviewError);
            dispatch(clearError());
        }

        if (success) {
            alert.success("Review Submitted Successfully");
            dispatch({ type: NEW_REVIEW_RESET });
        }
    }, [dispatch, alert, error, reviewError, success]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const increaseQuantity = () => {
        if (product.Stock <= quantity) return;
        setQuantity(q => q + 1);
    };

    const decreaseQuantity = () => {
        if (quantity <= 1) return;
        setQuantity(q => q - 1);
    };

    const addCartHandler = () => {
        if (product.Stock > 0) {
            dispatch(addItemToCart(id, quantity));
            alert.success("Item Added To Cart");
        } else {
            alert.error("Product is Out Of Stock");
        }
    };

    const submitReviewToggle = () => {
        setOpen(prev => !prev);
    };

    const reviewSubmitHandler = () => {
        const formData = new FormData();
        formData.set("comment", comments);
        formData.set("rating", rating);
        formData.set("productId", id);

        dispatch(newReview(formData));
        setOpen(false);
    };

    if (loading) return <Loader />;

    return (
        <div className="single-product-page">
            <div className="single-product-container">

                <div className="left-side">
                    <Carousel>
                        {product?.images?.map((img) => (
                            <img
                                key={img.url}
                                src={img.url}
                                className="carousel-img"
                                alt="product"
                            />
                        ))}
                    </Carousel>
                </div>

                <div className="rght-side">
                    <p>{product.name}</p>
                    <p>Product # {product._id}</p>

                    <div className="review-container">
                        <Rating
                            value={product.ratings || 0}
                            readOnly
                            precision={0.5}
                        />
                        <span>({product.numOfReviews || 0} Reviews)</span>
                    </div>

                    <div className="counter">
                        <button className="cnt" onClick={decreaseQuantity}>-</button>
                        <p>{quantity}</p>
                        <button className="cnt" onClick={increaseQuantity}>+</button>

                        <button className="add-to-cart btn" onClick={addCartHandler}>
                            Add To Cart
                        </button>
                    </div>

                    <p>
                        Status:
                        <span className={product.Stock > 0 ? "greenColor" : "redColor"}>
                            {product.Stock > 0 ? " In Stock" : " Out Of Stock"}
                        </span>
                    </p>

                    <p className="discription">
                        <b>Description:</b> {product.description}
                    </p>

                    <button className="submit-review btn" onClick={submitReviewToggle}>
                        Submit Review
                    </button>

                    <Dialog open={open} onClose={submitReviewToggle}>
                        <DialogTitle>Submit Review</DialogTitle>
                        <DialogContent>
                            <Rating
                                size="large"
                                value={rating}
                                onChange={(e, value) => setRating(value)}
                            />
                            <textarea
                                className="submitDialogTextArea"
                                rows="5"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={submitReviewToggle}>Cancel</Button>
                            <Button onClick={reviewSubmitHandler}>Submit</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>

            <div className="id-title ok">
                <p>Reviews</p>
            </div>

            <Review product={product} />
        </div>
    );
};

export default SingleProductPage;
