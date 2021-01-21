LabKeyModules
=============

LabKey Modules for [ImmuneSpace](https://www.immunespace.org/). These modules form the basis of the data processing, analysis and visualization tools within ImmuneSpace. They depend on a number of related projects, mostly R packages but also packages set up specifically for testing or frontend development. All ImmuneSpace packages are hosted on GitHub and listed with their build status in https://github.com/RGLab/status#immunespace. 

This repository includes many different modules. Thus, documentation for individual modules is included in a README in each module's directory. 

# Contributing

## Development Process
LabKeyModules develompent is closely tied to the ImmuneSpace servers as well as the [UITesting](https://github.com/RGLab/UITesting) repository and depends on many other packages. The [LabKeyModules Update Template](https://www.notion.so/rglab/LK-Modules-Update-Template-6b92a99810274cb09d1ea4a70aa1f2a1) outlines the entire process. Briefly: 

1. Identify an issue or new feature to add  
2. Create a feature branch off of `dev` named `fb_<description>`. Any changes in related packages should be made on a feature branch of he same name.  
3. Develop on your local ImmuneSpace instance  
4. Create a feature branch off the UITesting `dev` branch matching the name of the LKM feature branch and update tests so that it passes on your local  
5. Submit PRs to both LKM and UITesting and any other packages with related updates and request a review  
6. For the PR to be accepted, it must meet coding guidelines outlined below, and pass tests on the TEST server.  
7. Merge PRs into `dev` branch and submit `dev` -> `master` PRs.   
8. `dev` -> `master` PRs must pass all tests and go through code review  
9. Install updates on PROD server.  


## Code Structure
* Each module gets its own directory. Each module directory should include a README, based on README_TEMPLATE.md, outlining the basic functionality, dependencies, any other special considerations, and linking to relevant documentation online or in Notion.  
* For more details, refer to [LabKey's documentation](https://www.labkey.org/Documentation/wiki-page.view?name=simpleModules) on developing modules. 
* For React-based modules, follow guidelines outlined in [immunespace-frontend-tools](https://github.com/RGLab/ImmunespaceFrontendTools)

## Testing

Any changes should be tested. A PR without corresponding tests will not be accepted. Add integration tests to [UITesting](https://github.com/RGLab/UITesting) and cross-link PRs. Unit test React-based modules using Jest. 

## Helpful Documentation and References

### SQL 

LabKey has their own flavor of SQL, so refer to [LabKey SQL reference](https://www.labkey.org/Documentation/wiki-page.view?name=labkeysql) when writing SQL scripts. Refer to [LabKey's SQL script conventions](https://www.labkey.org/Documentation/wiki-page.view?name=sqlScriptConventions) for guidelines on developing SQL scripts. 

### ETL

We use LabKey ETLs in several different modules for tasks such as loading, caching, or updating data. See the [LabKey ETL documentation](https://www.labkey.org/Documentation/wiki-page.view?name=etlModule) for details on how to set up an ETL. An existing ETL can be run from the DataIntegration module. 

### Javascript

[LabKey javascript API reference](https://www.labkey.org/download/clientapi_docs/javascript-api/)

## Documenting

If you are creating a new module, be sure to include a README in the module directory, following the README_TEMPLATE.md format. When making changes to a module, be sure to update the README file for that module. If a module requires additional documentation, add a Notion page. 

## Style Guide

### Language-Agnostic guidelines  

LabKeyModules is built on many different coding languages, including but not limited to R, SQL, xml, Javascript, and Typescript. With some exceptions, we follow [LabKey's coding guidelines](https://www.labkey.org/Documentation/wiki-page.view?name=codingGuidelines), and follow some language-agnostic guidelines: 

1. Use descriptive variable names. See language-specific guidelines around casing. Avoid abbreviations or look up shorthands in the [glossary of variable abbreviations](https://www.notion.so/rglab/Glossary-of-variable-abbreviations-e205838b1f534abc903fa8c2228a6d7f).   
1. Include descriptive code comments. Comment every functions and method. If your code is well-written it should be clear what it is doing so comments should explain the why, not the what. 

### R

Please refer to the R style guide described in [ImmuneSpaceR](https://github.com/RGLab/ImmuneSpaceR/blob/master/CONTRIBUTING.md#package-development-guide) for guidelines on R code. Run [`styler::style_file()`](https://styler.r-lib.org/reference/style_file.html) on any R or Rmd files you edit for automatic style enforcement. 

### SQL

LabKey summarizes SQL style guidelines in their [Coding Guidelines page](https://www.labkey.org/Documentation/wiki-page.view?name=codingGuidelines), copied below: 

* Use singular nouns for table, view, and query names.
* Capitalize keywords.
* Explicitly name all constraints. If you do not, they are assigned an auto-generated default name, which makes them much harder to manipulate later.

    * Primary keys: PK_TableName
    * Foreign keys: FK_TableName_ColumnName
    * Indices: IDX_TableName_ColumnNames
    * Unique: UQ_TableName_ColumnNames

* When there is no “natural” key for a table, use the table’s name as part of the key column name. For example, use “CustomerID” as the Customer table’s PK instead of “RowID”.
* GUID columns should be named with a “GUID” suffix. For example, “CustomerGUID”.
* Junction table names should be the concatenation of the two linked table names. For example, “AppointmentProvider” is a junction table connecting “Appointment” and “Provider”.

### xml
We generally do not create our own xml document formats and are pretty limited by LabKey's formats. Follow format from examples in LabKey documentation. 

### html
Refer to [google's html style guide](https://google.github.io/styleguide/htmlcssguide.html):
* indent by 2 spaces (don't mix tabs and spaces!)
* use only lower-case when possible

### css
*  First check to see if there is already a class which will accomplish your purpose or that you can extend
*  All new class names should be lower case, and use dashes as separators. If they are specific to a module, the class name should start with the module name eg `datafinder-button`. If they are shared between modules, it should start with `immunespace-` eg `immunespace-button`.

### TypeScript and React
Our React-based modules are based on [LabKey's guidelines](https://www.labkey.org/Documentation/wiki-page.view?name=reactJSdev) and modeled on LabKey's [demo module](https://github.com/LabKey/tutorialModules/tree/develop/demo). Refer to [immunespace-frontend-tools](https://github.com/RGLab/ImmunespaceFrontendTools) for a full development and style guide for React modules. 

