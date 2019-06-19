const Apply = require('./apply');
const Delegates = require('./delegates');

module.exports = class Dpos {
	constructor({ storage, slots, activeDelegates, logger, schema }) {
		this.delegates = new Delegates({ storage, logger });
		this.apply = new Apply({
			storage,
			slots,
			activeDelegates,
			schema,
			logger,
			delegates: this.delegates,
		});
	}

	async getRoundDelegates(round) {
		return this.delegates.getRoundDelegates(round);
	}

	async apply(block) {
		return this.apply.apply(block);
	}
};
