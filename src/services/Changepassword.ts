import api from "../api/axiosIdentityInstance";
import { ChangePasswordRequest } from "../types/authtypes";
import AdminResetPasswordRequest from '../types/AdminResetPasswordRequest';

const changePassword = async (
  payload: ChangePasswordRequest
): Promise<string> => {

  const { data } = await api.put<string>(
    "Users/ChangeUserPassword",
    payload
  );

  return data;
};

export const resetUserPasswordByAdmin = async (
  payload: AdminResetPasswordRequest
): Promise<void> => {
  await api.put("Users/ResetUserPassword", payload);
};

export default changePassword;
