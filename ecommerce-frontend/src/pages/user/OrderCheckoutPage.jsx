import React, { useState, useEffect } from 'react';
import { useCart } from '../../shared/CartContext';
import { placeOrder } from '../../services/user/cartService';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../../components/OrderForm';
import CartSummary from '../../components/CartSummary';
import { toast } from 'react-hot-toast';

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
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    const prev = document.title;
    document.title = "Thông tin đặt hàng";
    return () => (document.title = prev);
  }, []);

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

  const handleSubmit = async () => {

    if (submitting) return;

    try {
      setSubmitting(true);

      const selectedPromotion = getSelectedPromotion();

      const order = await placeOrder(
        {
          ...form,
          deliveryAddress: fullAddress,
          promotionCode: selectedPromotion?.code || null
        },
        cartItems
      );

      if (!order) {
        setSubmitting(false);
        return;
      }

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
        return;
      }

    } catch (err) {
      console.error("Chi tiết lỗi đặt hàng tại giao diện:", err);

      const backendMessage = err.response?.data?.message || '';
      
      if (backendMessage.includes("hết hàng") || backendMessage.includes("hết số lượng")) {
        
        toast.error(
          (t) => (
            <div style={{ lineHeight: '1.6', padding: '2px' }}>
              <b style={{ color: '#ec1c24', fontSize: '15px' }}>Kho không đủ số lượng!</b>
              <div style={{ fontSize: '13px', marginTop: '4px', color: '#333' }}>
                {backendMessage}. Vui lòng kiểm tra và chỉnh sửa lại giỏ hàng.
              </div>
              <button 
                onClick={() => {
                  toast.dismiss(t.id); 
                  navigate('/cart'); 
                }}
                style={{
                  marginTop: '10px',
                  padding: '5px 12px',
                  backgroundColor: '#0d6efd',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Quay về giỏ hàng chỉnh sửa
              </button>
            </div>
          ),
          { 
            duration: 7000, 
            id: 'stock-error-toast',
            style: {
              maxWidth: '350px',
              borderLeft: '5px solid #ec1c24' 
            }
          }
        );

      } else {
        toast.error(backendMessage || 'Đặt hàng thất bại. Vui lòng thử lại!');
      }

    } finally {
      setSubmitting(false);
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
              submitting={submitting}
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