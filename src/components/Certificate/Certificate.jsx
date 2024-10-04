import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { EffectCoverflow, Pagination, Navigation } from 'swiper';

import styles from "./Certificate.module.css";
import skills from "../../data/skills.json";
import { getImageUrl } from "../../utils";

export const Certificate = () => {
  return (
    <section className={styles.container} id="experience">
        <h2 className={styles.title}>Experience</h2>
        <div className={styles.content}>
                {skills.map((skill, id) => {
                    return (
                    <div key={id} className={styles.skill}>
                        <Swiper
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            loop={true}
                            slidesPerView={'auto'}
                            coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 100,
                            modifier: 2.5,
                            }}
                            pagination={{ el: '.swiper-pagination', clickable: true }}
                            navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                            clickable: true,
                            }}
                            modules={[EffectCoverflow, Pagination, Navigation]}
                            className="swiper_container"
                        >  
                        <SwiperSlide>
                            <div className={styles.skillImageContainer}>
                                <img src={getImageUrl(skill.imageSrc)} alt={skill.title} />
                            </div>
                        </SwiperSlide>
                        
                        <div className="slider-controler">
                            <div className="swiper-button-prev slider-arrow">
                                <ion-icon name="arrow-back-outline"></ion-icon>
                            </div>
                            <div className="swiper-button-next slider-arrow">
                                <ion-icon name="arrow-forward-outline"></ion-icon>
                            </div>
                            <div className="swiper-pagination"></div>
                        </div>
                        </Swiper>
                    </div>
                    );
                })}
            </div>
    </section>
  )
}
