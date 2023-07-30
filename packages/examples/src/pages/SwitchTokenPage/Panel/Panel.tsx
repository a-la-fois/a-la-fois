import { DocContainer } from '@a-la-fois/doc-client';
import styles from './Panel.module.css';

export type PanelProps = {
    doc: DocContainer | null;
    onActivate: () => void;
};

export const Panel = ({ doc, onActivate }: PanelProps) => {
    return (
        <div className={styles.Panel}>
            {!doc && (
                <div className={styles['Panel-Overlay']}>
                    <button className={styles['Panel-ActivateButton']} onClick={onActivate}>
                        Activate
                    </button>
                </div>
            )}
        </div>
    );
};
