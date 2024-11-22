import React from 'react';
import styles from './HelpPopup.module.css';

const HelpPopup = ({ onClose }) => {
    return (
        <div className={styles['popup-overlay']}>
            <div className={styles['popup-content']}>
                <button className={styles['close-button']} onClick={onClose}>
                    ✖
                </button>
                <h3>How to use this site</h3>
                <p>
                    You can insert nodes one at a time, or several in sequence, separating them with commas, for example: 1, 2, 3, 4 (nodes 1, 2, 3 and 4 will be inserted).
                    The same can be done to delete nodes.
                    To handle nodes (delete, check adjacencies, etc.) use their IDs.
                    You can see everything our site has to offer using the 'Show menu' button.
                </p>
                <p>
                    Check our <a href='https://github.com/EstelaLacerda/GraphProject' target='_blank' className={styles.link}>source code</a>, and thank you for using Gramor!
                </p>
            </div>
        </div>
    );
};

export default HelpPopup;
