# Data Finder

To deploy: Follow the instructions in `BUILD.md` to set up gradle build. Then: 

```
~/labkey$ ./gradlew --parallel -PdeployMode=prod :server:modules:LabKeyModules:DataFinder:deployModule
```

