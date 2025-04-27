/**
 * @module askLBChangeLog
 * @description A gitStream plugin to interact with AI models. Currently works with `ChatGPR-4o-mini`.
 * @param {Object} context - The context that will be attached to the prompt .
 * @param {string} description - The pr description.
 * @param {Object} token - The token to the AI model.
 * @returns {Object} Returns the response from the AI model.
 * @example {{ branch | generateDescription(pr, repo, source) }}
 * @license MIT
 * */

const CHANGELOG_PROMPT = `You are an experienced software developer tasked with generating a concise changelog entry based on a Pull Request (PR) description and optional code changes. Your goal is to make a clear, one-line description of the changes introduced.

First, if available, examine the code changes associated with this PR. Next, review the following PR description.

Analyze the information provided and create a brief changelog entry. Follow these steps inside <changelog_preparation> tags:

1. Determine if there are any code changes:
   - If there are code changes, analyze both the PR description and the code changes.
   - If there are no code changes, base your analysis solely on the PR description.
   - Write down any key phrases from the PR description or important code snippets that support your analysis.

2. Identify the main purpose and impact of this update:
   - What is the most significant change or new feature introduced?
   - How does this change affect the project or its users?
   - Consider and note down the impact on different aspects such as functionality, performance, and user experience.

3. Draft a concise changelog entry that:
   - Clearly describes the main change or feature
   - Uses present tense (e.g., "Adds", "Fixes", "Improves")
   - Avoids technical jargon unless absolutely necessary

4. Review your draft to ensure it meets these requirements:
   - It is a single, concise sentence
   - It captures the essence of the change without unnecessary details
   - It is clear and understandable to both technical and non-technical readers

5. Prepare the final changelog entry by:
   - Adding today's date in the format YYYY-MM-DD
   - Formatting it as: "YYYY-MM-DD: Brief description of the change.

Based on your analysis, generate the final changelog entry. Output your changelog inside <changelog> tags, following this format:

<changelog>
YYYY-MM-DD: Brief description of the change.
</changelog>

Example (do not use this content, it's just to illustrate the format):
<changelog>
2023-05-20: Implements caching mechanism to improve API response times.
</changelog>`;

/**
 * @module askAI
 * @description A gitStream plugin to interact with AI models. Currently works with `ChatGPR-4o-mini`.
 * @param {Object} context - The context that will be attached to the prompt .
 * @param {string} role - Role instructions for the conversation.
 * @param {string} prompt - The prompt string.
 * @param {Object} token - The token to the AI model.
 * @returns {Object} Returns the response from the AI model.
 * @example {{ branch | generateDescription(pr, repo, source) }}
 * @license MIT
 * */

const MAX_TOKENS = 4096;
const OPEN_AI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const LOCK_FILES = [
  'package-lock.json',
  'yarn.lock',
  'npm-shrinkwrap.json',
  'Pipfile.lock',
  'poetry.lock',
  'conda-lock.yml',
  'Gemfile.lock',
  'composer.lock',
  'packages.lock.json',
  'project.assets.json',
  'pom.xml',
  'Cargo.lock',
  'mix.lock',
  'pubspec.lock',
  'go.sum',
  'stack.yaml.lock',
  'vcpkg.json',
  'conan.lock',
  'ivy.xml',
  'project.clj',
  'Podfile.lock',
  'Cartfile.resolved',
  'flake.lock',
  'pnpm-lock.yaml',
  'uv.lock'
];
const EXCLUDE_EXPRESSIONS_LIST = [
  '.*\\.(ini|csv|xls|xlsx|xlr|doc|docx|txt|pps|ppt|pptx|dot|dotx|log|tar|rtf|dat|ipynb|po|profile|object|obj|dxf|twb|bcsymbolmap|tfstate|pdf|rbi|pem|crt|svg|png|jpeg|jpg|ttf)$',
  '.*(package-lock|packages\\.lock|package)\\.json$',
  '.*(yarn|gemfile|podfile|cargo|composer|pipfile|gopkg)\\.lock$',
  '.*gradle\\.lockfile$',
  '.*lock\\.sbt$',
  '.*dist/.*\\.js',
  '.*public/assets/.*\\.js',
  '.*ci\\.yml$'
];
const IGNORE_FILES_REGEX_LIST = [
  ...LOCK_FILES.map(f => f.replace('.', '\\.')),
  ...EXCLUDE_EXPRESSIONS_LIST
];
const EXCLUDE_PATTERN = new RegExp(IGNORE_FILES_REGEX_LIST.join('|'));

