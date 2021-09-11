import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Posts extends BaseSchema {
  protected tableName = "posts";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer("id").primary();
      table.string("long_id").unique().notNullable();

      table.string("from_address").notNullable();
      table.string("from_name").notNullable();

      table.date("date").notNullable();
      table.text("subject").notNullable();
      table.string("in_reply_to");
      table.text("references");

      table.text("content", "longtext").notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
