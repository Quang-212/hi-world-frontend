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
import useTable from 'src/hooks/useTable';
import useSettings from 'src/hooks/useSettings';
import { useRecoilState } from 'recoil';
import { DialogAnimate } from 'src/components/animate';
import { getCourse } from 'src/api/courseList.api';
import { debounce } from 'lodash';
import {
  LessonListRow,
  LessonListTableToolbar,
  UpsertLessonList
} from 'src/sections/@dashboard/course/lesson/lesson-list';
import LessonListState from 'src/recoils/dashboard/lessonList';
import { getLessonCategory } from 'src/api/lessonCategory.api';
import { getLesson } from 'src/api/lessonList.api';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'lesson', label: 'Lesson', align: 'left' },
  { id: 'order', label: 'Order', align: 'left' },
  { id: 'chapter', label: 'Chapter', align: 'left' },
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
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage
  } = useTable();

  const { themeStretch } = useSettings();

  const [lessonListState, setLessonListState] = useRecoilState(LessonListState);
  const { lessonList, isEdit, total } = lessonListState;
  const { enqueueSnackbar } = useSnackbar();

  const [filterName, setFilterName] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  const delayedQuery = useCallback(
    debounce(() => {
      (async () => {
        if (filterCourse || total !== -1) {
          const data = await getLesson({
            limit: rowsPerPage,
            page,
            where: { $search: { name: filterName.toLowerCase() }, $populate: ['chapterId'] }
          });
          setLessonListState((prev) => ({ ...prev, lessonList: data?.data, total: data?.total }));
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
      try {
        const lessonCourseFilter = await getCourse({
          limit: -1,
          where: {
            $select: ['_id', 'title']
          }
        });
        setLessonListState((prev) => ({
          ...prev,
          lessonCourseFilter
        }));
      } catch (err) {
        console.error(err);
        enqueueSnackbar(err?.message || 'Không thể tải tên khóa học vì lỗi hệ thống!', { variant: 'error' });
      }
    })();
  }, []);

  const handleFilterCourse = useCallback(
    async (courseId) => {
      setFilterCourse(courseId);
      setFilterName('');
      setPage(0);
      if (courseId) {
        const chapters = await getLessonCategory({
          limit: -1,
          where: { $select: ['_id', 'name'], courseId }
        });
        setLessonListState((prev) => ({
          ...prev,
          lessonChapterFilter: chapters
        }));
      }
    },
    [filterCourse]
  );
  const handleFilterChapter = useCallback(async (chapterId) => {
    setFilterName('');
    setPage(0);
    if (chapterId) {
      const lessonList = await getLesson({
        limit: rowsPerPage,
        page,
        where: { $populate: ['chapterId'], chapterId }
      });
      setLessonListState((prev) => ({
        ...prev,
        lessonList: lessonList?.data,
        total: lessonList?.total
      }));
    }
  }, []);

  const handleFilterName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleDeleteRow = async (_id) => {
    try {
      await singleDeleteLesson(_id);
      const deleteRow = lessonList?.filter((row) => row._id !== _id);
      setLessonListState((prev) => ({ ...prev, lessonList: deleteRow }));
      enqueueSnackbar('Xóa bài học thành công!');
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err?.message || 'Không thể xóa bài học vì lỗi hệ thống!', { variant: 'error' });
    }
  };

  const handleEditRow = (row) => {
    setLessonListState((prev) => ({
      ...prev,
      currentLesson: row,
      isUpsertLessonOpen: true,
      isEdit: true
    }));
  };

  const handleCreateLesson = () => {
    setLessonListState((prev) => ({
      ...prev,
      isUpsertLessonOpen: true,
      currentLesson: {},
      isEdit: false
    }));
  };
  const handleCloseDialog = () => {
    setLessonListState((prev) => ({ ...prev, isUpsertLessonOpen: false, currentLesson: {}, isEdit: false }));
  };

  const isNotFound = !lessonList?.length;

  return (
    <Page title="Bài học: Danh sách">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <DialogAnimate open={lessonListState?.isUpsertLessonOpen} onClose={handleCloseDialog} maxWidth="md">
          <DialogTitle sx={{ mb: 3 }}>{`${isEdit ? 'Cập nhật' : 'Thêm mới'} bài học`}</DialogTitle>
          <UpsertLessonList onFilterCourse={handleFilterCourse} onFilterChapter={handleFilterChapter} />
        </DialogAnimate>
        <HeaderBreadcrumbs
          heading="Danh sách bài học"
          links={[]}
          action={
            <Button
              variant="contained"
              type="button"
              onClick={handleCreateLesson}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              Thêm bài học
            </Button>
          }
        />

        <Card>
          <LessonListTableToolbar
            filterName={filterName}
            onFilterCourse={handleFilterCourse}
            onFilterChapter={handleFilterChapter}
            onFilterName={handleFilterName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom headLabel={TABLE_HEAD} rowCount={lessonList?.length} />

                <TableBody>
                  {lessonList?.map((row) => (
                    <LessonListRow
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
