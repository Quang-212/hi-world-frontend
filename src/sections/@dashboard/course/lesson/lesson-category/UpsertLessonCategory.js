import * as Yup from 'yup';
import { useEffect } from 'react';
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
import { createLessonCategory, updateLessonCategory } from 'src/api/lessonCategory.api';
// ----------------------------------------------------------------------
const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1)
}));
export default function UpsertLessonCategory() {
  const { enqueueSnackbar } = useSnackbar();
  const [lessonCategoryState, setLessonCategoryState] = useRecoilState(LessonCategoryState);
  const { currentLessonCategory, lessonCategoryCount, isEdit } = lessonCategoryState;

  const NewCourseCategory = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    slug: Yup.string().required('Slug is required'),
    courseId: Yup.string().required('Course is required'),
    order: Yup.number().typeError('Order must be a number'),
    description: Yup.string().required('Description is required')
  });
  const defaultValues = {
    name: currentLessonCategory?.name || '',
    slug: (isEdit && currentLessonCategory?.slug) || '',
    courseId: currentLessonCategory?.courseId?._id || lessonCategoryCount?.[0]?._id || '',
    order: currentLessonCategory?.order || 1,
    description: currentLessonCategory?.description || ''
  };

  const methods = useForm({
    resolver: yupResolver(NewCourseCategory),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    if (isEdit && currentLessonCategory) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentLessonCategory]);
  const updateName = (id) => {
    return lessonCategoryCount.find((item) => item._id === id)?.title || '';
  };
  const handleRenderSlug = (event) => {
    setValue('name', event.target.value);
    setValue('slug', slugify(event.target.value));
  };
  const onSubmit = async (data) => {
    let lessonCategoryList = lessonCategoryState?.lessonCategoryList;
    try {
      if (isEdit) {
        if (data.courseId !== currentLessonCategory?.courseId?._id) {
          await updateLessonCategory({ id: currentLessonCategory?._id, data });
          lessonCategoryList = lessonCategoryList?.filter((item) => item?._id !== currentLessonCategory?._id);
        } else {
          const updatedLessonCategory = await updateLessonCategory({ id: currentLessonCategory?._id, data });
          lessonCategoryList = lessonCategoryList.map((item) =>
            item._id === currentLessonCategory?._id
              ? {
                  ...updatedLessonCategory,
                  courseId: {
                    _id: updatedLessonCategory.courseId,
                    name: updateName(updatedLessonCategory.courseId)
                  }
                }
              : item
          );
        }
      } else {
        const newLessonCategory = await createLessonCategory(data);
        lessonCategoryList = [newLessonCategory, ...lessonCategoryList];
      }

      setLessonCategoryState((prev) => ({
        ...prev,
        lessonCategoryList,
        isUpsertLessonCategoryOpen: false,
        total: isEdit ? prev?.total : prev?.total + 1
      }));
      enqueueSnackbar(!isEdit ? 'Thêm chương học thành công!' : 'Cập nhật chương học thành công!');
    } catch (error) {
      enqueueSnackbar(error || 'Lỗi hệ thống!', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <RHFTextField name="name" label="Tên chương học" onChange={handleRenderSlug} />
          <RHFTextField name="slug" label="Slug" />
          <Stack spacing={2} direction="row">
            <RHFSelect
              name="courseId"
              label="Khóa học"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
            >
              {lessonCategoryCount?.map((option) => (
                <MenuItem key={option._id} value={option?._id}>
                  {option.title}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField name="order" label="Thứ tự chương học" />
          </Stack>

          <div>
            <LabelStyle>Description</LabelStyle>
            <RHFEditor simple name="description" placeholder="Mô tả chương học..." />
          </div>
        </Stack>

        <Stack alignItems="flex-end" sx={{ mt: 3 }}>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {!isEdit ? 'Tạo chương học' : 'Cập nhật chương học'}
          </LoadingButton>
        </Stack>
      </Card>
    </FormProvider>
  );
}
