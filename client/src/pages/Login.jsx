import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/CustomInput";
import useAuthCalls from "../hooks/useAuthCalls";
import toastNotify from "../helpers/toastNotify";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthCalls();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in:", formData);

    const { email, password } = formData;

    if (email && password) {
      login(formData);
    } else {
      toastNotify("warn", "Please fill in all fields!");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Form constant object
  const loginFormFields = [
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
  ];

  return (
    <div className="bg-grey-lighter min-h-screen flex flex-col">
      <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
        <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
          <h1 className="mb-8 text-3xl text-center">Sign in</h1>
          <form onSubmit={handleSubmit}>
            {loginFormFields.map((field) => (
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
              Login
            </button>
          </form>
        </div>

        <div className="text-grey-dark mt-6">
          Don't have an account?{" "}
          <button
            className="no-underline border-b border-blue text-blue-400 hover:text-blue-300"
            onClick={() => navigate("/register")}
          >
            Sign up.
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
