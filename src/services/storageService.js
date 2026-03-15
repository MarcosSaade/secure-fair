export const getLocal = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const setLocal = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getSession = (key) => {
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setSession = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};