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
//~ "userId" is foreignkey, which is defined in target table i.e. Todo ref: source table(User).
//~hasMany means, 1 user === many Todos
//~onDelete:'CASCADE', i.e. child col(s). will be deleted if parent col(s). is/are deleted

Todo.belongsTo(User,{foreignKey:"userId"});
// ~belongsTo: 1 to 1 relation, foreignKey is define in source table(Todo). eg: todo-4 is associated with user_2 

// !========================================================

User.hasMany(Label, {foreignkey:"userId", onDelete:"CASCADE"});
// ~hasMany: 1 user can generate multiple labels
// ~foreignKey will be in target table(Label)

Label.belongsTo(User,{foreignKey:"userId"});
// ~belongsTo:  1 to 1 relationship, 1 label is associated with 1 user
// ~foreignKey is defined in source model i.e. Label


export { User, Todo, Label };