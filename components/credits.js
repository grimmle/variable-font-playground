import Linkify from 'linkify-react';

function Credits(props) {
    const font = props.font
    const regexUrl = (url) => {
        if (!/^https?:\/\//i.test(url)) return 'http://' + url
        return url
    }

    return (
        <div className="credits">
            <Linkify tagName="span" options={{ target: '_blank' }}>
                {font.credits.copyright}
            </Linkify> Designer: <a href={regexUrl(font.credits.designerURL)} rel="noreferrer" target="_blank"> {font.credits.designer}</a>
        </div>)
}

export default Credits