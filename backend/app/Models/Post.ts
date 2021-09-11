import { afterFind, BaseModel, beforeSave, column } from "@ioc:Adonis/Lucid/Orm";

export default class Post extends BaseModel {
  public static selfAssignPrimaryKey = true;

  @column({ isPrimary: true })
  public id: number;

  @column()
  public longId: string;

  @column()
  public fromAddress: string;

  @column()
  public fromName: string;

  @column()
  public date: Date;

  @column()
  public subject: string;

  @column()
  public inReplyTo: string;

  @column()
  public references: string;

  @column()
  public content: string;

  @beforeSave()
  public static convertArrayToString(post: Post) {
    if (post.$dirty.references) {
      post.references = JSON.stringify(post.references);
    }
  }

  @afterFind()
  public static convertStringToArray(post: Post) {
    post.references = JSON.parse(post.references);
  }
}
