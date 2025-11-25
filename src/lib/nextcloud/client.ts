import { createClient } from "webdav";

const NEXTCLOUD_URL = process.env.NEXTCLOUD_WEBDAV_URL || "http://192.168.15.10/remote.php/dav/files/Ponto";
const NEXTCLOUD_USER = process.env.NEXTCLOUD_USER || "";
const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD || "";

if (!NEXTCLOUD_USER || !NEXTCLOUD_PASSWORD) {
  console.warn(
    "Nextcloud credentials not configured. File uploads will not work."
  );
}

export const nextcloudClient = createClient(NEXTCLOUD_URL, {
  username: NEXTCLOUD_USER,
  password: NEXTCLOUD_PASSWORD,
});

export const BASE_PATH = "colaboradores";

