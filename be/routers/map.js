const express = require("express");
const router = express.Router();
const connection = require("../utils/db");
const moment = require("moment");
moment.locale("zh-tw");

router.get("/info", async (req, res, next) => {
  let [category] = await connection.execute("SELECT * FROM stores_category");
  category.unshift({ id: 0, category: "全部店家", valid: 1 });
  let [likeResult] = await connection.execute(
    `SELECT store_id, count(id) AS likeTotal
    FROM user_like
    GROUP BY store_id
    ORDER BY likeTotal DESC;`
  );
  let [storeResult] = await connection.execute(
    `SELECT a.id,
    a.name,
    a.logo,
    a.open_time,
    a.close_time,
    a.close_day,
    b.category,
    c.longitude AS lng,
    c.latitude AS lat
    FROM stores AS a
    JOIN stores_category AS b 
    ON a.stores_category_id = b.id
    JOIN map AS c ON a.id = c.store_id 
    WHERE a.valid = 1;`
  );
  let [starResult] = await connection.execute(
    `SELECT
    store_id,
    round(SUM(star)/count(id),1) AS score
    FROM products_comment
    GROUP BY store_id;`
  );
  let [storeProducts] = await connection.execute(
    `SELECT store_id,
  SUM(amount) AS amount
  FROM products
  GROUP BY store_id`
  );
  storeResult.map((item) => {
    // 放入 愛心
    let setLike = likeResult.find(
      (v) => Object.values(v)[0] === Object.values(item)[0]
    );
    if (setLike) {
      item.like = setLike.likeTotal;
    } else {
      item.like = 0;
    }

    // 放入星星
    let setStar = starResult.find(
      (v) => Object.values(v)[0] === Object.values(item)[0]
    );
    if (setStar) {
      item.star = setStar.score;
    } else {
      item.star = 0;
    }
    //放入剩餘數量
    let setAmount = storeProducts.find(
      (v) => Object.values(v)[0] === Object.values(item)[0]
    );
    if (setAmount) {
      item.amount = setAmount.amount;
    } else {
      item.amount = 0;
    }
  });

  // storeResult.sort(function (a, b) {
  //   // boolean false == 0; true == 1
  //   return b.star - a.star;
  // });

  storeResult.map((item) => {
    //*[step 1] 轉換卡面顯示的時間格式 => 00:00 (24小時制)
    item.open_time = moment(item.open_time, "hh:mm:ss.000").format("hh:mm");
    item.close_time = moment(item.close_time, "hh:mm:ss.000").format("HH:mm");
    //*[step 2] 判斷目前是否營業中
    //TODO 判斷 a.現在時間
    let nowTime = Number(moment().format("HHmm"));
    //開發中的假時間
    // let nowTime = 2131;
    //把營業時間轉為數字 09:30 -> 930
    let storeOpen = Number(moment(item.open_time, "hh:mm").format("hhmm"));
    let storeClosed = Number(moment(item.close_time, "hh:mm").format("HHmm")); //2130
    //今天星期？
    let today = Number(moment().format("d")); //今天星期：1
    //休息時間轉為數字
    let closeDay = JSON.parse(item.close_day); //[3,5]
    //let opState = item.opState;
    //TODO 判斷休息與否：a.現在時間 早於 storeOpen || 晚於storeClosed || closeDay裡面有今天就是休息
    if (
      nowTime < storeOpen ||
      nowTime > storeClosed ||
      closeDay.includes(today)
    ) {
      item.opState = false; //false=休息中
    } else {
      item.opState = true; //true=營業中
    }
  });
  // console.log("storeResult數量", storeResult);
  res.json([storeResult, category]);
});
router.get("/info/:storeId", async (req, res, next) => {
  let [likeResult] = await connection.execute(
    `SELECT store_id, count(id) AS likeTotal
    FROM user_like
    GROUP BY store_id
    ORDER BY likeTotal DESC;`
  );

  let [storeResult] = await connection.execute(
    `SELECT a.id,
    a.name,
    a.logo,
    a.open_time,
    a.close_time,
    a.close_day,
    b.category
    FROM stores AS a
    JOIN stores_category AS b ON b.id=a.stores_category_id
    WHERE a.valid = 1 AND a.id = ?;`,
    [req.params.storeId]
  );

  let [starResult] = await connection.execute(
    `SELECT
    store_id,
    round(SUM(star)/count(id),1) AS score
    FROM products_comment
    GROUP BY store_id;`
  );
  // -------- 計算餐點剩餘數量 --------
  let [storeProducts] = await connection.execute(
    `SELECT store_id,
  SUM(amount) AS amount
  FROM products
  GROUP BY store_id`
  );

  storeResult.map((item) => {
    // 放入 愛心
    let setLike = likeResult.find(
      (v) => Object.values(v)[0] === Object.values(item)[0]
    );
    if (setLike) {
      item.like = setLike.likeTotal;
    } else {
      item.like = 0;
    }

    // 放入星星
    let setStar = starResult.find(
      (v) => Object.values(v)[0] === Object.values(item)[0]
    );
    if (setStar) {
      item.star = setStar.score;
    } else {
      item.star = 0;
    }

    //放入剩餘數量
    let setAmount = storeProducts.find(
      (v) => Object.values(v)[0] === Object.values(item)[0]
    );
    if (setAmount) {
      item.amount = setAmount.amount;
    } else {
      item.amount = 0;
    }
  });
  storeResult.map((item) => {
    //*[step 1] 轉換卡面顯示的時間格式 => 00:00 (24小時制)
    item.open_time = moment(item.open_time, "hh:mm:ss.000").format("hh:mm");
    item.close_time = moment(item.close_time, "hh:mm:ss.000").format("HH:mm");
    //*[step 2] 判斷目前是否營業中
    //TODO 判斷 a.現在時間
    let nowTime = Number(moment().format("HHmm"));
    //開發中的假時間
    // let nowTime = 2131;
    //把營業時間轉為數字 09:30 -> 930
    let storeOpen = Number(moment(item.open_time, "hh:mm").format("hhmm"));
    let storeClosed = Number(moment(item.close_time, "hh:mm").format("HHmm")); //2130
    //今天星期？
    let today = Number(moment().format("d")); //今天星期：1
    //休息時間轉為數字
    let closeDay = JSON.parse(item.close_day); //[3,5]
    //let opState = item.opState;
    //TODO 判斷休息與否：a.現在時間 早於 storeOpen || 晚於storeClosed || closeDay裡面有今天就是休息
    if (
      nowTime < storeOpen ||
      nowTime > storeClosed ||
      closeDay.includes(today)
    ) {
      item.opState = false; //false=休息中
    } else {
      item.opState = true; //true=營業中
    }
    // console.log("filter: opState", item.opState);
  });

  // console.log("starResult", starResult);
  // console.log("storeProduct", storeProducts);
  res.json(storeResult);
});

module.exports = router;
