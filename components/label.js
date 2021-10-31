function Label(props) {
    return (
        <p style={{ textTransform: 'uppercase', fontWeight: 'bold', color: 'black'}}>
            {props.children}
        </p>
    )
}

export default Label