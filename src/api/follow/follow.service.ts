import { BaseService } from "../../helpers/db.helper";
import { Follow } from "./follow.model";
import { getRepository, Like } from "typeorm";
import { jwtCred } from "../../utils/enum";
import { userService } from "../user/user.services";
import { User } from "../user/user.model";

class FollowService extends BaseService {
  super: any;

  public createFollowInstance(followed: User, follower: User): Follow {
    return getRepository(Follow).create({
      followed,
      follower,
    });
  }

  public async saveFollow(follow: Follow): Promise<Follow> {
    return await this.save(Follow, follow);
  }

  public async follow(authUser: jwtCred, followedInfluencerId: number) {
    const userId = authUser.id;

    // check if user is already following the userId
    const followings = await getRepository(Follow).find({
      where: [
        {
          follower: userId,
          followed: followedInfluencerId,
        },
      ],
    });

    if (followings.length > 0) {
      return this.internalResponse(
        false,
        {},
        409,
        "Already following this user"
      );
    }

    const follower = await userService.findUserWithId(userId);
    const followed = await userService.findUserWithId(followedInfluencerId);
    if (!followed) {
      return this.internalResponse(
        false,
        {},
        400,
        "User doesn't exist or has been deleted"
      );
    }

    const followrepo = this.createFollowInstance(followed, follower);
    const result = await this.saveFollow(followrepo);
    if (!result) {
        return this.internalResponse(false, {}, 400, "Unable to follow user.")
    }
    return this.internalResponse(true, {}, 200, "followed succesfully");
  }
}

export const followService = new FollowService();
