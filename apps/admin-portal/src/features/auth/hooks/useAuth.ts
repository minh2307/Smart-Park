import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { setCredentials, logoutSuccess, setLoading, setError } from '../store/authSlice';
import { useLoginMutation, useLogoutMutation, useLazyGetCurrentUserQuery } from '../services/authApi';
import { LoginInput } from '../schemas/loginSchema';
import { useCallback } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [loginApi] = useLoginMutation();
  const [logoutApi] = useLogoutMutation();
  const [triggerGetCurrentUser] = useLazyGetCurrentUserQuery();

  const login = useCallback(async (data: LoginInput) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await loginApi(data).unwrap();
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      console.log('[DEBUG] useAuth - AccessToken in localStorage before triggerGetCurrentUser:', localStorage.getItem('accessToken'));
      const user = await triggerGetCurrentUser(undefined, false).unwrap();
      dispatch(setCredentials({ user, accessToken: response.accessToken }));
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.data?.detail || err?.data?.title || 'Authentication failed';
      dispatch(setError(errMsg));
      return { success: false, error: errMsg };
    } finally {
      dispatch(setLoading(false));
    }
  }, [loginApi, triggerGetCurrentUser, dispatch]);

  const logout = useCallback(async () => {
    dispatch(setLoading(true));
    const refreshToken = localStorage.getItem('refreshToken') || '';
    try {
      if (refreshToken) {
        await logoutApi({ refreshToken }).unwrap();
      }
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch(logoutSuccess());
      dispatch(setLoading(false));
    }
  }, [logoutApi, dispatch]);

  return {
    ...authState,
    login,
    logout,
  };
};
