import React, { useState } from 'react';
import HelpPopup from '../HelpPopup';
import styles from './HelpButton.module.css';

const HelpButton = () => {
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const togglePopup = () => {
        setIsPopupVisible(!isPopupVisible);
    };

    return (
        <>
            <button className={styles['help-button']} onClick={togglePopup}>
                ?
            </button>
            {isPopupVisible && <HelpPopup onClose={togglePopup} />}
        </>
    );
};

export default HelpButton;
