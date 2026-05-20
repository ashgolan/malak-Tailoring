export const createCrudController = (Model) => ({
  getAll: async (req, res) => {
    try {
      const data = await Model.find();
      res.send(data);
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  getOne: async (req, res) => {
    try {
      const data = await Model.findById(req.params.id);
      if (!data) return res.status(404).send("לא נמצא");
      res.send(data);
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  create: async (req, res) => {
    try {
      const data = await Model.create(req.body);
      res.send(data);
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  update: async (req, res) => {
    try {
      const data = await Model.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      if (!data) return res.status(404).send("לא נמצא");
      res.send(data);
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  remove: async (req, res) => {
    try {
      const data = await Model.findByIdAndDelete(req.params.id);
      if (!data) return res.status(404).send("לא נמצא");
      res.send(data);
    } catch (e) {
      res.status(400).send(e.message);
    }
  },
});