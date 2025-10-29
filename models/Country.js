export const countryModel = (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    capital: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    population: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: null,
    },
    estimated_gdp: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    flag_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_refreshed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,      
    }},
     {
    tableName: 'countries',
    timestamps: false, // disable sequelize's automatic timestamp fields
    underscored: true, //use snake_case for automatically added fields
    });
     // ✅ convert bigint to number in JSON
  Country.prototype.toJSON = function () {
    const values = { ...this.get() };
    if (typeof values.population === 'string') {
      values.population = Number(values.population);
    }
    return values;
  };
    return Country;
}; 