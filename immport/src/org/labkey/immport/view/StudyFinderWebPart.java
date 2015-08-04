package org.labkey.immport.view;

import org.labkey.api.data.Container;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.JspView;
import org.labkey.api.view.ViewContext;
import org.labkey.immport.ImmPortController;

/**
 * Created by matthew on 4/22/15.
 */

public class StudyFinderWebPart extends JspView
{
    public StudyFinderWebPart(Container c)
    {
        super("/org/labkey/immport/view/studyfinderNG.jsp");
        setTitle("Study Finder");
        setTitleHref(new ActionURL(ImmPortController.StudyFinderAction.class, c));
    }
    public StudyFinderWebPart(ViewContext v)
    {
        this(v.getContainer());
    }
}
