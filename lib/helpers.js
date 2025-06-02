import { OPENTYPE_FEATURES } from "./constants";

const GRADIENT = [
  [0, [74, 65, 231]],
  [100, [233, 33, 109]],
];

function getPercent(min, max, value) {
  return Math.round((100 * (value - min)) / (max - min));
}

// Thanks to Felipe Ribeiro: http://jsfiddle.net/vksn3yLL/
export function updateGradient(min, max, sliderValue) {
  const WIDTH = 100;
  const percent = getPercent(min, max, sliderValue);
  //Get the two closest colors
  var firstcolor = GRADIENT[0][1];
  var secondcolor = GRADIENT[1][1];

  //Calculate ratio between the two closest colors
  var firstcolor_x = 0;
  var secondcolor_x = WIDTH - firstcolor_x;
  var slider_x = WIDTH * (percent / 100) - firstcolor_x;
  var ratio = slider_x / secondcolor_x;

  //Get the color with pickHex
  var result = pickHex(secondcolor, firstcolor, ratio);
  const color = "rgb(" + result.join() + ")";
  // const full_gradient = 'linear-gradient(45deg, rgb(74, 65, 231) 0%, rgb(233, 33, 109) 100%)'
  const grad = `linear-gradient(90deg, rgb(74, 65, 231) 0%, ${color} 100%)`;
  return grad;
}

function pickHex(color1, color2, weight) {
  var p = weight;
  var w = p * 2 - 1;
  var w1 = (w / 1 + 1) / 2;
  var w2 = 1 - w1;
  var rgb = [
    Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2),
  ];
  return rgb;
}

export function buildFont(font, name) {
  const FEATURES = font.tables.gsub?.features.map((f) => {
    return { tag: f.tag, lookupListIndex: f.feature.lookupListIndexes[0] };
  });
  const LOOKUPS = font.tables.gsub?.lookups;
  const GLYPHS_BY_TAG = {};

  FEATURES?.map((feature) => {
    if (LOOKUPS[feature.lookupListIndex]?.lookupType !== 1) return;
    switch (LOOKUPS[feature.lookupListIndex].lookupType) {
      // LOOKUP TYPE 1: SINGLE GLYPH SUBSTITUTIONS
      case 1:
        const gs = [];
        LOOKUPS[feature.lookupListIndex].subtables.map((sub) => {
          switch (sub.coverage.format) {
            // SINGLE SUBSTITUTION FORMAT 1
            case 1:
              {
                sub.coverage.glyphs.map((glyph) => {
                  if (glyph) {
                    const char = String.fromCharCode(
                      font.glyphs.get(glyph).unicode
                    );
                    gs.push(char.length > 1 ? `[${char}]` : char);
                  }
                });
                const set = Array.from(new Set(gs));
                GLYPHS_BY_TAG[feature.tag] =
                  GLYPHS_BY_TAG[feature.tag] != undefined
                    ? [...GLYPHS_BY_TAG[feature.tag], ...set]
                    : [...set];
              }
              break;
            // SINGLE SUBSTITUTION FORMAT 2
            case 2:
              {
                const hello = sub.coverage.ranges.reduce(
                  (acc1, { start, end }) => [
                    ...acc1,
                    ...Array.from(
                      Array(end - start + 1),
                      (_, x) => x + start
                    ).map((i) => {
                      const char = String.fromCharCode(
                        font.glyphs.get(i).unicode
                      );
                      return char.length > 1 ? `[${char}]` : char;
                    }),
                  ],
                  []
                );
                const set = Array.from(new Set(hello));
                GLYPHS_BY_TAG[feature.tag] =
                  GLYPHS_BY_TAG[feature.tag] != undefined
                    ? [...GLYPHS_BY_TAG[feature.tag], ...set]
                    : [...set];
              }
              break;
            default:
              break;
          }
          if (sub.substFormat !== 1) return;
        });
        break;
      default:
        break;
    }
  });
  Object.keys(GLYPHS_BY_TAG).map((tag) => {
    GLYPHS_BY_TAG[tag] = Array.from(new Set(GLYPHS_BY_TAG[tag]));
  });

  //filter out unwanted features
  //sort by stylistic alternatives (SSXX) first
  var ORDERED_FEATURES = {};
  ORDERED_FEATURES = Object.keys(GLYPHS_BY_TAG)
    .filter(
      (tag) =>
        !(
          tag === "aalt" ||
          tag === "salt" ||
          tag === "sinf" ||
          tag === "locl" ||
          tag === "case" ||
          tag === "numr" ||
          tag === "pnum" ||
          tag === "rvrn" ||
          tag === "dnom"
        )
    )
    .sort((a, b) => {
      //sort SSXX ascending
      if (a.toString().includes("ss") && b.toString().includes("ss")) {
        return (
          parseInt(a.toString().substring(2)) -
          parseInt(b.toString().substring(2))
        );
      } else if (a.toString().includes("ss") || b.toString().includes("ss"))
        return 1;
      return -1;
    })
    .reduce((obj, key) => {
      obj[key] = GLYPHS_BY_TAG[key];
      return obj;
    }, {});

  const getFeatureName = (tag) => {
    if (tag.includes("ss")) {
      const registeredName =
        font.tables.name[255 + parseInt(tag.substring(2))]?.en;
      if (registeredName !== undefined) return registeredName;
    }
    return OPENTYPE_FEATURES[tag] ?? "Alternative";
  };

  return {
    name: name,
    credits: {
      copyright: font.tables.name.copyright?.en ?? "",
      designer: font.tables.name.designer?.en ?? "",
      designerURL: font.tables.name.designerURL?.en ?? "",
      preferredFamily: font.tables.name.preferredFamily?.en ?? "",
      license: font.tables.name.license?.en ?? "",
    },
    axes: font.tables.fvar?.axes,
    instances: font.tables.fvar?.instances,
    features:
      Object.keys(ORDERED_FEATURES).length > 0
        ? Object.keys(ORDERED_FEATURES).map((tag) => ({
            tag: tag,
            name: getFeatureName(tag),
          }))
        : null,
  };
}

export function updateElementPosition(el, x, y) {
  el.style.position = "absolute";
  el.style.left = x + "px";
  el.style.top = y + "px";
}
