import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";


import { loginService } from "../services/authService";


// =========================
// Models
// =========================

export interface UserModel {
  userID: number;
  employeeID?: number;
  username: string;
  fullName: string;
  email: string;
  organizationID: number;
  organizationName: string;
}

export interface RoleModel {
  roleID: number;
  roleName: string;
}

export interface PermissionModel {
  permissionCode: string;
}


export interface LoginResponse {
  token?: string;
  refreshToken?: string;

  user?: UserModel;

  roles?: RoleModel[];

  permissions?: PermissionModel[];

  isValid?: boolean;

  isPasswordResetRequired?: boolean;

  message?: string;
}


// =========================
// Context Interface
// =========================

interface AuthContextType {

  isAuthenticated: boolean;

  user: UserModel | null;

  roles: RoleModel[];

  permissions: PermissionModel[];

  login: (
    username: string,
    password: string
  ) => Promise<void>;

  logout: () => void;

  hasRole: (
    roleName: string
  ) => boolean;

  hasPermission: (
    permissionCode: string
  ) => boolean;
}


// =========================
// Context
// =========================

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);


// =========================
// Provider
// =========================

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {


  const storedUser =
    localStorage.getItem("user");


  const storedRoles =
    localStorage.getItem("userRoles");


  const storedPermissions =
    localStorage.getItem("userPermissions");


  const [user, setUser] =
    useState<UserModel | null>(
      storedUser
        ? JSON.parse(storedUser)
        : null
    );


  const [roles, setRoles] =
    useState<RoleModel[]>(
      storedRoles
        ? JSON.parse(storedRoles)
        : []
    );


  const [permissions, setPermissions] =
    useState<PermissionModel[]>(
      storedPermissions
        ? JSON.parse(storedPermissions)
        : []
    );


  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(
      () => !!localStorage.getItem("token")
    );



  // =========================
  // Login
  // =========================

  const login = async (
    username: string,
    password: string
  ) => {


    const data: LoginResponse =
      await loginService(
        username,
        password
      );


    if (data.isValid === false) {

      throw new Error(
        data.message ||
        "Invalid username or password"
      );

    }



    if (
      data.isPasswordResetRequired
    ) {

      throw new Error(
        "Password reset required"
      );

    }



    if (!data.token) {

      throw new Error(
        "Invalid login response"
      );

    }



    // Store JWT

    localStorage.setItem(
      "token",
      data.token
    );


    localStorage.setItem(
      "refreshToken",
      data.refreshToken || ""
    );



    // Store user

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );


    localStorage.setItem(
      "userRoles",
      JSON.stringify(
        data.roles || []
      )
    );


    localStorage.setItem(
      "userPermissions",
      JSON.stringify(
        data.permissions || []
      )
    );



    setUser(
      data.user || null
    );


    setRoles(
      data.roles || []
    );


    setPermissions(
      data.permissions || []
    );


    setIsAuthenticated(true);

  };



  // =========================
  // Logout
  // =========================

  const logout = () => {


    localStorage.removeItem(
      "token"
    );


    localStorage.removeItem(
      "refreshToken"
    );


    localStorage.removeItem(
      "user"
    );


    localStorage.removeItem(
      "userRoles"
    );


    localStorage.removeItem(
      "userPermissions"
    );


    setUser(null);

    setRoles([]);

    setPermissions([]);

    setIsAuthenticated(false);

  };



  // =========================
  // Role Check
  // =========================

  const hasRole = (
    roleName: string
  ): boolean => {

    return roles.some(
      r =>
        r.roleName === roleName
    );

  };



  // =========================
  // Permission Check
  // =========================

  const hasPermission = (
    permissionCode: string
  ): boolean => {

    return permissions.some(
      p =>
        p.permissionCode === permissionCode
    );

  };



  return (

    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        roles,
        permissions,
        login,
        logout,
        hasRole,
        hasPermission,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};



// =========================
// Hook
// =========================

export const useAuth = () => {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;

};