import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../api/productApi';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getAllProducts()
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mt-5">
      <h2>Danh sách sản phẩm</h2>
      <div className="row">
        {products.map(p => (
          <div className="col-md-4" key={p.id}>
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p>{p.description}</p>
                <p><strong>{p.price} VND</strong></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
