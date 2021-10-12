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

    if (followed.account_type !== "celebrity") {
      return this.internalResponse(
        false,
        {},
        400,
        "You can only follow an influencer"
      );
    }

    const followrepo = this.createFollowInstance(followed, follower);
    const result = await this.saveFollow(followrepo);
    if (!result) {
      return this.internalResponse(false, {}, 400, "Unable to follow user.");
    }
    return this.internalResponse(true, {}, 200, "followed succesfully");
  }

  public async unFollow(authUser: jwtCred, followedInfluencerId: number) {
    const userId = authUser.id;

    // check if user is already following the userId
    const isFollowing = await getRepository(Follow).findOne({
      where: [
        {
          follower: userId,
          followed: followedInfluencerId,
        },
      ],
    });

    if (!isFollowing) {
      return this.internalResponse(
        false,
        {},
        400,
        "You can unfollow only followed users"
      );
    }

    const followed = await userService.findUserWithId(followedInfluencerId);
    if (!followed) {
      return this.internalResponse(
        false,
        {},
        400,
        "User doesn't exist or has been deleted"
      );
    }

    // unfollow then
    const unfollow = await this.schema(Follow).remove(isFollowing);

    if (!unfollow) {
      return this.internalResponse(
        false,
        {},
        400,
        "An error occurred. Unable to unfollow user."
      );
    }

    return this.internalResponse(true, {}, 200, "Unfollowed succesfully!");
  }
}

export const followService = new FollowService();
