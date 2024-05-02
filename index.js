import data, { getPath, svgHeight, svgWidth, svgViewBox } from "./data.js";

console.log(data);
const graphEle = document.querySelector("div.graph");
const graphXLabelEle = document.querySelector("div.graph-x-label");
const dotIndicatorEle = document.querySelector("circle.graph-dot-indicator")
// const _dotIndicatorEle = document.querySelector("div.graph-dot-indicator")
const lineIndicatorEle = document.querySelector("div.graph-line-indicator")
const lineIndicatorXEle = document.querySelector("span.graph-line-indicator-x")
const lineIndicatorYEle = document.querySelector("span.graph-line-indicator-y")
const graphSvgEle = document.querySelector("svg.graph-svg");
const graphSvgPathEle = document.querySelector("path.graph-svg-path")
const graphSvgPathClipEle = document.querySelector("path.graph-svg-path-clip")
const graphSvgPathGradiantEle = document.querySelector("path.graph-svg-path-gradiant")
const graphSvgPathClipGradiantEle = document.querySelector("path.graph-svg-path-clip-gradiant")
const graphSvgDefGradiantColorEle = document.querySelector("linearGradient#gradient-color")
const graphSvgDefGradiantGrayscaleEle = document.querySelector("linearGradient#gradient-grayscale")

let graphRect = graphEle.getBoundingClientRect();
let lineRect = lineIndicatorEle.getBoundingClientRect()
let gradiantPathRect = graphSvgPathGradiantEle.getBoundingClientRect();


const { path: pathDefinition, closedPath: closedPathDefinition, minXValue: x1Path, maxXValue: x2Path, minYValue: y1Path, maxXValue: y2Path } = getPath(data);


const event = new Event("offsetdistancechange");

let offsetDistance = 0;

function mapRange(value, inputStart, inputEnd, outputStart, outputEnd) {
    return ((value - inputStart) / (inputEnd - inputStart)) * (outputEnd - outputStart) + outputStart;
}

function calculateIndexFromPercentage(offsetDistance, dataArrayLength) {
    const percentage = parseFloat(offsetDistance) / 100; // Convert to a decimal (e.g., 50% to 0.5)
    const index = Math.floor((dataArrayLength - 1) * percentage);
    return index;
}

const setOffsetDistance = () => {
    graphRect = graphEle.getBoundingClientRect();
    lineRect = lineIndicatorEle.getBoundingClientRect()
    gradiantPathRect = graphSvgPathGradiantEle.getBoundingClientRect();

    graphSvgDefGradiantColorEle.setAttribute("y1", gradiantPathRect.top - graphRect.top)
    graphSvgDefGradiantColorEle.setAttribute("y2", svgHeight)

    graphSvgDefGradiantGrayscaleEle.setAttribute("y1", gradiantPathRect.top - graphRect.top)
    graphSvgDefGradiantGrayscaleEle.setAttribute("y2", svgHeight)

    dotIndicatorEle.style.setProperty("offset-distance",
        `calc(${offsetDistance}%)`
    )
    graphSvgPathClipEle.setAttribute("stroke-dashoffset", 1 - offsetDistance / 100)

    if (offsetDistance === 0) {
        graphSvgPathClipEle.setAttribute("opacity", 0)
    } else {
        graphSvgPathClipEle.setAttribute("opacity", 1)
    }

    setLineIndicatorPosition()
}

