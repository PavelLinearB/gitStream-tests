const axios = require('axios');

const getIssueDetails = async (issueKey, username, apiKey, url, customFields = [], callback) => {
    console.log(`getIssueDetails: issueKey - ${issueKey}, username - ${username}, apiKey - ${apiKey}, url - ${url}, customFields - ${customFields}`);
    // Replace 'your_jira_domain' with your actual Jira domain
    const jiraUrl = `https://${url}/rest/api/2/issue/${issueKey}`;

    const fields = ['summary', 'description', 'issuetype', ...customFields];

    const authString = `${username}:${apiKey}`;
    const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;    
    const headers = {
        'Authorization': `${authHeader}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    try {
        console.log(`Sending request: ${jiraUrl}, ${JSON.stringify({
            headers,
            params: {
                fields: fields.join(','),
            }})}`);

        const response = await axios.get(jiraUrl, {
            headers,
            params: {
                fields: fields.join(','),
            },
        });

        console.log(`response: ${JSON.stringify(response)}`);
        if (response.status !== 200) {
            return callback(`status code: ${response.status}`);
        }
        return callback(null,  response.data);
    
    } catch (error) {
        console.error(`Error fetching issue details from ${jiraUrl}: ${error.message}`);
        return callback(error, "");
    }
}



// export interface IGetJiraTicketDetailsArgs {
//   url: string;
//   username: string;
//   apiToken: string;
//   additionalFields: string[];
// }

// export interface JiraTicketDetails {
//   labels: string[];
//   assignee: string;
//   status: string;
//   url: string;
//   priority: string;
//   creator: string;
//   issueType: string;
//   project: string;
//   summary: string;
// }

// export interface IAdditionalFields {
//   [key: string]: { self: string; value: string | number; id: string };
// }
// const extractAdditionalFieldsValue = (additionalFields: IAdditionalFields) => {
//   const additionalFieldsValues: any = {};
//   Object.entries(additionalFields).forEach(([key, value]) => {
//     additionalFieldsValues[key] = value;
//   });
//   return additionalFieldsValues;
// };

// const getJiraTicketDetails = async (
//   issueKey: string,
//   args: IGetJiraTicketDetailsArgs,
//   callback: any,
// ): Promise<void> => {
//   const { url, username, apiToken, additionalFields } = args;
//   if (!url || !username || !apiToken || !issueKey) {
//     callback(null, JSON.stringify({}));
//     return;
//   }
//   const authString = `${username}:${apiToken}`;
//   const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

//   const headers = {
//     Authorization: authHeader,
//     Accept: 'application/json',
//   };
//   try {
//     const { data: jiraDetails } = await axios.get(
//       `${url}/rest/api/3/issue/${issueKey}`,
//       {
//         headers,
//       },
//     );

//     const fields = jiraDetails?.fields ?? {};
//     const attachAdditionalFields = pick(fields, additionalFields);
//     const results = {
//       labels: fields.labels ?? [],
//       assignee: fields.assignee?.displayName ?? '',
//       status: fields.name ?? '',
//       url: jiraDetails?.self ?? '',
//       priority: fields.priority?.name ?? '',
//       creator: fields.creator?.displayName ?? '',
//       issueType: fields.issueType?.name ?? '',
//       project: fields.project?.name ?? '',
//       summary: fields.summary ?? '',
//       ...extractAdditionalFieldsValue(attachAdditionalFields),
//     };
//     callback(null, JSON.stringify(results));
//   } catch (e) {
//     console.log('error while running getJiraTicketDetails filter', e);
//     callback(null, JSON.stringify({}));
//   }
// };

module.exports = {
    async: true,
    filter: getIssueDetails
}
