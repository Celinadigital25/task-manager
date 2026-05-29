const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(auth);

// GET /api/tasks — obtener tareas activas
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, deleted: false }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// GET /api/tasks/trash — obtener papelera
router.get('/trash', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId, deleted: true }).sort({ updatedAt: -1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Error al obtener papelera' });
  }
});

// POST /api/tasks — crear tarea
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'El título es requerido' });

    const task = new Task({ user: req.userId, title, description });
    await task.save();
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// PATCH /api/tasks/:id — editar tarea (título, descripción, completado)
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    const { title, description, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    await task.save();
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// PATCH /api/tasks/:id/trash — mover a papelera
router.patch('/:id/trash', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { deleted: true },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Error al mover a papelera' });
  }
});

// PATCH /api/tasks/:id/restore — restaurar de papelera
router.patch('/:id/restore', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { deleted: false },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Error al restaurar tarea' });
  }
});

// DELETE /api/tasks/:id — eliminar permanentemente
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ message: 'Tarea eliminada' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

// DELETE /api/tasks/trash/all — vaciar papelera
router.delete('/trash/all', async (req, res) => {
  try {
    await Task.deleteMany({ user: req.userId, deleted: true });
    res.json({ message: 'Papelera vaciada' });
  } catch {
    res.status(500).json({ error: 'Error al vaciar papelera' });
  }
});

// PATCH /api/tasks/trash/restore-all — restaurar toda la papelera
router.patch('/trash/restore-all', async (req, res) => {
  try {
    await Task.updateMany({ user: req.userId, deleted: true }, { deleted: false });
    res.json({ message: 'Todas las tareas restauradas' });
  } catch {
    res.status(500).json({ error: 'Error al restaurar tareas' });
  }
});

module.exports = router;
