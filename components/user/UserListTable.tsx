import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import {
  InputAdornment,
  InputBase,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  alpha,
} from '@mui/material';
import DeleteIcon from '../assets/icons/trust.png';
import EditIcon from '../assets/icons/edit.png';
import Image from 'next/image';
import styled from '@emotion/styled';
import SearchIcon from '@mui/icons-material/Search';
import UserDetails from './UserDetails';
import { debounce } from 'lodash';
import SuccessPopUp from './SuccessPopUp';
import userService from '../../service/user/userService';
import TeamMemberModal from './TeamMemberModal';

type IProps = {
  fields: object[];
  items: object[];
  total: number;
  page: number;
  searchText: string;
  setPage: Dispatch<SetStateAction<number>>;
  limit: number;
  setLimit: Dispatch<SetStateAction<number>>;
  setSearchText: Dispatch<SetStateAction<string>>;
  fetchData: Dispatch<SetStateAction<void>>;
  role: string;
  // handleAddTeamMember: Dispatch<SetStateAction<void>>;
  teamNames: string[];
};

const UserListTable = (props: IProps) => {
  const [openModal, setOpenModal] = useState<{ edit: boolean }>({ edit: false });
  const [editUser, setEditUser] = useState(null);
  const [successModal, setSuccessModal] = useState<{ edit: boolean }>({ edit: false });
  const [debounceSearch, setDebounceSearch] = useState('');
  const [openMemberModal, setOpenMemberModal] = useState<{ edit: boolean }>({ edit: false });
  const [openMemberModalForEdit, setOpenMemberModalForEdit] = useState<{ edit: boolean }>({
    edit: false,
  });

  const handleSearch = (e: any) => {
    props?.setPage(1);
    setDebounceSearch(e.target.value);
  };
  const searchApi = () => {
    if (debounceSearch !== null) {
      props?.setSearchText(debounceSearch);
    }
  };
  const delayedQuery = useCallback(debounce(searchApi, 500), [debounceSearch]);
  useEffect(() => {
    delayedQuery();
    return delayedQuery.cancel;
  }, [debounceSearch, delayedQuery]);

  const handleChangePage = (event: any, newPage: any) => {
    props?.setPage(newPage + 1);
    setDebounceSearch('');
  };

  const handleChangeRowsPerPage = (event: any) => {
    props?.setLimit(+event.target.value);
    setDebounceSearch('');
    props?.setPage(1);
    props?.setSearchText('');
  };

  const handleEdit = (user: any) => {
    if (props.role === 'team_member') {
      setEditUser(user);
      setOpenMemberModalForEdit({ edit: true });
    } else {
      setEditUser(user);
      setOpenModal({ edit: true });
    }
  };
  const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: 10,
    backgroundColor: '#dde2ec',
    '&:hover': {
      backgroundColor: '#dde2ec',
    },
    marginLeft: 0,
    width: '25%',
  }));
  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: '10px',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
      padding: '12px',
      paddingLeft: '40px',
    },
  }));

  const handleAddTeamMember = () => {
    setOpenMemberModal({ edit: true });
  };

  return (
    <div>
      <div className="search mb-3 d-flex align-items-center justify-content-between">
        <TextField
          id="input-with-icon-textfield"
          hiddenLabel
          placeholder="Search..."
          size="small"
          value={debounceSearch}
          style={{ backgroundColor: '#f7f7f8', color: '#100324B2' }}
          onChange={(e: any) => handleSearch(e)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
        {props.role === 'team_member' && (
          <button onClick={() => handleAddTeamMember()} className="btn btn-light px-3 py-2">
            Add Member
          </button>
        )}
      </div>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {props?.fields?.map((column: any) => (
                <TableCell
                  sx={{
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 800,
                    backgroundColor: '#f7f7f8',
                    color: '#100324B2',
                  }}
                  key={column.id}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& td': {
                color: '#100324B2',
              },
            }}
          >
            {props?.items?.map((row: any) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {props?.fields?.map((column: any) => {
                    const value = row[column.id];
                    return (
                      <>
                        {column.id === 'action' ? (
                          <TableCell className="pe-auto">
                            <div className="d-flex">
                              <Image
                                onClick={() => handleEdit(row)}
                                className="me-2"
                                style={{ cursor: 'pointer' }}
                                src={EditIcon}
                                width={24}
                                height={24}
                                alt="edit"
                              />
                            </div>
                          </TableCell>
                        ) : (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </TableCell>
                        )}
                      </>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        sx={{
          '& p': {
            m: 0,
          },
        }}
        className="mt-4"
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={props?.total}
        rowsPerPage={props?.limit}
        page={props?.page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <UserDetails
        openModal={openModal}
        user={editUser}
        setSuccessModal={setSuccessModal}
        fetchData={props?.fetchData}
        setDebounceSearch={setDebounceSearch}
        teamNames={props.teamNames}
      />

      {openMemberModal && (
        <TeamMemberModal
          openModal={openMemberModal}
          fetchData={props.fetchData}
          teamNames={props.teamNames}
          // user={editUser}
          setSuccessModal={setSuccessModal}
          setDebounceSearch={setDebounceSearch}
        />
      )}

      {openMemberModal && (
        <TeamMemberModal
          openModal={openMemberModalForEdit}
          fetchData={props.fetchData}
          teamNames={props.teamNames}
          user={editUser}
          setSuccessModal={setSuccessModal}
          setDebounceSearch={setDebounceSearch}
        />
      )}

      <SuccessPopUp openModal={successModal} />
    </div>
  );
};

export default UserListTable;
