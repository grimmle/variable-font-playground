// Thanks to Jhey Tompkins: https://codepen.io/jh3y/pen/OJwagZa
export const CircularText = ({ children, side, color }) => {
    const CHARS = children.split('')
    const INNER_ANGLE = 360 / CHARS.length
    return (
        <span
            className="circular-text"
            style={{
                '--total': CHARS.length,
                '--radius': side / Math.sin(INNER_ANGLE / (180 / Math.PI)),
                'color': color
            }}
        >
            {CHARS.map((char, index) => (
                <span key={index} style={{ '--index': index }}>
                    {char}
                </span>
            ))}
        </span>
    )
}