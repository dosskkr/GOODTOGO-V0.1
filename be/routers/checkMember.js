const express = require("express");
const router = express.Router();
const { checkLogin } = require("../middleware/checkLogin");
// "/api/checkMember"
router.use(checkLogin);

// "/api/checkMember/info"
router.get("/", (req, res, next) => {
  // 因為有用了 checkLogin 這個我們自己寫的中間件
  // 能走到這裡，表示 req.session.user 一定有資料
  res.json(req.session.member);
  // console.log(req.session.member);
});

module.exports = router;
