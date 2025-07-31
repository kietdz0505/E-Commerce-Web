import { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/apiConfig';
import ProductCard from '../shared/ProductCard';
import SearchBar from '../components/SearchBar';

const SearchPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (filters) => {
    console.log('Filters received in SearchPage:', filters); // Debug filters khi nhận
    try {
      setLoading(true);
      setError(null);
      const apiUrl = getApiUrl('SEARCH', filters);
      console.log('API URL:', apiUrl); // Debug URL
      const res = await axios.get(apiUrl, {
        // Thêm header nếu cần token
        // headers: { Authorization: `Bearer YOUR_TOKEN_HERE` },
      });
      console.log('API Response:', res.data); // Debug response
      if (!res.data || typeof res.data !== 'object') {
        throw new Error('Phản hồi từ server không hợp lệ.');
      }
      const data = res.data.content || [];
      if (!Array.isArray(data)) {
        throw new Error('Dữ liệu trả về không phải là mảng.');
      }
      setProducts(data);
    } catch (err) {
      console.error('Search failed:', err);
      setError(`Không thể tải sản phẩm. Vui lòng thử lại sau. Chi tiết: ${err.message || err}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Tìm kiếm sản phẩm</h2>
      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <div className="text-center mt-5" role="status" aria-live="polite">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      ) : (
        <div className="row g-4">
          {products.length > 0 ? (
            products.map((prod) => (
              <ProductCard key={prod.id} prod={prod} />
            ))
          ) : (
            <p className="text-center" aria-live="polite">
              Không tìm thấy sản phẩm.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;