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
import Page from 'src/components/Page';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import Iconify from 'src/components/Iconify';
import { useSnackbar } from 'notistack';
import Scrollbar from 'src/components/Scrollbar';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import { CourseListRow, CourseListTableToolbar, UpsertCourseList } from 'src/sections/@dashboard/course/list';
import useTable from 'src/hooks/useTable';
import useSettings from 'src/hooks/useSettings';
import CourseCategoryState from 'src/recoils/dashboard/courseCategory';
import { useRecoilState } from 'recoil';
import { DialogAnimate } from 'src/components/animate';
import CourseListState from 'src/recoils/dashboard/courseList';
import { getCourseCategoryList } from 'src/api/courseCategory.api';
import { getCourse, singleDeleteCourse } from 'src/api/courseList.api';
import { debounce } from 'lodash';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'course', label: 'Course', align: 'left' },
  { id: 'category', label: 'Category', align: 'left' },
  { id: 'slug', label: 'Slug', align: 'left' },
  { id: 'level', label: 'Level', align: 'left' },
  { id: 'action', label: 'Action', align: 'right' }
];

// ----------------------------------------------------------------------

export default function CourseList() {
  const {
    dense,
    page,
    rowsPerPage,
    setPage,
    //
    selected,
    onSelectRow,
    //
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage
  } = useTable();

  const { themeStretch } = useSettings();

  const [courseListState, setCourseListState] = useRecoilState(CourseListState);
  const [courseCategoryState, setCourseCategoryState] = useRecoilState(CourseCategoryState);
  const CATEGORY_OPTIONS = courseCategoryState.courseCategoryList?.filter((category) => category.parentId !== null);
  CATEGORY_OPTIONS.unshift({ _id: 'all', name: 'All' });

  const { courseList, isEdit, total } = courseListState;
  const { enqueueSnackbar } = useSnackbar();

  const [filterName, setFilterName] = useState('');

  const [filterCategory, setFilterCategory] = useState('all');
  const delayedQuery = useCallback(
    debounce(() => {
      (async () => {
        if (filterName || total !== -1) {
          const data = await getCourse({
            limit: rowsPerPage,
            page,
            where: { $search: { title: filterName.toLowerCase() }, $populate: ['category'] }
          });
          setCourseListState((prev) => ({ ...prev, courseList: data?.data, total: data?.total }));
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
  useEffect(() => {
    (async () => {
      const courseList = await getCourse({ limit: rowsPerPage, page, where: { $populate: ['category'] } });
      setCourseListState((prev) => ({ ...prev, courseList: courseList?.data, total: courseList?.total }));
    })();
  }, [page, rowsPerPage]);

  useEffect(() => {
    (async () => {
      const courseCategoryList = await getCourseCategoryList({ limit: -1 });
      setCourseCategoryState((prev) => ({ ...prev, courseCategoryList }));
    })();
  }, []);

  const handleFilterName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleFilterCategory = async (event) => {
    const value = event.target.value;
    setFilterCategory(value);
    let courseList;
    if (value === 'all') {
      courseList = await getCourse({
        limit: rowsPerPage,
        page,
        where: { $populate: ['category'] }
      });
    } else {
      courseList = await getCourse({
        limit: rowsPerPage,
        page,
        where: { $populate: ['category'], category: value }
      });
    }
    setCourseListState((prev) => ({ ...prev, courseList: courseList?.data, toal: courseList?.total }));
  };

  const handleDeleteRow = async (_id) => {
    try {
      await singleDeleteCourse(_id);
      const deleteRow = courseList?.filter((row) => row._id !== _id);
      setCourseListState((prev) => ({ ...prev, courseList: deleteRow, total: prev?.total - 1 }));
      enqueueSnackbar('Xóa khóa học thành công!');
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err?.message || 'Không thể xóa khóa học vì lỗi hệ thống!', { variant: 'error' });
    }
  };

  const handleEditRow = (row) => {
    setCourseListState((prev) => ({
      ...prev,
      currentCourse: row,
      isUpsertCourseOpen: true,
      isEdit: true
    }));
  };

  const handleCloseDialog = () => {
    setCourseListState((prev) => ({ ...prev, isUpsertCourseOpen: false, currentCourse: {}, isEdit: false }));
  };
  const handleCreateCourseList = () => {
    setCourseListState((prev) => ({
      ...prev,
      isUpsertCourseOpen: true,
      currentCourse: {},
      isEdit: false
    }));
  };

  const isNotFound = !courseList.length;

  return (
    <Page title="Khóa học: Danh sách">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <DialogAnimate open={courseListState?.isUpsertCourseOpen} onClose={handleCloseDialog} maxWidth="xl">
          <DialogTitle sx={{ mb: 3 }}>{`${isEdit ? 'Cập nhật' : 'Thêm mới'} khóa học`}</DialogTitle>
          <UpsertCourseList />
        </DialogAnimate>
        <HeaderBreadcrumbs
          heading="Danh sách khóa học"
          links={[]}
          action={
            <Button
              variant="contained"
              type="button"
              onClick={handleCreateCourseList}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              Thêm khóa học
            </Button>
          }
        />

        <Card>
          <CourseListTableToolbar
            filterName={filterName}
            filterCategory={filterCategory}
            onFilterName={handleFilterName}
            onFilterCategory={handleFilterCategory}
            optionsCategory={CATEGORY_OPTIONS}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom headLabel={TABLE_HEAD} rowCount={courseList.length} />

                <TableBody>
                  {courseList?.map((row) => (
                    <CourseListRow
                      key={row._id}
                      row={row}
                      selected={selected.includes(row._id)}
                      onSelectRow={() => onSelectRow(row._id)}
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
