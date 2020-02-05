# Data Finder

To deploy: Follow the instructions in `BUILD.md` to set up gradle build. Then: 

```
~/labkey$ ./gradlew --parallel -PdeployMode=prod :server:modules:LabKeyModules:DataFinder:deployModule
```

## Directory And Code Structure
```
├── resources
│   ├── olap/
│   └── queries/
├── src/
│   └── client/
│       ├── Banner/
│       ├── DataFinder/
│       │   ├── components/
│       │   │   └── d3/
│       │   └── helpers/
│       ├── tests/
│       ├── theme/
│       └── typings/
└── webpack/
```
* More details about this [here](https://www.notion.so/rglab/Directory-Structure-for-React-Module-bdadaef3a05641d1bba6c870bfe292b7).
* For d3 components, I'm generally using [this example](https://towardsdatascience.com/react-d3-the-macaroni-and-cheese-of-the-data-visualization-world-12bafde1f922)
* Types for component props and function arguments are declared in the same file as the component. All other types are in the `typings/` directory.

## Data Structures
The main data structures used for state are Immutable (`CubeData`, `SelectedFilters`, `FilterCategories`, `StudyInfo`). 




