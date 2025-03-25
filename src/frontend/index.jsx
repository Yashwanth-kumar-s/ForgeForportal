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
        const users = await invoke('getUsersByIssueKey', {}); // Ensure function name matches manifest
        console.log('Fetched users for dropdown:', users);

        // Ensure the response is correctly parsed
        const parsedUsers = typeof users === 'string' ? JSON.parse(users) : users;

        if (!Array.isArray(parsedUsers)) {
          throw new Error('Invalid data format received');
        }

        setDropdownOptions(parsedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      <Text>Select a User:</Text>
      <Select label="Users" isLoading={isLoading}>
        {dropdownOptions.map((option, index) => (
          <Option key={index} label={option.label} value={option.label} />
        ))}
      </Select>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <PortalDropdown />
  </React.StrictMode>
);
