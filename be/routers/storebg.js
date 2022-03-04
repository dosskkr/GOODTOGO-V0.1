const express = require("express");
const router = express.Router();
const connection = require("../utils/db");
const path = require("path");
// express-validator 驗證
const { body, validationResult } = require("express-validator");
// multer 上傳圖片用
const multer = require("multer");
// bcrypt 雜湊密碼用
const bcrypt = require("bcrypt");

// TODO: 會員登入後 先到 auth 比對帳密 -> 登入成功 -> 回應前端(登入頁) session 資料
// TODO: 登入成功後進到內頁 /member -> 利用 session 確認有無登入過 -> 進到其他路由中間件撈資料 profile/password...

// -------- 驗證是否已登入 中間件 --------
// TODO: router.use(checkLogin); // 最後要抽離成 middleware 引入
router.use((req, res, next) => {
  // ----- 測試，假設已取得登入後的 session
  //   req.session.member = {
  //     id: member.id,
  //     name: member.name,
  //     photo: member.logo
  //   }
  req.session.member = {
    id: 1,
    name: "添飯中式料理",
    // photo: "",
    store_id: 1,
    logo: "/static/uploads/logo/test_logo.png",
  };
  // ----- 測試，假設已取得登入後的 session

  console.log("測試傳入id,name,logo", req.session.member);
  // 有無 session
  if (req.session.member) {
    // 表示登入過
    console.log("測試 has session");
    next(); // 這樣會跳出 router 到 server.js 繼續 next()???
  } else {
    // 表示尚未登入
    res.status(400).json({
      code: "99001",
      msg: "會員未登入",
    });
  }

  // 到這裡，表示 req.session.member 一定有資料
  // next(); // 往下走讓 其他頁撈資料
  // res.json(req.session.member); // 先測試看看前端能不能得到 session
});
// -------- 驗證是否已登入 中間件 結束 --------

// 檢查要 update 的資料是否符合格式 中間件
// express-validator {body} 驗證
const updateProfileRules = [
  // FIXME: 前後端錯誤訊息
  body("name").contains().withMessage("姓名 請填寫正確格式"),
  body("email").isEmail().withMessage("電子信箱 請填寫正確格式"),
  body("phone").isNumeric().withMessage("電話號碼 請填寫正確格式"), //.isMobilePhone()
];

// 設定上傳圖片儲存資訊 (資料夾、檔名)
const storage = multer.diskStorage({
  // 設定儲存的目的地(硬碟->檔案夾)
  destination: function (req, file, cb) {
    // ../public/uploads/headshots <-- 檔案夾要自己先建立好
    cb(null, path.join(__dirname, "..", "public", "uploads", "headshots"));
    // 錯誤訊息 先給null
  },
  // 設定儲存的檔名
  filename: function (req, file, cb) {
    console.log("multer-filename: ", file);
    // 抓使用者上傳的檔名 file.originalname
    // 取用副檔名 ext
    const ext = file.originalname.split(".").pop();
    // 組合要放進資料夾(、資料庫)的名稱
    cb(null, `member-${Date.now()}.${ext}`);
  },
});

//
// router.post 過濾圖片用的中間件
const uploader = multer({
  storage: storage, // 上面的 storage 圖片儲存資訊
  // 過濾 圖片類型
  fileFilter: function (req, file, cb) {
    console.log("file.mimetype: ", file.mimetype);
    if (
      file.mimetype !== "image/jpeg" &&
      file.mimetype !== "image/jpg" &&
      file.mimetype !== "image/png"
    ) {
      cb(new Error("不接受的檔案類型"), false);
      // 固定用法
    } else {
      cb(null, true); // 接受此文件
    }
  },
  // 過濾 檔案尺寸
  limits: {
    // 1K: 1024 bytes
    fileSize: 200 * 1024, // 限制 < 200K
  },
});

