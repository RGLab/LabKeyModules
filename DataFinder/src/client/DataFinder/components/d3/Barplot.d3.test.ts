import * as d3 from 'd3'
import { D3Barplot } from './Barplot.d3'
import { PlotDatum } from '../../../typings/CubeData';

describe("D3Barplot", () => {

    // setup
    const config = {
        width: 300,
        height: 300,
        totalHeight: 300,
        labels: ["a", "b", "c", "d"],
        countMetric: "studyCount",
        barColor: "#af88e3"
    }
    const data: PlotDatum[] = [
        {
            level: "Age",
            member: "a",
            studyCount: 10
        },
        {
            level: "Age",
            member: "b",
            studyCount: 50
        },
        {
            level: "Age",
            member: "c",
            studyCount: 12
        },
        {
            level: "Age",
            member: "d",
            studyCount: 42
        }
    ]
    const newData: PlotDatum[] = [
        {
            level: "Age",
            member: "a",
            studyCount: 88
        },
        {
            level: "Age",
            member: "b",
            studyCount: 99
        },
        {
            level: "Age",
            member: "c",
            studyCount: 77
        },
        {
            level: "Age",
            member: "d",
            studyCount: 66
        }
    ]

    document.body.innerHTML =
        `<div id="test-age" >
            <div class="df-barplot-title"><h4>Age</h4></div>
            <div id="barplot-container-Age" class="datafinder-barplot">
                <svg></svg>
            </div>
            <div id="xaxis-Age"}>
                <svg></svg>
            </div>
        </div>`

    const oldXaxisScale = d3
        .scaleLinear()
        .domain([0, 50]).nice()
        .range([0, config.width - 15 - 100]);

    const newXaxisScale = d3
        .scaleLinear()
        .domain([0, 99]).nice()
        .range([0, config.width - 15 - 100]);

    D3Barplot.create("Age", data, config)
    const plot = document.getElementById('test-age')

    test("Create", () => {

        const plotTxt = plot.innerHTML
        expect(plotTxt).toMatchSnapshot()
    })

    test("yaxis", () => {
        const yaxis = document.getElementById("yaxis-labels-short-Age")
        const labels = yaxis.getElementsByTagName("text")
        expect(labels.length).toEqual(4)
        expect(labels[1].innerHTML).toEqual("b")
    })

    test("Update", () => {
        D3Barplot.update("Age", data, config)
        const updatedPlot = document.getElementById('test-age')
        const updatedPlotTxt = updatedPlot.innerHTML
        expect(updatedPlotTxt).toMatchSnapshot()
    })

    test("OldData", () => {
        const barplot = document.getElementById('bars-Age')
        const bars = barplot.getElementsByTagName("rect")
        expect(bars.length).toEqual(4)
        expect(parseFloat(bars[0].getAttribute("width"))).toBeCloseTo(oldXaxisScale(10))
    })

    test("NewData", () => {
        D3Barplot.update("Age", newData, config);
        const barplot = document.getElementById('bars-Age')
        const bars = barplot.getElementsByTagName("rect")
        expect(bars.length).toEqual(4)
        expect(parseFloat(bars[0].getAttribute("width"))).toBeCloseTo(oldXaxisScale(10))

        // wait for transition
        setTimeout(() => {
            const barplot = document.getElementById('bars-Age')
            const bars = barplot.getElementsByTagName("rect")
            expect(bars.length).toEqual(4)
            expect(parseFloat(bars[0].getAttribute("width"))).toBeCloseTo(newXaxisScale(88))
        }, 500)


    })
})

