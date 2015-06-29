package org.labkey.test.pages.immport;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;

import java.io.File;

/**
 * User: kevink
 * Date: 6/29/15
 */
public class ExportStudyDatasetsPage extends LabKeyPage
{
    public ExportStudyDatasetsPage(BaseWebDriverTest test)
    {
        super(test);
    }

    public File download()
    {
        Ext4CmpRef ref = new Ext4CmpRef("downloadBtn", _test);
        ref.waitForEnabled();
        return _test.clickAndWaitForDownload(Ext4Helper.Locators.ext4Button("Download"), 1)[0];
    }
}
