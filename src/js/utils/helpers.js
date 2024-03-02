import * as d3 from "d3";


export function toggleClass(elementClass, toggleClass) {
    const element = document.getElementsByClassName(`${elementClass}`);
    element.classList.toggle(`${toggleClass}`);
}
export function euclidDistance(x1, y1, x2, y2) {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}

export function getUnique(value, index, self) {
    return self.indexOf(value) === index;
}

export function classExists(className) {
    return document.getElementsByClassName(`${className}`).length > 0;
}

export function addZeroes(num) {
    // Convert input string to a number and store as a variable.
    let value = Number(num);
    // Split the input string into two arrays containing integers/decimals
    const res = num.split(".");
    // If there is no decimal point or only one decimal place found.
    if (res.length === 1 || res[1].length < 2) {
        // Set the number to two decimal places
        value = Number(value).toFixed(2);
    }
    // Return updated or original number.
    return Number(value);
}

export function convertToFloat(input) {
    if (typeof input === 'number') {
        return input;
    }
    return parseFloat(input.replace(/ /g, '').replace(/E/g, 'e'));
}


export function setDecimalPlaces(data, fields, minimumFractionDigits = 2, maximumFractionDigits = 4) {

    for (const field of fields) {
        if (data[field] === null || data[field] === undefined || data[field] === "" || isNaN(data[field])) {
            if (field === 'pert_dose' || field === 'added_doses') {
                data[field] = data[field].toString().replace(/(\r\n|\n|\r)/gm, "|")
            } else {
                continue;
            }
        } else {
            const val = data[field];
            if (field === 'pert_dose') {
                minimumFractionDigits = 1;
                maximumFractionDigits = 8;
            }
            data[field] = setDecimalPlace(val, minimumFractionDigits, maximumFractionDigits);
        }
    }

    return data
}

export function setDecimalPlace(val, minimumFractionDigits = 2, maximumFractionDigits = 4) {

    if (val === null || val === undefined || isNaN(val) || val === 0) {
        return val;
    } else if (Math.abs(val) > 10 ** 4 || Math.abs(val) < 10 ** (maximumFractionDigits * -1)) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: maximumFractionDigits,
            minimumFractionDigits: minimumFractionDigits,
            notation: "scientific"
        }).format(val).replace("E", " E");
    } else {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: maximumFractionDigits,
            minimumFractionDigits: minimumFractionDigits,
            notation: "standard",
            useGrouping: false
        }).format(val);
    }
}

export function kde(kernel, thresholds, data) {
    return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
}

// handles multi-select + filtering arrays
export function updateSelectedArray(array, element) {
    if (array.indexOf(element) !== -1) {
        array.splice(array.indexOf(element), 1)
    } else {
        array.push(element);
    }
    return array;
}


// expects a sorted array of values and optional colorTheme
export function getCustomSequentialColorRange(domain, colorTheme) {
    let arr = domain.map((d, i) => i + 1) // turn strings into numbers

    if (arr.length <= 2) {
        arr = [...Array(4).keys()].map((d, i) => i + 1) // if only 2 doses, turn into 4 doses so that color scale colors are not so far apart
    }
    let step = 0; // old / not in use
    let values = [];
    let max = d3.max(arr) + step;
    let min = step;
    let scale;
    if (!colorTheme) {
        scale = d3.scaleSequential(d3.interpolateViridis).domain([max, min])
    } else if (colorTheme === "plasma") {
        scale = d3.scaleSequential(d3.interpolatePlasma).domain([max, min])
    } else if (colorTheme === "viridis") {
        scale = d3.scaleSequential(d3.interpolateViridis).domain([max, min])
    } else if (colorTheme === "inferno") {
        scale = d3.scaleSequential(d3.interpolateInferno).domain([max, min])
    }
    arr.forEach((d) => {
        values.push(scale(d + step)) // get list of evenly-spaced colors (light-dark)
    })
    return values
}

// returns values from data that are not in array. used to get values that are not in COMPOUND_OVERVIEW dose array
export function getValuesExcludedFromArray(array, data) {
    return data.filter(d => {
        if (!array.includes(d)) {
            return d
        }
    })
}

function getCPSAddedColors(array, colorTheme) {
    let colors = []
    let nest = d3.groups(array, d => d.split("|")[0])
    nest.forEach(d => {
        let local_colors = getCustomSequentialColorRange(d[1].reverse(), colorTheme)
        colors.push(local_colors)
    })
    return colors.flat()
}

export function getAddedColorsByScreenType(screen, array) {
    if (screen.type === "CPS") {
        return getCPSAddedColors(array, "plasma")
    } else {
        return getCustomSequentialColorRange(array, "plasma")
    }
}

export function sortAddedDosesByScreenType(screen, array) {
    if (screen.type === "CPS") {
        return array.sort(function (a, b) {
            return a.split("|")[0].localeCompare(b.split("|")[0]) || a.split("|")[1].split(" ")[1] - b.split("|")[1].split(" ")[1]
        })
    } else {
        return array.sort(function (a, b) {
            return d3.descending(a, b)
        })
    }
}

// used in data parsers for setting expected attributes that update via user input
export function getSelectionAttributes() {
    return {
        selected: false,
        highlighted: true,
        mouseover: false
    }
}

export function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}

export const __emptyOnBottom = function (a, b, high) {
    a = a || high;
    b = b || high;
    // return ((a < b) ? -1 : ((a > b) ? 1 : 0));
    return ((a > b) ? -1 : ((a < b) ? 1 : 0));
}

export function insertUniqueObject(arr, obj, attr) {
    if (attr === undefined) {
        attr = "id"
    }
    let isExist = arr.some(o => o[attr] === obj[attr]);
    if (!isExist) {
        arr.push(obj);
    } else {
        arr = arr.filter(o => o[attr] != obj[attr])
    }
    return arr;
}
