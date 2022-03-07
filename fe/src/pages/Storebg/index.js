import React, { useEffect } from "react";

import LeftNav from "./component/LeftNav";
import TopNav from "./component/TopNav";
import FilterContent from "./component/FilterContent";
import PenCount from "./component/PenCount";
import Table from "./component/Table";
import Pagination from "./component/Pagination";
const Storebg = ({ setIsAdmin }) => {
  // 判斷頁首頁尾
  useEffect(() => {
    setIsAdmin(true);
  }, []);

  return (
    <div className="background-storebg">
      <div className="background-storebg-data">
        <div className="d-flex position-relative">
          {/* -------- 左邊欄位區塊開始 --------*/}
          <LeftNav />
          {/* -------- 右邊欄位區塊開始 --------*/}
          <div className="p-0 background-storebg-data-right  ">
            {/* -------- 上方導覽列開始 -------- */}
            <TopNav />
            {/* -------- 白色主要內容區塊開始 -------- */}
            <div className="background-storebg-data-right-content">
              {/* -------- 排序區塊 -------- */}
              <FilterContent />
              {/* -------- 筆數 -------- */}
              <PenCount />
              {/* -------- 表格 資料主要呈現區塊開始 -------- */}
              <Table />
              {/* -------- 分頁區塊開始 --------*/}
              {/* <Pagination /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storebg;
