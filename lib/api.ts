"use client"

import axios, { InternalAxiosRequestConfig } from "axios"

// Centralised Axios instance for backend calls (adds JWT automatically)
export const api = axios.create({
  baseURL: "https://test.scorptech.co/api/v1",
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token && config.headers) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
}) 