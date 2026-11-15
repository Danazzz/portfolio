import React from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import styles from './Certificate.module.css';

import certificates from '../../data/projects.json';
import { CertificateCard } from './CertificateCard';

export const Certificate = () => {
    return (
        <section className={styles.container} id="certificate">
            <h2 className={styles.title}>Certificates</h2>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={50}
                slidesPerView={3}
                navigation
                pagination={{ clickable: true }}
            >
                {certificates.map((certificate, id) => (
                    <SwiperSlide key={id}>
                        <CertificateCard certificate={certificate} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};