import * as Yup from 'yup';
import { memo, useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Card, MenuItem, Stack, Typography } from '@mui/material';
// components
import { FormProvider, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { useRecoilState } from 'recoil';
import slugify from 'src/utils/formatText';
import RHFEditor from 'src/components/hook-form/RHFEditor';
import styled from '@emotion/styled';
import LessonCategoryState from 'src/recoils/dashboard/lessonCategory';
import { RHFUploadSingleFile } from 'src/components/hook-form/RHFUpload';
import LessonListState from 'src/recoils/dashboard/lessonList';
import { createLesson, updateLesson } from 'src/api/lessonList.api';
import { isString } from 'lodash';
import { cloudinaryUpload } from 'src/api/upload.api';
// ----------------------------------------------------------------------
const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1)
}));
const UpsertLessonList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [lessonListState, setLessonListState] = useRecoilState(LessonListState);
  const { lessonList, currentLesson, isEdit, lessonChapterFilter } = lessonListState;

  const [lessonCategoryState, setLessonCategoryState] = useRecoilState(LessonCategoryState);
  const { currentLessonCategory } = lessonCategoryState;

  const NewLessonSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    chapterId: Yup.string().required('Slug is required'),
    order: Yup.number().typeError('Order must be a number'),
    slug: Yup.string().required('Slug is required'),
    description: Yup.string().required('Description is required'),
    thumbnail: Yup.mixed().test('required', 'Thumbnail is required', (value) => value !== '')
  });
  const defaultValues = {
    name: currentLesson?.name || '',
    chapterId: currentLesson?.chapterId?._id || 'a',
    order: currentLesson?.order || 1,
    slug: (isEdit && currentLesson?.slug) || '',
    description: currentLesson?.description || '',
    thumbnail: currentLesson?.thumbnail?.url || ''
  };

  const methods = useForm({
    resolver: yupResolver(NewLessonSchema),
    defaultValues
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = methods;

  useEffect(() => {
    if (isEdit && currentLessonCategory) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentLessonCategory]);

  const handleRenderSlug = (event) => {
    setValue('name', event.target.value);
    setValue('slug', slugify(event.target.value));
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
  const updateName = (id) => {
    return lessonChapterFilter.find((item) => item._id === id)?.name || '';
  };
  const onSubmit = async (data) => {
    let lessonList = lessonListState?.lessonList;
    const formData = new FormData();
    formData.append('file', data.thumbnail);

    try {
      if (isEdit) {
        if (isString(data?.thumbnail)) {
          const updatedLesson = await updateLesson({
            id: currentLesson?._id,
            data: { ...data, thumbnail: currentLesson.thumbnail }
          });
          lessonList = lessonList.map((item) =>
            item._id === currentLesson?._id
              ? {
                  ...updatedLesson,
                  chapterId: { _id: updatedLesson?.chapterId, name: updateName(updatedLesson?.chapterId) }
                }
              : item
          );
        } else {
          const uploadData = await cloudinaryUpload(formData);
          const updatedLesson = await updateLesson({
            id: currentLesson?._id,
            data: { ...data, thumbnail: uploadData }
          });
          lessonList = lessonList.map((item) =>
            item._id === currentLesson?._id
              ? {
                  ...updatedLesson,
                  chapterId: { _id: updatedLesson?.chapterId, name: updateName(updatedLesson?.chapterId) }
                }
              : item
          );
        }
      } else {
        const uploadData = await cloudinaryUpload(formData);
        const newLesson = await createLesson({
          ...data,
          thumbnail: uploadData
        });
        lessonList = [
          {
            ...newLesson,
            chapterId: { _id: newLesson?.chapterId, name: updateName(newLesson?.chapterId) }
          },
          ...lessonList
        ];
      }
      setLessonListState((prev) => ({
        ...prev,
        lessonList,
        isUpsertLessonOpen: false,
        total: isEdit ? prev?.total : prev?.total + 1
      }));
      enqueueSnackbar(!isEdit ? 'Tạo mới bài học thành công!' : 'Cập nhật bài học thành công!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Lỗi hệ thống!', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <RHFTextField name="name" label="Tên bài học" onChange={handleRenderSlug} />
          <Stack spacing={2} direction="row">
            <RHFTextField name="courseId" label="Khóa học" value="ádf" disabled />
            <RHFSelect
              name="chapterId"
              label="Chương học"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
            >
              {lessonChapterFilter?.map((option) => (
                <MenuItem key={option._id} value={option?._id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>

          <Stack spacing={2} direction="row">
            <RHFTextField name="order" label="Thứ tự bài học" />
            <RHFTextField name="slug" label="Slug" />
          </Stack>

          <div>
            <LabelStyle>Description</LabelStyle>
            <RHFEditor simple name="description" placeholder="Mô tả bài học..." />
          </div>
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

        <Stack alignItems="flex-end" sx={{ mt: 3 }}>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {!isEdit ? 'Tạo bài học' : 'Cập nhật bài học'}
          </LoadingButton>
        </Stack>
      </Card>
    </FormProvider>
  );
};

export default memo(UpsertLessonList);
