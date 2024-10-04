import React from "react";

import styles from "./CertificateCard.module.css";
import { getImageUrl } from "../../utils";

import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const CertificateCard = ({
    certificate: { title, imageSrc, description, skills, demo, source },
}) => {
    return (
        <div className={styles.container}>
            <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={30}
                slidesPerView={1}
                onSlideChange={() => console.log('slide change')}
                onSwiper={(swiper) => console.log(swiper)}
                >
                    <SwiperSlide>
                        <img
                            src={getImageUrl(imageSrc)}
                            alt={`Image of ${title}`}
                            className={styles.image}
                        />
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.description}>{description}</p>
                        <ul className={styles.skills}>
                            {skills.map((skill, id) => {
                            return (
                                <li key={id} className={styles.skill}>
                                {skill}
                                </li>
                            );
                            })}
                        </ul>
                        <div className={styles.links}>
                            <a href={demo} className={styles.link}>
                            Demo
                            </a>
                            <a href={source} className={styles.link}>
                            Source
                            </a>
                        </div>
                    </SwiperSlide>
            </Swiper>
        </div>
    )
};