import { useCallback, useEffect, useState } from 'react';
// @mui
import {
  Box,
  Card,
  Table,
  Switch,
  Button,
  TableBody,
  Container,
  TableContainer,
  TablePagination,
  FormControlLabel,
  DialogTitle
} from '@mui/material';

import { debounce } from 'lodash';
import Page from 'src/components/Page';
import { useRecoilState } from 'recoil';
import { useSnackbar } from 'notistack';
import Iconify from 'src/components/Iconify';
import User from 'src/recoils/dashboard/user';
import useSettings from 'src/hooks/useSettings';
import Scrollbar from 'src/components/Scrollbar';
import { DialogAnimate } from 'src/components/animate';
import useTable, { emptyRows } from 'src/hooks/useTable';
import { getAllRole, getAllUser, singleDeleteUser } from 'src/api/user.api';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import { TableEmptyRows, TableHeadCustom, TableNoData } from 'src/components/table';
import { UpsertUser, UserTableRow, UserTableToolbar } from 'src/sections/@dashboard/user/list';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'fullName', label: 'Tên', align: 'left' },
  { id: 'email', label: 'Email', align: 'left' },
  { id: 'gender', label: 'Giới tính', align: 'left' },
  { id: 'role', label: 'Vai trò', align: 'left' },
  { id: 'phone', label: 'Số điện thoại', align: 'left' },
  { id: 'action', label: 'Action', align: 'right' }
];

// ----------------------------------------------------------------------

export default function UserList() {
  const { dense, page, rowsPerPage, setPage, onChangeDense, onChangePage, onChangeRowsPerPage } = useTable();

  const { themeStretch } = useSettings();

  const [userState, setUserState] = useRecoilState(User);
  const { userList, isEdit, total, roleList } = userState;
  const [filterEmail, setFilterEmail] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const ROLE_OPTIONS = ['all', ...roleList?.map((role) => role?.name)];
  const [filterRole, setFilterRole] = useState('all');

  const delayedQuery = useCallback(
    debounce(() => {
      (async () => {
        if (filterEmail || total !== -1) {
          const data = await getAllUser({
            limit: rowsPerPage,
            page,
            where: { $search: { email: filterEmail.toLowerCase() } }
          });
          setUserState((prev) => ({ ...prev, userList: data?.data, total: data?.total }));
        }
      })();
    }, 600),
    [filterEmail]
  );
  useEffect(() => {
    delayedQuery();
    // Cancel the debounce on useEffect cleanup.
    return delayedQuery.cancel;
  }, [filterEmail, delayedQuery]);

  useEffect(() => {
    (async () => {
      try {
        const [userRes, roleRes] = await Promise.all([
          getAllUser({
            limit: rowsPerPage,
            page
          }),
          getAllRole()
        ]);
        setUserState((prev) => ({ ...prev, userList: userRes?.data, roleList: roleRes?.data, total: userRes?.total }));
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error?.message || 'Không thể tải danh sách người dùng vì lỗi hệ thống!', { variant: 'error' });
      }
    })();
  }, []);

  const handleFilterEmail = (filterEmail) => {
    setFilterEmail(filterEmail);
    setPage(0);
  };

  const handleFilterRole = async (event) => {
    const role = event.target.value;
    setPage(0);
    setFilterRole(role);
    const userRes = await getAllUser({
      limit: rowsPerPage,
      page,
      where: {
        ...(role !== 'all' && { role })
      }
    });
    setUserState((prev) => ({ ...prev, userList: userRes?.data, total: userRes?.total }));
  };

  const handleDeleteRow = async (_id) => {
    try {
      await singleDeleteUser(_id);
      const deleteRow = userList?.filter((row) => row._id !== _id);
      setUserState((prev) => ({ ...prev, userList: deleteRow }));
      enqueueSnackbar('Đã xóa người dùng!');
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err?.message || 'Không thể xóa người dùng vì lỗi hệ thống!', { variant: 'error' });
    }
  };

  const handleCreateUser = () => {
    setUserState((prev) => ({
      ...prev,
      currentUser: {},
      isUpsertUserOpen: true,
      isEdit: false
    }));
    console.log(userState);
  };
  const handleEditRow = (row) => {
    setUserState((prev) => ({
      ...prev,
      currentUser: row,
      isUpsertUserOpen: true,
      isEdit: true
    }));
  };
  const handleCloseDialog = () => {
    setUserState((prev) => ({
      ...prev,
      isUpsertUserOpen: false,
      currentUser: {},
      isEdit: false
    }));
  };

  const denseHeight = dense ? 52 : 72;

  const isNotFound = !userList.length;

  return (
    <Page title="Người dùng: Danh sách">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <DialogAnimate open={userState.isUpsertUserOpen} onClose={handleCloseDialog} maxWidth="md">
          <DialogTitle sx={{ mb: 3 }}>{isEdit ? 'Chỉnh sửa người dùng' : 'Tạo mới người dùng'}</DialogTitle>
          <UpsertUser />
        </DialogAnimate>
        <HeaderBreadcrumbs
          heading="Danh sách người dùng"
          links={[]}
          action={
            <Button variant="contained" onClick={handleCreateUser} startIcon={<Iconify icon={'eva:plus-fill'} />}>
              Thêm người dùng
            </Button>
          }
        />

        <Card>
          <UserTableToolbar
            filterEmail={filterEmail}
            filterRole={filterRole}
            onFilterEmail={handleFilterEmail}
            onFilterRole={handleFilterRole}
            optionsRole={ROLE_OPTIONS}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {userList?.map((row) => (
                    <UserTableRow
                      key={row._id}
                      row={row}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                      onEditRow={() => handleEditRow(row)}
                    />
                  ))}

                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, userList?.length)} />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ position: 'relative' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />

            <FormControlLabel
              control={<Switch checked={dense} onChange={onChangeDense} />}
              label="Dense"
              sx={{ px: 3, py: 1.5, top: 0, position: { md: 'absolute' } }}
            />
          </Box>
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------
