function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
const urlVars = getUrlVars();

// number -> [number]
function arrTime(unixTime) {
    var time = unixTime;
    const output = [];

    while (time !== 0) {
        var digit = time % 10;
        output.push(digit);
        time = Math.floor(time / 10);
    }

    return output;
}

// hue changes over 100 seconds
function timeToColour(time) {
    const l = "80%";
    const s = "70%";

    const hBaseValue = time[3] * 10 + time[2];
    const h = hBaseValue * 3.6;
    return `hsl(${h}, ${s}, ${l})`;
}

function polarToCartesian(r, theta) {
    return [
        r * Math.cos(theta),
        r * Math.sin(theta)
    ];
}

const easeFunc = (() => {
    switch (urlVars["easing"]) {
        case "cubic":
            return easeCubic;
        case "elastic":
            return easeElastic;
        case "sine":
            return easeSine;
        case "linear":
        default:
            return easeLinear;
    }
})();

// chord movement function based on 1000 seconds
function moveChord(time) {
    // define a chord
    const startAngle = (time[3] * 3 + time[4] + time[5]) % 360;
    const endAngle = (time[3] * 7 + time[4] + time[5])  % 360;
    
    const r = canvas.height / 4;
    const startCoords = polarToCartesian(r, startAngle);
    const endCoords = polarToCartesian(r, endAngle);

    const diffCoords = [
        -(startCoords[0] - endCoords[0]),
        -(startCoords[1] - endCoords[1])
    ];

    // move to position along that chord based on 0.1s and 0.01s
    const movementFraction = easeFunc((time[2] * 10 + time[1]) / 100);
    return [
        startCoords[0] + (diffCoords[0] * movementFraction),
        startCoords[1] + (diffCoords[1] * movementFraction)
    ];
}

function easeLinear(linFraction) {
    return linFraction;
}

function easeCubic(linFraction) {
    return 1 - Math.pow(1 - linFraction, 3);
}

function easeElastic(linFraction) {
    const c4 = (2 * Math.PI) / 3;

    return linFraction === 0
      ? 0
      : linFraction === 1
      ? 1
      : Math.pow(2, -10 * linFraction) * Math.sin((linFraction * 10 - 0.75) * c4) + 1;
}

function easeSine(linFraction) {
    return -(Math.cos(Math.PI * linFraction) - 1) / 2;
}

// move in diagonal lines each second
function moveLines(time) {
    const offset = time[4];
    const slice = time[3];
    const progress = ((time[2] * 10 + time[1] + time[4] * 10 + time[3]) % 100) / 100;

    const hMovement = canvas.width / 20;

    return [
        (slice - 4) * hMovement + progress * hMovement,
        -(canvas.height / 6) + progress * (canvas.height / 3)
    ]
}

/**
 * Canvas stuff below
 */

var canvas = oCanvas.create({
    canvas: "#canvas",
    background: "#111",
    fps: 60
});

const objects = [];

for (var i = 0; i < 100; i++) {
    const obj = canvas.display.ellipse({
        radius: 5
    }).add();
    objects.push(obj);
}

function move(time, obj) {
    var relCoords;

    // const nowSecond = Math.floor(Date.now() / 10000);
    // if (nowSecond % 2 == 0) {
    //     relCoords = moveChord(time);
    // }
    // else {
    //     relCoords = moveLines(time);
    // }
    relCoords = moveChord(time);
    obj.x = canvas.width / 2 + relCoords[0];
    obj.y = canvas.height / 2 + relCoords[1];
}

canvas.setLoop(function() {
    for (var i = 0; i < objects.length; i++) {
        const fillTime = arrTime(Date.now() + i * 1000);
        const posTime = arrTime(Date.now() + i * 2000);
        objects[i].fill = timeToColour(fillTime);
        move(posTime, objects[i]);
    }
});

canvas.timeline.start();
