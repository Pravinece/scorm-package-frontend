import instance from "../utils/service";

function errMessage(err, fallback) {
  const data = err?.response?.data;
  return data?.error || data?.errors?.join(", ") || fallback;
}

export async function seedAdmin() {
  try {
    const res = await instance.post("/auth/seed");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, status: err?.response?.status, message: errMessage(err, "Could not seed admin") };
  }
}

export async function loginUser({ empId, password }) {
  try {
    const res = await instance.post("/auth/login", { empId, password });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: errMessage(err, "Invalid employee ID or password") };
  }
}

export async function getMe() {
  try {
    const res = await instance.get("/auth/me");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: errMessage(err, "Could not load session") };
  }
}

export async function createUser({ name, empId, password, role }) {
  try {
    const res = await instance.post("/auth/users", { name, empId, password, role });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: errMessage(err, "Could not create user") };
  }
}
