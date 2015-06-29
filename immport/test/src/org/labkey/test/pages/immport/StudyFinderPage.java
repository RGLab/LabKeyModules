package org.labkey.test.pages.immport;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.ComponentElements;
import org.labkey.test.components.immport.StudySummaryWindow;
import org.labkey.test.pages.LabKeyPage;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
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
    private String _uuid = "1";

    public StudyFinderPage(BaseWebDriverTest test)
    {
        super(test);
    }

    public void setUuid(String uuid)
    {
        _uuid = uuid;
    }

    @Override
    protected void waitForPage()
    {
        _test._ext4Helper.waitForMaskToDisappear();
        _test.waitForElement(Locator.tag("div").attributeStartsWith("id", "studyfinderAppDIV"));
    }

    public static StudyFinderPage goDirectlyToPage(BaseWebDriverTest test, String containerPath)
    {
        test.beginAt(WebTestHelper.buildURL(CONTROLLER, containerPath, ACTION));
        return new StudyFinderPage(test);
    }

    public ExportStudyDatasetsPage exportDatasets()
    {
        _test.clickAndWait(elements().exportDatasets);
        return new ExportStudyDatasetsPage(_test);
    }

    public void showAllImmPortStudies()
    {
        _test.checkRadioButton(elements().showAllRadioButton);
    }

    public void showAllImmuneSpaceStudies()
    {
        _test.checkRadioButton(elements().showAllImmuneSpaceRadioButton);
     }

    /**
     * Assumes that summary counts will change as a result of the search
     */
    public void studySearch(String search)
    {
        final Map<Dimension, Integer> initialCounts = getSummaryCounts();
        _test.setFormElement(elements().studySearchInput, search);
        _test.shortWait().until(new ExpectedCondition<Boolean>()
        {
            @Override
            public Boolean apply(WebDriver webDriver)
            {
                return !initialCounts.equals(getSummaryCounts());
            }
        });
    }

    public Map<Dimension, Integer> getSummaryCounts()
    {
        List<WebElement> summaryCountRows = elements().summaryCountRow.findElements(_test.getDriver());
        Map<Dimension, Integer> countMap = new HashMap<>();

        for (WebElement row : summaryCountRows)
        {
            List<WebElement> cells = row.findElements(By.cssSelector("td"));
            Dimension dimension = Dimension.fromString(cells.get(1).getText().trim());
            Integer count = Integer.parseInt(cells.get(0).getText());

            countMap.put(dimension, count);
        }

        return countMap;
    }

    public List<StudyCard> getStudyCards()
    {
        List<WebElement> studyCardEls = elements().studyCard.findElements(_test.getDriver());
        List<StudyCard> studyCards = new ArrayList<>();

        for (WebElement el : studyCardEls)
        {
            studyCards.add(new StudyCard(el));
        }

        return studyCards;
    }

    public Map<Dimension, SummaryFilterPanel> getSelectionPanels()
    {
        List<WebElement> selectionEls = elements().selection.findElements(_test.getDriver());
        Map<Dimension, SummaryFilterPanel> dimensionSelections = new HashMap<>();

        for (WebElement el : selectionEls)
        {
            SummaryFilterPanel dimensionSelection = new SummaryFilterPanel(el);
            dimensionSelections.put(dimensionSelection.getDimension(), dimensionSelection);
        }

        return dimensionSelections;
    }

    public Map<Dimension, List<String>> getSelectionValues()
    {
        Map<Dimension, SummaryFilterPanel> selectionPanels = getSelectionPanels();
        Map<Dimension, List<String>> selectionValues = new HashMap<>();

        for (Map.Entry<Dimension, SummaryFilterPanel> selection : selectionPanels.entrySet())
        {
            selectionValues.put(selection.getKey(), selection.getValue().getFilterValues());
        }

        return selectionValues;
    }

    public Map<Dimension, DimensionPanel> getDimensionPanels()
    {
        List<WebElement> dimensionPanelEls = elements().dimensionPanel.findElements(_test.getDriver());
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
    public SummaryFilterPanel waitForSelection(String value)
    {
        WebElement selectionEl = elements().selection.containing(value).waitForElement(_test.getDriver(), _test.shortWait());

        return new SummaryFilterPanel(selectionEl);
    }

    public void dismissTour()
    {
        Locator closeTourButton = Locator.css("a.hopscotch-close");
        if (_test.isElementPresent(closeTourButton))
            _test.click(closeTourButton);
    }

    protected Elements elements()
    {
        return new Elements();
    }
    
    protected class Elements
    {
        public Locator.CssLocator studyFinder = Locator.css("#studyfinderAppDIV" + _uuid);
        public Locator.XPathLocator exportDatasets = Locator.linkWithText("Export Study Datasets");
        public Locator.CssLocator studySearchInput = studyFinder.append(Locator.css("#searchTerms"));
        public Locator.CssLocator searchMessage = studyFinder.append(Locator.css("span.searchMessage"));
        public Locator.CssLocator searchMessageNotFound = studyFinder.append(Locator.css("span.searchNotFound"));
        public Locator.XPathLocator showAllRadioButton = Locator.radioButtonByNameAndValue("studySubset", "ImmPort");
        public Locator.XPathLocator showAllImmuneSpaceRadioButton = Locator.radioButtonByNameAndValue("studySubset","ImmuneSpace");
        public Locator.CssLocator studyPanel = studyFinder.append(Locator.css("#studypanel"));
        public Locator.CssLocator studyCard = studyFinder.append(Locator.css(".study-card"));
        public Locator.CssLocator dimensionsTable = studyFinder.append(Locator.css("table.dimensions"));
        public Locator.CssLocator dimensionPanel = dimensionsTable.append(Locator.css("fieldset.group-fieldset"));
        public Locator.CssLocator summaryArea = studyFinder.append(Locator.css("#summaryArea"));
        public Locator.CssLocator summaryCounts = summaryArea.append(Locator.css("> tbody:first-child"));
        public Locator.CssLocator summaryCountRow = summaryCounts.append(Locator.css("> tr:not(:first-child):not(:last-child)"));
        public Locator.CssLocator selection = summaryArea.append(Locator.css("> tbody:not(:first-child)"));
    }

    public enum Dimension
    {
        STUDIES(null, "studies"),
        PARTICIPANTS(null, "participants"),
        SPECIES("Species", "species"),
        CONDITION("Condition", "conditions"),
        TYPE("Type", "types"),
        CATEGORY("Research focus", null),
        ASSAY("Assay", "assays"),
        TIMEPOINT("Day of Study", "timepoints"),
        GENDER("Gender", "genders"),
        RACE("Race", "races"),
        AGE("Age", "age groups");

        private String caption;
        private String summaryLabel;

        Dimension(String caption, String summaryLabel)
        {
            this.caption = caption;
            this.summaryLabel = summaryLabel;
        }

        public String getCaption()
        {
            return caption;
        }

        public String getSummaryLabel()
        {
            return summaryLabel;
        }

        public static Dimension fromString(String value)
        {
            for (Dimension dimension : values())
            {
                if (value.equals(dimension.getSummaryLabel()) || value.equals(dimension.getCaption()))
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
            return _test.getTexts(elements.value.findElements(panel));
        }

        public List<String> getEmptyValues()
        {
            return _test.getTexts(elements.emptyValue.findElements(panel));
        }

        public List<String> getNonEmptyValues()
        {
            return _test.getTexts(elements.nonEmptyValue.findElements(panel));
        }

        public List<String> getSelectedValues()
        {
            return _test.getTexts(elements.selectedValue.findElements(panel));
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

        public void select(String value)
        {
            elements.value.withText(value).findElement(panel).click();
            waitForSelection(value);
        }

        public void addToSelection(String value)
        {
            controlClick(elements.value.withText(value).findElement(panel));
            waitForSelection(value);
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
            elements.goToStudyLink.findElement(card).click();
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

    public class SummaryFilterPanel
    {
        private WebElement dimensionFilter;
        private Elements elements;
        private Dimension dimension;

        private SummaryFilterPanel(WebElement dimensionFilter)
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
