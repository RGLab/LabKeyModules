### How to use ANT build
...
### How to use the gradle build

To use the gradle build you need to have a working LabKey dev machine.  Read this

>https://www.labkey.org/Documentation/wiki-page.view?name=devMachine

Once that's working, and only then.  Do the following:

* Checkout RGLab/LabKeyModules into the {labkey}/server/modules directory e.g.

>~/labkey/server/modules$ git clone https://github.com/RGLab/LabKeyModules LabKeyModules

* Add this line to settings.gradle near the similar looking lines

>    BuildUtils.includeModules(this.settings, rootDir, [BuildUtils.SERVER_MODULES_DIR + "/LabKeyModules"], [])

* Now rebuild, and you should see the modules in {labkey}/build/deploy/modules/

> ~/labkey$ ./gradlew --parallel deployApp

* To build a module that you can use in production add the option -PdeployMode=prod.

> ~/labkey$ ./gradlew --parallel -PdeployMode=prod deployApp

* or for one module

> ~/labkey$ ./gradlew --parallel -PdeployMode=prod :server:modules:LabKeyModules:ISCore:deployModule
 






