/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.labkey.test.tests;

import org.apache.commons.collections15.Bag;
import org.apache.commons.collections15.bag.HashBag;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpUriRequest;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.Command;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.External;
import org.labkey.test.components.ParticipantListWebPart;
import org.labkey.test.components.immport.StudySummaryWindow;
import org.labkey.test.components.study.StudyOverviewWebPart;
import org.labkey.test.pages.immport.ImmPortBeginPage;
import org.labkey.test.pages.immport.StudyFinderPage;
import org.labkey.test.pages.immport.StudyFinderPage.Dimension;
import org.labkey.test.pages.study.OverviewPage;
import org.labkey.test.util.APIContainerHelper;
import org.labkey.test.util.AbstractContainerHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.DatasetDomainEditor;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.Maps;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.ReadOnlyTest;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

@Category({External.class})
public class StudyFinderTest extends BaseWebDriverTest implements PostgresOnlyTest, ReadOnlyTest
{
    private static File immPortArchive = TestFileUtils.getSampleData("HIPC/ANIMAL_STUDIES-DR11.zip");
    private static File TEMPLATE_ARCHIVE = TestFileUtils.getSampleData("HIPC/SDY_template.zip");
    private static String[] ANIMAL_STUDIES = {"SDY99", "SDY139", "SDY147", "SDY208", "SDY215", "SDY217"};
    private static String[] STUDY_SUBFOLDERS = {"SDY139", "SDY147", "SDY208", "SDY217"};

    @Override
    protected String getProjectName()
    {
        return "ImmuneSpace Test Dataspace";
    }

