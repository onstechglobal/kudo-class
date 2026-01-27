import axios from "axios";

const api = axios.create({
  //baseURL: "http://127.0.0.1:8000/",
  baseURL: "https://kudoclass.onstech.in/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// CSRF token
const token = document
  .querySelector('meta[name="csrf-token"]')
  ?.getAttribute("content");

if (token) {
  api.defaults.headers.common["X-CSRF-TOKEN"] = token;
}

export default api;



export const Api_url = {
  //name: `http://127.0.0.1:8000/`,
  name: `https://kudoclass.onstech.in/`,
};