/**
 * @description Check if a file should be excluded from the context like "package-lock.json"
 * @param {*} fileObject
 * @returns returns true if the file should be excluded
 */
const shouldExcludeFile = fileObject => {
  const shouldExludeByName = EXCLUDE_PATTERN.test(fileObject.original_file);
  const shouldExludeBySize = (fileObject.diff?.split(' ').length ?? 0) > 1000;

  return shouldExludeByName || shouldExludeBySize;
};

/**
 * @description Check if a file should be included in the context
 * @param {*} fileObject
 * @returns returns true if the file should be included
 */
const shouldIncludeFile = fileObject => {
  return !shouldExcludeFile(fileObject);
};

const buildContextForGPT = context => {
  if (Array.isArray(context)) {
    return context.filter(element =>
      typeof element !== 'object' ? true : context.filter(shouldIncludeFile)
    );
  }

  if (context?.diff?.files) {
    const files = context.diff.files.filter(shouldIncludeFile);
    return files;
  }

  return context;
};

const askLBChangeLog = async (context, description, token, callback) => {
  const formattedContext = buildContextForGPT(context);

  if (!formattedContext?.length) {
    const message = `There are no context files to analyze.\nAll ${context?.diff?.files?.length} files were excluded by pattern or size.`;
    console.log(message);
    return callback(null, message);
  }

  const response = await fetch(OPEN_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: `You are an experienced software developer. Answer only to the request, without any introductory or conclusion text.`
        },
        {
          role: 'user',
          content: `CODE CHANGES: ${JSON.stringify(formattedContext)}`
        },
        {
          role: 'user',
          content: `PR DESCRIPTION: ${description}`
        },
        { role: 'user', content: CHANGELOG_PROMPT }
      ],
      max_tokens: MAX_TOKENS
    })
  });

  const data = await response.json();

  if (data?.error?.message) {
    console.error(data.error.message);
    return callback(null, data.error.message);
  }

  const suggestion =
    data.choices?.[0]?.message?.content ??
    'context was too big for api, try with smaller context object';

  return callback(null, suggestion);
};

module.exports = {
  async: true,
  filter: askLBChangeLog
};

// const WORDS_LIMIT = 100000;
// const LOCK_FILES = [
//   'package-lock.json',
//   'yarn.lock',
//   'npm-shrinkwrap.json',
//   'Pipfile.lock',
//   'poetry.lock',
//   'conda-lock.yml',
//   'Gemfile.lock',
//   'composer.lock',
//   'packages.lock.json',
//   'project.assets.json',
//   'pom.xml',
//   'Cargo.lock',
//   'mix.lock',
//   'pubspec.lock',
//   'go.sum',
//   'stack.yaml.lock',
//   'vcpkg.json',
//   'conan.lock',
//   'ivy.xml',
//   'project.clj',
//   'Podfile.lock',
//   'Cartfile.resolved',
//   'flake.lock',
//   'pnpm-lock.yaml'
// ];
// const EXCLUDE_EXPRESSIONS_LIST = [
//   '.*\\.(ini|csv|xls|xlsx|xlr|doc|docx|txt|pps|ppt|pptx|dot|dotx|log|tar|rtf|dat|ipynb|po|profile|object|obj|dxf|twb|bcsymbolmap|tfstate|pdf|rbi|pem|crt|svg|png|jpeg|jpg|ttf)$',
//   '.*(package-lock|packages\\.lock|package)\\.json$',
//   '.*(yarn|gemfile|podfile|cargo|composer|pipfile|gopkg)\\.lock$',
//   '.*gradle\\.lockfile$',
//   '.*lock\\.sbt$',
//   '.*dist/.*\\.js',
//   '.*public/assets/.*\\.js',
//   '.*ci\\.yml$'
// ];
// const IGNORE_FILES_REGEX_LIST = [
//   ...LOCK_FILES.map(f => f.replace('.', '\\.')),
//   ...EXCLUDE_EXPRESSIONS_LIST
// ];
// const EXCLUDE_PATTERN = new RegExp(IGNORE_FILES_REGEX_LIST.join('|'));

