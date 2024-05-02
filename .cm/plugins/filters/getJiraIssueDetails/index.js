const axios = require('axios');

const getIssueDetails = async (issueIdOrKey, userEmail, jiraApiToken, jiraInstanceDomain, customFields = [], callback) => {
    console.log(`getIssueDetails: issueIdOrKey - ${issueIdOrKey}, userEmail - ${userEmail}, jiraApiToken - ${jiraApiToken}, jiraInstanceDomain - ${jiraInstanceDomain}`);
    
    const defaultFields = ['summary', 'description', 'issuetype'];
    const fields = [...new Set([...defaultFields, ...customFields])].join(',');
    const url = `https://${jiraInstanceDomain}/rest/api/3/issue/${issueIdOrKey}`;

    console.log(`Fetching Jira issue with ID/Key: ${issueIdOrKey}, Fields: ${fields}`);

    try {
        const authHeader = `Basic ${Buffer.from(`${userEmail}:${jiraApiToken}`).toString('base64')}`;    
        const response = await axios.get(url, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            },
            params: { fields }
        });

        if (response.status === 200) {
            console.log(`Successfully retrieved Jira issue: ${issueIdOrKey}`);
            return callback(null, response.data);
        } else {
            throw new Error(`Received non-200 response status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error fetching Jira issue with ID/Key: ${issueIdOrKey}`, error);
        return callback(error, null);
    }
};

module.exports = {
    async: true,
    filter: getJiraIssueDetails
};
