import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyOrder } from '../../actions/orderAction';
import { Link } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = () => {

    const dispatch = useDispatch();
    const { orders = [], loading } = useSelector(state => state.myOrder);
    const { isAuthenticate } = useSelector(state => state.user);

    // ✅ Fetch orders ONCE after auth
    useEffect(() => {
        if (isAuthenticate) {
            dispatch(getMyOrder());
        }
    }, [dispatch, isAuthenticate]);

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    return (
        <div className="my-orders-container">
            <h1 className="orders-heading">My Orders</h1>

            {orders.length > 0 ? (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-card">

                            <div className="order-header">
                                <h3>Order ID: {order._id}</h3>
                                <span className={`order-status ${order?.orderStatus?.toLowerCase() || ""}`}>
                                    {order?.orderStatus}
                                </span>
                            </div>

                            <div className="order-info">
                                <p><strong>Total:</strong> ₹{order?.totalPrice}</p>
                                <p><strong>Payment:</strong> {order?.paymentInfo?.status || "N/A"}</p>
                                <p><strong>Date:</strong> {
                                    order?.createdAt
                                        ? new Date(order.createdAt).toLocaleDateString()
                                        : "-"
                                }</p>
                            </div>

                            <div className="order-items">
                                <h4>Items:</h4>
                                {order?.OrderItems?.length > 0 ? (
                                    order.OrderItems.map((item, i) => (
                                        <div key={i} className="order-item">
                                            <img
                                                src={item?.image || "https://via.placeholder.com/50"}
                                                alt={item?.name}
                                            />
                                            <div className="item-details">
                                                <span className="item-name">{item?.name}</span>
                                                <span className="item-quantity">Qty: {item?.quantity}</span>
                                                <span className="item-price">₹{item?.price}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No items</p>
                                )}
                            </div>

                            <Link to={`/order/${order._id}`} className="view-details-btn">
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-orders">
                    <p>No orders found</p>
                    <Link to="/products" className="shop-now-btn">
                        Shop Now
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
