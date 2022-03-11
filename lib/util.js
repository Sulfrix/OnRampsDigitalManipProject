// Some simple helper functions

function prettyPrintCategoryName(cat) { // Used for the capitalized names in the tabs
    switch (cat) {
        case "barrel":
            return "Barrels";
        case "receiver":
            return "Receivers";
        case "stock":
            return "Stocks";
        case "sight":
            return "Sights";
        case "attachment":
            return "Attachments";
        case "muzzle":
            return "Muzzle";
        case "pistol":
            return "Pistols";
    }
}

function rectFit(w1, h1, w2, h2) { // Fits a rectangle to another rectangle, retaining aspect ratio.
    let ratio1 = w1/h1;
    let ratio2 = w2/h2;
    if (ratio1 < ratio2) {
        let ratio = w1/w2;
        let height = h2*ratio;
        return {w: w1, h: height}
    } else {
        let ratio = h1/h2;
        let width = w2*ratio;
        return {w: width, h: h1}
    }
}

function rectFitEx(w1, h1, w2, h2) { // Extended function which also returns the offsets needed to center the part
    let out = rectFit(w1, h1, w2, h2);
    let baseCenterX = w1/2;
    let baseCenterY = h1/2;
    let sizeCenterX = out.w/2;
    let sizeCenterY = out.h/2;
    let diffX = baseCenterX-sizeCenterX;
    let diffY = baseCenterY-sizeCenterY;
    out.offsetX = diffX;
    out.offsetY = diffY;
    return out
}