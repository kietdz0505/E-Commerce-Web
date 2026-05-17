import React, { useEffect, useState } from "react";
import { getMyPromotions } from "../../services/user/promotionService";
import { useNavigate } from "react-router-dom";

import {
  HiOutlineGift,
  HiOutlineCalendarDays,
  HiOutlineTicket,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from "react-icons/hi2";

import "../../styles/userPromotionPage.css";

const UserPromotionPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPromotions(page, size);
  }, [page, size]);

  const fetchPromotions = async (page, size) => {
    try {
      const data = await getMyPromotions(page, size);
      setPromotions(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "active";
      case "EXPIRED":
        return "expired";
      default:
        return "inactive";
    }
  };

  return (
    <div className="az-promo-container">

      {/* HEADER */}
      <div className="az-promo-header">
        <h2><HiOutlineGift /> Khuyến mãi của bạn</h2>
      </div>

      {/* LIST */}
      {promotions.length === 0 ? (
        <div className="az-empty">Bạn chưa có khuyến mãi nào</div>
      ) : (
        <div className="az-promo-grid">
          {promotions.map((promo) => (
            <div key={promo.promotionId} className="az-promo-card">

              <div className="az-promo-top">
                <span className={`status ${getStatusClass(promo.status)}`}>
                  {promo.status}
                </span>
              </div>

              <div className="az-promo-body">

                <h4>
                  <HiOutlineTicket /> {promo.code}
                </h4>

                <p className="desc">{promo.description}</p>

                <div className="discount">
                  -{promo.discountPercent}%
                </div>

                <div className="date">
                  <HiOutlineCalendarDays />
                  {promo.validFrom} → {promo.validTo}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="az-pagination">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 0}
        >
          <HiOutlineChevronLeft /> Trang trước
        </button>

        <span>Trang {page + 1} / {totalPages}</span>

        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page + 1 >= totalPages}
        >
          Trang sau <HiOutlineChevronRight />
        </button>
      </div>

      {/* BACK */}
      <button className="az-back-btn" onClick={() => navigate("/")}>
        ← Quay lại
      </button>

    </div>
  );
};

export default UserPromotionPage;