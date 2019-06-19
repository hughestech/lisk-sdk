const { getAddressFromPublicKey } = require('@liskhq/lisk-cryptography');

class Apply {
	constructor({ storage, slots, activeDelegates, logger, delegates }) {
		this.storage = storage;
		this.slots = slots;
		this.activeDelegates = activeDelegates;
		this.logger = logger;
		this.delegates = delegates;
	}

	async apply(block) {
		const round = this.slots.calcRound(block.height);

		await this.updateProducedBlocks(block);
		await this.updateVotes(round);

		if (this.hasRoundFinished(block)) {
			const summarizedRound = await this.summarizeRound(block);
			const unfortunateDelegateAddresses = await this.unfortunateDelegateAddresses(
				round,
				summarizedRound.delegates
			);
			await this.updateMissedBlocks(unfortunateDelegateAddresses);
		}
	}

	hasRoundFinished(block) {
		const round = this.slots.calcRound(block.height);
		const nextRound = this.slots.calcRound(block.height + 1);

		return round < nextRound || block.height === 1 || block.height === 101;
	}

	async updateProducedBlocks(block, increase = true, tx) {
		const address = getAddressFromPublicKey(block.generatorPublicKey);

		const filters = { address_eq: address };
		const field = 'producedBlocks';
		const value = increase ? '1' : '-1';
		const method = increase ? 'increaseFieldBy' : 'decreaseFieldBy';

		return this.storage.entities.Account[method](filters, field, value, tx);
	}

	async summarizeRound(block) {
		const round = this.slots.calcRound(block.height);
		this.logger.debug('Calculating rewards and fees for round: ', round);

		// When we need to sum round just after genesis block (height: 1)
		// - set data manually to 0, they will be distributed when actual round 1 is summed
		if (block.height === 1) {
			return {
				fees: 0,
				rewards: [0],
				delegates: [block.generatorPublicKey],
			};
		}

		try {
			const row = await this.storage.entities.Round.summedRound(
				round,
				this.activeDelegates
			)[0];

			return {
				fees: Math.floor(row.fees),
				rewards: row.rewards.map(reward => Math.floor(reward)),
				delegates: row.delegates,
			};
		} catch (err) {
			this.logger.error('Failed to sum round', round);
			this.logger.error(err);
			throw err;
		}
	}

	async getUnfortunateDelegateAddresses(round, forgedDelegatesPks) {
		const roundDelegatesPks = await this.delegates.generateActiveDelegateList(
			round
		);

		const unfortunateDelegateAddresses = roundDelegatesPks
			.filter(roundDelegatePk => !forgedDelegatesPks.includes(roundDelegatePk))
			.map(delegate => getAddressFromPublicKey(delegate));

		return unfortunateDelegateAddresses;
	}

	async updateMissedBlocks(unfortunateDelegateAddresses, undo = false, tx) {
		const filters = { address_in: unfortunateDelegateAddresses };
		const field = 'missedBlocks';
		const value = '1';

		const method = undo ? 'decreaseFieldBy' : 'increaseFieldBy';

		return this.storage.entities.Account[method](filters, field, value, tx);
	}

	async updateVotes(round) {
		const votes = await this.storage.entities.Round.getTotalVotedAmount({
			round,
		});

		const queries = votes.map(vote =>
			this.storage.entities.Account.increaseFieldBy(
				{
					address: getAddressFromPublicKey(vote.delegate),
				},
				'vote',
				// Have to revert the logic to not use bignumber. it was causing change
				// in vote amount. More details can be found on the issue.
				// 		new Bignum(vote.amount).integerValue(Bignum.ROUND_FLOOR)
				// TODO: https://github.com/LiskHQ/lisk/issues/2423
				Math.floor(vote.amount)
			)
		);

		// @todo t.batch(queries)

		return queries;
	}
}

module.exports = { Apply };
