import { prisma } from "index.ts";
import { PrivateUser, User } from "models/User.ts";
import { TokenUtils } from "tools/Token.ts";

export async function createUserToken(user: PrivateUser) {
    return await TokenUtils.encode({
        id: user.id,
        furwazId: user.furwazId
    })
}

export async function getOrCreate(furwazId: number) {
    let user = await prisma.user.findUnique({ where: { furwazId } });
    if (!user) {
        user = await prisma.user.create({
            data: { furwazId }
        });
    }

    return User.makePrivate(user);
}