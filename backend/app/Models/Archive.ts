import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Archive extends BaseModel {
  @column({ isPrimary: true })
  public date: string;

  @column()
  public synced: boolean;

  @column()
  public content: string;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
