const GRADIENT = [
    [
        0,
        [74, 65, 231]
    ],
    [
        100,
        [233, 33, 109]
    ]
];

function getPercent(min, max, value) {
    return Math.round(100 * (value - min) / (max - min))
}

// Thanks to Felipe Ribeiro: http://jsfiddle.net/vksn3yLL/
export function updateGradient(min, max, sliderValue) {
    const WIDTH = 100;
    const percent = getPercent(min, max, sliderValue)
    //Get the two closest colors
    var firstcolor = GRADIENT[0][1];
    var secondcolor = GRADIENT[1][1];

    //Calculate ratio between the two closest colors
    var firstcolor_x = 0;
    var secondcolor_x = WIDTH - firstcolor_x;
    var slider_x = WIDTH * (percent / 100) - firstcolor_x;
    var ratio = slider_x / secondcolor_x

    //Get the color with pickHex
    var result = pickHex(secondcolor, firstcolor, ratio);
    const color = 'rgb(' + result.join() + ')'
    // const full_gradient = 'linear-gradient(45deg, rgb(74, 65, 231) 0%, rgb(233, 33, 109) 100%)'
    const grad = `linear-gradient(90deg, rgb(74, 65, 231) 0%, ${color} 100%)`
    return grad
}

function pickHex(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w / 1 + 1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}

export function buildFont(font, name) {
    return {
        name: name,
        credits: {
            copyright: font.tables.name.copyright?.en ?? '',
            designer: font.tables.name.designer?.en ?? '',
            designerURL: font.tables.name.designerURL?.en ?? '',
            preferredFamily: font.tables.name.preferredFamily?.en ?? '',
            license: font.tables.name.license?.en ?? '',
        },
        axes: font.tables.fvar?.axes,
        instances: font.tables.fvar?.instances
    }
}

export function updateElementPosition(el, x, y) {
    el.style.position = 'absolute';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
}