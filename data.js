const data = [
    ["2023-05-03 22:00", 7795],
    ["2023-05-03 23:00", 7801],
    ["2023-05-04 00:00", 7789],
    ["2023-05-04 01:00", 7799],
    ["2023-05-04 02:00", 7801],
    ["2023-05-04 03:00", 7793],
    ["2023-05-04 04:00", 7805],
    ["2023-05-04 05:00", 7807],
    ["2023-05-04 06:00", 7801],
    ["2023-05-04 07:00", 7813],
    ["2023-05-04 08:00", 7803],
    ["2023-05-04 09:00", 7817],
    ["2023-05-04 10:00", 7810],
    ["2023-05-04 11:00", 7821],
    ["2023-05-04 12:00", 7811],
    ["2023-05-04 13:00", 7825],
    ["2023-05-04 14:00", 7823],
    ["2023-05-04 15:00", 7829],
    ["2023-05-04 16:00", 7819],
    ["2023-05-04 17:00", 7831],
    ["2023-05-04 18:00", 7835],
    ["2023-05-04 19:00", 7827],
    ["2023-05-04 20:00", 7840],
    ["2023-05-04 21:00", 7830],
    ["2023-05-04 22:00", 7844],
    ["2023-05-04 23:00", 7836],
    ["2023-05-05 00:00", 7849],
    ["2023-05-05 01:00", 7841],
    ["2023-05-05 02:00", 7855],
    ["2023-05-05 03:00", 7853],
    ["2023-05-05 04:00", 7847],
    ["2023-05-05 05:00", 7861],
    ["2023-05-05 06:00", 7859],
    ["2023-05-05 07:00", 7850],
    ["2023-05-05 08:00", 7866],
    ["2023-05-05 09:00", 7864],
    ["2023-05-05 10:00", 7868],
    ["2023-05-05 11:00", 7857],
]
export const svgWidth = 400;
export const svgHeight = 300;
export const svgViewBox = [-12, -12, svgWidth + (12 * 2), svgHeight + (12 * 2)];

const lerp = (start, end, t) => start * (1 - t) + end * t;

export function getPath(data = data, tension = 0.8, flatten = 0.8) {
    const pathCommands = [];

    const yValues = data.map(point => point[1]);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const avgY = (minY + maxY) / 2;

    const getRawPoint = (index) => {
        const xValue = (svgWidth / data.length) * index;
        const diffMaxMin = (maxY - minY);
        const yValue = (svgHeight / diffMaxMin) * (data[index][1] - minY);
        return [xValue, yValue];
    };

    // Calculate bounding box of the raw path
    const allRawPoints = data.map((_, index) => getRawPoint(index));
    const minXValue = Math.min(...allRawPoints.map(p => p[0]));
    const maxXValue = Math.max(...allRawPoints.map(p => p[0]));
    const minYValue = Math.min(...allRawPoints.map(p => p[1]));
    const maxYValue = Math.max(...allRawPoints.map(p => p[1]));

    // Calculate offsets to center the path in the viewBox
    const offsetX = (svgWidth - (maxXValue - minXValue)) / 2 - minXValue;
    const offsetY = (svgHeight - (maxYValue - minYValue)) / 2 - minYValue;

    const getPoint = (index) => {
        const xValue = (svgWidth / (data.length - 1)) * index;
        const diffMaxMin = (maxY - minY);
        const originalYValue = svgHeight - (svgHeight / diffMaxMin) * (data[index][1] - minY);
        const flatYValue = svgHeight - (svgHeight / diffMaxMin) * (avgY - minY);

        const yValue = lerp(originalYValue, flatYValue, flatten);

        return [xValue, yValue];
    };


    for (let i = 0; i < data.length; i++) {
        const [xValue, yValue] = getPoint(i);

        if (i === 0) {
            pathCommands.push(`M${xValue},${yValue}`);
        } else {
            const [prevX, prevY] = getPoint(i - 1);
            const dx = xValue - prevX;
            const dy = yValue - prevY;

            const cp1x = prevX + tension * dx;
            const cp1y = prevY;
            const cp2x = xValue - tension * dx;
            const cp2y = yValue;

            pathCommands.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${xValue},${yValue}`);
        }
    }


    return {
        path: pathCommands.join(" "), closedPath: (() => {
            pathCommands.push(`L${svgWidth},${svgHeight}`);
            pathCommands.push(`L0,${svgHeight}`);
            pathCommands.push('Z');
            return pathCommands.join(" ")
        })(), minXValue, maxXValue, minYValue, maxXValue
    };
}

export function getPathLength(pathData) {
    // Create a new SVG path element
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', pathData);

    // Return the total length of the path
    return pathElement.getTotalLength();
}


export default data;