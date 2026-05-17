import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import "../styles/confirmDialog.css";


const MySwal = withReactContent(Swal);

// ===== BASE CONFIG =====
const baseConfig = {
  background: 'linear-gradient(135deg, #1b1a3a 0%, #16152e 100%)',
  color: '#fff',
  borderRadius: '20px',
  border: '1px solid rgba(124, 140, 255, 0.2)',
  backdrop: 'rgba(0,0,0,0.7)',
  width: '380px',
  didOpen: (modal) => {
    modal.style.boxShadow = '0 20px 60px rgba(124, 140, 255, 0.15)';
  },
  showClass: {
    popup: 'animate__animated animate__zoomIn'
  },
  hideClass: {
    popup: 'animate__animated animate__zoomOut'
  },
  customClass: {
    popup: 'az-swal',
    title: 'az-swal-title',
    htmlContainer: 'az-swal-text',
    confirmButton: 'az-swal-confirm',
    cancelButton: 'az-swal-cancel',
    actions: 'az-swal-actions'
  },
  titleFontSize: '24px',
  htmlFontSize: '16px'
};

// ===== CONFIRM DELETE =====
export const confirmDelete = (
  title = 'Xóa đánh giá?',
  text = 'Hành động này không thể hoàn tác!'
) => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#ff4d4f',
    cancelButtonColor: 'rgba(108, 117, 125, 0.5)',
    iconColor: '#ffc107',
    allowOutsideClick: false,
    allowEscapeKey: true
  });
};

// ===== SUCCESS =====
export const showSuccess = (title = 'Thành công!', text = '') => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#00e6a7',
    iconColor: '#00e6a7',
    timer: 2000,
    timerProgressBar: true
  });
};

// ===== ERROR =====
export const showError = (title = 'Lỗi!', text = '') => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ff4d4f',
    iconColor: '#ff4d4f'
  });
};