import React, { ReactElement, useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { Box, Tab } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import { TabList, TabPanel } from '@mui/lab';
import UserListTable from '../../../components/user/UserListTable';
import Image from 'next/image';
import userIcon from '../../../components/assets/icons/user-colored.png';
import userService from '../../../service/user/userService';
import TeamMemberModal from '../../../components/user/TeamMemberModal';

const UserManagement = () => {
  const [value, setValue] = React.useState('1');
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  const fields = [
    { id: 'fullName', label: 'User Name' },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role' },
    { id: 'team', label: 'Team Name' },
    { id: 'action', label: 'Action' },
  ];
  const [contactList, setcontactList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [role, setRole] = useState('admin');
  const [total, setTotal] = useState(0);
  const [userCountList, setUserCountList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [teamNames, setTeamNames] = useState([]);

  const fetchData = () => {
    userService
      .getAllUsers(searchText, page, limit, role)
      .then((res: any) => {
        setcontactList(res?.data?.users);
        setTotal(res?.data?.totalCount);
        setUserCountList(
          res?.data?.countList?.sort((a: any, b: any) => {
            if (a._id < b._id) return -1;
            if (a._id > b._id) return 1;
            return 0;
          }),
        );
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, [role, limit, page, searchText]);

  useEffect(() => {
    userService
      .getTeamInfo()
      .then((res) => {
        setTeamNames(res?.data?.team);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        p: 4,
        typography: 'body1',
        '& .title h1': {
          fontFamily: 'Inter',
          fontSize: '20px',
          fontWeight: 700,
          lineHeight: '24.2px',
          m: 0,
          pl: 1,
        },
      }}
    >
      <div className="title d-flex align-items-center  mb-4 ">
        <Image src={userIcon} width="30" height="30" alt="user" />
        <h1>Meetify User List </h1>
      </div>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            {userCountList?.map((obj: any, idx: number) => {
              return (
                <Tab
                  key={idx + 1}
                  value={(idx + 1).toString()}
                  onClick={() => {
                    setRole(obj?._id);
                    setPage(1);
                  }}
                  label={
                    <div className="d-flex align-items-center">
                      {obj?._id}
                      <Box
                        sx={{
                          position: 'relative',
                          bottom: '7px',
                          marginLeft: '5px',
                        }}
                      >
                        {obj?.count}
                      </Box>
                    </div>
                  }
                />
              );
            })}
          </TabList>
        </Box>
        <TabPanel value={value} sx={{ pl: 0 }}>
          <UserListTable
            fields={fields}
            items={contactList}
            total={total}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            setSearchText={setSearchText}
            searchText={searchText}
            fetchData={fetchData}
            role={role}
            // handleAddTeamMember={handleAddTeamMember}
            // isLoading={isLoading}
            teamNames={teamNames}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default UserManagement;
UserManagement.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
