const express = require('express');
const auth = require('../middleware/auth');
const {Problem} = require('../models/Problem');
const UserFavorites = require('../models/Favorite');

const problemRoutes = express.Router();

// Favorite Problems Routes
// CREATE api/problems/favorites
problemRoutes.post('/favorites', auth, async( req, res ) => {
    try {
        let favorites = await UserFavorites.findOne({ userId: req.user.id });
        if(!favorites) favorites = new UserFavorites({ userId: req.user.id, favoriteProblems: [] });
        if(!favorites.favoriteProblems.some(p => p.problemId === req.body.problemId)) {
            favorites.favoriteProblems.push(req.body);
            await favorites.save();
            res.status(201).json({message: 'Problem favorited', favorites})
        } else {
            res.status(400).json({message: 'Problem already favorited'});
        }
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

// GET api/problems/favorites
problemRoutes.get('/favorites', auth, async( req, res ) => {
    try {
        console.log('getting favorites')
        const favorites = await UserFavorites.findOne({ userId: req.user.id });
        if(!favorites) return res.status(400).json({ message: 'Could not find any favorites'});
        res.status(200).json(favorites.favoriteProblems);
    } catch (error) {
        res.status(400).json({ message: 'Request failed', error: error})
    }
})

// DELETE /api/problems/favorite/:problemId
problemRoutes.delete('/favorites/:problemId', auth, async( req, res ) => {
    const {problemId} = req.params;
    console.log(problemId)
    try {
        const problem = await UserFavorites.findOneAndUpdate({userId: req.user.id}, {$pull: {favoriteProblems: {problemId}}}, {new: true});
        if(!problem) return res.status(400).json({message: 'Could not find problem', error: error});
        res.status(200).json({message: 'Problem removed from favorites', userFavorites: problem.favoriteProblems});
    } catch (error) {
        res.status(400).json({ message: 'Could not delete problem', error: error});
    }
})

// POST /api/problems/create
problemRoutes.post('/create', auth, async( req, res ) => {
    const { problemId, title, description, shortDescription, code, pseudocode, difficulty, tags} = req.body;

    try {
        const existingProblem = await Problem.findOne({ problemId });
        if(existingProblem) return res.status(400).send('Problem already saved');

        const problem = new Problem({
            userId: req.user.id,
            problemId,
            title,
            description,
            shortDescription,
            code,
            pseudocode,
            difficulty,
            tags,
            createdAt: new Date()
        })
        await problem.save();
        res.status(200).send('Problem successfully saved!');
    } catch (error) {
        console.log('Error saving', error);
        res.status(400).send('Could not save problem');
    }
});

// GET /api/problems
problemRoutes.get('/', auth, async( req, res ) => {
    try {
        const problems = await Problem.find({ userId: req.user.id });
        if(!problems || problems.length < 0) return res.status(404).send('No problems found');
        res.status(200).json(problems);
    } catch (error) {
        console.log('Error getting problems', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET api/problems/:id
problemRoutes.get('/:problemId', auth, async( req, res ) => {
    const { problemId } = req.params;
    console.log(problemId)
    try {
        const problem = await Problem.findOne({problemId});
        if(!problem) return res.status(400).send('could not find problem by id:', problemId);
        res.status(200).json(problem);
    } catch (error) {
        console.log('Coult not get problem', error);
        res.status(400).send('error getting problem by id');
    }
})

// PUT api/problems/:id
problemRoutes.put('/:problemId', auth, async( req, res ) => {
    const { problemId } = req.params;
    const { title, description, code, pseudocode, difficulty } = req.body;
    try {
        
        const problem = await Problem.findOne({problemId, userId: req.user.id});
        if(!problem) return res.status(400).send('Could not find problem by id');
        
        if(title) problem.title = title;
        if(description) problem.description = description;
        if(code) problem.code = code;
        if(pseudocode) problem.pseudocode = pseudocode;
        if(difficulty) problem.difficulty = difficulty;

        await problem.save();
        res.status(200).json({ message: 'Problem updated successfully', problem });
    } catch (error) {
        console.log('Error updating problem:', error);
        res.status(400).send('Failed to update problem');
    }
})

// DELETE api/problems/:id
problemRoutes.delete('/:problemId', auth, async( req, res ) => {
    const { problemId } = req.params;
    try {
        const problem = await Problem.findOneAndDelete({problemId, userId: req.user.id});
        if(!problem) return res.status(400).send('Could not find problem by id');
        res.status(200).json({ message: 'problem deleted successfully', problem: problem });
    } catch (error) {
        console.log('Error deleting problem', error);
        res.status(500).json({error: 'server issues'});
    }
})


module.exports = problemRoutes;