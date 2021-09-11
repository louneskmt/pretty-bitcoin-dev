import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Archives extends BaseSchema {
  protected tableName = "archives";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string("date").primary();
      table.boolean("synced").defaultTo(false);
      table.text("content", "longtext");
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
