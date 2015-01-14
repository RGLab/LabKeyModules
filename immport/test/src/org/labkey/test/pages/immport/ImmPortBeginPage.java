package org.labkey.test.pages.immport;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.LabKeyPage;
import sun.reflect.generics.reflectiveObjects.NotImplementedException;

import java.io.File;

public class ImmPortBeginPage
{
    BaseWebDriverTest _test;

    public ImmPortBeginPage(BaseWebDriverTest test)
    {
        _test = test;
    }

    public void importArchive(String pathToArchive, boolean restricted)
    {
        _test.clickAndWait(Locator.linkWithText("Import Archive"));
        _test.setFormElement(Locator.name("path"), pathToArchive);
        if (restricted) _test.checkCheckbox(Locator.name("restricted"));
        _test.clickAndWait(Locator.tagWithAttribute("input", "type", "submit"));
    }

    public void populateCube()
    {
        _test.clickAndWait(Locator.linkWithText("Populate Cube"));
        _test.clickAndWait(Locator.tagWithAttribute("input", "type", "submit"), 120000);
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

    //TODO: Create CopyImmPortStudyPage
    public LabKeyPage copyDatasetsForOneStudy()
    {
        _test.clickAndWait(Locator.linkWithText("Copy Datasets for One Study"));

        return new LabKeyPage(_test);
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
