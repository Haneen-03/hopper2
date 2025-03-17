import React from "react";
import { useNavigate } from "react-router-dom"; // صحيح

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('thebac.png')" }} // أضف رابط الخلفية هنا
    >
      <img src="thelogo.png" alt="Logo" className="w-40 h-40 mb-8" />{" "}
      {/* أضف رابط اللوقو هنا */}
      <button
        onClick={() => navigate("/login")}
        className="w-64 bg-blue-700 text-white p-3 rounded-full text-lg font-semibold hover:bg-blue-800 transition mb-4"
      >
        SIGN IN
      </button>
      <button
        onClick={() => navigate("/signup")}
        className="w-64 bg-white text-blue-700 border border-blue-700 p-3 rounded-full text-lg font-semibold hover:bg-blue-100 transition"
      >
        SIGN UP
      </button>
    </div>
  );
};

export default Welcome;
