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
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpUriRequest;
import org.junit.Assert;
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
import org.labkey.test.categories.InDevelopment;
import org.labkey.test.components.ParticipantListWebPart;
import org.labkey.test.components.immport.StudySummaryWindow;
import org.labkey.test.components.study.StudyOverviewWebPart;
import org.labkey.test.pages.immport.DataFinderPage;
import org.labkey.test.pages.immport.DataFinderPage.Dimension;
import org.labkey.test.pages.immport.ExportStudyDatasetsPage;
import org.labkey.test.pages.immport.ImmPortBeginPage;
import org.labkey.test.pages.study.OverviewPage;
import org.labkey.test.util.APIContainerHelper;
import org.labkey.test.util.AbstractContainerHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.ReadOnlyTest;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4GridRef;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.Charset;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

@Category({InDevelopment.class})
public class DataFinderTest extends BaseWebDriverTest implements PostgresOnlyTest, ReadOnlyTest
{
    private static File immPortArchive = TestFileUtils.getSampleData("HIPC/ANIMAL_STUDIES-DR11.zip");
    private static File TEMPLATE_ARCHIVE = TestFileUtils.getSampleData("HIPC/SDY_template.zip");
    private static String[] ANIMAL_STUDIES = {"SDY99", "SDY139", "SDY147", "SDY208", "SDY215", "SDY217"};
    private static String[] STUDY_SUBFOLDERS = {"SDY139", "SDY147", "SDY208", "SDY217"};

    @Override
    protected String getProjectName()
    {
        return "ImmuneSpace Test Data Finder";
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
        DataFinderTest init = (DataFinderTest)getCurrentTest();

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
        new PortalHelper(this).addWebPart("ImmPort Data Finder");

        containerHelper.createSubfolder(getProjectName(), "SDY_template", "Study");
        importStudyFromZip(TEMPLATE_ARCHIVE, true, true);


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

        // Navigate to pipeline status page and show jobs in sub-folders
        beginAt("/pipeline-status/" + getProjectName() + "/showList.view?StatusFiles.containerFilterName=CurrentAndSubfolders");
        int expectedJobs =
                  1                       // load ImmPort archive
                + 1                       // SDY_template folder import
                + STUDY_SUBFOLDERS.length // copy datasets jobs
        ;
        waitForPipelineJobsToComplete(expectedJobs, "immport data copy", false);

        ImmPortBeginPage.beginAt(this, getProjectName()).populateCube();
    }

    @Before
    public void preTest()
    {
        clearSharedStudyContainerFilter();
        goToProjectHome();
        DataFinderPage finder = new DataFinderPage(this);
        finder.clearSearch();
        try
        {
            finder.clearAllFilters();
        }
        catch (NoSuchElementException ignore) {}
        finder.dismissTour();
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
        DataFinderPage finder = new DataFinderPage(this);
        assertCountsSynced(finder);

        Map<Dimension, Integer> studyCounts = finder.getSummaryCounts();

        for (Map.Entry<Dimension, Integer> count : studyCounts.entrySet())
        {
            if (count.getKey().getSummaryLabel() != null)
                assertNotEquals("No " + count.getKey().getSummaryLabel(), 0, count.getValue().intValue());
        }
    }

    @Test
    public void testStudyCards()
    {
        DataFinderPage finder = DataFinderPage.goDirectlyToPage(this, getProjectName());

        List<DataFinderPage.StudyCard> studyCards = finder.getStudyCards();

        studyCards.get(0).viewSummary();
    }

    @Test
    public void testImmuneSpaceStudySubset()
    {
        DataFinderPage finder = DataFinderPage.goDirectlyToPage(this, getProjectName());

        finder.showAllImmPortStudies();
        assertEquals("Wrong ImmPort studies have LabKey study links", Arrays.asList(STUDY_SUBFOLDERS),
                getTexts(Locator.tagWithClass("div", "labkey-study-card").withPredicate(Locator.linkWithText("go to study"))
                        .append(Locator.tagWithClass("span", "labkey-study-card-accession")).findElements(getDriver())));

        finder.showAllImmuneSpaceStudies();
        List<DataFinderPage.StudyCard> studyCards = finder.getStudyCards();
        List<String> studies = new ArrayList<>();
        for (DataFinderPage.StudyCard studyCard : studyCards)
        {
            studies.add(studyCard.getAccession());
        }
        assertEquals("Wrong study cards for ImmuneSpace studies", Arrays.asList(STUDY_SUBFOLDERS), studies);
    }

