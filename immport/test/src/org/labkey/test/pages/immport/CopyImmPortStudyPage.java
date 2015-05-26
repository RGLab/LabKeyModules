package org.labkey.test.pages.immport;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.LabKeyPage;

public class CopyImmPortStudyPage extends LabKeyPage
{
    public CopyImmPortStudyPage(BaseWebDriverTest test)
    {
        super(test);
    }

    public LabKeyPage copyStudyResults(String study)
    {
        _test.setFormElement(Locator.id("replaceResultsForm").append(Locator.id("$STUDY")), study);
        Locator.id("replaceResultsForm").findElement(getDriver()).submit();
        return new LabKeyPage(_test); // TODO: pipeline-status DetailsAction
    }

    public LabKeyPage appendStudyResults(String study)
    {
        _test.setFormElement(Locator.id("appendResultsForm").append(Locator.id("$STUDY")), study);
        Locator.id("appendResultsForm").findElement(getDriver()).submit();
        return new LabKeyPage(_test); // TODO: pipeline-status DetailsAction
    }
}
