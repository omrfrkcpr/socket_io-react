import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastNotify = (type, msg) => {
  switch (type) {
    case "success":
      toast.success(msg);
      break;
    case "error":
      toast.error(msg);
      break;
    case "info":
      toast.info(msg);
      break;
    case "warn":
      toast.warn(msg);
      break;
    default:
      break;
  }
};

export default toastNotify;
