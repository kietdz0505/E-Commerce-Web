import React, { useEffect, useState } from "react";
import { getMyPromotions } from "../services/promotionService"// API đã viết ở trên
import { useNavigate } from "react-router-dom";

const UserPromotionPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5); // có thể lấy từ backend config, hoặc cho người dùng chọn
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
      console.error("Error fetching promotions:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>🎁 Khuyến mãi của bạn</h2>

      {promotions.length === 0 ? (
        <p>Bạn chưa có khuyến mãi nào.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Mô tả</th>
              <th>Giảm (%)</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => (
              <tr key={promo.promotionId}>
                <td>{promo.code}</td>
                <td>{promo.description}</td>
                <td>{promo.discountPercent}</td>
                <td>
                  {promo.validFrom} → {promo.validTo}
                </td>
                <td>{promo.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-primary"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          ⬅ Trang trước
        </button>
        <span>
          Trang {page + 1} / {totalPages}
        </span>
        <button
          className="btn btn-outline-primary"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Trang sau ➡
        </button>
      </div>

      <button
        className="btn btn-secondary mt-3"
        onClick={() => navigate("/")}
      >
        ⬅ Quay lại
      </button>
    </div>
  );
};

export default UserPromotionPage;