    @Test
    public void testSelection()
    {
        DataFinderPage finder = new DataFinderPage(this);
        finder.showAllImmPortStudies();

        Map<Dimension, DataFinderPage.DimensionPanel> dimensionPanels = finder.getDimensionPanels();

        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();
        String selectedGender = dimensionPanels.get(Dimension.GENDER).selectFirstIntersectingMeasure();

        assertCountsSynced(finder);
        assertSelectionsSynced(finder);

        dimensionPanels.get(Dimension.SPECIES).selectAll();

        List<String> finalSelectedGenders = dimensionPanels.get(Dimension.GENDER).getSelectedValues();
        List<String> finalSelectedSpecies = dimensionPanels.get(Dimension.SPECIES).getSelectedValues();

        assertEquals("Clearing Species selection removed Gender filter", Collections.singletonList(selectedGender), finalSelectedGenders);
        assertEquals("Clicking 'ALL' didn't clear species selection", Collections.emptyList(), finalSelectedSpecies);

        assertCountsSynced(finder);
        assertSelectionsSynced(finder);
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

        DataFinderPage finder = DataFinderPage.goDirectlyToPage(this, getProjectName());

        WebElement emptyMember = Locator.css("fieldset.group-fieldset > div.emptyMember").waitForElement(shortWait());
        String value = emptyMember.getText().trim();
        emptyMember.click();

        finder.waitForSelection(value);

        List<DataFinderPage.StudyCard> filteredStudyCards = finder.getStudyCards();
        Map<Dimension, Integer> filteredSummaryCounts = finder.getSummaryCounts();

        assertEquals("Study cards visible after selection", 0, filteredStudyCards.size());
        assertEquals("Wrong counts after selecting empty measure", expectedCounts, filteredSummaryCounts);
    }

    @Test
    public void testSearch()
    {
        DataFinderPage finder = DataFinderPage.goDirectlyToPage(this, getProjectName());
        finder.showAllImmPortStudies();

        List<DataFinderPage.StudyCard> studyCards = finder.getStudyCards();
        String searchString = studyCards.get(0).getAccession();

        finder.studySearch(searchString);

        shortWait().until(ExpectedConditions.stalenessOf(studyCards.get(1).getCardElement()));
        studyCards = finder.getStudyCards();

        assertEquals("Wrong number of studies after search", 1, studyCards.size());

        assertCountsSynced(finder);
    }

    @Test
    public void testStudySummaryWindow()
    {
        DataFinderPage finder = DataFinderPage.goDirectlyToPage(this, getProjectName());

        DataFinderPage.StudyCard studyCard = finder.getStudyCards().get(0);

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
        Map<String, Integer> finderParticipantCounts = new HashMap<>();
        Map<String, Integer> studyParticipantCounts = new HashMap<>();

        DataFinderPage finder = new DataFinderPage(this);
        for (String studyAccession : STUDY_SUBFOLDERS)
        {
            finder.studySearch(studyAccession);
            finderParticipantCounts.put(studyAccession, finder.getSummaryCounts().get(Dimension.PARTICIPANTS));
        }

        for (String studyAccession : STUDY_SUBFOLDERS)
        {
            clickFolder(studyAccession);
            StudyOverviewWebPart studyOverview = new StudyOverviewWebPart(this);
            studyParticipantCounts.put(studyAccession, studyOverview.getParticipantCount());
        }

        assertEquals("Participant counts in study finder don't match LabKey studies", finderParticipantCounts, studyParticipantCounts);
    }

    @Test
    public void testStudyCardStudyLinks()
    {
        Set<String> foundAccessions = new HashSet<>();
        for (int i = 0; i < STUDY_SUBFOLDERS.length; i++)
        {
            DataFinderPage finder = new DataFinderPage(this);
            DataFinderPage.StudyCard studyCard = finder.getStudyCards().get(i);
            String studyAccession = studyCard.getAccession();
            foundAccessions.add(studyAccession);
            studyCard.clickGoToStudy();
            WebElement title = Locator.css(".labkey-folder-title").waitForElement(shortWait());
            assertEquals("Study card linked to wrong study", studyAccession, title.getText());
            goBack();
        }

        assertEquals("Didn't find all studies", new HashSet<>(Arrays.asList(STUDY_SUBFOLDERS)), foundAccessions);
    }

