import React from 'react'
import { createTinyHeatmapConsts , TinyHeatmap, createTinyHeatmapYaxisScale} from './TinyHeatmap'
import * as renderer from 'react-test-renderer'
import {shallow} from 'enzyme'
import { D3TinyHeatmap } from './d3/TinyHeatmap.d3'


describe("createTinyHeatmapConsts", () => {
    const thc = createTinyHeatmapConsts();

    test("width", () => {
        expect(thc).toHaveProperty("width", 260)
    })

    test("colorScale", () => {
        expect(thc).toHaveProperty("colorScale")
        expect(thc.colorScale(11)).toBe("#A1D99B")
    })

    test("xaxisScale", () => {
        expect(thc).toHaveProperty("xaxisScale")
        expect(thc.xaxisScale("<0")).toBeCloseTo(0)
    })

})

describe("createTinyHeatmapYaxisScale", () => {
    const scale = createTinyHeatmapYaxisScale(["assay1", "assay2"])

    test("scale", () => {
        expect(scale.bandwidth()).toBeCloseTo(10)
        expect(scale.range()).toEqual([0, 20])
        expect(scale("assay1")).toBeCloseTo(0)
    })

})

describe("<TinyHeatmap />", () => {
    const consts = createTinyHeatmapConsts()
    const props = {
        name: "test", 
        heatmapInfo: {
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
    }

    test("Renders", () => {
        const tree = renderer.create(
            <TinyHeatmap {...props} />
        )
        expect(tree).toMatchSnapshot()
    })
    test("performs plotting side effect", () => {
        const useEffect = jest.spyOn(React, "useEffect").mockImplementation(f => f());
        const drawTinyHeatmap = jest.spyOn(D3TinyHeatmap, "drawTinyHeatmap")

        const heatmap = shallow(<TinyHeatmap {...props}/>)
        expect(drawTinyHeatmap).toHaveBeenCalled()
        expect(drawTinyHeatmap).toHaveBeenCalledTimes(1)

        drawTinyHeatmap.mockClear()
    })
    test("doesn't plot when there's no data", () => {
        const useEffect = jest.spyOn(React, "useEffect").mockImplementation(f => f());
        const drawTinyHeatmap = jest.spyOn(D3TinyHeatmap, "drawTinyHeatmap")

        props.heatmapInfo.data = []
        const heatmap = shallow(<TinyHeatmap {...props}/>)
        expect(drawTinyHeatmap).not.toHaveBeenCalled()
    })
})