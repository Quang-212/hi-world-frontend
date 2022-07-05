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

import useSettings from 'src/hooks/useSettings';
import Page from 'src/components/Page';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import Iconify from 'src/components/Iconify';
import Scrollbar from 'src/components/Scrollbar';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import useTable from 'src/hooks/useTable';
import { DialogAnimate } from 'src/components/animate';
import { useRecoilState } from 'recoil';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';
import {
  LessonCategoryRow,
  LessonCategoryTableToolbar,
  UpsertLessonCategory
} from 'src/sections/@dashboard/course/lesson/lesson-category';
import { getLessonCategory, singleDeleteLessonCategory } from 'src/api/lessonCategory.api';
import LessonCategoryState from 'src/recoils/dashboard/lessonCategory';
import { getCourse } from 'src/api/courseList.api';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', align: 'left' },
  { id: 'course', label: 'Khóa học', align: 'left' },
  { id: 'slug', label: 'Slug', align: 'left' },
  { id: 'order', label: 'Order', align: 'left' },
  { id: 'action', label: 'Action', align: 'right' }
];

// ----------------------------------------------------------------------

export default function LessonCategory() {
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
  const [lessonCategoryState, setLessonCategoryState] = useRecoilState(LessonCategoryState);
  const { lessonCategoryList, total } = lessonCategoryState;
  const [filterName, setFilterName] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  const delayedQuery = useCallback(
    debounce(() => {
      (async () => {
        if (filterCourse || total !== -1) {
          const data = await getLessonCategory({
            limit: rowsPerPage,
            page,
            where: {
              $search: { name: filterName.toLowerCase() },
              $populate: ['courseId'],
              ...(filterCourse && { courseId: filterCourse })
            }
          });
          setLessonCategoryState((prev) => ({ ...prev, lessonCategoryList: data?.data, total: data?.total }));
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
  const handleFilterCourse = async (courseId) => {
    setFilterCourse(courseId);
    setFilterName('');
    setPage(0);
    if (courseId) {
      const chapters = await getLessonCategory({
        limit: rowsPerPage,
        page,
        where: { $populate: ['courseId'], $sort: { order: 1 }, courseId }
      });
      setLessonCategoryState((prev) => ({
        ...prev,
        lessonCategoryList: chapters?.data,
        total: chapters?.total
      }));
    }
  };
  useEffect(() => {
    (async () => {
      if (filterCourse) {
        const chapters = await getLessonCategory({
          limit: rowsPerPage,
          page,
          where: { $populate: ['courseId'], $sort: { order: 1 }, courseId: filterCourse }
        });
        setLessonCategoryState((prev) => ({
          ...prev,
          lessonCategoryList: chapters?.data,
          total: chapters?.total
        }));
      }
    })();
  }, [page, rowsPerPage]);
  useEffect(() => {
    (async () => {
      try {
        const lessonCategoryCount = await getCourse({
          limit: -1,
          where: {
            $select: ['_id', 'title']
          }
        });
        setLessonCategoryState((prev) => ({
          ...prev,
          lessonCategoryCount
        }));
      } catch (err) {
        console.error(err);
        enqueueSnackbar(err?.message || 'Không thể tải tên khóa học vì lỗi hệ thống!', { variant: 'error' });
      }
    })();
  }, []);

  const handleDeleteRow = async (_id) => {
    try {
      await singleDeleteLessonCategory(_id);
      const deleteRow = lessonCategoryList?.filter((row) => row._id !== _id);
      setLessonCategoryState((prev) => ({ ...prev, lessonCategoryList: deleteRow, total: prev?.total - 1 }));
      enqueueSnackbar('Đã xóa chương học!');
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err?.message || 'Không thể xóa chương học vì lỗi hệ thống!', { variant: 'error' });
    }
  };

  const handleEditRow = (row) => {
    setLessonCategoryState((prev) => ({
      ...prev,
      currentLessonCategory: row,
      isUpsertLessonCategoryOpen: true,
      isEdit: true
    }));
  };

  const handleCreateLessonCategory = () => {
    setLessonCategoryState((prev) => ({
      ...prev,
      currentLessonCategory: {},
      isUpsertLessonCategoryOpen: true,
      isEdit: false
    }));
  };
  const handleCloseDialog = () => {
    setLessonCategoryState((prev) => ({
      ...prev,
      isUpsertLessonCategoryOpen: false,
      currentLessonCategory: {},
      isEdit: false
    }));
  };

  const isNotFound = !lessonCategoryList?.length;

  return (
    <Page title="Bài học: Chương">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <DialogAnimate open={lessonCategoryState.isUpsertLessonCategoryOpen} onClose={handleCloseDialog} maxWidth="md">
          <DialogTitle sx={{ mb: 3 }}>Thêm mới chương học</DialogTitle>
          <UpsertLessonCategory />
        </DialogAnimate>
        <HeaderBreadcrumbs
          heading="Danh sách chương học"
          links={[]}
          action={
            <Button
              variant="contained"
              type="button"
              onClick={handleCreateLessonCategory}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              Thêm chương học
            </Button>
          }
        />

        <Card>
          <LessonCategoryTableToolbar
            filterName={filterName}
            onFilterCourse={handleFilterCourse}
            onFilterName={handleFilterName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom headLabel={TABLE_HEAD} rowCount={lessonCategoryList?.length} />

                <TableBody>
                  {lessonCategoryList?.map((row) => (
                    <LessonCategoryRow
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
