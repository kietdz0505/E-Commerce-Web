import { useCart } from '../shared/CartContext';

const CheckoutPage = () => {
  const { clearCart } = useCart();

  const handlePaymentSuccess = async () => {
    // Gọi API thanh toán xong (nếu có)
    await clearCart();  // Clear cart ở backend và context sau khi thanh toán xong
    alert('Thanh toán thành công và giỏ hàng đã được xóa!');
  };

  return (
    <button onClick={handlePaymentSuccess}>Thanh toán</button>
  );
};

export default CheckoutPage;