const setLineIndicatorPosition = () => {
    const dotRect = dotIndicatorEle.getBoundingClientRect()
    const dotCTM = dotIndicatorEle.getCTM();
    const gradiantPathCTM = graphSvgPathGradiantEle.getCTM();

    const dotCenterX = dotCTM.e;
    const dotCenterY = dotCTM.f;

    console.log({ dotCenterX, dotCenterY, dotRect, gradiantPathRect, graphRect, svgViewBox, dotCTM, gradiantPathCTM, cbb: graphSvgPathGradiantEle.getBBox(), adfasd: mapRange(dotCenterX, gradiantPathCTM.e, gradiantPathRect.right - gradiantPathRect.x + gradiantPathCTM.e, 0, svgWidth) });

    lineIndicatorEle.style.setProperty("transform", `translateX(${dotCenterX - lineRect.width / 2}px)`)
    lineIndicatorEle.style.setProperty("top", `${dotCenterY}px`)

    const clipPath = `inset(-4px ${svgWidth - mapRange(dotCenterX, gradiantPathCTM.e, gradiantPathRect.right - gradiantPathRect.x + gradiantPathCTM.e, 0, svgWidth)}px -4px 0)`;


    graphSvgPathClipGradiantEle.style.setProperty("clip-path", clipPath)



    const newLocal = Math.floor(mapRange(dotCenterX + 1, gradiantPathCTM.e, gradiantPathRect.right - gradiantPathRect.x + gradiantPathCTM.e, 0, data.length - 1));
    // Safety check to ensure index is within bounds
    const safeIndex = Math.min(Math.max(newLocal, 0), data.length - 1);

    const coordinate = data[safeIndex] ?? data.at(-1);

    const xLabel = new Date(coordinate[0])

    lineIndicatorXEle.innerHTML = `${xLabel.getDate()}/${xLabel.getMonth()} ${xLabel.getHours()}:${xLabel.getMinutes()}`

    lineIndicatorYEle.innerHTML = coordinate[1]
}

window.addEventListener("resize", function () {
    graphRect = graphEle.getBoundingClientRect();
    lineRect = lineIndicatorEle.getBoundingClientRect()
    gradiantPathRect = graphSvgPathGradiantEle.getBoundingClientRect();

    setOffsetDistance(0)
})

window.addEventListener("mousemove",
    /**
     * @param {MouseEvent} e
     */
    function (e) {

        const eXGraph = e.clientX - graphRect.left
        const eYGraph = e.clientY - graphRect.top;

        if (eYGraph < 0 || eYGraph > graphRect.height) return;



        if (eXGraph < 0) {
            if (offsetDistance === 0) return;
            offsetDistance = 0;
        }
        else if (eXGraph > graphRect.width) {
            if (offsetDistance === 100) return;
            offsetDistance = 100;
        } else {
            offsetDistance = (eXGraph / graphRect.width) * 100
        }

        setOffsetDistance();

    }
    , { capture: true })

window.addEventListener("touchmove",
    /**
     * @param {TouchEvent} e
     */
    function (e) {
        // Prevent the default touch behavior like scrolling
        e.preventDefault();

        // Assuming single touch point for simplicity
        const touch = e.touches[0];

        const eXGraph = touch.clientX - graphRect.left;
        const eYGraph = touch.clientY - graphRect.top;

        if (eYGraph < 0 || eYGraph > graphRect.height) return;

        if (eXGraph < 0) {
            if (offsetDistance === 0) return;
            offsetDistance = 0;
        } else if (eXGraph > graphRect.width) {
            if (offsetDistance === 100) return;
            offsetDistance = 100;
        } else {
            offsetDistance = (eXGraph / graphRect.width) * 100;
        }

        setOffsetDistance(offsetDistance);

    },
    { passive: false } // Setting passive to false to prevent the default event
);


window.addEventListener("load", function () {
    this.window.dispatchEvent(event);

    graphSvgEle.setAttribute("viewBox", svgViewBox.join(" "));

    graphEle.style.setProperty("--d", `"${pathDefinition}"`)
    graphSvgPathEle.setAttribute("d", pathDefinition)
    graphSvgPathClipEle.setAttribute("d", pathDefinition)
    graphSvgPathGradiantEle.setAttribute("d", closedPathDefinition)
    graphSvgPathClipGradiantEle.setAttribute("d", closedPathDefinition)

    let lastDate = new Date(data[0][0]);
    const xLabels = [new Date(data[0][0])];

    for (let i = 0; i < data.length; i++) {
        const [x, y] = data[i];
        const currentDate = new Date(x);

        if (lastDate.getDate() !== currentDate.getDate() || lastDate.getMonth() !== currentDate.getMonth()) {
            xLabels.push(currentDate);
        }

        lastDate = currentDate;

    }


    graphXLabelEle.innerHTML = xLabels.map(date => `<span>${date.getMonth()}/${date.getDate()}</span>`).join("\n");

    // Defer the setting offset distance important for consistent feel

    setOffsetDistance(0)
});
window.addEventListener('contextmenu', event => event.preventDefault());
