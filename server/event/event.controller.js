const { GradedEvent, LearnerProfile, UngradedEvent } = require('../common/database');
const HttpStatus = require('http-status');
const pick = require('lodash/pick');

const { CREATED } = HttpStatus;
const commonAttrs = ['userId', 'activityId', 'interactionStart', 'interactionEnd'];
const ungradedAttrs = ['progress'].concat(commonAttrs);
const gradedAttrs = ['questionId', 'isCorrect', 'answer'].concat(commonAttrs);

async function reportUngradedEvent({ cohortId, body }, res) {
  const data = { cohortId, ...pick(body, ungradedAttrs) };
  const profileCond = { cohortId, userId: body.userId };
  const [profile] = await LearnerProfile.findOrCreate({ where: profileCond });
  await UngradedEvent.create({ ...data, duration: calculateDuration(body) });
  profile.updateProgress(body.activityId, body.progress, new Date().getTime());
  await profile.save();
  return res.status(CREATED).end();
}

async function reportGradedEvent({ cohortId, body }, res) {
  const data = { cohortId, ...pick(body, gradedAttrs) };
  await GradedEvent.create({ ...data, duration: calculateDuration(body) });
  return res.status(CREATED).end();
}

function calculateDuration({ interactionStart, interactionEnd }) {
  if (!interactionStart || !interactionEnd) return null;
  return Math.ceil((interactionEnd - interactionStart) / 1000);
}

module.exports = {
  reportUngradedEvent,
  reportGradedEvent
};
