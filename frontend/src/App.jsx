import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Signup from "./components/user/Signup";
import Login from "./components/user/Login";
import Mainpage from "./components/user/Mainpage";
import { restoreAuthState } from "../redux/authSlice";
import { fetchUserData } from "../redux/userSlice";
import Withdraw from "./components/user/Withdraw";
import Deposit from "./components/user/Deposit";
import Dashboard from "./components/user/Dashboard";
import Profile from "./components/user/Profile";
import Setting from "./components/user/Setting";
import CryptoDeposit from "./components/user/CryptoDeposit";
import AdminLogin from "./components/admin/AdminLogin";
import AdminRoutes from "./components/admin/AdminRoutes";
import Transactions from "./components/user/Transactions";
import Security from "./components/user/Security";
import ForgotPasswordPage from "./components/user/ForgotPasswordPage";
import Referrals from "./components/user/Referrals";
import CryptoTransactionStatus from "./components/user/CryptoTransaction";
import SupportPage from "./components/user/SupportPage";


const ProtectedRoute = ({ isAuthenticated, children }) => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserData());
    }
  }, [isAuthenticated, dispatch]);

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(restoreAuthState({ token }));
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/user" /> : <Signup />}
        />
        <Route
          path="/referrals/:refId"
          element={isAuthenticated ? <Navigate to="/user" /> : <Signup />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/user" /> : <Login />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/user" /> : <ForgotPasswordPage />}
        />


        {/* Protected Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Mainpage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Withdraw />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Deposit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crypto-transaction-status"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CryptoTransactionStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SupportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Profile />
            </ProtectedRoute>
          }
        />
         <Route
          path="/security"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Security />
            </ProtectedRoute>
          }
        />
          <Route
          path="/setting"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Setting />
            </ProtectedRoute>
          }
        />  
        <Route
        path="/referrals"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Referrals />
          </ProtectedRoute>
        }
      />


      <Route path="/crypto-deposit" 
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <CryptoDeposit />
        </ProtectedRoute>
        } />


        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminRoutes />} /> 


        {/* Fallback for undefined routes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;