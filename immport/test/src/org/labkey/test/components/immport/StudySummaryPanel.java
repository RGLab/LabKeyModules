package org.labkey.test.components.immport;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;

public abstract class StudySummaryPanel
{
    protected BaseWebDriverTest _test;
    protected WebElement _panel;

    public StudySummaryPanel(BaseWebDriverTest test)
    {
        _test = test;
        _panel = Locators.self.waitForElement(test.getDriver(), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
        elements().accession.waitForElement(_panel, BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    public String getAccession()
    {
        return elements().accession.findElement(_panel).getText();
    }

    public String getTitle()
    {
        return elements().title.findElement(_panel).getText();
    }

    public String getPI()
    {
        return elements().PI.findElement(_panel).getText();
    }

    public String getOrganization()
    {
        return elements().organization.findElement(_panel).getText();
    }

    public WebElement getImmportLink()
    {
        return elements().immportLink.findElement(_panel);
    }

    public List<Paper> getPapers()
    {
        List<WebElement> paperEls = elements().paper.findElements(_panel);
        List<Paper> papers = new ArrayList<>();

        for (WebElement el : paperEls)
        {
            papers.add(new Paper(el));
        }

        return papers;
    }

    protected Elements elements()
    {
        return new Elements();
    }

    protected class Elements
    {
        Locator.CssLocator accession = Locator.css(".study-accession");
        Locator.CssLocator title = Locator.css(".study-title");
        Locator.CssLocator PI = Locator.css(".study-pi");
        Locator.CssLocator organization = Locator.css(".study-organization");
        Locator.CssLocator paper = Locator.css(".study-papers > p");
        Locator immportLink = Locator.linkWithText("ImmPort");
    }

    private static class Locators
    {
        private static Locator self = Locator.css("div#demographics.main");
    }

    private class Paper
    {
        private WebElement paper;

        private Paper(WebElement el)
        {
            this.paper = el;
        }

        public String getJournal()
        {
            return elements().journal.findElement(paper).getText();
        }

        public String getYear()
        {
            return elements().year.findElement(paper).getText();
        }

        public String getTitle()
        {
            return elements().title.findElement(paper).getText();
        }

        public WebElement getPubMedLink()
        {
            return elements().pubMedLink.findElement(paper);
        }

        private Elements elements()
        {
            return new Elements();
        }

        private class Elements
        {
            Locator journal = Locator.css(".pub-journal");
            Locator year = Locator.css(".pub-year");
            Locator title = Locator.css(".pub-title");
            Locator pubMedLink = Locator.linkWithText("PubMed");
        }
    }
}
