'use strict';

const { LearnerProfile, Sequelize } = require('../common/database');
const graphService = require('../knowledge-graph/GraphService');
const Op = Sequelize.Op;
const pick = require('lodash/pick');

async function listGraphs({ cohortId, query, options }, res) {
  const where = { cohortId };
  if (query.userId) where.userId = { [Op.in]: query.userId };
  const profiles = await LearnerProfile.findAll({ where, ...options });
  const data = profiles.map(it => ({
    ...pick(it, ['cohortId', 'userId', 'progress']),
    ...it.getProfile()
  }));
  return res.jsend.success(data);
}

async function getGraph({ cohortId, learnerId }, res) {
  const where = { cohortId, userId: learnerId };
  const [learnerProfile] = await LearnerProfile.findOrCreate({ where });
  const { repositories, nodes } = learnerProfile.getProfile();
  return res.jsend.success({
    ...pick(learnerProfile, ['cohortId', 'userId', 'progress']),
    cohortProgress: graphService.getCohortProgress(cohortId),
    repositories,
    nodes
  });
}

function getCohortProgress({ cohortId }, res) {
  return res.jsend.success({
    progress: graphService.getCohortProgress(cohortId)
  });
}

module.exports = {
  getGraph,
  listGraphs,
  getCohortProgress
};
