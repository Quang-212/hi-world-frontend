import { Card, CardContent, Container, Divider, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';
import Page from 'src/components/Page';
// import Profile from 'src/sections/@dashboard/user/settingRole/Profile';

function SettingRole() {
  const [tabValue, setTabValue] = useState('Profile');
  return (
    <Page title="Setting Role">
      {/* <Container>
        <Card>
          <Tabs
            allowScrollButtonsMobile
            variant='scrollable'
            scrollButtons='auto'
            value={tabValue}
            // onChange={onChangeFilterStatus}
            sx={{ px: 2, bgcolor: 'background.neutral' }}
          >
            {['Profile', 'Access', 'Limited'].map((tab) => (
              <Tab disableRipple key={tab} label={tab} value={tab} />
            ))}
          </Tabs>
          <CardContent>
            <Profile />
          </CardContent>

          <Divider />
        </Card>
      </Container> */}
    </Page>
  );
}

export default SettingRole;
