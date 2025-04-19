import React, { SetStateAction, Dispatch, useEffect, useState } from 'react';
import CustomeModal from '../custom/CustomModal';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import userIcon from '../assets/icons/user-colored.png';
import { Padding } from '@mui/icons-material';
import { SubmitHandler, useForm } from 'react-hook-form';
import userService from '../../service/user/userService';
type IProps = {
  openModal: { edit: boolean };
  user: any;
  setSuccessModal?: Dispatch<SetStateAction<{ edit: boolean }>>;
  fetchData: Dispatch<SetStateAction<void>>;
  setDebounceSearch: Dispatch<SetStateAction<string>>;
  teamNames: string[];
};
type Inputs = {
  role: string;
  team: string;
};
const UserDetails = (props: IProps) => {
  const [closeModal, setCloseModal] = useState<{ status: boolean }>({ status: false });
  const [userRole, setUserRole] = useState('');
  const [userTeam, setUserTeam] = useState('');
  useEffect(() => {
    setUserRole(props?.user?.role);
    setUserTeam(props?.user?.team);
  }, [props.openModal]);

  
  const handleUserEdit = () => {
    const newData: Inputs = {
      role: userRole,
      team: userTeam,
    };
    userService
      .updateUser(props?.user?._id, newData)
      .then((res) => {
        setCloseModal({ status: false });
        props.setSuccessModal!({ edit: true });
        props.fetchData();
        props.setDebounceSearch('');
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  return (
    <div>
      <CustomeModal
        openModal={props.openModal}
        closeModal={closeModal}
        customStyle={{
          borderRadius: '12px',
          border: 0,
          backgroundColor: 'white',
          width: '450px',
          padding: '0px',
        }}
      >
        <div className="title d-flex align-items-center mt-4 ps-5">
          <Image src={userIcon} width="30" height="30" alt="user" />
          <Typography fontWeight="bold" className="ms-3" fontSize="18px">
            Update User
          </Typography>
        </div>
        <hr style={{ marginBottom: '20px', marginTop: '20px', opacity: '0.1' }} />
        <Box
          sx={{
            width: '100%',
            typography: 'body1',
            padding: '0px 45px 35px 45px',
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
          <Typography fontWeight="bold" fontSize="16px" className="mb-2">
            Name
          </Typography>
          <TextField
            hiddenLabel
            id="filled-hidden-label-small"
            defaultValue={props?.user?.fullName}
            disabled
            fullWidth
            size="small"
          />
          <Typography fontWeight="bold" fontSize="16px" className="mt-4 mb-2">
            Email
          </Typography>
          <TextField
            hiddenLabel
            id="filled-hidden-label-small"
            defaultValue={props?.user?.email}
            disabled
            fullWidth
            size="small"
          />
          <Typography fontWeight="bold" fontSize="16px" className="mb-2 mt-4">
            Role
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              size="small"
              hiddenLabel
              defaultValue={userRole}
              onChange={(e) => {
                setUserRole(e.target.value);
              }}
            >
              <MenuItem value={'student'}>Student</MenuItem>
              <MenuItem value={'admin'}>Admin</MenuItem>
              <MenuItem value={'super-admin'}>Super Admin</MenuItem>
            </Select>
          </FormControl>
          <Typography fontWeight="bold" fontSize="16px" className="mb-2 mt-4">
            Team
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              size="small"
              hiddenLabel
              defaultValue={userTeam}
              onChange={(e) => setUserTeam(e.target.value)}
            >
              {props.teamNames?.map((team) => (
                <MenuItem key={team} value={team}>
                  {team}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            className="mt-4 w-100"
            size="large"
            onClick={() => handleUserEdit()}
          >
            Update User
          </Button>
        </Box>
      </CustomeModal>
    </div>
  );
};

export default UserDetails;
