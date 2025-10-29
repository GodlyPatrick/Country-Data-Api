export const statusModel = (sequelize, DataTypes) => {
  const Status = sequelize.define('Status', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    total_countries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_refreshed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }}, {
    tableName: 'status',
    underscored: true,
    timestamps: false,
  });
    // ✅ Remove `id` when converting to JSON
  Status.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.id; // remove id field from response
    return values;
  };
  
  return Status;
}