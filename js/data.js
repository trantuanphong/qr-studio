export const codeTypes = [
  { id: "text", label: "Văn bản", description: "Đoạn text, thông điệp", qr: true },
  { id: "url", label: "Website / URL", description: "Liên kết trang web", qr: true },
  { id: "vietqr", label: "VietQR Bank", description: "Thanh toán chuyển khoản", qr: true },
  { id: "wifi", label: "Wi‑Fi", description: "Kết nối mạng nhanh", qr: true },
  { id: "vcard", label: "Danh thiếp", description: "vCard liên hệ", qr: true },
  { id: "event", label: "Sự kiện", description: "Lịch vEvent", qr: true },
  { id: "social", label: "Social Bio", description: "Liên kết mạng xã hội", qr: true },
  { id: "app", label: "Ứng dụng", description: "App Store / Google Play", qr: true },
  { id: "pdf", label: "Tài liệu PDF", description: "Tài liệu trực tuyến", qr: true },
  { id: "image", label: "Album ảnh", description: "Thư viện hình ảnh", qr: true },
  { id: "mp3", label: "Âm nhạc", description: "MP3 / Spotify / Zing", qr: true },
  { id: "playlist", label: "Playlist video", description: "YouTube / TikTok", qr: true },
  { id: "menu", label: "Menu nhà hàng", description: "Menu trực tuyến / món ăn", qr: true },
  { id: "coupon", label: "Mã giảm giá", description: "Voucher / ưu đãi", qr: true },
  { id: "product", label: "Sản phẩm", description: "Mô tả, giá, liên kết", qr: true },
  { id: "landing", label: "Landing page", description: "Trang giới thiệu", qr: true },
  { id: "feedback", label: "Đánh giá", description: "Google review / góp ý", qr: true },
  { id: "cccd", label: "CCCD Việt Nam", description: "Chuỗi dữ liệu 7 trường", qr: true },
  { id: "barcode", label: "Barcode", description: "Code 128, EAN, UPC, Code 39", qr: false }
];
export const qrStyles = {
  pattern: [
    "Square QR Pattern", "Rounded Square QR Pattern", "Circle QR Pattern", "Diamond QR Pattern",
    "Hexagon QR Pattern", "Star QR Pattern", "Circuit QR Pattern", "Wave QR Pattern", "Flower QR Pattern"
  ],
  eye: [
    "Square QR Eye", "Rounded Square QR Eye", "Circle QR Eye", "Diamond QR Eye",
    "Hexagon QR Eye", "Flower QR Eye"
  ],
  center: [
    "Square QR Eye Center", "Rounded Square QR Eye Center", "Circle QR Eye Center",
    "Diamond QR Eye Center", "Star QR Eye Center", "Flower QR Eye Center"
  ]
};
export const quickStyles = [
  {
    id: "vietnam", label: "Việt Nam", foreground: "#9D1C2A", background: "#FFF6E5",
    gradientEnd: "#8E5B00", useGradient: true, gradientType: "linear",
    pattern: "Flower QR Pattern", eye: "Rounded Square QR Eye", center: "Star QR Eye Center"
  },
  {
    id: "classic", label: "Cổ Điển", foreground: "#171717", background: "#FFFFFF",
    gradientEnd: "#4B5563", useGradient: false, gradientType: "linear",
    pattern: "Square QR Pattern", eye: "Square QR Eye", center: "Circle QR Eye Center"
  },
  {
    id: "jade", label: "Ngọc Bích", foreground: "#064E3B", background: "#ECFDF5",
    gradientEnd: "#0F766E", useGradient: true, gradientType: "linear",
    pattern: "Circle QR Pattern", eye: "Flower QR Eye", center: "Flower QR Eye Center"
  },
  {
    id: "sea", label: "Biển Xanh", foreground: "#083F68", background: "#EAF8FF",
    gradientEnd: "#076B78", useGradient: true, gradientType: "linear",
    pattern: "Wave QR Pattern", eye: "Rounded Square QR Eye", center: "Diamond QR Eye Center"
  },
  {
    id: "sunset", label: "Hoàng Hôn", foreground: "#7F1D3D", background: "#FFF4EC",
    gradientEnd: "#B93832", useGradient: true, gradientType: "linear",
    pattern: "Star QR Pattern", eye: "Circle QR Eye", center: "Flower QR Eye Center"
  },
  {
    id: "cyberpunk", label: "Cyberpunk", foreground: "#E879F9", background: "#0F172A",
    gradientEnd: "#22D3EE", useGradient: true, gradientType: "linear",
    pattern: "Circuit QR Pattern", eye: "Hexagon QR Eye", center: "Diamond QR Eye Center"
  }
];
export const fieldSchemas = {
  text: [{ name: "message", label: "Nội dung văn bản", type: "textarea", wide: true, required: true, maxLength: 2000, placeholder: "Nhập nội dung cần chia sẻ…" }],
  url: [{ name: "url", label: "Đường dẫn trang web", type: "url", wide: true, required: true, placeholder: "https://example.com" }],
  vietqr: [
    { name: "bank", label: "Ngân hàng thụ hưởng", type: "select", required: true, options: [
      ["970436", "Vietcombank"], ["970422", "MB Bank"], ["970407", "Techcombank"], ["970418", "BIDV"],
      ["970415", "VietinBank"], ["970432", "VPBank"], ["970423", "TPBank"], ["970416", "ACB"],
      ["970403", "Sacombank"], ["970405", "Agribank"]
    ] },
    { name: "account", label: "Số tài khoản", required: true, placeholder: "Nhập số tài khoản" },
    { name: "owner", label: "Tên chủ tài khoản (không dấu)", wide: true, placeholder: "NGUYEN VAN A" },
    { name: "amount", label: "Số tiền (VNĐ)", type: "number", min: "0", placeholder: "Tùy chọn" },
    { name: "transferNote", label: "Nội dung chuyển khoản", placeholder: "Thanh toan don hang" }
  ],
  wifi: [
    { name: "ssid", label: "Tên mạng Wi‑Fi (SSID)", wide: true, required: true },
    { name: "password", label: "Mật khẩu", type: "password" },
    { name: "security", label: "Bảo mật", type: "select", options: [["WPA", "WPA / WPA2 / WPA3"], ["WEP", "WEP"], ["nopass", "Không mật khẩu"]] },
    { name: "hidden", label: "Mạng Wi‑Fi ẩn", type: "checkbox", wide: true }
  ],
  vcard: [
    { name: "name", label: "Họ và tên", required: true },
    { name: "title", label: "Chức danh" },
    { name: "phone", label: "Số điện thoại", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "company", label: "Công ty / cơ quan", wide: true },
    { name: "address", label: "Địa chỉ", wide: true }
  ],
  event: [
    { name: "title", label: "Tên sự kiện", required: true, wide: true },
    { name: "location", label: "Địa điểm", wide: true },
    { name: "start", label: "Bắt đầu", type: "datetime-local", required: true },
    { name: "end", label: "Kết thúc", type: "datetime-local" },
    { name: "description", label: "Mô tả", type: "textarea", wide: true }
  ],
  social: [
    { name: "displayName", label: "Tên / thương hiệu", wide: true },
    { name: "facebook", label: "Facebook", type: "url", placeholder: "https://facebook.com/…" },
    { name: "instagram", label: "Instagram", type: "url", placeholder: "https://instagram.com/…" },
    { name: "tiktok", label: "TikTok", type: "url", placeholder: "https://tiktok.com/@…" },
    { name: "zalo", label: "Zalo / liên kết khác", type: "url", placeholder: "https://zalo.me/…" }
  ],
  app: [
    { name: "appName", label: "Tên ứng dụng", wide: true },
    { name: "appStore", label: "Link App Store (iOS)", type: "url", placeholder: "https://apps.apple.com/…" },
    { name: "playStore", label: "Link Google Play (Android)", type: "url", placeholder: "https://play.google.com/…" }
  ],
  pdf: [
    { name: "title", label: "Tiêu đề tài liệu", wide: true },
    { name: "url", label: "Link PDF / Google Drive", type: "url", required: true, wide: true, placeholder: "https://…" },
    { name: "fileSize", label: "Dung lượng (tùy chọn)", placeholder: "4 MB" },
    { name: "pages", label: "Số trang (tùy chọn)", placeholder: "12" }
  ],
  image: [
    { name: "title", label: "Tên album ảnh", wide: true },
    { name: "url", label: "Link album (Photos / web)", type: "url", required: true, wide: true, placeholder: "https://…" }
  ],
  mp3: [
    { name: "title", label: "Tên bài hát", required: true },
    { name: "artist", label: "Nghệ sĩ" },
    { name: "url", label: "Link nhạc (Spotify / Zing / SoundCloud)", type: "url", required: true, wide: true, placeholder: "https://…" }
  ],
  playlist: [
    { name: "title", label: "Tên playlist / video", wide: true },
    { name: "url", label: "Link YouTube / TikTok", type: "url", required: true, wide: true, placeholder: "https://…" }
  ],
  menu: [
    { name: "restaurant", label: "Tên nhà hàng", required: true, wide: true },
    { name: "menuUrl", label: "Link menu trực tuyến", type: "url", wide: true, placeholder: "https://…" },
    { name: "items", label: "Một số món nổi bật (nếu chưa có link)", type: "textarea", wide: true }
  ],
  coupon: [
    { name: "code", label: "Mã giảm giá", required: true },
    { name: "discount", label: "Mức ưu đãi" },
    { name: "expiry", label: "Hạn sử dụng" },
    { name: "terms", label: "Điều kiện áp dụng", type: "textarea", wide: true }
  ],
  product: [
    { name: "productName", label: "Tên sản phẩm", required: true, wide: true },
    { name: "price", label: "Giá bán" },
    { name: "url", label: "Link mua hàng", type: "url", required: true, wide: true, placeholder: "https://…" }
  ],
  landing: [
    { name: "brand", label: "Tên / thương hiệu", required: true },
    { name: "tagline", label: "Mô tả ngắn" },
    { name: "url", label: "Link landing page", type: "url", required: true, wide: true, placeholder: "https://…" }
  ],
  feedback: [
    { name: "business", label: "Tên cửa hàng / doanh nghiệp", wide: true },
    { name: "url", label: "Link đánh giá (Google / Tripadvisor)", type: "url", required: true, wide: true, placeholder: "https://…" },
    { name: "prompt", label: "Lời nhắn mời đánh giá", type: "textarea", wide: true }
  ],
  cccd: [
    { name: "citizenId", label: "Số CCCD (12 số)", required: true, maxLength: 12 },
    { name: "oldId", label: "CMND cũ (nếu có)", maxLength: 9 },
    { name: "fullName", label: "Họ và tên", required: true, wide: true },
    { name: "birthDate", label: "Ngày sinh (DDMMYYYY)", required: true, maxLength: 8 },
    { name: "gender", label: "Giới tính", type: "select", options: [["Nam", "Nam"], ["Nữ", "Nữ"], ["Khác", "Khác"]] },
    { name: "citizenAddress", label: "Địa chỉ thường trú", required: true, wide: true },
    { name: "issueDate", label: "Ngày cấp (DDMMYYYY)", maxLength: 8, wide: true }
  ],
  barcode: [{ name: "barcodeData", label: "Nội dung / mã số Barcode", required: true, wide: true, placeholder: "4006381333931" }]
};
