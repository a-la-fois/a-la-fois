import { Pixel } from '../Pixel';
import './row.css';

interface RowProps {
    width: number;
    selectedColor: string;
}

export const Row = ({ width, selectedColor }: RowProps) => {
    let pixels = [];

    for (let i = 0; i < width; i++) {
        pixels.push(<Pixel key={i} selectedColor={selectedColor} />);
    }

    return <div className="row">{pixels}</div>;
};
