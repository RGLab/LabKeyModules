
package org.labkey.test.tests.datafinder;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.categories.Git;

import java.util.Arrays;
import java.util.List;

@Category({Git.class})
public class DataFinderReactTest extends BaseWebDriverTest
{
    @Override
    protected String getProjectName()
    {
        return "Data Finder React Test Project";
    }

    @Override
    public List<String> getAssociatedModules()
    {
        return Arrays.asList("DataFinder");
    }

    @BeforeClass
    public static void setupProject()
    {
        DataFinderReactTest init = (DataFinderReactTest) getCurrentTest();
        init.doSetup();
    }

    @Before
    public void preTest()
    {
        // Import sample data, studies
    }

    // This will create a new project on your server and enable the required modules
    private void doSetup()
    {
        log("Create a simple DataFinder project.");
        _containerHelper.createProject(getProjectName(), "Dataspace");
        _containerHelper.enableModules(Arrays.asList("DataFinder", "DataExplorer", "ImmPort"));
        goToProjectHome(getProjectName());
    }


    // This is one example test, they are normally much longer and include manipulating the web pages to ensure
    // proper functionality
    @Test
    public void testDataFinder() throws Exception
    {
        goToProjectHome();
        assertTextPresent(getProjectName());
    }
}