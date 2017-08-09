import Url from 'url';
import qs from 'qs';

Object.entries = Object.entries || (object => Object.keys(object).map(i => [i, object[i]]));

export const createUrl = (endpoint, options) => {
  const url = Url.parse(endpoint, false);

  url.search = qs.stringify(
    Object.entries({
      ...qs.parse(url.search),
      ...options,
    })
    .filter(([key, value]) => !!value || value === false || value === 0) // eslint-disable-line
    .reduce((prev, [key, value]) => ({
      ...prev,
      [key]: value,
    }), {})
  );
  return Url.format(url);
};
