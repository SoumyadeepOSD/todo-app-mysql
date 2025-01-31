import { DataTypes } from "sequelize";
import { SEQUELIZE } from "../config/db";

const User = SEQUELIZE.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accessToken: {
            type: DataTypes.STRING(1000),
        },
        refreshToken: {
            type: DataTypes.STRING(1000),
        },
    },
    {
        timestamps: true, // Enables createdAt and updatedAt fields
    }
);

const Todo = SEQUELIZE.define(
    "Todo",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        creationDateTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        updationDateTime: {
            type: DataTypes.STRING,
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        labels: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [], 
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
        },
    },
    {
        timestamps: true,
    }
);

const Label = SEQUELIZE.define(
    "Label",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
        },
    },
    {
        timestamps: true,
    }
);

// Define associations
User.hasMany(Todo, {foreignkey:"userId", onDelete:"CASCADE"});
Todo.belongsTo(User,{foreignKey:"userId"});

User.hasMany(Label, {foreignkey:"userId", onDelete:"CASCADE"});
Label.belongsTo(User,{foreignKey:"userId"});

export { User, Todo, Label };