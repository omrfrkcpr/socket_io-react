import { useDispatch } from "react-redux";
import {
  fetchFail,
  fetchStart,
  loginSuccess,
  logoutSuccess,
  registerSuccess,
  usersSuccess,
} from "../features/authSlice";
import { useNavigate } from "react-router-dom";
import useAxios, { axiosWithPublic } from "./useAxios";
import toastNotify from "../helpers/toastNotify";

const useAuthCalls = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosWithToken = useAxios();

  const register = async (userInfo) => {
    dispatch(fetchStart());
    try {
      const { data } = await axiosWithPublic.post("auth/register", userInfo);
      // console.log(data);
      dispatch(registerSuccess(data));
      navigate("/home");
      toastNotify("success", data.message);
    } catch (error) {
      dispatch(fetchFail());
      toastNotify(
        "error",
        "The register request could not be performed, Please try again!"
      );
      console.log(error);
    }
  };

  const login = async (userInfo) => {
    dispatch(fetchStart());
    try {
      const { data } = await axiosWithPublic.post("auth/login", userInfo);
      // console.log(data);
      dispatch(loginSuccess(data));
      navigate("/home");
      toastNotify("success", data.message);
    } catch (error) {
      dispatch(fetchFail());
      toastNotify(
        "error",
        "The login request could not be performed, Please try again!"
      );
      console.log(error);
    }
  };

  const getAllUsers = async () => {
    dispatch(fetchStart());
    try {
      const { data } = await axiosWithToken.get("users");
      dispatch(usersSuccess(data));
    } catch (error) {
      dispatch(fetchFail());
      console.log(error);
    }
  };

  const logout = async () => {
    dispatch(fetchStart());
    try {
      await axiosWithToken.get("auth/logout");
      dispatch(logoutSuccess());
      toastNotify("success", "You're successfully logged out!");
      navigate("/");
    } catch (error) {
      dispatch(fetchFail());

      toastNotify(
        "error",
        "The logout request could not be performed, Please try again!"
      );
      console.log(error);
    }
  };

  return {
    register,
    login,
    logout,
    getAllUsers,
  };
};

export default useAuthCalls;
