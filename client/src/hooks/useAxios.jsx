import axios from "axios";
import { useSelector } from "react-redux";

export const axiosWithPublic = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

const useAxios = () => {
  const { token } = useSelector((state) => state.auth);
  const axiosWithToken = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
  return axiosWithToken;
};

export default useAxios;
