import { Follow } from "./follow.model"
import { getRepository } from "typeorm"
import { User } from "../User/user.model"
import { BaseService, jwtCred } from "../../enums";


class FollowService extends BaseService {


  public async follow(authuser: jwtCred, followedId: number) {
    const followerId = authuser.id


    const f = await getRepository(Follow).find({
      where: [
        {
          follower: followerId,
          followed: followedId
        }
      ]
    })

    if (f.length > 0) {
      return this.internalResponse(true, "following")
    }

    let fuser = await getRepository(User).findOne({
      where: [
        { id: followerId }
      ]

    })

    let user = await getRepository(User).findOne({
      where: [
        { id: followedId }
      ]
    })
    const followrepo = getRepository(Follow).create({
      follower: fuser,
      followed: user
    })
    await this.save(Follow, followrepo)
    if (fuser) {
      fuser.following_count++
      await this.save(User, fuser)

    }



    if (user) {
      user.followers_count++
      await this.save(User, user)

    }
    return this.internalResponse(true, "followed succesfully")


  }
}
export const followService = new FollowService();