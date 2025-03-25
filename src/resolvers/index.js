import api, { route } from '@forge/api';

export async function handler(req) {
  try {
    const issueKey = req.context.extension.request.key;
    console.log('Extracted Issue Key:', issueKey);

    // Fetch project details
    const projectResponse = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`);
    const projectData = await projectResponse.json();
    const projectKey = projectData.fields.project.key;
    const projectId = projectData.fields.project.id;
    console.log('Extracted Project Key:', projectKey);
    console.log('Extracted Project ID:', projectId);

    // Fetch organization details using project ID
    const organizationResponse = await api
      .asApp()
      .requestJira(route`/rest/servicedeskapi/servicedesk/${projectKey}/organization`);
    const organizationData = await organizationResponse.json();
    const organizationId = organizationData.values[0]?.id;
    console.log('Extracted Organization ID:', organizationId);

    // Fetch customers in the organization
    const customersResponse = await api
      .asApp()
      .requestJira(route`/rest/servicedeskapi/organization/${organizationId}/user`);
    const customersData = await customersResponse.json();
    console.log('Fetched Customers:', customersData.values);

    // Map customers to dropdown options
    const dropdownOptions = customersData.values.map((customer) => ({
      label: customer.displayName,
      value: customer.accountId,
    }));

    return {
      body: JSON.stringify(dropdownOptions),
    };
  } catch (error) {
    console.error('Error in resolver:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch dropdown options' }),
    };
  }
}