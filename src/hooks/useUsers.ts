import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginRequest, registerRequest, getMeRequest } from "../api/User/users.api";
import { toastSuccess, toastError } from "../lib/toast";
import { ApiError } from "../api/ApiClient";

export function useUsers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMeRequest,
    enabled: !!localStorage.getItem("token"),
  });

  const loginMutation = useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => loginRequest(email, password),

    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["me"], data.user);

      toastSuccess(data.message || "Log in");
      navigate("/home");
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toastError(error.data?.error || error.message);
      } else {
        toastError("Unexpected error while log in");
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => registerRequest(name, email, password),

    onSuccess: (data) => {
      localStorage.setItem("token", data.token);

      queryClient.setQueryData(["me"], data.user);

      toastSuccess(data.message || "Sign up");

      navigate("/home");
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toastError(error.data?.error || error.message);
      } else {
        toastError("Failed to sign up");
      }
    },
  });


  const logout = () => {
    localStorage.clear();
    queryClient.clear();
    navigate("/login");
    toastSuccess("Logged out");
  };

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,

    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,

    logout,
  };
}
