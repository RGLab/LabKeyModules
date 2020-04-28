import mock, { proxy } from 'xhr-mock';
import studyInfo from './data/selectRowsResponse_dataFinder_studyCard.json'

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function initMocks() {

    initMockServerContext({
        container: {
            formats: {
                dateFormat: 'yyyy-MM-dd',
                dateTimeFormat: 'yyyy-MM-dd HH:mm',
                numberFormat: null,
            },
            path: 'testContainer',
        },
        contextPath: 'http://localhost:8080/labkey'
    });

    mock.setup();

    // Select Rows
    mock.get(/.*\/query\/?.*\/getQuery.*/, (req, res) => {
        const { query } = req.url();
        const queryName = query['query.queryName'].toLowerCase();
        const schemaName = query.schemaName.toLowerCase();

        let responseBody;

        // Choose return json based on the schema.query
        if (schemaName === 'immport' && queryName === 'datafinder_studycard')
        {
            responseBody = studyInfo;
        }
        return res.status(200).headers(JSON_HEADERS).body(JSON.stringify(responseBody));
    });

    mock.use(proxy);
}

export function resetMocks() {
    mock.reset();
    mock.teardown();
}

function initMockServerContext(context: Partial<LabKey>): void {
    Object.assign(LABKEY, context);
}