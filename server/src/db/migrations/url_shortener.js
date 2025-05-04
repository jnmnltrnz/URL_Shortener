/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const {
    createOnUpdateTrigger,
    dropOnUpdateTrigger,
    createUpdateAtTriggerFunction,
    dropUpdatedAtTriggerFunction,
  } = require("../util/db-util");
  
  exports.up = async function (knex) {
    const hasTable = await knex.schema.hasTable("url_shortener");
    if (!hasTable) {
      await knex.schema.createTable("url_shortener", (table) => {
        table.increments("id").primary(); // SERIAL PRIMARY KEY
        table.string("actual_url", 255).notNullable();
        table.string("published_url", 255).notNullable();
        table.string("custom_slug", 100).nullable();
        table.timestamp("expiration_date").nullable(); // ✅ FIXED
        table.timestamps(true, true); // created_at and updated_at
      });
  
      await createUpdateAtTriggerFunction(knex);
      await createOnUpdateTrigger(knex, "url_shortener");
    }
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function (knex) {
    const hasTable = await knex.schema.hasTable("url_shortener");
    if (hasTable) {
      await knex.schema.dropTable("url_shortener");
      await dropOnUpdateTrigger(knex, "url_shortener");
      await dropUpdatedAtTriggerFunction(knex);
    }
  };
  