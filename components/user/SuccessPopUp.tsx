import React, { useState } from 'react';
import CustomeModal from '../custom/CustomModal';
import { Box } from '@mui/material';
import Image from 'next/image';
import successIcon from '../assets/icons/success.png';

type Iprops = {
  openModal: { edit: boolean };
  reschedule?: boolean;
};

const SuccessPopUp = (props: Iprops) => {
  const [closeModal, setCloseModal] = useState<{ status: boolean }>({ status: false });
  return (
    <CustomeModal
      openModal={props.openModal}
      closeModal={closeModal}
      noCloseIcon
      customStyle={{
        borderRadius: '12px',
        border: 0,
        backgroundColor: 'white',
        width: '500px',
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& h1': {
            fontSize: '24px',
            fontWeight: '600',
            lineHeight: '26px',
            color: '#100324',
          },
          '& p': {
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '26px',
            color: '#10032499',
          },
        }}
      >
        <div className="text-center">
          <Image src={successIcon} width={88} height={88} alt="success" />
          <div className="pt-2">
            <h1>User has been updated</h1>
            <p className="pt-2 m-0">
              This user has been updated, now you can check the user list.
            </p>
          </div>
        </div>
      </Box>
    </CustomeModal>
  );
};

export default SuccessPopUp;