    @Test
    public void testNavigationDoesNotRemoveFinderFilter()
    {
        DataFinderPage finder = new DataFinderPage(this);
        Map<Dimension, DataFinderPage.DimensionPanel> dimensionPanels = finder.getDimensionPanels();
        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();

        Map<Dimension, List<String>> selections = finder.getSelectionValues();
        clickTab("Manage");
        clickTab("Overview");
        assertEquals("Navigation cleared study finder filter", selections, finder.getSelectionValues());
    }

    @Test
    public void testRefreshDoesNotRemoveFinderFilter()
    {
        DataFinderPage finder = new DataFinderPage(this);
        Map<Dimension, DataFinderPage.DimensionPanel> dimensionPanels = finder.getDimensionPanels();
        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();

        Map<Dimension, List<String>> selections = finder.getSelectionValues();
        refresh();
        assertEquals("'Refresh' cleared study finder filter", selections, finder.getSelectionValues());
    }

    @Test
    public void testBackDoesNotRemoveFinderFilter()
    {
        DataFinderPage finder = new DataFinderPage(this);
        Map<Dimension, DataFinderPage.DimensionPanel> dimensionPanels = finder.getDimensionPanels();
        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();

        Map<Dimension, List<String>> selections = finder.getSelectionValues();
        clickTab("Manage");
        goBack();
        assertEquals("'Back' cleared study finder filter", selections, finder.getSelectionValues());
    }

    @Test
    public void testFinderWebPartAndActionShareFilter()
    {
        DataFinderPage finder = new DataFinderPage(this);
        Map<Dimension, DataFinderPage.DimensionPanel> dimensionPanels = finder.getDimensionPanels();
        dimensionPanels.get(Dimension.SPECIES).selectFirstIntersectingMeasure();

        Map<Dimension, List<String>> selections = finder.getSelectionValues();
        DataFinderPage.goDirectlyToPage(this, getProjectName());
        assertEquals("WebPart study finder filter didn't get applied", selections, finder.getSelectionValues());
    }

    @Test
    public void testStickyFinderFilterOnDataset()
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

        DataFinderPage finder = new DataFinderPage(this);
        finder.getDimensionPanels().get(Dimension.CATEGORY).select("Immune Response");

        Map<Dimension, Integer> finderSummaryCounts = finder.getSummaryCounts();
        assertEquals("Study finder counts not as expected for 'Immune Response'.", expectedCounts, finderSummaryCounts);

        clickAndWait(Locator.linkContainingText("datasets"));
        clickAndWait(Locator.linkWithText("Demographics"));
        DataRegionTable demData = new DataRegionTable("Dataset", this);
        demData.showAll();
        demData.openFilterDialog("gender");
        assertEquals("Demographics data set doesn't have same number of genders as filtered study finder",
                Locator.css(".labkey-filter-dialog .labkey-link").findElements(getDriver()).size(), finderSummaryCounts.get(Dimension.GENDER).intValue());
        clickButton("Cancel", 0);

        demData.openFilterDialog("race");
        assertEquals("Demographics dataset doesn't have same number of races as filtered study finder",
                Locator.css(".labkey-filter-dialog .labkey-link").findElements(getDriver()).size(), finderSummaryCounts.get(Dimension.RACE).intValue());
        clickButton("Cancel", 0);

        demData.openFilterDialog("species");
        assertEquals("Demographics dataset doesn't have same number of species as filtered study finder",
                Locator.css(".labkey-filter-dialog .labkey-link").findElements(getDriver()).size(), finderSummaryCounts.get(Dimension.SPECIES).intValue());
        clickButton("Cancel", 0);

        assertEquals("Demographics dataset doesn't have same number of participants as filtered study finder",
                demData.getDataRowCount(), finderSummaryCounts.get(Dimension.PARTICIPANTS).intValue());

