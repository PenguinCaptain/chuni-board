import crypto from "crypto";
import { TimeSyncService } from "@/util/timesync";

const timeSync = new TimeSyncService();

/**
 * 鉴权加密
 * @param {*} params
 * @returns
 */
export async function getEncodeHeader(params = {}, appKey: string, appSecret: string) {
    const timestamp = await timeSync.getTimestamp();
    const nonce = parseInt(Math.random() * 100000 + "") + timestamp;
    const header = {
        "x-bili-accesskeyid": appKey,
        "x-bili-content-md5": getMd5Content(JSON.stringify(params)),
        "x-bili-signature-method": "HMAC-SHA256",
        "x-bili-signature-nonce": nonce + "",
        "x-bili-signature-version": "1.0",
        "x-bili-timestamp": timestamp,
    };
    const data: string[] = [];
    for (const key in header) {
        data.push(`${key}:${header[key as keyof typeof header]}`);
    }

    const signature = crypto.createHmac("sha256", appSecret).update(data.join("\n")).digest("hex");
    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...header,
        Authorization: signature,
    };
}

/**
 * MD5加密
 * @param {*} str
 * @returns
 */
export function getMd5Content(str: string) {
    return crypto.createHash("md5").update(str).digest("hex");
}
