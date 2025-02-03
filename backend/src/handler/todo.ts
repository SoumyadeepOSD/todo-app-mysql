import { Label, Todo, User } from "../models/model";
import { Op, Sequelize } from "sequelize";


const todoCreateHandler = async (req: any, h: any) => {
    try {
        const { 
            creationDateTime, 
            updationDateTime, 
            description, 
            priority, 
            status, 
            labels, // This should be an array of label IDs
            title, 
        } = req.payload;
        const userId = req.auth.userId;

        // Create a new Todo
        const newTodo = await Todo.create({
            title,
            description,
            status,
            userId,
            creationDateTime,
            updationDateTime,
            priority,
            labels
        });

        // Link existing labels to the new Todo
        if (labels && labels.length > 0) {
            await newTodo.setLabels(labels); // Sequelize's built-in method for Many-to-Many
        }

        // Fetch the created Todo with associated labels
        const createdTodo = await Todo.findByPk(newTodo.id, {
            include: {
                model: Label, // Ensure Label is the correct Sequelize model
            },
        });

        return h.response({
            message: "Successfully created new Todo",
            todo: createdTodo
        }).code(201);

    } catch (error: any) {
        console.error(error);
        return h.response({
            message: "An error occurred while creating the Todo",
            error: error.message || "Internal Server Error"
        }).code(500);
    }
};


const todoReadHandler = async (req:any, h:any) => {
    const userId = req.auth.userId;
    const { start, end, keyword, priority, category } = req.query;

    try {
        let whereClause:any = { userId };

        if (start) {
            const parsedStart = new Date(start);
            parsedStart.setDate(parsedStart.getDate() + 1);
            const adjustedStart = parsedStart.toISOString().split('T')[0];
            whereClause.creationDateTime = { [Op.gte]: adjustedStart };
        }

        if (end) {
            const parsedEnd = new Date(end);
            parsedEnd.setDate(parsedEnd.getDate() + 1);
            const adjustedEnd = parsedEnd.toISOString().split('T')[0];
            whereClause.creationDateTime = {
                ...(whereClause.creationDateTime || {}),
                [Op.lte]: adjustedEnd,
            };
        }

        if (keyword) {
            whereClause.title = { [Op.like]: `%${keyword}%` };
        }

        if (["1", "2", "3", "4"].includes(priority)) {
            whereClause.priority = +priority;
        }

        if (category !== "-1" && !isNaN(category)) {
            const categoryId = Number(category);
            whereClause = {
                ...whereClause,
                [Op.and]: Sequelize.literal(`JSON_CONTAINS(labels, '${categoryId}', '$')`)
            };
        }

        const allTodos = await Todo.findAll({ where: whereClause });

        return {
            message: `Successfully retrieved ${allTodos.length} todos`,
            todos: allTodos,
            others: { start, end },
        };
    } catch (error:any) {
        console.error(error);
        return h.response({
            message: "An error occurred while reading the todos",
            error: error.message || "Internal Server Error",
        }).code(500);
    }
};



const todoUpdateHandler = async (req: any, h: any) => {
    const { todoId } = req.params;
    const userId = req.auth.userId;
    const { title, description, status, updationDateTime, creationDateTime, priority, labels } = req.payload;

    try {
        // Check if the Todo exists and belongs to the user
        const existingTodo = await Todo.findOne({
            where: { id: todoId, userId: userId }, // Ensure the user owns the todo
        });

        if (!existingTodo) {
            return h.response({
                message: "Todo can't be updated as it does not exist or does not belong to this user",
            }).code(403); // Use 403 for forbidden access
        }

        // Update the Todo fields
        await existingTodo.update({
            title,
            description,
            status,
            updationDateTime,
            creationDateTime,
            priority,
            ...(labels !== undefined && { labels }), // Update labels only if provided
        });

        return h.response({
            message: "Successfully updated the todo",
            todo: existingTodo, // ✅ No need for extra DB query
        }).code(200);

    } catch (error: any) {
        console.error(error);
        return h.response({
            message: "An error occurred while updating the Todo",
            error: error.message || "Internal Server Error",
        }).code(500);
    }
};



const todoDeleteHandler = async (req: any, h: any) => {
    const { todoId } = req.params;
    const userId = req.auth.userId;
    try {
        if (userId) {
            const existingTodo = await Todo.findOne({
                where: {
                    id: todoId
                }
            });
            if (!existingTodo) {
                return h.response({
                    "message": "Todo can't deleted as it does not exist"
                }).code(401);
            }
            const deletedTodo = await Todo.destroy({
                where: {
                    id: todoId
                }
            });
            if (!deletedTodo) {
                return h.response({
                    "message": "Can't delete todo"
                }).code(404);
            }
            return h.response({
                message: "Successfully deleted new Todo",
                todo: deletedTodo
            }).code(201); // Use 201 for resource creation
        }
    } catch (error: any) {
        console.error(error);
        return h.response({
            message: "An error occurred while updating the Todo",
            error: error.message || "Internal Server Error"
        }).code(500);
    }

}


const todoFetchAllHandler = async (req: any, h: any) => {
    try {
        const allTodos = await Todo.findAll({
            include: {
                labels: true
            }
        });
        if (!allTodos) {
            return h.response({
                "message": "No todos found"
            }).code(401);
        }
        return {
            "message": "Successfully fetch all todos",
            "todo": allTodos
        }
    } catch (error: any) {
        console.error(error);
        return h.response({
            message: "An error occurred while fetching all the todos",
            error: error.message || "Internal Server Error"
        }).code(500);
    }

}


export {
    todoReadHandler,
    todoUpdateHandler,
    todoCreateHandler,
    todoDeleteHandler,
    todoFetchAllHandler,
}




