import React, { useState, useEffect } from 'react';
import { useCart } from '../../shared/CartContext';
import { placeOrder } from '../../services/user/cartService';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../../components/OrderForm';
import CartSummary from '../../components/CartSummary';

import {
  createMomoPayment,
  createVnpayPayment
} from '../../services/user/paymentService';

import {
  getProvinces,
  getDistricts,
  getWards
} from '../../services/user/locationService';

import { getPromotionsByProducts } from '../../services/user/promotionService';

import {
  HiOutlineShoppingCart
} from "react-icons/hi2";

import '../../styles/orderCheckoutPage.css';

const OrderCheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [promotions, setPromotions] = useState([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [form, setForm] = useState({
    receiverName: '',
    receiverPhone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    paymentMethod: 'CASH'
  });

  // TITLE
  useEffect(() => {
    const prev = document.title;
    document.title = "Thông tin đặt hàng";
    return () => (document.title = prev);
  }, []);

  // LOAD PROVINCES
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProvinces();
        setProvinces(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // LOAD PROMOTIONS (FIX BUG)
  useEffect(() => {
    const loadPromo = async () => {
      if (!cartItems.length) return;
      try {
        const productIds = cartItems.map(i => i.product.id);
        const res = await getPromotionsByProducts(productIds);
        setPromotions(Array.isArray(res) ? res : []);
      } catch {
        setPromotions([]);
      }
    };

    loadPromo();
  }, [cartItems]);

  // LOCATION
  const handleProvinceChange = async (e) => {
    const code = e.target.value;
    const selected = provinces.find(p => p.code == code);

    setForm(prev => ({
      ...prev,
      province: selected?.name || '',
      district: '',
      ward: ''
    }));

    const res = await getDistricts(code);
    setDistricts(res.data?.districts || []);
    setWards([]);
  };

  const handleDistrictChange = async (e) => {
    const code = e.target.value;
    const selected = districts.find(d => d.code == code);

    setForm(prev => ({
      ...prev,
      district: selected?.name || '',
      ward: ''
    }));

    const res = await getWards(code);
    setWards(res.data?.wards || []);
  };

  const handleWardChange = (e) => {
    const code = e.target.value;
    const selected = wards.find(w => w.code == code);

    setForm(prev => ({
      ...prev,
      ward: selected?.name || ''
    }));
  };

  const handleInputChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fullAddress =
    `${form.detailAddress}, ${form.ward}, ${form.district}, ${form.province}`;

  // PROMOTION
  const handlePromotionSelect = (id) => {
    setSelectedPromotionId(id === selectedPromotionId ? null : id);
  };

  const getSelectedPromotion = () =>
    promotions.find(p => p.id === selectedPromotionId);

  const isProductInPromotion = (productId, promo) =>
    promo?.products?.some(p => p.id === productId);

  const calculateItemDiscountedPrice = (item) => {
    const promo = getSelectedPromotion();
    if (promo && isProductInPromotion(item.product.id, promo)) {
      return item.price * (1 - promo.discountPercent / 100);
    }
    return item.price;
  };

  const calculateTotal = () =>
    cartItems.reduce(
      (sum, item) => sum + calculateItemDiscountedPrice(item) * item.quantity,
      0
    );

  // SUBMIT
  const handleSubmit = async () => {
    const selectedPromotion = getSelectedPromotion();
    const order = await placeOrder(
      {
        ...form,
        deliveryAddress: fullAddress,
        promotionCode: selectedPromotion?.code || null
      },
      cartItems
    );

    if (!order) return;

    // CASH
    if (form.paymentMethod === 'CASH') {
      await clearCart();
      navigate('/my-orders');
      return;
    }

    // MOMO
    if (form.paymentMethod === 'MOMO') {
      const res = await createMomoPayment(order.id);
      window.location.href = res.data;
      return;
    }

    // VNPAY
    if (form.paymentMethod === 'VNPAY') {
      const res = await createVnpayPayment(order.id);
      window.location.href = res.data;
    }
  };

  if (!cartItems.length) {
    return <div className="container py-5">Giỏ hàng trống</div>;
  }

  return (
    <div className="az-checkout-container">

      <div className="az-checkout-header">
        <HiOutlineShoppingCart />
        <h2>Xác nhận đơn hàng</h2>
      </div>

      <div className="row g-4">

        <div className="col-lg-7">
          <div className="az-checkout-card">
            <OrderForm
              form={{ ...form, deliveryAddress: fullAddress }}
              onInputChange={handleInputChange}
              provinces={provinces}
              districts={districts}
              wards={wards}
              onProvinceChange={handleProvinceChange}
              onDistrictChange={handleDistrictChange}
              onWardChange={handleWardChange}
              promotions={promotions}
              selectedPromotionId={selectedPromotionId}
              onPromotionSelect={handlePromotionSelect}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        <div className="col-lg-5">
          <div className="az-checkout-summary">
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
    </div>
  );
};

export default OrderCheckoutPage;