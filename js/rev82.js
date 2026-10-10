/* Rev 82 – bản hoàn thiện cho điện thoại: bản đồ tổng mặc định, thanh máu gọn, cân bằng sát thương,
 * quái mới theo vùng, vật phẩm & tướng có hiệu ứng riêng, giao diện thống nhất. Nạp sau main.js. */
(function () {
  'use strict';

  /* ===== 5. Bản đồ tổng: luôn dùng tranh 6 vùng mặc định (worlds56), không ghi đè ảnh từng thẻ ===== */
  const renderMap = UI.renderMap;
  UI.renderMap = function () {
    const out = renderMap.apply(this, arguments);
    document.querySelectorAll('.world-card').forEach(c => { c.style.backgroundImage = ''; c.style.backgroundSize = ''; c.style.backgroundPosition = ''; });
    return out;
  };

  window.Rev82 = { version: 82 };
})();
