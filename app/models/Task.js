const {Schema, model} = require('mongoose')

const Task = new Schema ({
    status: {type: String, required: true},
    hours: {type: Number, required: true},
    description: {type: String, required: true},
    deleted: {type: Boolean, required: true},
})

module.exports = model('Task', Task)