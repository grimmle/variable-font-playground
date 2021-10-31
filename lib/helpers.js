const gradient = [
    [
        0,
        [74, 65, 231]
    ],
    [
        100,
        [233, 33, 109]
    ]
];

const g = 'linear-gradient(45deg, rgb(74, 65, 231) 0%, rgb(233, 33, 109) 100%)'

const getPercent = (min, max, value) => Math.round(100 * (value - min) / (max - min))

export function updateGradient(min, max, sliderValue) {
    var sliderWidth = 100;

    const percent = getPercent(min, max, sliderValue)
    //Get the two closest colors
    var firstcolor = gradient[0][1];
    var secondcolor = gradient[1][1];
    
    //Calculate ratio between the two closest colors
    var firstcolor_x = 0;
    var secondcolor_x = sliderWidth - firstcolor_x;
    var slider_x = sliderWidth*(percent/100) - firstcolor_x;
    var ratio = slider_x/secondcolor_x
    
    //Get the color with pickHex(thx, less.js's mix function!)
    var result = pickHex(secondcolor, firstcolor, ratio);
    const color = 'rgb('+result.join()+')'
    const grad = `linear-gradient(90deg, rgb(74, 65, 231) 0%, ${color} 100%)`
    return grad
}

function pickHex(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}

export function setThumbMargin(min, max, sliderValue) {
    const percent = getPercent(min, max, sliderValue)
    const margin = percent > 50 ? '0 37px 0 0' : '0 0 0 37px';
    return margin
}