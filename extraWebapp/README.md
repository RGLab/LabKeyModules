# extraWebApp

Resources for front page and other random stuff like the rstudio viewer panel. Not a real module. extraWebApp is a (deprecated) LabKey standard directory for extra stuff.

## Entrance Page Local Development Process

1. Check out new branch. 
2. Run `npm start` to start local development server.
3. When finished developing, save and run `gradle deploy` to see your changes on your local Labkey instance.
4. Edit test-0-front.R in UITesting repository to reflect new changes made to the entrance page.
5. Follow default LKM guidelines for submitting PRs and deploying to production.

Note: Most Labkey functionalities, such as those relating to api calls, will only work if deployed on the local instance (not localhost!)


## Code Structure

* Put files in their appropriate folders. Javascript/Typescript files go in js folder, style files go in scss folder, so on.
* Each stateful components should receive their own file. 
* Create new folders for files that don't fit nicely into existing folders.
* The public folder consists of assests that are publicly availble to the browser, put things such as favicons in there.

## Resources

<!-- _Links to any helpful resources like LabKey or Notion documentation or external sources used when developing this module_ -->
https://www.notion.so/rglab/Javascript-Development-9a57dd103ae94daaa7c2942678d3dc71
