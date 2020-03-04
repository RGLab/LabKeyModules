import React from 'react'
import * as renderer from 'react-test-renderer'
import * as ab from './ActionButton'

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
})

