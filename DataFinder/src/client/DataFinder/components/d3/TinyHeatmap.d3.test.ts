import * as d3 from 'd3'
import {D3TinyHeatmap} from './TinyHeatmap.d3'
import { TinyHeatmapInfo } from '../../../typings/StudyCard'
import { createTinyHeatmapConsts, createTinyHeatmapYaxisScale } from '../TinyHeatmap'

describe("drawTinyHeatmap", () => {

    // setup
    const consts = createTinyHeatmapConsts()

    const info: TinyHeatmapInfo = {
        data: [
            {   x: "0",
                y: "HAI",
                participantCount: 15,
                studyCount: 1,
                data: undefined},
            {
                x: "1",
                y: "GE",
                participantCount: 30,
                studyCount: 1,
                data: undefined
            }
        ],
        assays: ["HAI", "GE"],
        height: 50,
        width: consts.width,
        yaxisScale: createTinyHeatmapYaxisScale(["HAI", "GE"]),
        xaxisScale: consts.xaxisScale,
        colorScale: consts.colorScale
    }

    document.body.innerHTML =
    `<div class="tinyheatmap" >
        <svg id="tinyheatmap-test"></svg>
    </div>`

    D3TinyHeatmap.drawTinyHeatmap({name: "test", heatmapInfo: info})
    const plot = document.getElementById('tinyheatmap-test')
    
    test("draw", () => {

        const plotTxt = plot.innerHTML
        expect(plotTxt).toMatchSnapshot()

    })

    test("yaxis", () => {
        const yaxis = document.getElementById("yaxis-labels-test")
        const labels = yaxis.getElementsByTagName("text")
        expect(labels.length).toEqual(2)
        expect(labels[1].innerHTML).toEqual("GE")
    })

    test("xaxis", () => {
        const xaxis = document.getElementById("xaxis-labels-test")
        const labels = xaxis.getElementsByTagName("text")
        expect(labels.length).toEqual(consts.timepoints.length)
    })

    test("rects", () => {
        const rects = document.getElementsByTagName("rect")
        expect(rects.length).toEqual(2)
    })




})