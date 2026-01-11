import React, { useEffect, useRef, useState } from 'react';
import './Payment.css'
import { BsFillCreditCardFill, BsCalendarEventFill } from "react-icons/bs";
import { MdVpnKeyOff } from "react-icons/md";
import CheckOutStep from '../../Components/CheckOutStep/CheckOutStep';
import Typography from "@mui/material/Typography";
import { CardExpiryElement, CardCvcElement, CardNumberElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { clearError, createOrder } from '../../actions/orderAction';
import Small from '../../Components/smallSpiner/smallSpiner';

const Payment = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const alert = useAlert();

    const stripe = useStripe();
    const elements = useElements();

    const payBtn = useRef(null);
    const [loading, setLoading] = useState(false);

    const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo") || "{}");

    const { user } = useSelector(state => state.user);
    const { shippingInfo, cartItems } = useSelector(state => state.cart);
    const { error } = useSelector(state => state.newOrder);

    // 🛑 Guard missing order data
    if (!orderInfo || !orderInfo.Total) {
        navigate('/cart');
        return null;
    }

    const paymentData = {
        amount: Math.round(orderInfo.Total) * 100
    };

    const orderDetails = {
        shippingInfo,
        OrderItems: cartItems,
        itemsPrice: orderInfo.subTotal,
        taxPrice: orderInfo.tax,
        shippingPrice: orderInfo.shippingCharges,
        totalPrice: orderInfo.Total,
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        payBtn.current.disabled = true;

        try {
            const { data } = await axios.post(
                '/api/v1/payment/process',
                paymentData,
                { headers: { "Content-Type": "application/json" } }
            );

            if (!stripe || !elements) return;

            const result = await stripe.confirmCardPayment(
                data.client_secret,
                {
                    payment_method: {
                        card: elements.getElement(CardNumberElement),
                        billing_details: {
                            name: user.name,
                            email: user.email,
                            address: {
                                line1: shippingInfo.address,
                                city: shippingInfo.city,
                                state: shippingInfo.state,
                                postal_code: shippingInfo.pincode,
                                country: shippingInfo.country
                            }
                        }
                    }
                }
            );

            if (result.error) {
                payBtn.current.disabled = false;
                alert.error(result.error.message);
            } else if (result.paymentIntent.status === "succeeded") {
                orderDetails.paymentInfo = {
                    id: result.paymentIntent.id,
                    status: result.paymentIntent.status,
                };

                dispatch(createOrder(orderDetails));
                navigate('/success');
            } else {
                alert.error("Payment processing failed");
            }

        } catch (err) {
            payBtn.current.disabled = false;
            alert.error(err?.response?.data?.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (error) {
            alert.error(error);
            dispatch(clearError());
        }
    }, [dispatch, alert, error]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <CheckOutStep activeStep={2} />

            <div className="paymentContainer">
                <form className="paymentForm" onSubmit={submitHandler}>
                    <Typography>Card Info</Typography>

                    <div>
                        <BsFillCreditCardFill />
                        <CardNumberElement className="paymentInput" />
                    </div>

                    <div>
                        <BsCalendarEventFill />
                        <CardExpiryElement className="paymentInput" />
                    </div>

                    <div>
                        <MdVpnKeyOff />
                        <CardCvcElement className="paymentInput" />
                    </div>

                    <button
                        type="submit"
                        ref={payBtn}
                        className="paymentBtn"
                        disabled={loading}
                    >
                        {loading ? <Small /> : `Pay - ₹${Math.round(orderInfo.Total)}`}
                    </button>
                </form>
            </div>
        </>
    );
};

export default Payment;
