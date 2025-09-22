import React from 'react';
import styles from './PsychedelicBackground.module.css';

const PsychedelicBackground = () => {
  return (
    <div className={styles.psychedelicContainer}>
      <div className={`${styles.floatingOrb} ${styles.orb1}`}></div>
      <div className={`${styles.floatingOrb} ${styles.orb2}`}></div>
      <div className={`${styles.floatingOrb} ${styles.orb3}`}></div>
    </div>
  );
};

export default PsychedelicBackground;