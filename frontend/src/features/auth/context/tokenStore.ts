let _accessToken: string | null = null;

export const setAccessToken = (token: string): void => {
  _accessToken = token;
};

export const removeAccessToken = (): void => {
  _accessToken = null;
};

export const getAccessToken = (): string | null => {
  return _accessToken;
};
