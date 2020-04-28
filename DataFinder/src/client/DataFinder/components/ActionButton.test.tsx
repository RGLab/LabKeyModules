import React from 'react'
import * as renderer from 'react-test-renderer'
import * as ab from './ActionButton'
import { mount } from "enzyme";
import toJson from "enzyme-to-json";

describe("<ActionButton />", () => {
    test("Apply", () => {

        const tree = renderer.create(<ab.ActionButton onClick={() => { }} text={"Apply"} />).toJSON()
        expect(tree).toMatchSnapshot()
    })
})

describe("<DropdownButtons />", () => {
    test("Save", () => {
        const buttonData = [
            {
                label: "Save",
                action: () => { },
                disabled: false
            },
            {
                label: "Save As",
                action: () => {},
                disabled: true
            }
        ]
        const tree = renderer.create(<ab.DropdownButtons title={"Save"} buttonData={buttonData} />).toJSON()
        expect(tree).toMatchSnapshot()
    })
})

describe("<ClearDropdown/>", () => {
    test("Clear", () => {
        const tree = renderer.create(<ab.ClearDropdown clearAll={() => {}} reset={() => {}} />).toJSON()
        expect(tree).toMatchSnapshot()
    })
})

describe("<SaveDropdown />", () => {
    test("enabled", () => {
        const tree = renderer.create(<ab.SaveDropdown saveAs={() => {}} save={() => {}} disableSave={false} />).toJSON()
        expect(tree).toMatchSnapshot()
    })
    test("disabled", () => {
        const tree = renderer.create(<ab.SaveDropdown saveAs={() => {}} save={() => {}} disableSave={true} />).toJSON()
        expect(tree).toMatchSnapshot()
    })

    test("enabled to disabled", () => {
        const button = mount(<ab.SaveDropdown saveAs={jest.fn()} save={jest.fn()} disableSave={false}/>);

        // Ensure there are no disabled li tags
        expect(button.find('li.disabled').length).toEqual(0);

        // Update props and verify
        button.setProps({disableSave: true});

        // Ensure there is now one disabled li tags
        expect(button.find('li.disabled').length).toEqual(1)

        expect(toJson(button)).toMatchSnapshot();
        button.unmount();
    })
})