// const getLinearbAIContext = () => {
//   const payload = getClientPayload();
//   const {
//     source,
//     installationId,
//     owner,
//     repo,
//     pullRequestNumber,
//     branch,
//     prContext: { author, url },
//     webhookEventName
//   } = payload;

//   const context = {
//     source,
//     installationId,
//     owner,
//     repo,
//     pullRequestNumber,
//     branch,
//     author,
//     url,
//     webhookEventName,
//     version: '2.1.89'
//   };

//   return context;
// };

// /**
//  * Get CLIENT_PAYLOAD from environment variables and parse it
//  * @returns {Object} - The client payload object
//  */
// const getClientPayload = () => {
//   const afterOneParsing = JSON.parse(process.env.CLIENT_PAYLOAD);

//   if (typeof afterOneParsing === 'string') {
//     return JSON.parse(afterOneParsing);
//   }

//   return afterOneParsing;
// };

// /**
//  * @description Check if a file should be excluded from the context like "package-lock.json"
//  * @param {*} fileObject
//  * @returns returns true if the file should be excluded
//  */
// const shouldExcludeFile = fileObject => {
//   const shouldExludeByName = EXCLUDE_PATTERN.test(fileObject.original_file);
//   const shouldExludeBySize = false; // (fileObject.diff?.split(' ').length ?? 0) > 1000

//   return shouldExludeByName || shouldExludeBySize;
// };

// /**
//  * @description Check if a file should be included in the context
//  * @param {*} fileObject
//  * @returns returns true if the file should be included
//  */
// const shouldIncludeFile = fileObject => {
//   return !shouldExcludeFile(fileObject);
// };

// const convertFilesForContext = source => {
//   const files = source.diff?.files.filter(shouldIncludeFile);
//   const words = JSON.stringify(files).split(' ').length;

//   if (WORDS_LIMIT > words) {
//     return files;
//   }

//   return [];
// };

// const askLBChangeLog = async (source, description, callback) => {
//   console.log("askLBChangeLog starting"); 
//   const formattedContext = convertFilesForContext(source);

//   if (!formattedContext?.length) {
//     const message = `There are no context files to analyze.\nAll ${source?.diff?.files?.length} files were excluded by pattern.`;
//     console.log(message);
//     return callback(null, message);
//   }

//   const { RULES_RESOLVER_TOKEN, RULES_RESOLVER_URL } = process.env;
//   const askLbEndpoint = RULES_RESOLVER_URL.replace('gitstream/resolve', 'gitstream/linearb_ai');
//   const context = getLinearbAIContext();

//   console.log("requesting"); 
//   const response = await fetch(askLbEndpoint, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${RULES_RESOLVER_TOKEN}`
//     },
//     body: JSON.stringify({ CHANGELOG_PROMPT, source, description, context })
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     const message = `Request failed with status ${response.status}: ${errorText}`;
//     console.error(message);
//     return callback(null, message);
//   }

//   const data = await response.json();
//   console.log(`response status: ${statusCode}`); 
//   console.log(`response: ${data}`); 
//   const { statusCode, message } = data || {};

//   if (statusCode !== 200) {
//     console.error(message);
//     return callback(null, message);
//   }

//   return callback(null, message);
// };

// module.exports = {
//   async: true,
//   filter: askLBChangeLog
// };
