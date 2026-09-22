"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { setToken } from "../utils/auth";
import AuthRedirect from "@/components/common/AuthRedirect";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

// Custom CSS for styling
const styles = `
  .card {
    border: 1px solid transparent;
    border-image: linear-gradient(to bottom, #EF7E20, #D66F1B) 1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), inset 0 0 8px rgba(239, 126, 32, 0.1);
    transition: box-shadow 0.3s ease;
  }
  .card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  .form-control:focus {
    border: 2px solid #EF7E20;
    box-shadow: 0 0 0 0.25rem rgba(239, 126, 32, 0.3);
  }
  .form-control::placeholder {
    color: #6B7280;
    opacity: 0.8;
  }
  .btn-primary {
    background: linear-gradient(to right, #EF7E20, #D66F1B);
    border: none;
    transition: transform 0.2s ease, background 0.3s ease;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    background: linear-gradient(to right, #D66F1B, #EF7E20);
  }
  .btn-primary:active {
    transform: scale(0.98);
  }
  .title-container {
    position: relative;
    padding: 3rem 2rem;
  }
  .title-container::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 70%;
    background: rgba(239, 126, 32, 0.1);
    border-radius: 24px;
    z-index: -1;
  }
  .title-underline::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(to right, #EF7E20, #D66F1B);
    border-radius: 2px;
  }
  .title-text:hover {
    letter-spacing: 1.2px;
  }
  .form-divider::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(to right, #EF7E20, #D66F1B);
    border-radius: 2px;
  }
  .forgot-link:hover {
    text-decoration: underline;
    color: #D66F1B;
  }
  .main-container {
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.5), #F5F7FA);
  }
  .footer:hover {
    color: #EF7E20;
    transition: color 0.3s ease;
  }
  @media (max-width: 1200px) {
    .title-text {
      font-size: 2.5rem !important;
    }
  }
  @media (max-width: 992px) {
    .title-text {
      font-size: 2.25rem !important;
    }
  }
  @media (max-width: 576px) {
    .card {
      padding: 2rem !important;
    }
    h2 {
      font-size: 1.75rem !important;
    }
    .title-text {
      font-size: 1.5rem !important;
    }
  }
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      });
      setToken(res.data.data.token);
      router.push("/dashboard");
      // Optional: Success message (uncomment to use)
      // setError(null);
      // setSuccess("Login successful! Redirecting...");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Check your email and password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthRedirect>
      <style>{styles}</style>
      <div className="min-vh-100 d-flex flex-column main-container" style={{ backgroundColor: "#F5F7FA" }}>
        {/* Main Content */}
        <div className="container-fluid p-0 flex-grow-1">
          <div className="row g-0 align-items-center mx-auto" style={{ minHeight: "calc(100vh - 200px)", maxWidth: "1920px" }}>
            {/* Left Side Title */}
            <div className="col-lg-6 ">
              <div className="text-center py-5 title-container">
           
                <h1
                  className="fw-bold title-text"
                  style={{
                    color: "#1A3159",
                    fontSize: "3.25rem",
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: "1px",
                    lineHeight: "1.2",
                    maxWidth: "85%",
                    margin: "0 auto",
                    textShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    position: "relative",
                    transition: "letter-spacing 0.3s ease",
                  }}
                  role="heading"
                  aria-label="Hari Om School College Management System Software"
                >
                  <span style={{ color: "#EF7E20", fontWeight: "900" }}>Hari Om</span> School College Management System Software
                  <span className="title-underline" />
                </h1>
                <p
                  style={{
                    color: "#6B7280",
                    fontSize: "1.2rem",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: "400",
                    marginTop: "1.5rem",
                    maxWidth: "85%",
                    margin: "1.5rem auto",
                    lineHeight: "1.5",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  Empowering Education with Seamless Management
                </p>
              </div>
              
            </div>

            {/* Right Side Form */}
            <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center py-5">
              <div
                className="card shadow-sm p-4 p-md-5 position-relative mx-2"
                style={{
                  maxWidth: "500px",
                  width: "100%",
                  borderRadius: "20px",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <h2
                  className="text-center mb-4 fw-bold form-divider"
                  style={{
                    color: "#1A3159",
                    fontSize: "2rem",
                    fontFamily: "'Poppins', sans-serif",
                    lineHeight: "1.4",
                    position: "relative",
                  }}
                >
                  Welcome Back
                </h2>
                <form onSubmit={handleSubmit} aria-describedby={error ? "form-error" : undefined}>
                  <div className="mb-3">
                    <label
                      htmlFor="email"
                      className="form-label fw-medium"
                      style={{
                        color: "#1A3159",
                        fontSize: "1rem",
                        fontWeight: "500",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control py-3 px-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      aria-label="Email Address"
                      style={{
                        borderColor: "#E0E4EC",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        transition: "border 0.3s ease, box-shadow 0.3s ease",
                      }}
                    />
                  </div>
                  <div className="mb-4 position-relative">
                    <label
                      htmlFor="password"
                      className="form-label fw-medium"
                      style={{
                        color: "#1A3159",
                        fontSize: "1rem",
                        fontWeight: "500",
                      }}
                    >
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control py-3 px-3"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      aria-label="Password"
                      style={{
                        borderColor: "#E0E4EC",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        transition: "border 0.3s ease, box-shadow 0.3s ease",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="position-absolute end-0 top-50 translate-middle-y pe-3 border-0 bg-transparent"
                      style={{ color: "#1A3159", fontSize: "0.9rem" }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {error && (
                    <div id="form-error" className="alert alert-danger mt-3 py-2" role="alert" style={{ fontSize: "0.9rem" }}>
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3"
                    disabled={isLoading}
                    style={{
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <p
                    style={{
                      color: "#6B7280",
                      fontSize: "0.95rem",
                      fontFamily: "'Inter', sans-serif",
                      lineHeight: "1.5",
                    }}
                  >
                    For login credentials, please connect with your organization
                  </p>
                </div>
                <div className="text-center mt-2">
                  <Link
                    href="/forgot-password"
                    className="forgot-link"
                    style={{
                      color: "#EF7E20",
                      fontSize: "0.95rem",
                      fontFamily: "'Inter', sans-serif",
                      textDecoration: "none",
                      fontWeight: "500",
                      transition: "color 0.3s ease",
                    }}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="footer text-center py-4 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "#1A3159",
            color: "#FFFFFF",
            fontFamily: "'Inter', sans-serif",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"%23FFFFFF\" viewBox=\"0 0 24 24\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.4-3 5h2c0-2.5 3-2.5 3-5 0-2.21-1.79-4-4-4z\"/></svg>')",
              backgroundSize: "contain",
              marginRight: "8px",
            }}
          />
          <p style={{ fontSize: "0.9rem", margin: 0 }}>
            Copyright © Powered by Palsande Innovation Pvt Ltd
          </p>
        </footer>
      </div>
    </AuthRedirect>
  );
}