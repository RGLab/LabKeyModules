package org.labkey.test.pages.immport;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.immport.StudySummaryWindow;
import org.labkey.test.pages.LabKeyPage;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.sun.jna.Platform.isMac;

public class StudyFinderPage extends LabKeyPage
{
    private static final String CONTROLLER = "immport";
    private static final String ACTION = "studyFinder";

    public StudyFinderPage(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected void waitForPage()
    {
        _test._ext4Helper.waitForMaskToDisappear();
        _test.waitForElement(Locators.studySearchInput);
    }

    public static StudyFinderPage goDirectlyToPage(BaseWebDriverTest test, String containerPath)
    {
        test.beginAt(WebTestHelper.buildURL(CONTROLLER, containerPath, ACTION));
        return new StudyFinderPage(test);
    }

    public void checkShowAllImmPortStudies()
    {
        _test.checkRadioButton(Locators.showAllRadioButton);
    }

    public void uncheckShowAllImmPortStudies()
    {
        _test.checkRadioButton(Locators.showAllImmuneSpaceRadioButton);
     }

    public void studySearch(String search)
    {
        _test.setFormElement(Locators.studySearchInput, search);
    }

    public Map<String, Integer> getSummaryCounts()
    {
        List<WebElement> summaryCountRows = Locators.summaryCountRow.findElements(_test.getDriver());
        Map<String, Integer> countMap = new HashMap<>();

        for (WebElement row : summaryCountRows)
        {
            List<WebElement> cells = row.findElements(By.cssSelector("td"));
            String dimension = cells.get(1).getText().trim();
            Integer count = Integer.parseInt(cells.get(0).getText());

            countMap.put(dimension, count);
        }

        return countMap;
    }

    public List<StudyCard> getStudyCards()
    {
        List<WebElement> studyCardEls = Locators.studyCard.findElements(_test.getDriver());
        List<StudyCard> studyCards = new ArrayList<>();

        for (WebElement el : studyCardEls)
        {
            studyCards.add(new StudyCard(el));
        }

        return studyCards;
    }

    public Map<Dimension, DimensionFilter> getSelections()
    {
        List<WebElement> selectionEls = Locators.selection.findElements(_test.getDriver());
        Map<Dimension, DimensionFilter> dimensionSelections = new HashMap<>();

        for (WebElement el : selectionEls)
        {
            DimensionFilter dimensionSelection = new DimensionFilter(el);
            dimensionSelections.put(dimensionSelection.getDimension(), dimensionSelection);
        }

        return dimensionSelections;
    }

    public Map<Dimension, DimensionPanel> getDimensionPanels()
    {
        List<WebElement> dimensionPanelEls = Locators.dimensionPanel.findElements(_test.getDriver());
        Map<Dimension, DimensionPanel> dimensionPanels = new HashMap<>();

        for (WebElement el : dimensionPanelEls)
        {
            DimensionPanel panel = new DimensionPanel(el);
            dimensionPanels.put(panel.getDimension(), panel);
        }

        return dimensionPanels;
    }

    /**
     * Not very precise
     */
    public DimensionFilter waitForSelection(String value)
    {
        WebElement selectionEl = Locators.selection.containing(value).waitForElement(_test.getDriver(), _test.shortWait());

        return new DimensionFilter(selectionEl);
    }

    public void dismissTour()
    {
        Locator closeTourButton = Locator.css("a.hopscotch-close");
        if (_test.isElementPresent(closeTourButton))
            _test.click(closeTourButton);
    }

    protected static class Locators
    {
        public static Locator.CssLocator studyFinder = Locator.css("#studyfinderAppDIV");
        public static Locator.CssLocator studySearchInput = studyFinder.append(Locator.css("#searchTerms"));
        public static Locator.XPathLocator showAllRadioButton = Locator.radioButtonByNameAndValue("studySubset", "ImmPort");
        public static Locator.XPathLocator showAllImmuneSpaceRadioButton = Locator.radioButtonByNameAndValue("studySubset","ImmuneSpace");
        public static Locator.CssLocator searchMessage = studyFinder.append(Locator.css(".searchMessage"));
        public static Locator.CssLocator studyPanel = studyFinder.append(Locator.css("#studypanel"));
        public static Locator.CssLocator studyCard = studyFinder.append(Locator.css(".study-card"));
        public static Locator.CssLocator dimensionsTable = studyFinder.append(Locator.css("table.dimensions"));
        public static Locator.CssLocator dimensionPanel = dimensionsTable.append(Locator.css("fieldset.group-fieldset"));
        public static Locator.CssLocator summaryArea = studyFinder.append(Locator.css("#summaryArea"));
        public static Locator.CssLocator summaryCounts = summaryArea.append(Locator.css("> tbody:first-child"));
        public static Locator.CssLocator summaryCountRow = summaryCounts.append(Locator.css("> tr:not(:first-child):not(:last-child)"));
        public static Locator.CssLocator selection = summaryArea.append(Locator.css("> tbody:not(:first-child)"));
    }

    public enum Dimension
    {
        SPECIES("species", "species"),
        CONDITION("condition", "conditions"),
        TYPE("type", "types"),
        ASSAY("assay", "assays"),
        TIMEPOINT("timepoint", "timepoints"),
        GENDER("gender", "genders"),
        RACE("race", "races"),
        CATEGORY("category", "categories");

        private String singular;
        private String plural;

        Dimension(String singular, String plural)
        {
            this.singular = singular;
            this.plural = plural;
        }

        public String getSingular()
        {
            return singular;
        }

        public String getPlural()
        {
            return plural;
        }

        public static Dimension fromString(String value)
        {
            for (Dimension dimension : values())
            {
                if (dimension.getPlural().equals(value.toLowerCase()) || dimension.getSingular().equals(value.toLowerCase()))
                    return dimension;
            }

            throw new IllegalArgumentException("No such dimension: " + value);
        }
    }

    public class DimensionPanel
    {
        private WebElement panel;
        private Elements elements;
        private Dimension dimension;

        private DimensionPanel(WebElement panel)
        {
            this.panel = panel;
            elements = new Elements();
        }

        public Dimension getDimension()
        {
            if (dimension == null)
            {
                dimension = Dimension.fromString(elements.dimension.findElement(panel).getText());
            }

            return dimension;
        }

        public List<String> getValues()
        {
            return getValues(elements.value);
        }

        public List<String> getEmptyValues()
        {
            return getValues(elements.emptyValue);
        }

        public List<String> getNonEmptyValues()
        {
            return getValues(elements.nonEmptyValue);
        }

        public List<String> getSelectedValues()
        {
            return getValues(elements.selectedValue);
        }

        private List<String> getValues(Locator valueLoc)
        {
            List<WebElement> els = valueLoc.findElements(panel);
            List<String> values = new ArrayList<>();

            for (WebElement el : els)
            {
                values.add(el.getText().trim());
            }

            return values;
        }

        public void selectAll()
        {
            elements.all.findElement(panel).click();
            elements.selectedValue.waitForElementToDisappear(panel, _test.shortWait());
        }

        public String selectFirstIntersectingMeasure()
        {
            WebElement el = elements.nonEmptyNonSelectedValue.findElement(panel);
            String value = el.getText();

            controlClick(el);

            elements.selectedValue.withText(value).waitForElement(panel, _test.shortWait());
            return value;
        }

        private void controlClick(WebElement el)
        {
            Keys multiSelectKey;
            if (isMac())
                multiSelectKey = Keys.COMMAND;
            else
                multiSelectKey = Keys.CONTROL;

            Actions builder = new Actions(_test.getDriver());
            builder.keyDown(multiSelectKey).build().perform();
            el.click();
            builder.keyUp(multiSelectKey).build().perform();
        }

        private class Elements
        {
            public Locator.CssLocator dimension = Locator.css("h3");
            public Locator.CssLocator all = Locator.css("#m__ALL");
            public Locator.CssLocator value = Locator.css(".member");
            public Locator.CssLocator emptyValue = Locator.css(".ng-scope.emptyMember");
            public Locator.CssLocator nonEmptyValue = Locator.css(".ng-scope.member:not(.emptyMember)");
            public Locator.CssLocator nonEmptyNonSelectedValue = Locator.css(".ng-scope.member:not(.emptyMember):not(.selectedMember)");
            public Locator.CssLocator selectedValue = Locator.css(".ng-scope.selectedMember");
        }
    }

    public class StudyCard
    {
        WebElement card;
        Elements elements;
        String title;
        String accession;
        String pi;

        private StudyCard(WebElement card)
        {
            this.card = card;
            elements = new Elements();
        }

        public WebElement getCardElement()
        {
            return card;
        }

        public StudySummaryWindow viewSummary()
        {
            elements.viewStudyLink.findElement(card).click();
            return new StudySummaryWindow(_test);
        }

        public void clickGoToStudy()
        {
            _test.clickAndWait(elements.goToStudyLink.findElement(card), BaseWebDriverTest.WAIT_FOR_PAGE);
        }

        public String getAccession()
        {
            return elements.name.findElement(card).getText();
        }

        public String getPI()
        {
            return elements.PI.findElement(card).getText();
        }

        public String getTitle()
        {
            return elements.title.findElement(card).getText();
        }

        private class Elements
        {
            public Locator viewStudyLink = Locator.linkWithText("view summary");
            public Locator goToStudyLink = Locator.linkWithText("go to study");
            public Locator name = Locator.css(".studycard-accession");
            public Locator PI = Locator.css(".studycard-pi");
            public Locator title = Locator.css(".studycard-description");
        }
    }

    public class DimensionFilter
    {
        private WebElement dimensionFilter;
        private Elements elements;
        private Dimension dimension;

        private DimensionFilter(WebElement dimensionFilter)
        {
            this.dimensionFilter = dimensionFilter;
            elements = new Elements();
        }

        public Dimension getDimension()
        {
            if (dimension == null)
            {
                dimension = Dimension.fromString(elements.dimension.findElement(dimensionFilter).getText());
            }

            return dimension;
        }

        public List<String> getFilterValues()
        {
            List<WebElement> valueEls = elements.filterValue.findElements(dimensionFilter);
            List<String> values = new ArrayList<>();

            for (WebElement el : valueEls)
            {
                values.add(el.getText().trim());
            }

            return values;
        }

        public void removeFilter(String value)
        {
            WebElement filter = elements.filterValue.withText(value).findElement(dimensionFilter);
            Locator.css("img.delete").findElement(filter).click();
            _test.shortWait().until(ExpectedConditions.stalenessOf(filter));
        }

        private class Elements
        {
            public Locator dimension = Locator.css("legend.ng-binding");
            public Locator filterValue = Locator.css("div.filter-member");
        }
    }
}
