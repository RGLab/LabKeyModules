package org.labkey.test.pages.immport;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.LogMethod;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.io.File;

public class ImmPortBeginPage extends LabKeyPage
{
    public ImmPortBeginPage(BaseWebDriverTest test)
    {
        super(test);
    }

    protected static String getController()
    {
        return "immport";
    }

    protected static String getAction()
    {
        return "begin";
    }

    public static ImmPortBeginPage beginAt(BaseWebDriverTest test, String containerPath)
    {
        test.beginAt(WebTestHelper.buildURL(getController(), containerPath, getAction()));
        return new ImmPortBeginPage(test);
    }

    @LogMethod
    public void importArchive(File archive, boolean restricted)
    {
        _test.clickAndWait(Locator.linkWithText("Import Archive"));
        _test.setFormElement(Locator.name("path"), archive);
        if (restricted) _test.checkCheckbox(Locator.name("restricted"));
        _test.clickAndWait(Locator.css("form[name=importArchive] input[type=submit]"));
        _test.waitForPipelineJobsToComplete(1, "Load ImmPort archive", false, 600000);
    }

    @LogMethod
    public void populateCube()
    {
        _test.clickAndWait(Locator.linkWithText("Populate Cube"));
        _test.clickAndWait(Locator.css("form[name=populateCube] input[type=submit]"), 120000);
    }

    public StudyFinderPage goToStudyFinder()
    {
        _test.clickAndWait(Locator.linkWithText("Study Finder"));

        return new StudyFinderPage(_test);
    }

    //TODO: Create RestrictedStudiesPage
    public LabKeyPage goToRestrictedStudies()
    {
        _test.clickAndWait(Locator.linkWithText("Public/Restricted Studies"));

        return new LabKeyPage(_test);
    }

    public LabKeyPage copyDatasetsForAllStudies()
    {
        _test.clickAndWait(Locator.linkWithText("Copy Datasets (All)"));

        return new LabKeyPage(_test);
    }

    public CopyImmPortStudyPage copyDatasetsForOneStudy()
    {
        _test.clickAndWait(Locator.linkWithText("Copy Datasets for One Study"));

        return new CopyImmPortStudyPage(_test);
    }

    public File downloadSpecimens()
    {
        return _test.clickAndWaitForDownload(Locator.linkWithText("Import Archive"));
    }

    public LabKeyPage uploadSpecimens()
    {
        _test.clickAndWait(Locator.linkWithText("Import Archive"));
        throw new NotImplementedException();
    }
}
