// put helper functions here

function prettyPrintCategoryName(cat) {
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

function rectSize(w1, h1, w2, h2) {
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