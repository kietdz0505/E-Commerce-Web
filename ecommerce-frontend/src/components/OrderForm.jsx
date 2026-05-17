import React from 'react';

const OrderForm = ({
    form,
    onInputChange,
    provinces,
    districts,
    wards,
    onProvinceChange,
    onDistrictChange,
    onWardChange,
    promotions,
    selectedPromotionId,
    onPromotionSelect,
    onSubmit
}) => {

    const isFormValid =
        form.receiverName &&
        form.receiverPhone &&
        form.province &&
        form.district &&
        form.ward;

    return (
        <div>
            <div className="mb-3">
                <label>Họ và tên</label>
                <input className="form-control" name="receiverName"
                    value={form.receiverName} onChange={onInputChange} />
            </div>

            <div className="mb-3">
                <label>Số điện thoại</label>
                <input className="form-control" name="receiverPhone"
                    value={form.receiverPhone} onChange={onInputChange} />
            </div>

            {/* PROVINCE */}
            <div className="mb-3">
                <label>Tỉnh / Thành phố</label>
                <select className="form-select" onChange={onProvinceChange}>
                    <option>Chọn tỉnh</option>
                    {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* DISTRICT */}
            <div className="mb-3">
                <label>Quận / Huyện</label>
                <select className="form-select" onChange={onDistrictChange}>
                    <option>Chọn huyện</option>
                    {districts.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                </select>
            </div>

            {/* WARD */}
            <div className="mb-3">
                <label>Phường / Xã</label>
                <select className="form-select" onChange={onWardChange}>
                    <option>Chọn xã</option>
                    {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                </select>
            </div>

            {/* DETAIL */}
            <div className="mb-3">
                <label>Địa chỉ chi tiết</label>
                <input className="form-control"
                    name="detailAddress"
                    placeholder="Ví dụ: Số nhà, tên đường, tổ dân phố..." 
                    value={form.detailAddress}
                    onChange={onInputChange} />
            </div>

            {/* FULL ADDRESS SHOW */}
            <div className="mb-3">
                <label>Địa chỉ đầy đủ</label>
                <textarea
                    className="form-control"
                    value={form.deliveryAddress}
                    readOnly
                />
            </div>

            {/* PAYMENT */}
            <div className="mb-3">
                <label>Thanh toán</label>
                <select className="form-select"
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={onInputChange}>
                    <option value="CASH">COD</option>
                    <option value="MOMO">Momo</option>
                    <option value="VNPAY">VNPay</option>
                </select>
            </div>

            {/* PROMO */}
            <div className="mb-3">
                <label>Khuyến mãi</label>
                <div className="d-flex flex-wrap gap-2">
                    {promotions.map(p => (
                        <button
                            key={p.id}
                            type="button"
                            className={`btn btn-sm ${selectedPromotionId === p.id ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => onPromotionSelect(p.id)}
                        >
                            {p.code} - {p.discountPercent}%
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="btn btn-primary w-100"
                disabled={!isFormValid}
                onClick={onSubmit}
            >
                Xác nhận đặt hàng
            </button>
        </div>
    );
};

export default OrderForm;