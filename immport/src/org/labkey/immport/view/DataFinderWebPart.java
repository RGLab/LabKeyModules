package org.labkey.immport.view;

import org.labkey.api.data.Container;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.JspView;
import org.labkey.api.view.ViewContext;
import org.labkey.immport.ImmPortController;

/**
 * Created by matthew on 4/22/15.
 */

public class DataFinderWebPart extends JspView
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

    public DataFinderWebPart(Container c)
    {
        super("/org/labkey/immport/view/dataFinder.jsp");
        setTitle("Data Finder");
        setTitleHref(new ActionURL(ImmPortController.DataFinderAction.class, c));
    }
    public DataFinderWebPart(ViewContext v)
    {
        this(v.getContainer());
    }

    @Override
    public void setIsOnlyWebPartOnPage(boolean b)
    {
        setIsAutoResize(b);
    }
}
