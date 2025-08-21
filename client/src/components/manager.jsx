import React, { useState, useEffect } from "react";
import AnimatedHeader from "./AnimatedHeader";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";

const Manager = () => {
  const [showpassword, setshowpassword] = useState(false);
  const [form, setform] = useState({ site: "", username: "", password: "", id: "" });
  const [passwordArray, setpasswordArray] = useState([]);

  const getpasswords = async () => {
    try {
      const req = await fetch("http://localhost:3000/");
      const passwords = await req.json();
      setpasswordArray(passwords);
    } catch (error) {
      toast.error("Failed to fetch passwords!", { transition: Bounce });
    }
  };

  useEffect(() => {
    getpasswords();
  }, []);

  const passwordalert = () => {
    if (form.password.trim() === "") {
      toast.error("Please provide a valid password", { transition: Bounce });
    } else if (!showpassword) {
      toast.info("Password is now visible!", { transition: Bounce });
    }
  };

  const savepassword = async () => {
    const passwordData = {
        ...form,
        id: form.id || uuidv4()
    };
    
    try {
        const method = form.id ? "PUT" : "POST";
        const response = await fetch("http://localhost:3000/", {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(passwordData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        if (form.id) {
            toast.success("Password updated successfully!", { transition: Bounce });
        } else {
            toast.success("Password added successfully!", { transition: Bounce });
        }

        setform({ site: "", username: "", password: "", id: "" });
        getpasswords();
    } catch (error) {
        toast.error(`Failed to save: ${error.message}`, { transition: Bounce });
    }
  };

  const handlechange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Copied: ${text}`, { transition: Bounce });
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this password?")) {
      try {
        await fetch("http://localhost:3000/", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        toast.info("Password deleted!", { transition: Bounce });
        getpasswords(); 
      } catch (error) {
        toast.error("Failed to delete password!", { transition: Bounce });
      }
    }
  };

  const handleEdit = (id) => {
    const passwordToEdit = passwordArray.find((item) => item.id === id);
    if (passwordToEdit) {
      setform(passwordToEdit);
    }
  };

  return (
  
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />

      <div className="min-h-screen w-full pt-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#22c55e_100%)]">
        <div className="container mx-auto p-4 md:p-0 md:w-10/12 m flex flex-col">
          <AnimatedHeader />
          <p className="text-green-400 text-center text-lg">
            Your Password Manager
          </p>

          <div className="flex flex-col gap-6 my-5">
            <input
              value={form.site}
              onChange={handlechange}
              name="site"
              type="url"
              id="forms"
              placeholder="Enter website URL"
              className="w-full bg-black rounded-full border-2 text-green-400 border-green-400 placeholder-green-500 px-4 py-2 focus:outline-none caret-green-400"
            />
            <div className="flex flex-col sm:flex-row gap-6 w-full">
              <input
                value={form.username}
                onChange={handlechange}
                type="text"
                name="username"
                id="names"
                placeholder="Enter username"
                className="placeholder-green-500 border-2 border-green-400 text-green-400 bg-black focus:outline-none caret-green-400 rounded-full h-11 w-full px-4"
              />
              <div className="relative w-full">
                <input
                  name="password"
                  value={form.password}
                  onChange={handlechange}
                  type={showpassword ? "text" : "password"}
                  placeholder="Enter password"
                  id="passwords"
                  className="placeholder-green-500 border-2 border-green-400 text-green-400 bg-black focus:outline-none caret-green-400 rounded-full h-11 w-full px-4 pr-12"
                />
                <i
                  className={`${
                    showpassword ? "ri-eye-off-fill" : "ri-eye-fill"
                  } text-green-400 text-2xl absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer`}
                  onClick={() => {
                    setshowpassword(!showpassword);
                    passwordalert();
                  }}
                ></i>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                if (
                  form.site.trim() &&
                  form.username.trim() &&
                  form.password.trim()
                ) {
                  if (
                    form.site.trim().length > 4 &&
                    form.username.trim().length > 4 &&
                    form.password.trim().length > 4
                  ) {
                    savepassword();
                  } else {
                    toast.error("All fields must be at least 5 characters long!");
                  }
                } else {
                  toast.error("Please fill in all fields!");
                }
              }}
              className="group flex items-center justify-center cursor-pointer hover:text-black hover:bg-green-400 text-green-400 rounded-full w-full sm:w-auto sm:px-6 my-4 text-xl p-2 border-green-400 border-2 transition-colors duration-300"
            >
              <i className="ri-lock-password-fill text-green-400 text-2xl mr-2 group-hover:text-black transition-colors duration-300"></i>
              {form.id ? "Update Password" : "Add Password"}
            </button>
          </div>
        </div>

        <div className="passwords bg-black text-green-500 w-10/12 mx-auto rounded-2xl md:p-10 p-4">
          <h1 className="text-3xl mb-4 text-center md:text-start">
            Your Passwords:
          </h1>
          {passwordArray.length === 0 && (
            <div className="text-center">No passwords to show</div>
          )}

          {passwordArray.length !== 0 && (
            <div className="overflow-x-auto rounded-2xl">
              <table className="min-w-full table-auto border-t border-b border-green-500">
                <thead>
                  <tr className="bg-green-900 text-green-300">
                    <th className="p-3 text-center border-r border-green-500">
                      URL
                    </th>
                    <th className="p-3 text-center border-r border-green-500">
                      Username
                    </th>
                    <th className="p-3 text-center border-r border-green-500">
                      Password
                    </th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordArray.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-green-500 text-sm sm:text-base"
                    >
                      <td className="p-3 flex items-center justify-between border-r border-green-500 break-words max-w-[480px]">
                        <a
                          href={item.site}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate"
                        >
                          {item.site}
                        </a>
                        <i
                          className="ri-clipboard-line cursor-pointer ml-2"
                          onClick={() => copyToClipboard(item.site)}
                        ></i>
                      </td>
                      <td className="p-3 text-center border-r border-green-500 break-words max-w-[120px]">
                        {item.username}
                      </td>
                      <td className="p-3 text-center border-r border-green-500 break-words max-w-[120px]">
                        {item.password}
                      </td>
                      <td className="flex justify-center gap-6 p-3">
                        <i
                          className="ri-pencil-fill cursor-pointer hover:text-green-300"
                          onClick={() => handleEdit(item.id)}
                        >
                          Edit
                        </i>
                        <i
                          className="ri-delete-bin-5-fill cursor-pointer hover:text-red-400"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Manager;