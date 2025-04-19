import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import CustomeModal from '../custom/CustomModal';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import userService from '../../service/user/userService';
import swal from 'sweetalert';
import userIcon from '../assets/icons/user-colored.png';
import Image from 'next/image';

type Iprops = {
  openModal: { edit: boolean };
  fetchData: Dispatch<SetStateAction<void>>;
  teamNames: string[];
  user?: any;
  setSuccessModal?: Dispatch<SetStateAction<{ edit: boolean }>>;
  setDebounceSearch: Dispatch<SetStateAction<string>>;
};
type Inputs = {
  fullName: string;
  email: string;
  phone: number;
  role: string;
  team: string;
  profileImage: string;
};

const TeamMemberModal = (props: Iprops) => {
  const [closeModal, setCloseModal] = useState<{ status: boolean }>({ status: false });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    data.role = 'team_member';
    data.profileImage =
      'https://phero-web.nyc3.cdn.digitaloceanspaces.com/uat-images/public/profileImage.png';

    if (props.user?.role) {
      const newData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        team: data.team,
        role: data.role,
      };

      userService
        .updateManualUser(props?.user?._id, newData)
        .then((res) => {
          setCloseModal({ status: false });
          props.fetchData();
          props.setDebounceSearch('');
          swal('success', 'User Updated Successfully', 'success');
        })
        .catch((err) => {
          console.log('err', err);
          swal('error', 'User Failed to Update', 'error');
        });
    } else {
      userService
        .addManualUser(data)
        .then((res) => {
          swal('success', 'Manual User Created Successfully', 'success');
          setCloseModal({ status: false });
          props.fetchData();
        })
        .catch((err) => {
          if (err?.response?.data?.message) {
            swal('User Already Exist', err?.response?.data.message, 'error');
          } else {
            swal('error', 'something went wrong', 'error');
          }
        });
    }
  };

  useEffect(() => {
    if (props.openModal && props.user?.role) {
      reset(props.user);
    }
    if (props.openModal) {
      reset();
    }
  }, [props.openModal, props.user]);

  return (
    <CustomeModal
      openModal={props.openModal}
      closeModal={closeModal}
      customStyle={{
        borderRadius: '12px',
        border: 0,
        backgroundColor: 'white',
        maxWidth: '600px',
        width: '400px',
      }}
    >
      <Box className="d-flex align-items-center">
        <Image src={userIcon} width="30" height="30" alt="user" />
        <Typography fontWeight="bold" className="ms-3" fontSize="18px">
          {props.user ? 'Update Team Member' : 'Add Team Member'}
        </Typography>
      </Box>
      <hr style={{ marginBottom: '20px', marginTop: '20px', opacity: '0.1' }} />
      <Box
        sx={{
          '& .form-control': {
            padding: '10px',
            borderRadius: '8px',
          },
          '& .submit-btn': {
            background: 'linear-gradient(270deg, #006EFF 0%, #2170D8 100%)',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '17px',
            color: '#FFFFFF',
            padding: '15px',
          },
          '& .heading p': {
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '21px',
            color: '#100324',
          },
          '& label': {
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '26px',
            color: '#100324',
          },
        }}
        className="schedule-modal"
      >
        <Box className="mt-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="fullName">Full Name</label>
              <input
                className="form-control mt-2"
                placeholder="Enter your Name"
                {...register('fullName', { required: true })}
              />
              {errors.fullName && (
                <span className="text-danger d-inline-block pt-2">Name is required</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <input
                className="form-control mt-2"
                placeholder="Enter your Email"
                {...register('email', { required: true })}
              />
              {errors.email && (
                <span className="text-danger d-inline-block pt-2">Email is required</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="phone">Phone</label>
              <input
                type="number"
                className="form-control mt-2"
                placeholder="Enter your Phone no."
                {...register('phone', { required: true })}
              />
              {errors.phone && (
                <span className="text-danger d-inline-block pt-2">Phone is required</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="team">Team</label>
              <select {...register('team', { required: true })} className="form-control mt-2">
                {props.teamNames?.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
              {errors.team && (
                <span className="text-danger d-inline-block pt-2">Team is required</span>
              )}
            </div>
            <Box
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                  height: '45px',
                },
              }}
              className="d-flex justify-content-between"
            ></Box>

            <input
              className={`submit-btn form-control `}
              value={props.user ? 'Update' : 'Submit'}
              type="submit"
            />
          </form>
        </Box>
      </Box>
    </CustomeModal>
  );
};

export default TeamMemberModal;