        clickTab("Participants");
        ParticipantListWebPart participantListWebPart = new ParticipantListWebPart(this);
        assertEquals("Participant list count doesn't match study finder", participantListWebPart.getParticipantCount(), finderSummaryCounts.get(Dimension.PARTICIPANTS));
    }

    @Test
    public void testStickyFinderFilterOnStudyNavigator()
    {
        DataFinderPage finder = new DataFinderPage(this);
        finder.dismissTour();
        finder.getDimensionPanels().get(Dimension.CATEGORY).select("Immune Response");

        List<String> assaysWithData = finder.getDimensionPanels().get(Dimension.ASSAY).getNonEmptyValues();
        List<String> assaysWithoutData = finder.getDimensionPanels().get(Dimension.ASSAY).getEmptyValues();
        Map<Dimension, Integer> finderSummaryCounts = finder.getSummaryCounts();

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

        // Issue 23689: study overview navigator displays incorrect participant and row counts for demographics
//        assertEquals("Participant count from study finder does not match Demographics dataset participant count.",
//                finderSummaryCounts.get(Dimension.PARTICIPANTS), studyOverviewParticipantCounts.get("Demographics"));
    }

//    @Test
    public void testDatasetExport() throws IOException
    {
        DataFinderPage finder = DataFinderPage.goDirectlyToPage(this, getProjectName());
        finder.dismissTour();
        finder.getDimensionPanels().get(Dimension.CATEGORY).select("Immune Response");

        Map<Dimension, Integer> studyCounts = finder.getSummaryCounts();
        assertEquals("Study count mismatch", 2, studyCounts.get(Dimension.STUDIES).intValue());

        final int fcs_analyzed_rowCount = 78;

        log("Verify dataset row counts");
        ExportStudyDatasetsPage exportDatasetsPage = finder.exportDatasets();
        // wait for all the dataset row counts to be loaded
        Ext4CmpRef ref = new Ext4CmpRef("downloadBtn", this);
        ref.waitForEnabled();

        Ext4GridRef grid = new Ext4GridRef("datasets", this);
        Map<String, Integer> datasetCounts = new HashMap<>();
        for (int i = 1; i < grid.getRowCount()+1; i++)
        {
            String name = (String)grid.getFieldValue(i, "name");
            Long datasetId = (Long)grid.getFieldValue(i, "id");
            Long numRows = (Long)grid.getFieldValue(i, "numRows");
            datasetCounts.put(name, numRows.intValue());
        }

        Assert.assertEquals(2, datasetCounts.get("StudyProperties").intValue());
        Assert.assertEquals(345, datasetCounts.get("demographics").intValue());
        Assert.assertEquals(960, datasetCounts.get("elispot").intValue());
        Assert.assertEquals(fcs_analyzed_rowCount, datasetCounts.get("fcs_analyzed_result").intValue());


        log("Download datasets zip");
        final File exportedFile = exportDatasetsPage.download();
        assertTrue("Expected file name to end in .tables.zip: " + exportedFile.getAbsolutePath(), exportedFile.getName().endsWith(".tables.zip"));
        assertTrue("Exported file does not exist: " + exportedFile.getAbsolutePath(), exportedFile.exists());

        waitFor(new Checker() {
            @Override
            public boolean check() {
                return exportedFile.length() > 0;
            }
        }, "Exported file is empty", WAIT_FOR_JAVASCRIPT * 10);


        log("Validate contents");
        try (FileSystem fs = FileSystems.newFileSystem(exportedFile.toPath(), null)) {
            // Verify StudyProperties.tsv exists
            Path p = fs.getPath("StudyProperties.tsv");
            Assert.assertTrue("Expected file within doesn't exist: " + p, Files.exists(p));

            // Extract a file
            List<String> lines = Files.readAllLines(fs.getPath("fcs_analyzed_result.tsv"), Charset.forName("UTF-8"));
            Assert.assertEquals(
                    "Expected " + fcs_analyzed_rowCount + " rows and header (dumping first two lines):\n" +
                            StringUtils.join(lines.subList(0, 2), "\n"),
                    fcs_analyzed_rowCount + 1, lines.size());
        }
    }

    @LogMethod(quiet = true)
    private void assertCountsSynced(DataFinderPage finder)
    {
        List<DataFinderPage.StudyCard> studyCards = finder.getStudyCards();
        Map<Dimension, Integer> studyCounts = finder.getSummaryCounts();
        Map<Dimension, DataFinderPage.DimensionPanel> dimensions = finder.getDimensionPanels();

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
    private void assertSelectionsSynced(DataFinderPage finder)
    {
        Map<Dimension, DataFinderPage.DimensionPanel> dimensionPanels = finder.getDimensionPanels();
        Map<Dimension, DataFinderPage.SummaryFilterPanel> summarySelections = finder.getSelectionPanels();

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
