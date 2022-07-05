import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { Card, Grid, Stack, Typography, MenuItem } from '@mui/material';
import { FormProvider, RHFRadioGroup, RHFSelect, RHFTextField } from 'src/components/hook-form';
import RHFEditor from 'src/components/hook-form/RHFEditor';
import { RHFUploadSingleFile } from 'src/components/hook-form/RHFUpload';
import RHFDatePicker from 'src/components/hook-form/RHFDatePicker';
import { createCourse, updateCourse } from 'src/api/courseList.api';
import { cloudinaryUpload } from 'src/api/upload.api';
import CourseListState from 'src/recoils/dashboard/courseList';
import { useRecoilState, useRecoilValue } from 'recoil';
import CourseCategoryState from 'src/recoils/dashboard/courseCategory';
import { isString } from 'lodash';
import slugify from 'src/utils/formatText';
// routes

// ----------------------------------------------------------------------

const LEVEL_OPTION = ['Beginner', 'Skilled', 'Proficient', 'Advanced'];

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1)
}));

// ----------------------------------------------------------------------

export default function CourseNewEditForm() {
  const { enqueueSnackbar } = useSnackbar();
  const courseCategoryState = useRecoilValue(CourseCategoryState);
  const courseCategory = courseCategoryState.courseCategoryList?.filter((category) => category?.parentId !== null);
  const [courseListState, setCourseListState] = useRecoilState(CourseListState);
  const { currentCourse, isEdit } = courseListState;
  const NewCourseSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    subTitle: Yup.string().required('Sub title is required'),
    slug: Yup.string().required('Slug is required'),
    category: Yup.string().required('Category is required'),
    level: Yup.string().required('Level is required'),
    description: Yup.string().required('Description is required'),
    thumbnail: Yup.mixed().test('required', 'Thumbnail is required', (value) => value !== '')
  });

  const defaultValues = useMemo(
    () => ({
      title: currentCourse?.title || '',
      subTitle: currentCourse?.subTitle || '',
      slug: currentCourse?.slug || '',
      category: currentCourse?.category?._id || courseCategory[0]?._id || '',
      level: currentCourse?.level || LEVEL_OPTION[0],
      description: currentCourse?.description || '',
      thumbnail: currentCourse?.thumbnail?.url || ''
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentCourse]
  );
  const methods = useForm({
    resolver: yupResolver(NewCourseSchema),
    defaultValues
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = methods;
  useEffect(() => {
    if (isEdit && currentCourse) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentCourse]);

  const updateName = (id) => {
    return courseCategory.find((item) => item._id === id)?.name || '';
  };
  const handleRenderSlug = (event) => {
    setValue('title', event.target.value);
    setValue('slug', slugify(event.target.value));
  };
  const onSubmit = async (data) => {
    let courseList = courseListState?.courseList;
    const formData = new FormData();
    formData.append('file', data.thumbnail);

    try {
      if (isEdit) {
        if (isString(data?.thumbnail)) {
          const updatedCourse = await updateCourse({
            id: currentCourse?._id,
            data: { ...data, thumbnail: currentCourse.thumbnail }
          });
          courseList = courseList.map((item) =>
            item._id === currentCourse?._id
              ? {
                  ...updatedCourse,
                  category: { _id: updatedCourse?.category, name: updateName(updatedCourse?.category) }
                }
              : item
          );
        } else {
          const uploadData = await cloudinaryUpload(formData);
          const updatedCourse = await updateCourse({
            id: currentCourse?._id,
            data: { ...data, thumbnail: uploadData }
          });
          courseList = courseList.map((item) =>
            item._id === currentCourse?._id
              ? {
                  ...updatedCourse,
                  category: { _id: updatedCourse?.category, name: updateName(updatedCourse?.category) }
                }
              : item
          );
        }
      } else {
        const uploadData = await cloudinaryUpload(formData);
        const newCourse = await createCourse({
          ...data,
          thumbnail: uploadData
        });
        courseList = [
          {
            ...newCourse,
            category: { _id: newCourse?.category, name: updateName(newCourse?.category) }
          },
          ...courseList
        ];
      }

      setCourseListState((prev) => ({
        ...prev,
        courseList,
        isUpsertCourseOpen: false,
        total: isEdit ? prev?.total : prev?.total + 1
      }));
      enqueueSnackbar(!isEdit ? 'Tạo mới khóa học thành công!' : 'Cập nhật khóa học thành công!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Lỗi hệ thống!', { variant: 'error' });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          'thumbnail',
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        );
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <RHFTextField name="title" label="Title" onChange={handleRenderSlug} />
              <RHFTextField name="subTitle" label="Sub title" />
              <div>
                <LabelStyle>Level</LabelStyle>
                <RHFRadioGroup
                  name="level"
                  options={LEVEL_OPTION}
                  sx={{
                    '& .MuiFormControlLabel-root': { mr: 4 }
                  }}
                />
              </div>
              <div>
                <LabelStyle>Description</LabelStyle>
                <RHFEditor simple name="description" />
              </div>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3} mt={2}>
                <RHFTextField name="slug" label="Slug" />

                <RHFSelect
                  name="category"
                  label="Danh mục khóa học"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {courseCategory?.map((option) => (
                    <MenuItem key={option._id} value={option?._id} sx={{ textTransform: 'capitalize' }}>
                      {option.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <div>
                  <LabelStyle>Thumbnail</LabelStyle>
                  <RHFUploadSingleFile
                    name="thumbnail"
                    helperText={errors?.thumbnail?.message}
                    accept="image/*"
                    maxSize={3145728}
                    onDrop={handleDrop}
                  />
                </div>
              </Stack>
            </Card>
            <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
              {!isEdit ? 'Tạo mới khóa học' : 'Cập nhật khóa học'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
