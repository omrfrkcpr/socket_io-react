import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/CustomInput";
import useAuthCalls from "../hooks/useAuthCalls";
import toastNotify from "../helpers/toastNotify";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuthCalls();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registering:", formData);

    const { username, email, password, confirm_password } = formData;

    if (username && email && password && confirm_password) {
      if (password === confirm_password) {
        register(formData);
      } else {
        toastNotify("error", "Passwords do not match!");
      }
    } else {
      toastNotify("warn", "Please fill in all fields!");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Form constant object
  const registerFormFields = [
    {
      type: "text",
      name: "username",
      placeholder: "Username",
      value: formData.username,
    },
    {
      type: "text",
      name: "email",
      placeholder: "Email",
      value: formData.email,
    },
    {
      type: showPassword ? "text" : "password",
      name: "password",
      placeholder: "Password",
      value: formData.password,
      showPasswordToggle: showPassword,
      togglePasswordVisibility: togglePasswordVisibility,
    },
    {
      type: showConfirmPassword ? "text" : "password",
      name: "confirm_password",
      placeholder: "Confirm Password",
      value: formData.confirm_password,
      showPasswordToggle: showConfirmPassword,
      togglePasswordVisibility: toggleConfirmPasswordVisibility,
    },
  ];

  return (
    <div className="bg-grey-lighter min-h-screen flex flex-col">
      <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
        <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
          <h1 className="mb-8 text-3xl text-center">Sign up</h1>
          <form onSubmit={handleSubmit}>
            {registerFormFields.map((field) => (
              <CustomInput
                key={field.name}
                {...field}
                onChange={handleChange}
              />
            ))}
            <button
              type="submit"
              className="w-full text-center py-3 rounded bg-green-500 text-white hover:bg-green-600 duration-300 focus:outline-none my-1"
            >
              Create Account
            </button>
          </form>
          <div className="text-center text-sm text-grey-dark mt-4">
            By signing up, you agree to the{" "}
            <button
              className="no-underline border-b border-grey-dark text-grey-dark bg-transparent"
              onClick={() => alert("Terms of Service")}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              className="no-underline border-b border-grey-dark text-grey-dark bg-transparent"
              onClick={() => alert("Privacy Policy")}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        <div className="text-grey-dark mt-6">
          Already have an account?{" "}
          <button
            className="no-underline border-b border-blue text-blue-400 hover:text-blue-300"
            onClick={() => navigate("/login")}
          >
            Log in.
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
