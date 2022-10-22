import { Pixel } from '../Pixel';
import './row.css';

interface RowProps {
    rowNumber: number;
    width: number;
    selectedColor: string;
}

export const Row = ({ rowNumber, width, selectedColor }: RowProps) => {
    let pixels = [];

    for (let i = 0; i < width; i++) {
        pixels.push(<Pixel key={i} rowNumber={rowNumber} pixelNumber={i} selectedColor={selectedColor} />);
    }

    return <div className="row">{pixels}</div>;
};
