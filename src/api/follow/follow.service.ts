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
      return this.internalResponse(false, {}, 409, "already following the user")
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
  public async getAllFollowers(userId: number) {
    let user = await getRepository(User).findOne({
      where: [
        { id: userId }
      ]
    })
    if (!user) {
      return this.internalResponse(false, {}, 404, "user does not exist");
    }
    const followers = await getRepository(Follow).find({
      where: [
        {

          followed: user.id
        }
      ]
    })
    if (followers.length < 1) {
      return this.internalResponse(false, {}, 404, "user has no follower")
    }
    return this.internalResponse(true, followers, 200)


  }
}
export const followService = new FollowService();