import React, { useState, useEffect } from 'react';
import { useCart } from '../shared/CartContext';
import { getPromotionsByProducts } from '../services/promotionService';
import { placeOrder } from '../services/cartService';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';
import CartSummary from '../components/CartSummary';
import { createMomoPayment, createVnpayPayment } from '../services/paymentService'; // Assuming these functions exist


const OrderCheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const [promotions, setPromotions] = useState([]);
    const [selectedPromotionId, setSelectedPromotionId] = useState(null);
    const [form, setForm] = useState({
        receiverName: '',
        receiverPhone: '',
        deliveryAddress: '',
        paymentMethod: 'CASH'
    });

    useEffect(() => {
    const previousTitle = document.title; 
    document.title = "Thông tin đặt hàng"; 

    return () => {
        document.title = previousTitle; 
    };
}, []);

    const navigate = useNavigate();

    useEffect(() => {
        if (cartItems.length > 0) {
            const productIds = cartItems.map(item => item.product.id);
            fetchPromotions(productIds);
        }
    }, [cartItems]);

    const fetchPromotions = async (productIds) => {
        try {
            const promoList = await getPromotionsByProducts(productIds);
            console.log('API Promotions Response:', promoList);

            const formattedPromos = (Array.isArray(promoList) ? promoList : []).map(promo => ({
                ...promo,
                products: Array.isArray(promo.products) ? promo.products : []
            }));

            setPromotions(formattedPromos);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            setPromotions([]);
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handlePromotionSelect = (promoId) => {
        setSelectedPromotionId(promoId === selectedPromotionId ? null : promoId);
    };

    const getSelectedPromotion = () => promotions.find(promo => promo.id === selectedPromotionId);

    const isProductInPromotion = (productId, promotion) => {
        return promotion.products.some(prod => prod.id === productId);
    };

    const calculateItemDiscountedPrice = (item) => {
        const selectedPromo = getSelectedPromotion();
        if (selectedPromo && isProductInPromotion(item.product.id, selectedPromo)) {
            return item.price * (1 - selectedPromo.discountPercent / 100);
        }
        return item.price;
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => {
            const discountedPrice = calculateItemDiscountedPrice(item);
            return sum + discountedPrice * item.quantity;
        }, 0);
    };

    const handleSubmit = async () => {
        const orderResponse = await placeOrder(form, cartItems);
        if (orderResponse) {
            clearCart();

            if (form.paymentMethod === 'MOMO') {
                const momoPayment = await createMomoPayment(orderResponse.id);
                window.location.href = momoPayment.payUrl;  // Redirect to Momo Gateway
            } else if (form.paymentMethod === 'VNPAY') {
                const vnpayPayment = await createVnpayPayment(orderResponse.id);
                window.location.href = vnpayPayment.paymentUrl;  // Redirect to VNPay Gateway
            } else {
                navigate('/my-orders');  // Cash on delivery, go to orders page
            }
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container py-5">
                <h3>Giỏ hàng của bạn đang trống.</h3>
            </div>
        );
    }

    return (
        <div className="container my-5 pt-5">
            <h2 className="mb-4 fw-bold">📝 Thông tin đặt hàng</h2>
            <div className="row">
                <div className="col-md-6">
                    <OrderForm
                        form={form}
                        onInputChange={handleInputChange}
                        promotions={promotions}
                        selectedPromotionId={selectedPromotionId}
                        onPromotionSelect={handlePromotionSelect}
                        onSubmit={handleSubmit}
                    />
                </div>
                <div className="col-md-6">
                    <CartSummary
                        cartItems={cartItems}
                        selectedPromotion={getSelectedPromotion()}
                        calculateItemDiscountedPrice={calculateItemDiscountedPrice}
                        calculateTotal={calculateTotal}
                        isProductInPromotion={isProductInPromotion}
                    />
                </div>
            </div>
        </div>
    );
};

export default OrderCheckoutPage;
