const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    difficulty: {type: String},
    description: {type: String, required: true,},
    code: {type: String, required: true},
    pseudocode: {type: String, required: true},
    userId: {type: String, required: true},
    problemId: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;