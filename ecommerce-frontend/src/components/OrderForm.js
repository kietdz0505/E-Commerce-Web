import React from 'react';

const OrderForm = ({
    form,
    onInputChange,
    promotions,
    selectedPromotionId,
    onPromotionSelect,
    onSubmit
}) => {

    const handlePromotionClick = (promoId) => {
        onPromotionSelect(promoId);
        const selectedPromo = promotions.find(p => p.id === promoId);
        onInputChange({
            target: {
                name: 'promotionCode',
                value: selectedPromo ? selectedPromo.code : ''
            }
        });
    };

    const isFormValid = form.receiverName && form.receiverPhone && form.deliveryAddress;

    return (
        <form>
            <div className="mb-3">
                <label className="form-label">Họ và tên</label>
                <input
                    type="text"
                    className="form-control"
                    name="receiverName"
                    value={form.receiverName}
                    onChange={onInputChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                    type="text"
                    className="form-control"
                    name="receiverPhone"
                    value={form.receiverPhone}
                    onChange={onInputChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Địa chỉ giao hàng</label>
                <textarea
                    className="form-control"
                    name="deliveryAddress"
                    value={form.deliveryAddress}
                    onChange={onInputChange}
                ></textarea>
            </div>
            <div className="mb-3">
                <label className="form-label">Phương thức thanh toán</label>
                <select
                    className="form-select"
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={onInputChange}
                >
                    <option value="CASH">Thanh toán khi nhận hàng (COD)</option>
                    <option value="MOMO">Ví Momo</option>
                    <option value="VNPAY">VNPay</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Chọn mã khuyến mãi (1 mã duy nhất)</label>
                <div className="d-flex flex-wrap gap-2">
                    {promotions.map(promo => (
                        <button
                            key={promo.id}
                            type="button"
                            className={`btn btn-sm ${selectedPromotionId === promo.id ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => handlePromotionClick(promo.id)}
                        >
                            {promo.code} - {promo.discountPercent}%<br />
                            <small>{promo.description}</small>
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={onSubmit}
                disabled={!isFormValid}
            >
                Xác nhận đặt hàng
            </button>
        </form>
    );
};

export default OrderForm;
