package org.labkey.test.components.immport;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class StudySummaryWindow extends StudySummaryPanel
{
    private WebElement _window;

    public StudySummaryWindow(BaseWebDriverTest test)
    {
        super(test);
        _window = Locator.css("div.study-detail").findElement(test.getDriver());
    }

    public void closeWindow()
    {
        elements().closeButton.findElement(_window).click();
        _test.shortWait().until(ExpectedConditions.stalenessOf(_window));
    }

    @Override
    public Elements elements()
    {
        return new Elements();
    }

    private class Elements extends StudySummaryPanel.Elements
    {
        Locator.CssLocator closeButton = Locator.css(".x4-tool-close");
    }
}
