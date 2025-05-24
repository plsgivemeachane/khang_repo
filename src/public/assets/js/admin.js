const socket = io();

socket.on("connect", () => {
  console.log("🟢 Admin connected to socket");
});

socket.on("notifyAdmin", (data) => {
  console.log("📢 Admin nhận được yêu cầu seller:", data);

  // Gửi nội dung thông báo đến server để lưu vào DB
  fetch("/admin/notification/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: data.message }),
  })
    .then((res) => res.json())
    .then((result) => {
      console.log("✅ Thông báo đã được lưu:", result.message);
      Toastify({
        text: result.message || "Đã lưu thông báo",
        duration: 3000,
        gravity: "top",
        position: "right",
        className: "toastify toastify-success",
      }).showToast();
    })
    .catch((err) => {
      console.error("❌ Lỗi khi lưu thông báo:", err);
      Toastify({
        text: "Lỗi khi lưu thông báo!",
        duration: 3000,
        gravity: "top",
        position: "right",
        className: "toastify toastify-error",
      }).showToast();
    });
});
