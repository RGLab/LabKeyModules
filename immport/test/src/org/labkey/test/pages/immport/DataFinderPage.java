package org.labkey.test.pages.immport;

import com.google.common.base.Predicate;
import org.apache.commons.lang3.SystemUtils;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.Component;
import org.labkey.test.components.immport.StudySummaryWindow;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataFinderPage extends LabKeyPage
{
    private static final String CONTROLLER = "immport";
    private static final String ACTION = "dataFinder";
    private static final String COUNT_SIGNAL = "dataFinderCountsUpdated";

    public DataFinderPage(BaseWebDriverTest test)
    {
        super(test);
    }

    @Override
    protected void waitForPage()
    {
        _test.waitForElement(LabKeyPage.Locators.pageSignal(COUNT_SIGNAL));
    }

    public static DataFinderPage goDirectlyToPage(BaseWebDriverTest test, String containerPath)
    {
        test.beginAt(WebTestHelper.buildURL(CONTROLLER, containerPath, ACTION));
        return new DataFinderPage(test);
    }

    public ExportStudyDatasetsPage exportDatasets()
    {
        _test.clickAndWait(Locators.exportDatasets);
        return new ExportStudyDatasetsPage(_test);
    }

    public void showUnloadedImmPortStudies()
    {
        selectStudySubset("Unloaded ImmPort studies");
//        _test.doAndWaitForPageSignal(() -> _test.selectOptionByText(Locators.studySubsetChooser, "Unloaded ImmPort studies"), COUNT_SIGNAL);
    }

    public void showAllImmuneSpaceStudies()
    {
        selectStudySubset("ImmuneSpace studies");
//        _test.doAndWaitForPageSignal(() -> _test.selectOptionByText(Locators.studySubsetChooser, "ImmuneSpace studies"), COUNT_SIGNAL);
     }

    public void selectStudySubset(String text)
    {
        String selectedText = _test.getSelectedOptionText(Locators.studySubsetChooser);
        if (!selectedText.equals(text))
        {
            _test.doAndWaitForPageSignal(() -> _test.selectOptionByText(Locators.studySubsetChooser, text), COUNT_SIGNAL);
        }
    }

    @LogMethod
    public void studySearch(@LoggedParam final String search)
    {
        _test.doAndWaitForPageSignal(() -> _test.setFormElement(Locators.studySearchInput, search), COUNT_SIGNAL);
    }

    @LogMethod(quiet = true)
    public void clearSearch()
    {
        if (!_test.getFormElement(Locators.studySearchInput).isEmpty())
            studySearch(" ");
    }

    public Map<Dimension, Integer> getSummaryCounts()
    {
        // FIXME figure out what counts the tests want and create locator for that
//        List<WebElement> summaryCountRows = Locators.summaryCountRow.findElements(_test.getDriver());
        Map<Dimension, Integer> countMap = new HashMap<>();

//        for (WebElement row : summaryCountRows)
//        {
//            List<WebElement> cells = row.findElements(By.cssSelector("td"));
//            Dimension dimension = Dimension.fromString(cells.get(1).getText().trim());
//            Integer count = Integer.parseInt(cells.get(0).getText());
//
//            countMap.put(dimension, count);
//        }

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

    public Map<Dimension, SummaryFilterPanel> getSelectionPanels()
    {
        // FIXME figure out what the tests wants and update selectors for that
//        List<WebElement> selectionEls = Locators.selection.findElements(_test.getDriver());
        Map<Dimension, SummaryFilterPanel> dimensionSelections = new HashMap<>();

//        for (WebElement el : selectionEls)
//        {
//            SummaryFilterPanel dimensionSelection = new SummaryFilterPanel(el);
//            dimensionSelections.put(dimensionSelection.getDimension(), dimensionSelection);
//        }

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
        List<WebElement> dimensionPanelEls = Locators.facet.findElements(_test.getDriver());
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
        WebElement selectionEl = Locators.selection.containing(value).waitForElement(_test.shortWait());

        return new SummaryFilterPanel(selectionEl);
    }

    public void clearAllFilters()
    {
        final WebElement clearAll = Locators.clearAll.findElement(_test.getDriver());
        if (clearAll.isDisplayed())
        {
            _test.doAndWaitForPageSignal(clearAll::click, COUNT_SIGNAL);
        }
    }

    public void dismissTour()
    {
        _test.shortWait().until(new Predicate<WebDriver>()
        {
            @Override
            public boolean apply(WebDriver webDriver)
            {
                try
                {
                    return (Boolean) _test.executeScript("" +
                            "if (window.hopscotch)" +
                            "  return !hopscotch.endTour().isActive;" +
                            "else" +
                            "  return true;");
                }
                catch (Exception recheck)
                {
                    return false;
                }
            }

            @Override
            public String toString()
            {
                return "tour to be dismissed.";
            }
        });
    }
    
    public static class Locators
    {
        public static Locator.CssLocator studyFinder = Locator.css("#dataFinderApp");
        public static Locator.XPathLocator exportDatasets = Locator.linkWithText("Export Study Datasets");
        public static Locator.CssLocator studySearchInput = studyFinder.append(Locator.css("#searchTerms"));
        public static Locator.CssLocator searchMessage = studyFinder.append(Locator.css("span.labkey-study-search"));

        public static Locator.NameLocator studySubsetChooser = Locator.name("studySubsetSelect");
        //        public Locator.XPathLocator showAllRadioButton = Locator.radioButtonByNameAndValue("studySubset", "ImmPort");
//        public Locator.XPathLocator showAllImmuneSpaceRadioButton = Locator.radioButtonByNameAndValue("studySubset","ImmuneSpace");
        public static Locator.CssLocator studyPanel = studyFinder.append(Locator.css("#studypanel"));
        public static Locator.CssLocator studyCard = studyFinder.append(Locator.css(".labkey-study-card"));
        public static Locator.CssLocator selectionPanel = studyFinder.append(Locator.css(".selection-panel"));
        public static Locator.CssLocator facetPanel = selectionPanel.append(Locator.css("#facetPanel"));
        public static Locator.CssLocator facet = facetPanel.append(" .facet");
        public static Locator.CssLocator emptyMember = facetPanel.append(Locator.css("li.empty-member"));
        public static Locator.CssLocator summaryArea = selectionPanel.append(Locator.css("#summaryArea"));
//        public Locator.CssLocator summaryCounts = summaryArea.append(Locator.css("> tbody:first-child"));
//        public Locator.CssLocator summaryCountRow = summaryCounts.append(Locator.css("> tr:not(:first-child):not(:last-child)"));
        public static Locator.CssLocator selection = facetPanel.append(Locator.css(".bar-selected"));
        public static Locator.CssLocator clearAll = summaryArea.append(Locator.css("span[ng-click='clearAllFilters(true);']"));
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

    public class DimensionPanel extends Component
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
                dimension = Dimension.fromString(findElement(elements.dimension).getText());
            }

            return dimension;
        }

        @Override
        public WebElement getComponentElement()
        {
            return panel;
        }

        public List<String> getValues()
        {
            return _test.getTexts(findElements(elements.value));
        }

        public List<String> getEmptyValues()
        {
            return _test.getTexts(findElements(elements.emptyValue));
        }

        public List<String> getNonEmptyValues()
        {
            return _test.getTexts(findElements(elements.nonEmptyValue));
        }

        public List<String> getSelectedValues()
        {
            return _test.getTexts(findElements(elements.selectedValue));
        }


        public String selectFirstIntersectingMeasure()
        {
            WebElement el = findElement(elements.nonEmptyNonSelectedValue);
            String value = el.getText();

            addToSelection(el);

            waitForSelection(value);
            return value;
        }

        public void select(String value)
        {
            select(findElement(elements.value.withText(value)));
            waitForSelection(value);
        }

        public void addToSelection(String value)
        {
            addToSelection(findElement(elements.value.withText(value)));
            waitForSelection(value);
        }

        private void select(final WebElement value)
        {
            _test.doAndWaitForPageSignal(value::click, COUNT_SIGNAL);
        }

        private void addToSelection(final WebElement value)
        {
            _test.doAndWaitForPageSignal(() -> controlClick(value), COUNT_SIGNAL);
        }

        private void controlClick(WebElement el)
        {
            Keys multiSelectKey;
            if (SystemUtils.IS_OS_MAC)
                multiSelectKey = Keys.COMMAND;
            else
                multiSelectKey = Keys.CONTROL;

            Actions builder = new Actions(_test.getDriver());
            builder.keyDown(multiSelectKey).build().perform();
            el.click();
            builder.keyUp(multiSelectKey).build().perform();
        }

        private void waitForSelection(String value)
        {
            elements.selectedValue.withText(value).waitForElement(panel, BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
        }

        private class Elements
        {
            // FIXME these elements are probably not correct
            public Locator.CssLocator dimension = Locator.css(".facet-caption > span");
            public Locator.CssLocator value = Locator.css(".member");
            public Locator.CssLocator emptyValue = Locator.css(".ng-scope.empty-member");
            public Locator.CssLocator nonEmptyValue = Locator.css(".ng-scope.member:not(.empty-member)");
            public Locator.CssLocator nonEmptyNonSelectedValue = Locator.css(".ng-scope.member:not(.empty-member):not(.selected-member)");
            public Locator.CssLocator selectedValue = Locator.css(".ng-scope.selected-member");
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
            public Locator name = Locator.css(".labkey-study-card-accession");
            public Locator PI = Locator.css(".labkey-study-card-pi");
            public Locator title = Locator.css(".labkey-study-card-description");
        }
    }

    public class SummaryFilterPanel extends Component
    {
        private final WebElement dimensionFilter;
        private final Elements elements;
        private final Dimension dimension;

        private SummaryFilterPanel(final WebElement dimensionFilter)
        {
            this.dimensionFilter = dimensionFilter;
            elements = new Elements();
            _test.shortWait().until(new Predicate<WebDriver>()
            {
                @Override
                public boolean apply(WebDriver webDriver)
                {
                    return findElement(elements.dimension).getText().length() > 0;
                }
            });
            dimension = Dimension.fromString(findElement(elements.dimension).getText());
        }

        @Override
        public WebElement getComponentElement()
        {
            return dimensionFilter;
        }

        public Dimension getDimension()
        {
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
            final WebElement filter = findElement(elements.filterValue.withText(value));

            _test.doAndWaitForPageSignal(() -> Locator.css("img.delete").findElement(filter).click(), COUNT_SIGNAL);

            _test.shortWait().until(ExpectedConditions.stalenessOf(filter));
        }

        private class Elements
        {
            public Locator dimension = Locator.css("legend.ng-binding");
            public Locator filterValue = Locator.css("div.filter-member");
        }
    }
}