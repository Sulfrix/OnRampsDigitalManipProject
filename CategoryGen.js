let fs = require("fs");
let path = require("path");

let object = {};

function addWeapon(type, path) {
    if (!object[type]) {
        object[type] = [];
    }
    object[type].push(path);
}

function scanWeaponDir(folder, name) {
    let parts = fs.readdirSync(folder, {
        withFileTypes: false
    })
    for (let part of parts) {
        addWeapon(part.split(".")[0], path.join(folder, part))
    }
}

let basefolder = fs.readdirSync("assets/parts/");

basefolder.forEach((i) => {console.log(i)})

for (let folder of basefolder) {
    let folderPath = path.join("assets/parts/", folder)

    scanWeaponDir(folderPath, folder);
}

console.log(object);

fs.writeFileSync("categories.json", JSON.stringify(object), "utf-8");