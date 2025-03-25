import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Select, Option } from '@forge/react';
import { invoke } from '@forge/bridge';

const PortalDropdown = () => {
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await invoke('getUsersByIssueKey', {});
        console.log('Fetched users for dropdown:', users);

        // Format the data for the dropdown
        const formattedOptions = users.map((user) => ({
          label: user.label, // Display name of the user
          value: user.value, // Account ID of the user
        }));

        setDropdownOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSelectionChange = (value) => {
    setSelectedValue(value);
    console.log('Selected Value:', value);
  };

  return (
    <>
      <Text>Select a User:</Text>
      <Select
        label="Users"
        onChange={handleSelectionChange}
        value={selectedValue}
        isLoading={isLoading}
      >
        {dropdownOptions.map((option, index) => (
          <Option key={index} label={option.label} value={option.value} />
        ))}
      </Select>
      {selectedValue && <Text>You selected: {selectedValue}</Text>}
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <PortalDropdown />
  </React.StrictMode>
);