// -------- 店家資料顯示 --------
// /api/member/profile (get)
router.get("/profile", async (req, res, next) => {
  let [data] = await connection.execute(
    "SELECT name, email, logo FROM stores WHERE id=?",
    [req.session.member.id]
  );
  console.log("db_stores id: ", req.session.member.id);
  console.log("取得 stores: ", data);

  // 打包資料給 res
  let profile = {
    name: data[0].name,
    email: data[0].email,
    logo: data[0].logo,
    // photo: data[0].headshots,
    logo: req.session.member.logo,
  };
  res.json(profile);
});

// -------- 商品清單資料顯示 --------
// /api/member/profile (get)
router.get("/productslist", async (req, res, next) => {
  let [productsData] = await connection.execute(
    "SELECT * FROM products WHERE store_id = ?",
    [req.session.member.id]
  );
  console.log("db_stores id: ", req.session.member.id);
  console.log("取得 stores: ", productsData);

  let page = req.query.page || 1;
  console.log("目前所在頁數：", page);

  let [total] = await connection.execute(
    "SELECT COUNT(*) AS total FROM products WHERE store_id=?",
    [req.session.member.id]
  );

  console.log("總筆數：", total);
  total = total[0].total; // total = 6

  // 計算總共應該要有幾頁
  const perPage = 3;
  // lastPage: 總共有幾頁
  const lastPage = Math.ceil(total / perPage);
  // 計算 SQL 要用的 offset
  let offset = (page - 1) * perPage;
  // 取得資料
  let [data] = await connection.execute(
    "SELECT * FROM products WHERE store_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [req.session.member.id, perPage, offset]
  );
  console.log("目前店家id", req.session.member.id);
  console.log("目前一頁有幾筆", perPage);
  console.log("offsetoffsetoffset3", offset);
  // -------- 整理分頁資訊回傳的資料 --------
  //全部商家數，一頁幾筆資料，在第幾頁，最後一頁
  let pagination = { total, perPage, page, lastPage };

  console.log("data", data);

  res.json([data, productsData, pagination]);
});

// -------- 上下架修改儲存 --------
// /api/member/password (post)
router.post("/productslistvalid", async (req, res, next) => {
  console.log("ddddd", req.body);

  // 檢查 req.body.password 密碼是否正確，正確才能改新密碼
  if (req.body.productValid === 1) {
    let [validResult] = await connection.execute(
      `UPDATE products SET valid=0 WHERE store_id=? AND id=?;`,
      [req.session.member.id, req.body.productId]
    );
  } else {
    let [validResult] = await connection.execute(
      `UPDATE products SET valid=1 WHERE store_id=? AND id=?;`,
      [req.session.member.id, req.body.productId]
    );
  }
  // 把會員資料從陣列中拿出來
  // let userPassword = passwordResult[0];
  console.log("11111111111111++++++++++++++", req.session.member.id);
  console.log("000000++++++++++++++", req.session.member);
  console.log("2222222++++++++++++++", req.body.productId);
  // 寫到這 先測試 是否能比對密碼成功(用前台送出表單測試)
  // 再進行後續儲存

  // // -------- 儲存到資料庫 --------
  // let [updatePasswordResult] = await connection.execute(
  //   `UPDATE users SET password=? WHERE id=?;`,
  //   [hashNewPassword, req.session.member.id]
  // );
  // console.log(updatePasswordResult);

  // 寫內容前先測試能不能得到 req
  // console.log("req.body: ", req.body);
  res.json({
    message: "儲存成功 ok",
  });
});

// 新增商品
router.post("/newproduct", async (req, res, next) => {
  console.log(req.body);
  //*存入資料庫
  let [result] = await connection.execute(
    "INSERT INTO products (name, description, amount, price, valid) VALUES (?,?,?,?,?)",
    [
      req.body.productName,
      req.body.productDescription,
      req.body.amountOfGoods,
      req.body.commodityPrice,
      "1",
    ]
  );
  console.log(result);
  res.json({ message: "ok" });
});

module.exports = router;