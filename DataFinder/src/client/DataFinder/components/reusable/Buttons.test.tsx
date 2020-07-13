import React from 'react'
import * as renderer from 'react-test-renderer'
import * as buttons from './Buttons'
import { mount } from "enzyme";

describe("<HighlightedButton />", () => {
    test("render with all props", () => {
        const tree = renderer.create(<buttons.HighlightedButton label="Click me!" action={jest.fn()} id={"this-id"}/>).toJSON()
        expect(tree).toMatchSnapshot()  
    })
    test("change text", () => {
        const button = mount(<buttons.HighlightedButton action={jest.fn()} label={"Before"} />)
        expect(
            button.text()
          ).toEqual('Before')

        button.setProps({label: "After"})
        expect(
            button.text()
        ).toEqual("After")
    })
    test("id", () => {
        const button = mount(<buttons.HighlightedButton action={jest.fn()} label={"Button"} id={"test-button"} />)
        expect(button.find("#test-button").hostNodes().text()).toEqual("Button")
    })
    test("click", () => {
        const onClick = jest.fn()
        const button = mount(<buttons.HighlightedButton action={onClick} label={"Apply"}/>);
        expect(onClick.mock.calls.length).toBe(0)
        button.simulate("click")
        expect(onClick.mock.calls.length).toBe(1)
    })
    test("href", () => {
        const button =  mount(<buttons.HighlightedButton href={"go-to-site"} label={"Apply"}/>);
        expect(button.find('a[href="go-to-site"]').text()).toEqual("Apply")
    })
})