    @Override
    protected BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    protected void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        AbstractContainerHelper containerHelper = new APIContainerHelper(this);
        containerHelper.deleteProject(getProjectName(), afterTest);
    }

    @BeforeClass
    public static void initTest()
    {
        StudyFinderTest init = (StudyFinderTest)getCurrentTest();

        if (init.needsSetup())
            init.setupProject();
    }

    @Override
    public boolean needsSetup()
    {
        try
        {
            return HttpStatus.SC_NOT_FOUND == WebTestHelper.getHttpGetResponse(WebTestHelper.buildURL("project", getProjectName(), "begin"));
        }
        catch (IOException fail)
        {
            return true;
        }
    }

    private void setupProject()
    {
        AbstractContainerHelper containerHelper = new APIContainerHelper(this);

        containerHelper.createProject(getProjectName(), "Study");
        containerHelper.enableModule("ImmPort");
        ImmPortBeginPage
                .beginAt(this, getProjectName())
                .importArchive(immPortArchive, false);

        goToProjectHome();
        clickButton("Create Study");
        checkRadioButton(Locator.radioButtonByNameAndValue("shareDatasets", "true"));
        checkRadioButton(Locator.radioButtonByNameAndValue("shareVisits", "true"));
        selectOptionByValue(Locator.name("securityString"), "ADVANCED_WRITE");
        clickButton("Create Study");
        containerHelper.setFolderType("Dataspace");
        new PortalHelper(this).addWebPart("ImmPort Study Finder");

        containerHelper.createSubfolder(getProjectName(), "SDY_template", "Study");
        importStudyFromZip(TEMPLATE_ARCHIVE, true, true);

        // Share demographics
        beginAt(WebTestHelper.buildURL("study", getProjectName(), "editType", Maps.of("datasetId", "5001")));
        DatasetDomainEditor datasetDomainEditor = new DatasetDomainEditor(this);
        datasetDomainEditor.shareDemographics(DatasetDomainEditor.ShareDemographicsBy.PTID);
        datasetDomainEditor.save();

        for (String studyAccession : STUDY_SUBFOLDERS)
        {
            containerHelper.createSubfolder(getProjectName(), studyAccession, "Study");
            clickButton("Create Study");
            setFormElement(Locator.name("label"), studyAccession);
            selectOptionByValue(Locator.name("securityString"), "ADVANCED_WRITE");
            clickButton("Create Study");
            goToModule("ImmPort");
            new ImmPortBeginPage(this)
                    .copyDatasetsForOneStudy()
                    .copyStudyResults(studyAccession);
        }

        ImmPortBeginPage.beginAt(this, getProjectName()).populateCube();
    }

    @Before
    public void preTest()
    {
        clearSharedStudyContainerFilter();
        goToProjectHome();
        StudyFinderPage studyFinder = new StudyFinderPage(this);
        studyFinder.clearSearch();
        try
        {
            studyFinder.clearAllFilters();
        }
        catch (NoSuchElementException ignore) {}
        studyFinder.dismissTour();
    }

    public void clearSharedStudyContainerFilter()
    {
        Connection connection = createDefaultConnection(false);
        Command command = new Command("study-shared", "sharedStudyContainerFilter")
        {
            @Override
            protected HttpUriRequest createRequest(URI uri)
            {
                return new HttpDelete(uri);
            }
        };

        try
        {
            command.execute(connection, getProjectName());
        }
        catch (CommandException | IOException fail)
        {
            throw new RuntimeException(fail);
        }
    }

    @Test
    public void testCounts()
    {
        StudyFinderPage studyFinder = new StudyFinderPage(this);
        assertCountsSynced(studyFinder);

        Map<Dimension, Integer> studyCounts = studyFinder.getSummaryCounts();

        for (Map.Entry<Dimension, Integer> count : studyCounts.entrySet())
        {
            if (count.getKey().getSummaryLabel() != null)
                assertNotEquals("No " + count.getKey().getSummaryLabel(), 0, count.getValue().intValue());
        }
    }

    @Test
    public void testStudyCards()
    {
        StudyFinderPage studyFinder = StudyFinderPage.goDirectlyToPage(this, getProjectName());

        List<StudyFinderPage.StudyCard> studyCards = studyFinder.getStudyCards();

        studyCards.get(0).viewSummary();
    }

    @Test
    public void testImmuneSpaceStudySubset()
    {
        StudyFinderPage studyFinder = StudyFinderPage.goDirectlyToPage(this, getProjectName());

        studyFinder.showAllImmPortStudies();
        assertEquals("Wrong ImmPort studies have LabKey study links", Arrays.asList(STUDY_SUBFOLDERS),
                getTexts(Locator.tagWithClass("div", "study-card").withPredicate(Locator.linkWithText("go to study"))
                        .append(Locator.tagWithClass("span", "studycard-accession")).findElements(getDriver())));

        studyFinder.showAllImmuneSpaceStudies();
        List<StudyFinderPage.StudyCard> studyCards = studyFinder.getStudyCards();
        List<String> studies = new ArrayList<>();
        for (StudyFinderPage.StudyCard studyCard : studyCards)
        {
            studies.add(studyCard.getAccession());
        }
        assertEquals("Wrong study cards for ImmuneSpace studies", Arrays.asList(STUDY_SUBFOLDERS), studies);
    }

    @Test
    public void testSelection()
    {
        StudyFinderPage studyFinder = new StudyFinderPage(this);
        studyFinder.showAllImmPortStudies();

        Map<Dimension, StudyFinderPage.DimensionPanel> dimensionPanels = studyFinder.getDimensionPanels();

        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();
        List<String> selectedGenders = new ArrayList<>();
        selectedGenders.add(dimensionPanels.get(Dimension.GENDER).selectFirstIntersectingMeasure());

        assertCountsSynced(studyFinder);
        assertSelectionsSynced(studyFinder);

        dimensionPanels.get(Dimension.SPECIES).selectAll();

        List<String> finalSelectedGenders = dimensionPanels.get(Dimension.GENDER).getSelectedValues();
        List<String> finalSelectedSpecies = dimensionPanels.get(Dimension.SPECIES).getSelectedValues();

        assertEquals("Clearing Species selection removed Gender filter", selectedGenders, finalSelectedGenders);
        assertEquals("Clicking 'ALL' didn't clear species selection", 0, finalSelectedSpecies.size());

        assertCountsSynced(studyFinder);
        assertSelectionsSynced(studyFinder);
    }

    @Test
    public void testSelectingEmptyMeasure()
    {
        Map<Dimension, Integer> expectedCounts = new HashMap<>();
        expectedCounts.put(Dimension.STUDIES, 0);
        expectedCounts.put(Dimension.PARTICIPANTS, 0);
        expectedCounts.put(Dimension.SPECIES, 0);
        expectedCounts.put(Dimension.TYPE, 0);
        expectedCounts.put(Dimension.CONDITION, 0);
        expectedCounts.put(Dimension.ASSAY, 0);
        expectedCounts.put(Dimension.TIMEPOINT, 0);
        expectedCounts.put(Dimension.GENDER, 0);
        expectedCounts.put(Dimension.AGE, 0);
        expectedCounts.put(Dimension.RACE, 0);

        StudyFinderPage studyFinder = StudyFinderPage.goDirectlyToPage(this, getProjectName());

        WebElement emptyMember = Locator.css("fieldset.group-fieldset > div.emptyMember").waitForElement(getDriver(), shortWait());
        String value = emptyMember.getText().trim();
        emptyMember.click();

        studyFinder.waitForSelection(value);

        List<StudyFinderPage.StudyCard> filteredStudyCards = studyFinder.getStudyCards();
        Map<Dimension, Integer> filteredSummaryCounts = studyFinder.getSummaryCounts();

        assertEquals("Study cards visible after selection", 0, filteredStudyCards.size());
        assertEquals("Wrong counts after selecting empty measure", expectedCounts, filteredSummaryCounts);
    }

    @Test
    public void testSearch()
    {
        StudyFinderPage studyFinder = StudyFinderPage.goDirectlyToPage(this, getProjectName());
        studyFinder.showAllImmPortStudies();

        List<StudyFinderPage.StudyCard> studyCards = studyFinder.getStudyCards();
        String searchString = studyCards.get(0).getAccession();

        studyFinder.studySearch(searchString);

        shortWait().until(ExpectedConditions.stalenessOf(studyCards.get(1).getCardElement()));
        studyCards = studyFinder.getStudyCards();

        assertEquals("Wrong number of studies after search", 1, studyCards.size());

        assertCountsSynced(studyFinder);
    }

    @Test
    public void testStudySummaryWindow()
    {
        StudyFinderPage studyFinder = StudyFinderPage.goDirectlyToPage(this, getProjectName());

        StudyFinderPage.StudyCard studyCard = studyFinder.getStudyCards().get(0);

        StudySummaryWindow summaryWindow = studyCard.viewSummary();

        assertEquals("Study card does not match summary (Accession)", studyCard.getAccession(), summaryWindow.getAccession());
        assertEquals("Study card does not match summary (Title)", studyCard.getTitle().toUpperCase(), summaryWindow.getTitle());
        String cardPI = studyCard.getPI();
        String summaryPI = summaryWindow.getPI();
        assertTrue("Study card does not match summary (PI)", summaryPI.contains(cardPI));

        summaryWindow.closeWindow();
    }

    @Test
    public void testStudyParticipantCounts()
    {
        Map<String, Integer> studyFinderParticipantCounts = new HashMap<>();
        Map<String, Integer> studyParticipantCounts = new HashMap<>();

        StudyFinderPage studyFinder = new StudyFinderPage(this);
        for (String studyAccession : STUDY_SUBFOLDERS)
        {
            studyFinder.studySearch(studyAccession);
            studyFinderParticipantCounts.put(studyAccession, studyFinder.getSummaryCounts().get(Dimension.PARTICIPANTS));
        }

        for (String studyAccession : STUDY_SUBFOLDERS)
        {
            clickFolder(studyAccession);
            StudyOverviewWebPart studyOverview = new StudyOverviewWebPart(this);
            studyParticipantCounts.put(studyAccession, studyOverview.getParticipantCount());
        }

        assertEquals("Participant counts in study finder don't match LabKey studies", studyFinderParticipantCounts, studyParticipantCounts);
    }

    @Test
    public void testStudyCardStudyLinks()
    {
        Set<String> foundAccessions = new HashSet<>();
        for (int i = 0; i < STUDY_SUBFOLDERS.length; i++)
        {
            StudyFinderPage studyFinder = new StudyFinderPage(this);
            StudyFinderPage.StudyCard studyCard = studyFinder.getStudyCards().get(i);
            String studyAccession = studyCard.getAccession();
            foundAccessions.add(studyAccession);
            studyCard.clickGoToStudy();
            WebElement title = Locator.css(".labkey-folder-title").waitForElement(getDriver(), shortWait());
            assertEquals("Study card linked to wrong study", studyAccession, title.getText());
            goBack();
        }

        assertEquals("Didn't find all studies", new HashSet<>(Arrays.asList(STUDY_SUBFOLDERS)), foundAccessions);
    }

    @Test
    public void testNavigationDoesNotDoesNotRemoveStudyFinderFilter()
    {
        StudyFinderPage studyFinder = new StudyFinderPage(this);
        Map<Dimension, StudyFinderPage.DimensionPanel> dimensionPanels = studyFinder.getDimensionPanels();
        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();

        Map<Dimension, List<String>> selections = studyFinder.getSelectionValues();
        clickTab("Manage");
        clickTab("Overview");
        assertEquals("Navigation cleared study finder filter", selections, studyFinder.getSelectionValues());
    }

    @Test
    public void testRefreshDoesNotDoesNotRemoveStudyFinderFilter()
    {
        StudyFinderPage studyFinder = new StudyFinderPage(this);
        Map<Dimension, StudyFinderPage.DimensionPanel> dimensionPanels = studyFinder.getDimensionPanels();
        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();

        Map<Dimension, List<String>> selections = studyFinder.getSelectionValues();
        refresh();
        assertEquals("'Refresh' cleared study finder filter", selections, studyFinder.getSelectionValues());
    }

    @Test
    public void testBackDoesNotDoesNotRemoveStudyFinderFilter()
    {
        StudyFinderPage studyFinder = new StudyFinderPage(this);
        Map<Dimension, StudyFinderPage.DimensionPanel> dimensionPanels = studyFinder.getDimensionPanels();
        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();

        Map<Dimension, List<String>> selections = studyFinder.getSelectionValues();
        clickTab("Manage");
        goBack();
        assertEquals("'Back' cleared study finder filter", selections, studyFinder.getSelectionValues());
    }

    @Test
    public void testStudyFinderWebPartAndActionShareFilter()
    {
        StudyFinderPage studyFinder = new StudyFinderPage(this);
        Map<Dimension, StudyFinderPage.DimensionPanel> dimensionPanels = studyFinder.getDimensionPanels();
        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();

        Map<Dimension, List<String>> selections = studyFinder.getSelectionValues();
        StudyFinderPage.goDirectlyToPage(this, getProjectName());
        assertEquals("WebPart study finder filter didn't get applied to StudyFinderAction", selections, studyFinder.getSelectionValues());
    }

    @Test
    public void testStickyStudyFinderFilterOnDataset()
    {
        Map<Dimension, Integer> expectedCounts = new HashMap<>();
        expectedCounts.put(Dimension.STUDIES, 2);
        expectedCounts.put(Dimension.PARTICIPANTS, 345);
        expectedCounts.put(Dimension.SPECIES, 1);
        expectedCounts.put(Dimension.TYPE, 1);
        expectedCounts.put(Dimension.CONDITION, 0);
        expectedCounts.put(Dimension.ASSAY, 3);
        expectedCounts.put(Dimension.TIMEPOINT, 11);
        expectedCounts.put(Dimension.GENDER, 1);
        expectedCounts.put(Dimension.AGE, 1);
        expectedCounts.put(Dimension.RACE, 1);

        StudyFinderPage studyFinder = new StudyFinderPage(this);
        studyFinder.getDimensionPanels().get(Dimension.CATEGORY).select("Immune Response");

        Map<Dimension, Integer> studyFinderSummaryCounts = studyFinder.getSummaryCounts();
        assertEquals("Study finder counts not as expected for 'Immune Response'.", expectedCounts, studyFinderSummaryCounts);

        clickAndWait(Locator.linkWithText("15 datasets"));
        clickAndWait(Locator.linkWithText("Demographics"));
        DataRegionTable demData = new DataRegionTable("Dataset", this);
        demData.showAll();
        assertEquals("Demographics dataset doesn't have same number of genders as filtered study finder",
                new HashSet<>(demData.getColumnDataAsText("Gender")).size(), studyFinderSummaryCounts.get(Dimension.GENDER).intValue());
        assertEquals("Demographics dataset doesn't have same number of races as filtered study finder",
                new HashSet<>(demData.getColumnDataAsText("Race")).size(), studyFinderSummaryCounts.get(Dimension.RACE).intValue());
        assertEquals("Demographics dataset doesn't have same number of species as filtered study finder",
                new HashSet<>(demData.getColumnDataAsText("Species")).size(), studyFinderSummaryCounts.get(Dimension.SPECIES).intValue());
        assertEquals("Demographics dataset doesn't have same number of participants as filtered study finder",
                demData.getDataRowCount(), studyFinderSummaryCounts.get(Dimension.PARTICIPANTS).intValue());

        clickTab("Participants");
        ParticipantListWebPart participantListWebPart = new ParticipantListWebPart(this);
        assertEquals("Participant list count doesn't match study finder", participantListWebPart.getParticipantCount(), studyFinderSummaryCounts.get(Dimension.PARTICIPANTS));
    }

    @Test
    public void testStickyStudyFinderFilterOnStudyNavigator()
    {
        StudyFinderPage studyFinder = new StudyFinderPage(this);
        studyFinder.getDimensionPanels().get(Dimension.CATEGORY).select("Immune Response");

        List<String> assaysWithData = studyFinder.getDimensionPanels().get(Dimension.ASSAY).getNonEmptyValues();
        List<String> assaysWithoutData = studyFinder.getDimensionPanels().get(Dimension.ASSAY).getEmptyValues();
        Map<Dimension, Integer> studyFinderSummaryCounts = studyFinder.getSummaryCounts();

        OverviewPage studyOverview = new StudyOverviewWebPart(this).clickStudyNavigator();

        Map<String, Integer> studyOverviewParticipantCounts = studyOverview.getDatasetTotalParticipantCounts();

        for (String assayWithData : assaysWithData)
        {
            for (Map.Entry<String, Integer> participantCount : studyOverviewParticipantCounts.entrySet())
            {
                if (participantCount.getKey().contains(assayWithData))
                {
                    assertTrue(String.format("Assay [%s] should have data with current filter, but does not.",
                            assayWithData), participantCount.getValue() > 0);
                    break;
                }
            }
        }

        for (String assayWithoutData : assaysWithoutData)
        {
            for (Map.Entry<String, Integer> participantCount : studyOverviewParticipantCounts.entrySet())
            {
                if (participantCount.getKey().contains(assayWithoutData))
                {
                    assertEquals(String.format("Assay [%s] should be empty with current filter, but is not.",
                            assayWithoutData), 0, participantCount.getValue().intValue());
                    break;
                }
            }
        }

        assertEquals("Participant count from study finder does not match Demographics dataset participant count.",
                studyFinderSummaryCounts.get(Dimension.PARTICIPANTS), studyOverviewParticipantCounts.get("Demographics"));
    }

    @LogMethod(quiet = true)
    private void assertCountsSynced(StudyFinderPage studyFinder)
    {
        List<StudyFinderPage.StudyCard> studyCards = studyFinder.getStudyCards();
        Map<Dimension, Integer> studyCounts = studyFinder.getSummaryCounts();
        Map<Dimension, StudyFinderPage.DimensionPanel> dimensions = studyFinder.getDimensionPanels();

        assertEquals("Study count mismatch", studyCards.size(), studyCounts.get(Dimension.STUDIES).intValue());

        for (Dimension dim : Dimension.values())
        {
            if (dim.getSummaryLabel() != null && dim.getCaption() != null)
            {
                assertEquals("Counts out of sync: " + dim.getCaption(), studyCounts.get(dim).intValue(), dimensions.get(dim).getNonEmptyValues().size());
            }
        }
    }

    @LogMethod(quiet = true)
    private void assertSelectionsSynced(StudyFinderPage studyFinder)
    {
        Map<Dimension, StudyFinderPage.DimensionPanel> dimensionPanels = studyFinder.getDimensionPanels();
        Map<Dimension, StudyFinderPage.SummaryFilterPanel> summarySelections = studyFinder.getSelectionPanels();

        for (Dimension dim : Dimension.values())
        {
            Bag<String> panelSelections;
            if (dimensionPanels.containsKey(dim))
                panelSelections = new HashBag<>(dimensionPanels.get(dim).getSelectedValues());
            else
                panelSelections = new HashBag<>();

            Bag<String> dimensionSummarySelections;
            if (summarySelections.containsKey(dim))
                dimensionSummarySelections = new HashBag<>(summarySelections.get(dim).getFilterValues());
            else
                dimensionSummarySelections = new HashBag<>();

            assertEquals("Selection did not match summary for " + dim.getCaption(), panelSelections, dimensionSummarySelections);
        }
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("ImmPort");
    }
}
