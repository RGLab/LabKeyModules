package org.labkey.immport.view;

import org.labkey.api.data.Container;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.JspView;
import org.labkey.api.view.ViewContext;
import org.labkey.immport.ImmPortController;

/**
 * Created by matthew on 4/22/15.
 */

public class SubjectFinderWebPart extends JspView
{
    boolean isAutoResize = false;

    public boolean isAutoResize()
    {
        return isAutoResize;
    }

    public void setIsAutoResize(boolean isAutoResize)
    {
        this.isAutoResize = isAutoResize;
    }

    public SubjectFinderWebPart(Container c)
    {
        super("/org/labkey/immport/view/subjectfinderNG.jsp");
        setTitle("Study Finder");
        setTitleHref(new ActionURL(ImmPortController.SubjectFinderAction.class, c));
    }
    public SubjectFinderWebPart(ViewContext v)
    {
        this(v.getContainer());
    }

    @Override
    public void setIsOnlyWebPartOnPage(boolean b)
    {
        setIsAutoResize(b);
    }
}
