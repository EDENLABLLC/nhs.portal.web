const objectToQuery = (target) => (
  '?' + Object.keys(target).reduce((arr, key) => (
    arr.push(`${key}=${target[key]}`) && arr
  ), []).join('&')
);

export const numberFormatting = number => (
  number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1 ').split('.')[0]
);

export const fetchJSON = (url, options = { method: 'GET' }) => new Promise((resolve, reject) => {
  const request = new XMLHttpRequest();

  if (options.body && options.method === 'GET') {
    url += objectToQuery(options.body);
  }

  request.onreadystatechange = () => {
    if (request.readyState !== 4) {
      return;
    }

    resolve(JSON.parse(request.responseText));
  };

  request.onerror = reject;
  request.open(options.method || 'GET', url);
  request.send(options.body ? JSON.stringify(options.body) : null);
});