package org.labkey.test.pages.immport;

import com.google.common.base.Function;
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
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class StudyFinderPage extends LabKeyPage
{
    private static final String CONTROLLER = "immport";
    private static final String ACTION = "studyFinder";
    private static final String COUNT_SIGNAL = "studyFinderCountsUpdated";
    private String _uuid = "1";

    public StudyFinderPage(BaseWebDriverTest test)
    {
        super(test);
    }

    public void setUuid(String uuid)
    {
//        _uuid = uuid;
        throw new UnsupportedOperationException("Study Finder doesn't currently support multiple instances.");
    }

    @Override
    protected void waitForPage()
    {
        _test.waitForElement(Locators.pageSignal(COUNT_SIGNAL));
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
        _test.applyAndWaitForPageSignal(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.checkRadioButton(elements().showAllRadioButton);
                return null;
            }
        }, COUNT_SIGNAL);
    }

    public void showAllImmuneSpaceStudies()
    {
        _test.applyAndWaitForPageSignal(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.checkRadioButton(elements().showAllImmuneSpaceRadioButton);
                return null;
            }
        }, COUNT_SIGNAL);
     }

    @LogMethod
    public void studySearch(@LoggedParam final String search)
    {
        _test.applyAndWaitForPageSignal(new Function<Void, Void>()
        {
            @Override
            public Void apply(Void aVoid)
            {
                _test.setFormElement(elements().studySearchInput, search);
                return null;
            }
        }, COUNT_SIGNAL);
    }

    @LogMethod(quiet = true)
    public void clearSearch()
    {
        if (!_test.getFormElement(elements().studySearchInput).isEmpty())
            studySearch(" ");
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

    public void clearAllFilters()
    {
        final WebElement clearAll = elements().clearAll.findElement(_test.getDriver());
        if (clearAll.isDisplayed())
        {
            _test.applyAndWaitForPageSignal(new Function<Void, Void>()
            {
                @Override
                public Void apply(Void aVoid)
                {
                    clearAll.click();
                    return null;
                }
            }, COUNT_SIGNAL);
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

    protected Elements elements()
    {
        return new Elements();
    }
    
    protected class Elements
    {
        public Locator.CssLocator studyFinder = Locator.css("#studyfinderAppDIV" + (_uuid == null ? "1" : _uuid));
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
        public Locator.CssLocator clearAll = summaryArea.append(Locator.css("a[ng-click='clearAllFilters();']"));
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

        public void selectAll()
        {
            _test.applyAndWaitForPageSignal(new Function<Void, Void>()
            {
                @Override
                public Void apply(Void aVoid)
                {
                    elements.all.findElement(panel).click();
                    return null;
                }
            }, COUNT_SIGNAL);
            elements.selectedValue.waitForElementToDisappear(panel, _test.shortWait());
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
            _test.applyAndWaitForPageSignal(new Function<Void, Void>()
            {
                @Override
                public Void apply(Void aVoid)
                {
                    value.click();
                    return null;
                }
            }, COUNT_SIGNAL);
        }

        private void addToSelection(final WebElement value)
        {
            _test.applyAndWaitForPageSignal(new Function<Void, Void>()
            {
                @Override
                public Void apply(Void aVoid)
                {
                    controlClick(value);
                    return null;
                }
            }, COUNT_SIGNAL);
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
            elements.selectedValue.withText(value).waitForElement(panel, _test.shortWait());
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

            _test.applyAndWaitForPageSignal(new Function<Void, Void>()
            {
                @Override
                public Void apply(Void aVoid)
                {
                    Locator.css("img.delete").findElement(filter).click();
                    return null;
                }
            }, COUNT_SIGNAL);

            _test.shortWait().until(ExpectedConditions.stalenessOf(filter));
        }

        private class Elements
        {
            public Locator dimension = Locator.css("legend.ng-binding");
            public Locator filterValue = Locator.css("div.filter-member");
        }
    }
}
