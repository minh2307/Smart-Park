import React, { useState } from 'react';
import { Box, Tabs as MuiTabs, Tab } from '@mui/material';

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: number;
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <MuiTabs value={activeTab} onChange={handleChange} aria-label="custom reusable tabs">
          {items.map((item, index) => (
            <Tab key={index} label={item.label} id={`tab-${index}`} aria-controls={`tabpanel-${index}`} />
          ))}
        </MuiTabs>
      </Box>
      {items.map((item, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
          sx={{ py: 2 }}
        >
          {activeTab === index && <Box>{item.content}</Box>}
        </Box>
      ))}
    </Box>
  );
};
