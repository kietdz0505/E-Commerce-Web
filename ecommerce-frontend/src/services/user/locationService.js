import axios from "axios";

const BASE_URL = "https://provinces.open-api.vn/api";

export const getProvinces = () => {
  return axios.get(`${BASE_URL}/p/`);
};

export const getDistricts = (provinceCode) => {
  return axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`);
};

export const getWards = (districtCode) => {
  return axios.get(`${BASE_URL}/d/${districtCode}?depth=2`);
};