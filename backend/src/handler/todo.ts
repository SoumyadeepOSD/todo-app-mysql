import { Todo } from "../models/model";
import { Op } from "sequelize";
const todoCreateHandler = async (req: any, h: any) => {
    try {
        const { title, description, status, creationDateTime, updationDateTime, priority, labels } = req.payload;
        const userId = req.auth.userId;

        // Prepare label associations
        const labelConnections = labels?.map((labelId: number) => ({ id: labelId })) || [];

        // Create a new Todo
        const newTodo = await Todo.create(
            {
                title: title,
                description: description,
                status: status,
                userId: userId,
                creationDateTime: creationDateTime,
                updationDateTime: updationDateTime,
                priority: priority,
                labels: {
                    connect: labelConnections, // Use the `connect` keyword to link existing labels
                },
                include: {
                    labels: true, // Include labels in the response
                },
            });

        return h.response({
            message: "Successfully created new Todo",
            todo: newTodo
        }).code(201); // Use 201 for resource creation

    } catch (error: any) {
        console.error(error);
        return h.response({
            message: "An error occurred while creating the Todo",
            error: error.message || "Internal Server Error"
        }).code(500);
    }
};


const todoReadHandler = async (req: any, h: any) => {
    const userId = req.auth.userId;
    const { start, end, keyword, priority, category } = req.query;

    try {
        let whereClause: any = { userId };

        if (start) {
            // Add one day to the start date
            const parsedStart = new Date(new Date(start));
            parsedStart.setDate(parsedStart.getDate() + 1); // Add one day
            const adjustedStart = parsedStart.toISOString().split('T')[0]; // Format to ISO date string
            console.log("Parsed Start Date + 1 Day:", adjustedStart);
            whereClause.creationDateTime = { gte: adjustedStart }; // Set greater than or equal to adjusted start
        }

        if (end) {
            const parsedEnd = new Date(new Date(end));
            parsedEnd.setDate(parsedEnd.getDate() + 1); // Add one day
            const adjustedEnd = parsedEnd.toISOString().split('T')[0]; // Format to ISO date string
            console.log("Parsed End Date + 1 Day:", adjustedEnd);
            // Merge with the existing `creationDateTime` condition
            whereClause.creationDateTime = {
                ...(whereClause.creationDateTime || {}),
                lte: adjustedEnd, // Set less than or equal to end date
            };
        }

        if (keyword) {
            whereClause = {
                ...whereClause,
                title: {
                    [Op.like]: `%${keyword}%`
                }
            }
            console.log("Search Query:", keyword);
        }

        if (["1", "2", "3", "4"].includes(priority)) {
            whereClause.priority = +priority;
        }

        // if (category != "-1" || isNaN(category)) {
        //     const categoryId = +category; // Ensure category is a number
        //     if (typeof (categoryId) === "number")
        //         whereClause.labels = {
        //             some: {
        //                 id: categoryId, // Match category with label id
        //             },
        //         };
        // }

        console.log("Final Where Clause:", whereClause);

        const allTodos = await Todo.findAll({
            where: whereClause,
            // include: { labels: true },
            order: [
                ['id', 'DESC']
            ],
        });


        return {
            message: `Successfully retrieved ${allTodos.length} todos`,
            todos: allTodos,
            others: { start, end },
        };
    } catch (error: any) {
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
            where: { id: todoId },
            include: { user: true },
        });

        if (!existingTodo || existingTodo.userId !== userId) {
            return h.response({
                message: "Todo can't be updated as it does not exist or does not belong to this user",
            }).code(401);
        }

        // Update the Todo fields
        const updatedTodo = await Todo.update(
            {
                title: title,
                description: description,
                status: status,
                updationDateTime: updationDateTime,
                creationDateTime: creationDateTime,
                priority: priority,
                labels: {
                    set: labels.map((labelId: number) => ({ id: labelId })), // Clear existing and set new labels
                },
            },
            { where: { id: todoId } },
        );

        return h.response({
            message: "Successfully updated the todo",
            todo: updatedTodo,
        }).code(200); // Use 200 for successful updates

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




