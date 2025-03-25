import api, { route } from '@forge/api';
import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getUsersByIssueKey', async (req) => {
  try {
    console.log('Request context:', JSON.stringify(req.context, null, 2));

    // Extract the issue key from the context
    const issueKey = req.context.extension.request.key;
    if (!issueKey) {
      throw new Error('Issue key is missing in the context.');
    }
    console.log(`Extracted Issue Key: ${issueKey}`);

    // Fetch the project ID using the issue key
    const issueResponse = await api.asApp().requestJira(
      route`/rest/api/3/issue/${issueKey}`
    );
    if (!issueResponse.ok) {
      console.error(`Failed to fetch issue details: ${issueResponse.status} ${issueResponse.statusText}`);
      throw new Error('Unable to fetch issue details.');
    }
    const issueData = await issueResponse.json();
    const projectId = issueData.fields.project.key;
    console.log(`Extracted Project ID: ${projectId}`);

    // Fetch organization ID for the project
    console.log(`Fetching organization details for projectId: ${projectId}`);
    const orgResponse = await api.asApp().requestJira(
      route`/rest/servicedeskapi/servicedesk/${projectId}/organization`
    );
    if (!orgResponse.ok) {
      console.error(`Failed to fetch organization details: ${orgResponse.status} ${orgResponse.statusText}`);
      throw new Error('Unable to fetch organization details.');
    }
    const orgData = await orgResponse.json();
    const organizationId = orgData.values[0]?.id; // Assuming the first organization is used
    console.log(`Extracted Organization ID: ${organizationId}`);

    if (!organizationId) {
      console.error('No organization ID found for the project.');
      throw new Error('No organization ID found for the project.');
    }

    // Fetch users from the organization
    console.log(`Fetching users for organizationId: ${organizationId}`);
    const usersResponse = await api.asApp().requestJira(
      route`/rest/servicedeskapi/organization/${organizationId}/user`
    );
    if (!usersResponse.ok) {
      console.error(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`);
      throw new Error('Unable to fetch users.');
    }
    const usersData = await usersResponse.json();

    // Log the fetched users
    console.log(`Fetched Users: ${JSON.stringify(usersData.values, null, 2)}`);

    // Map the users to the format required by the frontend
    const mappedUsers = usersData.values.map((user) => ({
      label: user.displayName,
      value: user.accountId,
    }));

    // Log the mapped users being sent to the frontend
    console.log(`Mapped Users for Field: ${JSON.stringify(mappedUsers, null, 2)}`);

    // Return the list of users
    return mappedUsers;
  } catch (error) {
    console.error('Error in getUsersByIssueKey resolver:', error);
    throw new Error('Failed to fetch users.');
  }
});

export const handler = resolver.getDefinitions();
