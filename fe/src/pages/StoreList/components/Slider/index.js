import React, { useState, useEffect } from "react";
// -------- 引用圖檔 --------
import Slider1 from "../../images/Slider1.png";
import Slider2 from "../../images/Slider2.png";
import Slider3 from "../../images/Slider3.png";
import { v4 as uuidv4 } from "uuid";

const Slider = () => {
  //把圖片檔案存成陣列
  const displayImage = [Slider1, Slider2, Slider3];
  //
  const [slideIndex, setSlideIndex] = useState(1);

  // 讓幻燈片自動歸零
  useEffect(() => {
    const lastIndex = displayImage.length;
    //如果slideIndex為-1（繼續往左按)，會回到slideIndex=3
    if (slideIndex <= 0) {
      setSlideIndex(lastIndex);
    }
    //如果slideIndex為4以上（繼續往右按)，會回到slideIndex=1
    if (slideIndex > lastIndex) {
      setSlideIndex(1);
    }
  }, [slideIndex, displayImage]);

  //每兩秒自動往右滑
  // useEffect(() => {
  //   let slider = setInterval(() => {
  //     setSlideIndex(slideIndex + 1);
  //   }, 2000);
  //   return () => clearInterval(slider);
  // }, [slideIndex]);

  //移動點點
  const moveDot = (index) => {
    setSlideIndex(index);
  };
  // console.log(typeof slideIndex);
  // console.log(slideIndex);
  // console.log("圖片的數量", displayImage.length); //長度跟陣列[1]都有值
  // const showSlide = () => {
  //   for (let i = 0; i <= displayImage.length; i++) {
  //     return (
  //       <div key={uuidv4()} index={i}>
  //         <img src={`${displayImage[i]}`} alt="" />
  //       </div>
  //     );
  //   }
  // };

  return (
    <>
      <div className="slider m-auto">
        <div className="slider-box text-center col-sm-12 m-auto">
          <div
            id="carouselExampleIndicators"
            class="carousel slide"
            data-bs-ride="carousel"
          >
            <div class="carousel-indicators">
              <button
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide-to="0"
                class="active"
                aria-current="true"
                aria-label="Slide 1"
              ></button>
              <button
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide-to="1"
                aria-label="Slide 2"
              ></button>
              <button
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide-to="2"
                aria-label="Slide 3"
              ></button>
            </div>
            <div class="carousel-inner">
              <div class="carousel-item active">
                <img src={Slider1} class="d-block w-100" alt="..." />
              </div>
              <div class="carousel-item">
                <img src={Slider2} class="d-block w-100" alt="..." />
              </div>
              <div class="carousel-item">
                <img src={Slider3} class="d-block w-100" alt="..." />
              </div>
            </div>
            <button
              class="carousel-control-prev"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="prev"
            >
              <div className="controller-left">
                <span
                  class="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
              </div>
            </button>
            <button
              class="carousel-control-next"
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide="next"
            >
              <div className="controller-right">
                <span
                  class="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>
      {/* <div className="slider d-grid">
        <div className="slider-box text-center">
          <div className="wrapper d-flex">
            {/* {showSlide()} */}
      {/* {displayImage.map((img, i) => {
              return (
                <div key={uuidv4()} index={i}>
                  <img src={`${img}`} alt="" />
                </div>
              );
            })}
          </div>
        </div> */}
      {/* <div className="slider-point list-unstyled">
          <li> </li>
          <li> </li>
          <li> </li>
        </div>
        <div className="controller"> */}
      {/* <BtnSlider moveSlide={prevSlide} direction={"next"} /> */}
      {/* <button className="btn arrow-bg text-center p-0 m-0">
            <IoIosArrowBack
              className="arrow-btn pe-1"
              onClick={() => setSlideIndex(slideIndex - 1)}
            />
          </button>
        </div>
        <div className="controller"> */}
      {/* <BtnSlider moveSlide={nextSlide} direction={"prev"} /> */}
      {/* <button className="btn arrow-bg text-center p-0 m-0">
            <IoIosArrowForward
              className="arrow-btn ps-1"
              onClick={() => setSlideIndex(slideIndex + 1)}
            />
          </button>
        </div> */}
      {/* </div> */}
    </>
  );
};

export default Slider;
