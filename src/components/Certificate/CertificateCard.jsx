import React from 'react';
import styles from './CertificateCard.module.css'; // Define necessary CSS in this file

export const CertificateCard = ({ certificate }) => {
  return (
    <div className={styles.card}>
      <img src={certificate.imageUrl} alt={certificate.title} className={styles.image} />
      <div className={styles.info}>
        <h3 className={styles.title}>{certificate.title}</h3>
        <p className={styles.description}>{certificate.description}</p>
        <a href={certificate.link} target="_blank" rel="noopener noreferrer" className={styles.link}>View Certificate</a>
      </div>
    </div>
  );
};