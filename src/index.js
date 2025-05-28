const express = require("express");
const app = express(); // ✅ Tạo app trước

const PORT = 4000;
const path = require("path");
const route = require('./routes/index');
const flash = require('express-flash');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require("method-override");

const cookieParser = require('cookie-parser');
const session = require('express-session');
const database = require("./config/database");

// ✅ Tạo server và socket sau khi có app
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socket/socketHandler'); // 👈 file mới

const server = http.createServer(app);
const io = new Server(server);

// Gắn logic xử lý socket vào đây
socketHandler(io);

// TinyMCE path
const pathTinymce = path.join(__dirname, "..", "node_modules", "tinymce");
console.log(" pathTinymce:", pathTinymce);

// Static
app.use("/tinymce", express.static(pathTinymce));
app.use("/node_modules", express.static(path.join(__dirname, "..", "node_modules")));
app.use(express.static(path.join(__dirname, "public")));


// View + Layouts
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layout/root");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser("IH12345"));
app.use(methodOverride("_method"));
app.use(session({
  secret: "IH12345",
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
}));
app.use(flash());

// DB + Route
database();
route(app);

// ✅ Khởi chạy server chung cho Express và Socket.IO
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
