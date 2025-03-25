import api, { route } from '@forge/api';

export async function getUsersByIssueKey(req) {
  try {
    const issueKey = req.context.extension.request.key;
    console.log('Extracted Issue Key:', issueKey);

    // Fetch project details
    const projectResponse = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`);
    const projectData = await projectResponse.json();
    const projectKey = projectData.fields.project.key;

    // Fetch organization details
    const organizationResponse = await api
      .asApp()
      .requestJira(route`/rest/servicedeskapi/servicedesk/${projectKey}/organization`);
    const organizationData = await organizationResponse.json();
    const organizationId = organizationData.values[0]?.id;

    if (!organizationId) {
      throw new Error('Organization ID not found');
    }

    // Fetch customers in the organization
    const customersResponse = await api
      .asApp()
      .requestJira(route`/rest/servicedeskapi/organization/${organizationId}/user`);
    const customersData = await customersResponse.json();

    console.log('Customers Data:', customersData); // Debugging

    // Ensure customersData contains valid entries
    if (!customersData.values || customersData.values.length === 0) {
      throw new Error('No customers found in the organization');
    }

    // Map customers to dropdown options with both label and value
    const dropdownOptions = customersData.values.map((customer) => ({
      label: customer.displayName || 'Unknown User', // Ensures no empty labels
      value: customer.displayName, // Use accountId as the value
    }));

    console.log('Dropdown Options:', dropdownOptions);

    return {
      body: JSON.stringify(dropdownOptions),
    };
  } catch (error) {
    console.error('Error in getUsersByIssueKey:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch dropdown options' }),
    };
  }
}