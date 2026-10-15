import instance from "../utils/service";

function errMessage(err, fallback) {
  const data = err?.response?.data;
  return data?.error || data?.errors?.join(", ") || fallback;
}

export async function askQuestion({ question, packageId, history }) {
  try {
    const res = await instance.post("/ask", { question, packageId, history: history || [] });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: errMessage(err, "Could not get an answer") };
  }
}

export async function getSpeechToken() {
  try {
    const res = await instance.get("/speech-token");
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, status: err?.response?.status, message: errMessage(err, "Voice isn't available") };
  }
}
