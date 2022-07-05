import * as Yup from 'yup';
import { useEffect, useState } from 'react';
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
import CourseCategoryState from 'src/recoils/dashboard/courseCategory';
import slugify from 'src/utils/formatText';
import { createCourseCategory, updateCourseCategory } from 'src/api/courseCategory.api';
import { getCourseCategoryList } from 'src/api/courseCategory.api';
import { renderError } from 'src/utils/renderError';
// ----------------------------------------------------------------------

export default function UpsertCourseCategory() {
  const { enqueueSnackbar } = useSnackbar();
  const [courseCategoryState, setCourseCategoryState] = useRecoilState(CourseCategoryState);
  const [courseCategoryListParent, setCourseCategoryListParent] = useState([]);
  const { currentCourseCategory, isEdit } = courseCategoryState;

  const NewCourseCategory = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    slug: Yup.string().required('Slug is required'),
    parentId: Yup.string()
  });
  const defaultValues = {
    name: currentCourseCategory?.name || '',
    slug: (isEdit && currentCourseCategory?.slug) || '',
    parentId: currentCourseCategory?.parentId?._id || ''
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
    if (isEdit && currentCourseCategory) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentCourseCategory]);

  const handleRenderSlug = (event) => {
    setValue('name', event.target.value);
    setValue('slug', slugify(event.target.value));
  };
  useEffect(() => {
    (async () => {
      const data = await getCourseCategoryList({ limit: -1 });
      setCourseCategoryListParent(data?.filter((item) => item.parentId === null));
    })();
  }, []);
  const updateNameAfterCreate = (id) => {
    return courseCategoryListParent.find((item) => item._id === id)?.name || '';
  };
  const onSubmit = async (data) => {
    data = {
      name: data.name,
      slug: data.slug,
      ...(data.parentId && { parentId: data.parentId })
    };
    let courseCategoryList = courseCategoryState?.courseCategoryList;
    try {
      if (isEdit) {
        const updatedCourseCategory = await updateCourseCategory({ id: currentCourseCategory?._id, data });
        const { parentId } = updatedCourseCategory;
        console.log(parentId);
        courseCategoryList = courseCategoryList.map((item) =>
          item._id === currentCourseCategory?._id
            ? {
                ...updatedCourseCategory,
                ...(parentId && {
                  parentId: {
                    _id: updatedCourseCategory?.parentId,
                    name: updateNameAfterCreate(updatedCourseCategory?.parentId)
                  }
                })
              }
            : item
        );
      } else {
        const newCourseCategory = await createCourseCategory(data);
        const { parentId } = newCourseCategory;
        courseCategoryList = [
          {
            ...newCourseCategory,
            ...(parentId && {
              parentId: { _id: newCourseCategory?.parentId, name: updateNameAfterCreate(newCourseCategory?.parentId) }
            })
          },
          ...courseCategoryList
        ];
      }
      setCourseCategoryState((prev) => ({
        ...prev,
        courseCategoryList,
        isUpsertCourseCategoryOpen: false,
        total: isEdit ? prev?.total : prev?.total + 1
      }));
      enqueueSnackbar(!isEdit ? 'Thêm danh mục khóa học thành công!' : 'Cập nhật danh mục khóa học thành công!');
    } catch (error) {
      enqueueSnackbar(renderError(error) || 'Lỗi hệ thống!', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <RHFTextField name="name" label="Tên danh mục khóa học" onChange={handleRenderSlug} />
          <RHFTextField name="slug" label="Slug" />
          <RHFSelect
            name="parentId"
            label="Danh mục cha"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: false }}
          >
            <MenuItem value="" sx={{ color: 'error.main' }}>
              Thư mục gốc
            </MenuItem>
            {courseCategoryListParent?.map((option) => (
              <MenuItem key={option._id} value={option?._id}>
                {option.name}
              </MenuItem>
            ))}
          </RHFSelect>
          <Typography variant="subtitle2" noWrap>
            Lưu ý: Chỉ bỏ trống danh mục cha nếu đang tương tác với thư mục gốc.
          </Typography>
        </Stack>

        <Stack alignItems="flex-end" sx={{ mt: 3 }}>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {!isEdit ? 'Tạo danh mục khóa học' : 'Cập nhật danh mục khóa học'}
          </LoadingButton>
        </Stack>
      </Card>
    </FormProvider>
  );
}
