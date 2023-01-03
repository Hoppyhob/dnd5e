import AdvancementConfig from "./advancement-config.mjs";

/**
 * Configuration application for item choices.
 */
export default class ItemChoiceConfig extends AdvancementConfig {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "advancement", "item-choice", "two-column"],
      dragDrop: [{ dropSelector: ".drop-target" }],
      dropKeyPath: "pool",
      template: "systems/dnd5e/templates/advancement/item-choice-config.hbs",
      width: 540
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData(options={}) {
    const context = {
      ...super.getData(options),
      showSpellConfig: this.advancement.configuration.type === "spell",
      validTypes: this.advancement.constructor.VALID_TYPES.reduce((obj, type) => {
        obj[type] = game.i18n.localize(`ITEM.Type${type.capitalize()}`);
        return obj;
      }, {})
    };
    if ( this.advancement.configuration.type === "feat" ) {
      const selectedType = CONFIG.DND5E.featureTypes[this.advancement.configuration.restriction.type];
      context.typeRestriction = {
        typeLabel: game.i18n.localize("DND5E.ItemFeatureType"),
        typeOptions: CONFIG.DND5E.featureTypes,
        subtypeLabel: game.i18n.format("DND5E.ItemFeatureSubtype", {category: selectedType?.label}),
        subtypeOptions: selectedType?.subtypes
      };
    }
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async prepareConfigurationUpdate(configuration) {
    if ( configuration.choices ) configuration.choices = this.constructor._cleanedObject(configuration.choices);

    // Ensure items are still valid if type restriction or spell restriction are changed
    configuration.pool ??= this.advancement.configuration.pool;
    configuration.pool = await configuration.pool.reduce(async (pool, uuid) => {
      const item = await fromUuid(uuid);
      if ( this.advancement._validateItemType(item, {
        type: configuration.type, restriction: configuration.restriction ?? {}, error: false
      }) ) return [...await pool, uuid];
      return pool;
    }, []);

    return configuration;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _validateDroppedItem(event, item) {
    this.advancement._validateItemType(item);
  }
}
