import React from 'react';

import PropTypes from 'prop-types';

import styles from './CertificateCard.module.css';
import { getImageUrl } from "../../utils";

export const CertificateCard = ({
  certificate: { title, imageSrc, description, source },
}) => {
  return (
    <div className={styles.card}>
      <img src={getImageUrl(imageSrc)} alt={`Image of ${title}`} className={styles.image} />
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <a href={source} target="_blank" rel="noopener noreferrer" className={styles.link}>View Certificate</a>
      </div>
    </div>
  );
};

CertificateCard.propTypes = {
    certificate: PropTypes.shape({
      title: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      description: PropTypes.string,
      link: PropTypes.string
    }).isRequired
  };