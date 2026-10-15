import { getSessionUser } from "./auth";

export const ROLES = {
  ADMIN: "admin",
  UPLOADER: "uploader",
  VIEWER: "viewer",
};

export const isAdmin = () => getSessionUser()?.role === ROLES.ADMIN;
export const isUploader = () => getSessionUser()?.role === ROLES.UPLOADER;
export const canUpload = () => ["admin", "uploader"].includes(getSessionUser()?.role);
