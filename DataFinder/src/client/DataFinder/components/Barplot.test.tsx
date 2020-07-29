import React from 'react'
import * as renderer from 'react-test-renderer'
import {Barplot} from './Barplot'
import {shallow} from 'enzyme'
import { PlotDatum, FilterCategory } from '../../typings/CubeData'
import { List } from 'immutable'
import { D3Barplot } from './d3/Barplot.d3'

const testData: List<PlotDatum> = List([
    {
        level: "Age",
        member: "0-10",
        participantCount: 10
    },
    {
        level: "Age", 
        member: "11-20",
        participantCount: 15
    },
    {
        level: "Age",
        member: "21-30",
        participantCount: 19
    }
])

const categories: FilterCategory[] = [
    {
        label: "0-10",
        sortorder: 0
    },
    {
        label: "11-20",
        sortorder: 0
    },
    {
        label: "21-30",
        sortorder: 0
    }
]

const props = {
    data: testData,
    name:"Age",
    width:300,
    height:300,
    categories:categories,
    countMetric:"Subject",
    barColor:"#32a852"
}

const config = {
    width: 280,
    height: 300,
    labels: ["21-30", "11-20", "0-10"],
    countMetric: "Subject",
    barColor: "#32a852"
}

describe("<Barplot />", () => {

    test("Render", () => {
        const tree = renderer.create(
            <Barplot {...props} />
        )
        expect(tree).toMatchSnapshot()
    })
    test("plots", () => {
        // Mocks
        const useEffect = jest.spyOn(React, "useEffect").mockImplementation(f => f());

        const createBarplot = jest.spyOn(D3Barplot, "create")
        const updateBarplot = jest.spyOn(D3Barplot, "update")

        const barplot = shallow(<Barplot {...props}/>)
        expect(createBarplot).toHaveBeenCalled()
        expect(createBarplot).toHaveBeenCalledTimes(1)
        expect(createBarplot).toHaveBeenCalledWith("Age", testData.toJS(), config)
        expect(updateBarplot).toHaveBeenCalled()
        expect(updateBarplot).toHaveBeenCalledTimes(1)
        expect(updateBarplot).toHaveBeenCalledWith("Age", testData.toJS(), config)

    })
})

