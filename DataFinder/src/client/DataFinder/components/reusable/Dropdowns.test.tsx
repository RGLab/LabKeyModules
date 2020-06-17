import React from 'react'
import * as renderer from 'react-test-renderer'
import * as dropdowns from './Dropdowns'
import { mount } from "enzyme";
import toJson from "enzyme-to-json";

describe("<InnerDropdownButtons />", () => {
    const buttonData = [
        {
            label: "option1"
        },{
            label: "option2",
            buttonData: [{label: "option3"}]
        }
    ]
    test("Render", () => {
        const tree = renderer.create(<dropdowns.InnerDropdownButtons title={"test"} buttonData={buttonData} />).toJSON()
        expect(tree).toMatchSnapshot()
    })
    test("Content", () => {
        const dropdown = mount(<dropdowns.InnerDropdownButtons title={"test"} buttonData={buttonData} />)
        expect(dropdown.find("button").length).toEqual(4)
        expect(dropdown.find("InnerDropdownContent").length).toEqual(2)
        expect(dropdown.find("InnerDropdownContent").first().children().find("InnerDropdownContent").length).toEqual(1)
    })
    test("open", () => {
        const dropdown = mount(<dropdowns.InnerDropdownButtons title={"test"} buttonData={buttonData} />)
        expect(dropdown.find("InnerDropdownContent").first().prop("open")).toBeFalsy()
        dropdown.find("button").first().simulate("click")
        expect(dropdown.find("InnerDropdownContent").first().prop("open")).toBeTruthy()
    })
})

describe("<OuterDropdownButtons />", () => {
    test("Render", () => {
        const tree = renderer.create(
            <dropdowns.OuterDropdownButton title={"Test"}><div id="test-div"/></dropdowns.OuterDropdownButton>
        ).toJSON()
        expect(tree).toMatchSnapshot()
    })
    test("Children", () => {
        const button = mount(
            <dropdowns.OuterDropdownButton title={"Test"}><div id="test-div"/></dropdowns.OuterDropdownButton>
        )
        expect(button.find(".df-outer-dropdown").length).toEqual(1)
        expect(button.find(".df-outer-dropdown>.btn").children().length).toEqual(2)
        expect(button.find(".df-outer-dropdown>.btn").children().last().html()).toEqual('<div id="test-div"></div>')
    })
})


describe("<DropdownButtons />", () => {
    const clickMock1 = jest.fn()
    const clickMock2 = jest.fn()
    const buttonData = [
        {
            label: "Single Button",
            action: clickMock1
        },
        {
            label: "Nest",
            buttonData: [
                {
                    label: "egg1",
                    href: "#"
                },
                {
                    label: "another nest",
                    buttonData: [
                        {label:"super nested egg", action: clickMock2}
                    ]
                },
                {
                    label: "egg2"
                }
            ]
        }
    ]
    test("Render", () => {
        const tree = renderer.create(<dropdowns.DropdownButtons title={"Save"} buttonData={buttonData} />).toJSON()
        expect(tree).toMatchSnapshot()
    })

    test("Contents", () => {
        const nestedDropdown = mount(<dropdowns.DropdownButtons title={"Dropdown"} buttonData={buttonData}/>)
        expect(nestedDropdown.find("button").length).toEqual(7)
        expect(nestedDropdown.find(".dropdown-menu").length).toEqual(3)
        expect(nestedDropdown.find(".df-sub-dropdown").length).toEqual(2)
        expect(nestedDropdown.find("a").length).toEqual(4)
        expect(nestedDropdown.find('a[href="#"]').length).toEqual(1)
    })

    test("actions", () => {
        const nestedDropdown = mount(<dropdowns.DropdownButtons title={"Dropdown"} buttonData={buttonData}/>)
        
        expect(clickMock1.mock.calls.length).toEqual(0)
        nestedDropdown.findWhere(x => x.text() == "Single Button").find("button").simulate("click")
        expect(clickMock1.mock.calls.length).toEqual(1)

        expect(clickMock2.mock.calls.length).toEqual(0)
        nestedDropdown.findWhere(x => x.text() == "super nested egg").find("button").simulate("click")
        expect(clickMock2.mock.calls.length).toEqual(1)
    })
})

