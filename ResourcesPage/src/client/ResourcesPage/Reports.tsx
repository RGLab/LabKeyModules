import * as React from "react";

export const Reports = () => {
    // Define baseUrl 
    var baseUrl = window.location.origin;

    // Define path to image resources
    // Actual path in directory is ResourcesPage/resources/web/ResourcesPage/images
    var imgPath = '/ResourcesPage/images/'

    var data = [
        {
            study: 'SDY144',
            link: '/reports/Studies/SDY144/runReport.view?reportId=module%3ASDY144%2Freports%2Fschemas%2Fstudy%2Fdemographics%2FHAI_VN_vs_plasma_cells.Rmd',
            img: 'SDY144_report_thumbnail.png',
            title: 'Correlation of HAI/VN and plasma cell counts',
            text: 'Reproduction of Figure 2 of Cao RG et al, "Differences in antibody responses between trivalent inactivated influenza vaccine and live attenuated influenza vaccine correlate with the kinetics and magnitude of interferon signaling in children." J Infect Dis 210(2), 2014 Jul 15.'
        },
        {
            study: 'SDY180',
            link: '/reports/Studies/SDY180/runReport.view?reportId=module%3ASDY180%2Freports%2Fschemas%2Fstudy%2Fdemographics%2Fplasmablast_abundance.Rmd',
            img: 'SDY180_report_thumbnail.png',
            title: 'Measuring plasmablast abundance by multi-parameter flow cytometry',
            text: 'This report investigates the abundance of plasmablast (and other B cell subsets) over time after vaccination with Pneumovax, Fluzone, or no vaccination (saline control group). The results are similar to those reported in Figure 6 B of Obermoser et al. (2013).'
        },
        {
            study: 'SDY207',
            link: '/project/Studies/SDY207/begin.view?pageId=Reports',
            img: 'SDY207_report_thumbnail.png',
            title: 'Multiple custom reports related to CyTOF and Flow Cytometry Data',
            text: 'These reports take advantage of a rich cytometry dataset to do things like compare power analyses using manual and automated gating.'
        },
        {
            study: 'SDY269',
            link: '/reports/Studies/SDY269/runReport.view?reportId=module%3ASDY269%2Freports%2Fschemas%2Fhai_flow_elispot.Rmd',
            img: 'SDY269_report_thumbnail.png',
            title: 'Correlating HAI with flow cytometry and ELISPOT results',
            text: 'This report investigates the association between the number influenza-specific cells measured by ELISPOT measured at day 7 with the number of plasmablast measured by flow cytometry at day 7 and the HAI response measured at day 28 (log-fold day28/day0). It reproduces Figure 1 (d-e) of Nakaya et al. (2011)'
        },
        {
            study: 'ImmuneSignatures 1',
            link: '/project/HIPC/IS1/begin.view?pageId=Report',
            img: 'IS1_report_thumbnail.png',
            title: 'Influenza Vaccine Meta-Analysis to define genetic predictors of vaccine response',
            text: 'Reproduction of figures from HIPC-CHI Signatures Project Team, "Multicohort analysis reveals baseline transcriptional predictors of influenza vaccination responses." Science Immunology 25 Aug 2017: Vol. 2, Issue 14.'
        },
        {
            study: 'Lyoplate',
            link: '/project/HIPC/Lyoplate/begin.view?pageId=Analyses',
            img: 'Lyoplate_report_thumbnail.png',
            title: 'Standardizing Flow Cytometry Immunophenotyping from Reagents to Analyses:  Results of the Human ImmunoPhenotyping Consortium',
            text: 'Standardization of flow cytometry assays requires careful attention to reagents, sample handling, instrument setup, and data analysis, and is essential for successful cross-study and cross-center performance and analysis of large data sets. Analyses from HIP-C attempt to determine whether automated methods were a suitable approach to streamline and further standardize analysis'
        }
    ]
    
    // React requires each list element have a unique key for DOM.
    // However this key is NOT shown in the inspector.
    const reportsList = data.map(function(report){
        var fullUrl = baseUrl + report.link
        return(
            <tr key={report.study}>
                <td className="hr-imgCol">
                    <img className="hr-staticImg" src={imgPath + report.img}/>
                </td>
                <td className="hr-infoCol">
                    <h2>{report.title}</h2>
                    <a href={fullUrl}>{report.study}</a>
                    <p>{report.text}</p>
                </td>
            </tr>
        )
    })

    return(
        <div id="Reports-content">
            <table>
                <tbody>
                    {reportsList}
                </tbody>
            </table>
        </div>
        
    )
}