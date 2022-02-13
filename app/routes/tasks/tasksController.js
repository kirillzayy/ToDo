const Task      = require('../../models/Task')

const ObjectID = require('mongodb').ObjectID;
const checkID = (req, res) => {
    try {
        new ObjectID(id)
    } catch (e) {
        res.send({
            'error': 'Задача с таким id удалена или еще не создана'
        });
    }
}

class tasksController {
    
    async getTasks (req, res) {
        //Запросить все задачи
        try {
            
            const tasks = await Task.find({ deleted: false }).exec();
            
            return res.json(tasks)
            
        } catch (e) {
            return res.status(400).json({message: `Ошибка: ${e}`})
        }
    }    
    
    async addTask (req, res) {
        //Добавить задачу
        try {

            const task = new Task({
                status: req.body.status,
                hours: req.body.hours,
                description: req.body.description,
                deleted: false
            });

            await task.save()
            
            return res.json(task)
            
        } catch (e) {
            return res.status(400).json({message: `Ошибка: ${e}`})
        }
    }    
    
    async editTask (req, res) {
        //Изменить задачу
        try {
            
            const {status, hours, description, _id} = req.body

            let task = await Task.findOneAndUpdate({_id}, {
                status,
                hours,
                description
            }, {  
                new: true
            })

            return res.json(task)
            
        } catch (e) {
            return res.status(400).json({message: `Ошибка: ${e}`})
        }
    }    
    
    async deleteTask (req, res) {
        //Удалить задачу
        try {
            
            const {_id} = req.body

            let task = await Task.findOneAndUpdate({_id}, {
                deleted: true,
            }, {  
                new: true
            })

            return res.json(task)
            
        } catch (e) {
            return res.status(400).json({message: `Ошибка: ${e}`})
        }
    }    
    
    async restoreAllTasks (req, res) {
        //Метод для отладки кода, который восстанавливает все удаленные задачи. В последствии нужно удалить
        try {
            
            const tasks = await Task.updateMany({deleted: true}, {deleted: false});
            
            return res.json(tasks)
            
        } catch (e) {
            return res.status(400).json({message: `Ошибка: ${e}`})
        }
    }
}

module.exports = new tasksController()