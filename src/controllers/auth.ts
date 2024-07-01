import { PrivateUser } from "models/User.ts";
import { TokenUtils } from "tools/Token.ts";

export async function createUserToken(user: PrivateUser) {
    return await TokenUtils.encode({
        id: user.id,
        furwazId: user.furwazId
    })
}