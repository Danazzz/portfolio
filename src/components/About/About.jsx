/* eslint-disable no-unused-vars */
import React from "react";

import styles from "./About.module.css";
import { getImageUrl } from "../../utils";

export const About = () => {
  return (
    <section className={styles.container} id="about">
      <h2 className={styles.title}>About</h2>
      <div className={styles.content}>
        <img
          src={getImageUrl("about/aboutImage.png")}
          alt="My Picture 2"
          className={styles.aboutImage}
        />
        <ul className={styles.aboutItems}>
          <li className={styles.aboutItem}>
            <div className={styles.aboutItemText}>
              <h3>I am a Master student in Informatics Engineering, graduated in Information Technology and proficient in MERN stack, Laravel and Python. My studies are currently oriented towards IT Governance with the intent to analyze strategic IT alignment. In several internships and courses, I have implemented my technical knowledge and experience in realistic settings. My approach is practical and straightforward, aiming to effectively integrate technology solutions in business.</h3>
            </div>
          </li>
          {/* <li className={styles.aboutItem}>
            <img src={getImageUrl("about/serverIcon.png")} alt="Server icon" />
            <div className={styles.aboutItemText}>
              <h3>Backend Developer</h3>
              <p>
                API on-progress
              </p>
            </div>
          </li>
          <li className={styles.aboutItem}>
            <img src={getImageUrl("about/cursorIcon.png")} alt="UI icon" />
            <div className={styles.aboutItemText}>
              <h3>UI Designer</h3>
              <p>
                API on-progress
              </p>
            </div>
          </li> */}
        </ul>
      </div>
    </section>
  );
};
