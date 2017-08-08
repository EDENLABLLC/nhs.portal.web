import Url from 'url';
import qs from 'qs';

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

export const replaceQuery = (filter, { location, router }) => {
  const newFilter = {
    ...location.query,
    ...filter,
  };

  const query = Object.keys(newFilter).reduce((target, key) => {
    if (newFilter[key]) {
      target[key] = newFilter[key]; // eslint-disable-line
    }

    return target;
  }, { });

  router.replace({
    ...location,
    query,
  });
};
