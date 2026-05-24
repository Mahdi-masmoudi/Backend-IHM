const offreService = require('../services/offre-service');

function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page || '1', 10));
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(query.pageSize || '10', 10)));
  return { page, pageSize };
}

async function list(req, res, next) {
  try {
    const { page, pageSize } = parsePagination(req.query);
    const mine = req.query.mine === 'true';

    const result = await offreService.listOffers({
      q: req.query.q || null,
      typeContrat: req.query.typeContrat || null,
      localisation: req.query.localisation || null,
      statut: req.query.statut || null,
      salaireMin: req.query.salaireMin ? Number.parseFloat(req.query.salaireMin) : null,
      salaireMax: req.query.salaireMax ? Number.parseFloat(req.query.salaireMax) : null,
      entreprise: req.query.entreprise || null,
      sortBy: req.query.sortBy || null,
      sortDirection: req.query.sortDirection || null,
      page,
      pageSize,
      entrepriseId: mine ? req.user.id : null
    });

    res.json({
      items: result.items,
      total: result.total,
      page,
      pageSize
    });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const offre = await offreService.getOffre(req.params.id);
    res.json(offre);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const offre = await offreService.createOffre({
      entrepriseId: req.user.id,
      payload: req.body
    });
    res.status(201).json(offre);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const offre = await offreService.updateOffre({
      entrepriseId: req.user.id,
      idOffre: req.params.id,
      payload: req.body
    });
    res.json(offre);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await offreService.deleteOffre({
      entrepriseId: req.user.id,
      idOffre: req.params.id
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, create, update, remove };
