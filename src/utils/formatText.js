export default function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/ + /g, ' ')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .split(' ')
    .join('-');
}
