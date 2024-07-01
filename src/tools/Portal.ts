import fetch from "node-fetch";
import Config from "./Config.ts";
import HTTPError from "errors/HTTPError.ts";
import HTTP from "./HTTP.ts";

class PortalUserInformations {
    public id: number;
    public pseudo: string;
    public email: string;
    public roles: string[];
    public apps: number[];
    public verified: boolean;

    constructor(json: any) {
        this.id = json.id;
        this.pseudo = json.pseudo;
        this.email = json.email;
        this.roles = json.roles;
        this.apps = json.apps;
        this.verified = json.verified;
    }
}

type PortalConnectionListener = (userInfos: PortalUserInformations) => void;

const tokenListeners = new Map<string, PortalConnectionListener[]>();
const tokenInfos = new Map<string, PortalUserInformations>();

async function request(url: string) {
    return await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Config.appKey}`
        }
    });
}

export async function generateToken(): Promise<string> {
    const res = await request(`https://${Config.mainAPIHost}/portal/generate`);
    const json: any = await res.json();
    if (json.error) {
        throw new Error(json.error);
    }

    // Remove the token after 5 minutes
    // (to avoid memory leaks if the user never connects)
    setTimeout(() => {
        tokenListeners.delete(json.data.token);
    }, 1000 * 60 * 5);

    const token = json.data.token;
    tokenListeners.set(token, []);
    tryRetreiveUserInfos(token);
    return token as string;
}

function tryRetreiveUserInfos(token: string) {
    setTimeout(async () => {
        if (!tokenListeners.has(token)) {
            return;
        }
    
        const res = await request(`https://${Config.mainAPIHost}/portal/${token}/user`);
        if (res.status === 200) {
            const json: any = await res.json();
            const userInfos = new PortalUserInformations(json.data);
            const listeners = tokenListeners.get(token);
            if (listeners !== undefined) {
                tokenListeners.delete(token);
                listeners.forEach((listener) => {
                    listener(userInfos);
                });
            }
            if (listeners === undefined || listeners.length === 0) {
                tokenInfos.set(token, userInfos);
            }
        }

        tryRetreiveUserInfos(token);
    }, 1000);
}

export async function getUserInfos(token: string): Promise<PortalUserInformations> {
    return new Promise((resolve, reject) => {
        if (!tokenListeners.has(token) && !tokenInfos.has(token)) {
            reject(new HTTPError(HTTP.UNAUTHORIZED, "Token not found"));
            return;
        }

        const portalInfos = tokenInfos.get(token);
        if (portalInfos !== undefined) {
            resolve(portalInfos);
            tokenInfos.delete(token);
            return;
        }

        tokenListeners.get(token)!.push((userInfos) => {
            resolve(userInfos);
        });
    });
}
