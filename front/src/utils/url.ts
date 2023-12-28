export function changeURLParam({
  pathname,
  search,
  param,
  value,
}: {
  pathname: string;
  search: URLSearchParams;
  param: string;
  value: string;
}) {
  const url = new URL(pathname, window.location.origin);
  const params = new URLSearchParams(search);
  params.set(param, value);
  return `${url.toString()}?${params.toString()}`;
}
