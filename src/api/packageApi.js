import instance from "../utils/service";

function errMessage(err, fallback) {
  const data = err?.response?.data;
  return data?.error || data?.errors?.join(", ") || fallback;
}

export async function uploadPackage(file, onProgress) {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await instance.post("/packages", form, {
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
      },
    });
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: errMessage(err, "Upload failed") };
  }
}

export async function getPackages() {
  try {
    const res = await instance.get("/packages");
    return { success: true, data: res.data?.packages || [] };
  } catch (err) {
    return { success: false, message: errMessage(err, "Could not fetch packages") };
  }
}

export async function getPackage(id) {
  try {
    const res = await instance.get(`/packages/${id}`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: errMessage(err, "Could not fetch package") };
  }
}

export async function triggerTranscription(id) {
  try {
    const res = await instance.post(`/packages/${id}/transcribe`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: errMessage(err, "Could not start transcription") };
  }
}

export async function deletePackage(id) {
  try {
    await instance.delete(`/packages/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, message: errMessage(err, "Could not delete package") };
  }
}

export async function getCourseContent(id) {
  try {
    const res = await instance.get(`/packages/${id}/course-content`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: errMessage(err, "Could not load course content") };
  }
}
