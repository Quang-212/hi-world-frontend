import { useCallback, useEffect, useState } from 'react';
// @mui
import {
  Box,
  Card,
  Table,
  Switch,
  Button,
  Divider,
  TableBody,
  Container,
  TableContainer,
  TablePagination,
  FormControlLabel,
  DialogTitle
} from '@mui/material';

import useSettings from 'src/hooks/useSettings';
import Page from 'src/components/Page';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import Iconify from 'src/components/Iconify';
import Scrollbar from 'src/components/Scrollbar';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import {
  CourseCategoryRow,
  CourseCategoryTableToolbar,
  UpsertCourseCategory
} from 'src/sections/@dashboard/course/category';
import useTable from 'src/hooks/useTable';
import { DialogAnimate } from 'src/components/animate';
import CourseCategoryState from 'src/recoils/dashboard/courseCategory';
import { useRecoilState } from 'recoil';
import { getCourseCategoryList, singleDeleteCourseCategory } from 'src/api/courseCategory.api';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', align: 'left' },
  { id: 'parentId', label: 'Danh mục cha', align: 'left' },
  { id: 'slug', label: 'Slug', align: 'left' },
  { id: 'action', label: 'Action', align: 'right' }
];

// ----------------------------------------------------------------------

export default function CourseManagement() {
  const {
    dense,
    page,
    rowsPerPage,
    setPage,
    //
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage
  } = useTable();

  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [courseCategoryState, setCourseCategoryState] = useRecoilState(CourseCategoryState);
  const { courseCategoryList, total } = courseCategoryState;

  const [filterName, setFilterName] = useState('');

  const delayedQuery = useCallback(
    debounce(() => {
      (async () => {
        if (filterName || total !== -1) {
          const data = await getCourseCategoryList({
            limit: rowsPerPage,
            page,
            where: { $search: { name: filterName.toLowerCase() }, $populate: ['parentId'] }
          });
          setCourseCategoryState((prev) => ({ ...prev, courseCategoryList: data?.data, total: data?.total }));
        }
      })();
    }, 600),
    [filterName]
  );
  useEffect(() => {
    delayedQuery();
    // Cancel the debounce on useEffect cleanup.
    return delayedQuery.cancel;
  }, [filterName, delayedQuery]);
  const handleFilterName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };
  useEffect(() => {
    (async () => {
      try {
        const courseCategoryList = await getCourseCategoryList({
          limit: rowsPerPage,
          page,
          where: { $populate: ['parentId'] }
        });
        setCourseCategoryState((prev) => ({
          ...prev,
          courseCategoryList: courseCategoryList?.data,
          total: courseCategoryList?.total
        }));
      } catch (err) {
        console.log(err);
        enqueueSnackbar(err?.message || 'Không thể tải danh mục khóa học vì lỗi hệ thống!', { variant: 'error' });
      }
    })();
  }, [page, rowsPerPage]);
  const handleDeleteRow = async (_id) => {
    try {
      await singleDeleteCourseCategory(_id);
      const deleteRow = courseCategoryList?.filter((row) => row._id !== _id);
      setCourseCategoryState((prev) => ({ ...prev, courseCategoryList: deleteRow, total: prev?.total - 1 }));
      enqueueSnackbar('Đã xóa danh mục khóa học!');
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err?.message || 'Không thể xóa danh mục khóa học vì lỗi hệ thống!', { variant: 'error' });
    }
  };

  const handleEditRow = (row) => {
    setCourseCategoryState((prev) => ({
      ...prev,
      currentCourseCategory: row,
      isUpsertCourseCategoryOpen: true,
      isEdit: true
    }));
  };

  const handleCreateCourseCategory = () => {
    setCourseCategoryState((prev) => ({
      ...prev,
      currentCourseCategory: {},
      isUpsertCourseCategoryOpen: true,
      isEdit: false
    }));
  };
  const handleCloseDialog = () => {
    setCourseCategoryState((prev) => ({
      ...prev,
      isUpsertCourseCategoryOpen: false,
      currentCourseCategory: {},
      isEdit: false
    }));
  };

  const isNotFound = !courseCategoryList?.length;

  return (
    <Page title="Khóa học: Danh mục">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <DialogAnimate open={courseCategoryState.isUpsertCourseCategoryOpen} onClose={handleCloseDialog} maxWidth="md">
          <DialogTitle sx={{ mb: 3 }}>Thêm mới danh mục khóa học</DialogTitle>
          <UpsertCourseCategory />
        </DialogAnimate>
        <HeaderBreadcrumbs
          heading="Danh mục khóa học"
          links={[]}
          action={
            <Button
              variant="contained"
              type="button"
              onClick={handleCreateCourseCategory}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              Thêm danh mục khóa học
            </Button>
          }
        />

        <Card>
          <Divider />

          <CourseCategoryTableToolbar filterName={filterName} onFilterName={handleFilterName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom headLabel={TABLE_HEAD} rowCount={courseCategoryList?.length} />

                <TableBody>
                  {courseCategoryList?.map((row) => (
                    <CourseCategoryRow
                      key={row._id}
                      row={row}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                      onEditRow={() => handleEditRow(row)}
                    />
                  ))}
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

// ---------------------------------------------------------------------
