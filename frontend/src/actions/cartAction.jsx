import axios from 'axios';
import { ADD_TO_CART, REMOVE_ITEM_FROM_CART, SAVE_SHIPPING_INFO } from '../constants/cartConstants';

// ADD TO CART
const addItemToCart = (id, quantity) => async (dispatch, getState) => {
    // ✅ Guard against undefined or null id
    if (!id) {
        console.warn('addItemToCart called with undefined/null id - skipping');
        return;
    }
    const response = await axios.get(`/api/v1/product/${id}`);
    const { cartItems } = getState().cart;
    const isItemExist = cartItems.find(i => i.productId === response.data.data._id);

    let newQuantity = quantity;
    if (isItemExist && !window.location.pathname.includes("/cart")) {
        // If we are on product page and add same item, increment
        newQuantity = isItemExist.quantity + quantity;
    }

    dispatch({
        type: ADD_TO_CART,
        payload: {
            productId: response.data.data._id,
            name: response.data.data.name,
            price: response.data.data.price,
            image: response.data.data.images[0].url,
            Stock: response.data.data.Stock,
            quantity: newQuantity,
        }
    });

    localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));


    // Sync cart to backend if user is logged in
    const { user } = getState().user;
    if (user && user.isAuthenticate) {
        try {
            const { cartItems } = getState().cart;
            await axios.put('/api/v1/user/cart', { cartItems });
        } catch (error) {
            console.error("Error syncing cart to backend:", error);
        }
    }
}

// REMOVE FROM CART
const removeFromCart = (id) => async (dispatch, getState) => {
    dispatch({
        type: REMOVE_ITEM_FROM_CART,
        payload: id,
    });
    localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));

    // Sync cart to backend if user is logged in
    const { user } = getState().user;
    if (user && user.isAuthenticate) {
        try {
            const { cartItems } = getState().cart;
            await axios.put('/api/v1/user/cart', { cartItems });
        } catch (error) {
            console.error("Error syncing cart to backend:", error);
        }
    }
}


// SAVE SHIPPING INFO
const saveShippingInfo = (data) => async (dispatch) => {
    dispatch({
        type: SAVE_SHIPPING_INFO,
        payload: data
    });

    localStorage.setItem("shippingInfo", JSON.stringify(data));
}

export { addItemToCart, removeFromCart, saveShippingInfo };