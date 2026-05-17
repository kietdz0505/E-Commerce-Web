import { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config/apiConfig';
import ProductCard from '../../shared/ProductCard';
import SearchBar from '../../components/SearchBar';
import '../../styles/searchPage.css';


const SearchPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (filters) => {
    console.log('Filters received in SearchPage:', filters);
    try {
      setLoading(true);
      setError(null);
      const apiUrl = getApiUrl('SEARCH', filters);
      console.log('API URL:', apiUrl);
      const res = await axios.get(apiUrl);
      console.log('API Response:', res.data);
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
    <>
      <div className="az-searchpage">

        {/* Hero header */}
        <div className="az-searchpage-hero">
          <div className="container text-center pb-0 pt-2">
            <h1 className="az-searchpage-title">
              Tìm kiếm <span>sản phẩm</span>
            </h1>
            <p className="az-searchpage-sub">Khám phá hàng ngàn sản phẩm chính hãng</p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Results */}
        <div className="az-searchpage-body">
          <div className="container position-relative">
            {loading ? (
              <div className="az-sp-loading" role="status" aria-live="polite">
                <div className="az-sp-spinner" />
                <span className="az-sp-loading-text">Đang tìm kiếm sản phẩm...</span>
              </div>
            ) : error ? (
              <div className="az-sp-error" role="alert">
                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                {error}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="az-sp-count" aria-live="polite">
                  Tìm thấy <strong>{products.length}</strong> sản phẩm
                </div>
                <div className="az-sp-grid">
                  {products.map((prod) => (
                    <ProductCard key={prod.id} prod={prod} />
                  ))}
                </div>
              </>
            ) : (
              <div className="az-sp-empty" aria-live="polite">
                <div className="az-sp-empty-icon">
                  <i className="bi bi-search" />
                </div>
                <span className="az-sp-empty-text">Không tìm thấy sản phẩm phù hợp.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;