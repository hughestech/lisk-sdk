/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const {
	BlockSlots,
} = require('../../../../../../src/modules/chain/blocks/block_slots');

describe('BlockSlots', () => {
	let slots;

	beforeEach(async () => {
		slots = new BlockSlots({
			epochTime: __testContext.config.constants.EPOCH_TIME,
			interval: __testContext.config.constants.BLOCK_TIME,
			blocksPerRound: __testContext.config.constants.ACTIVE_DELEGATES,
		});
	});

	describe('calc', () => {
		it('should calculate round number from given block height', async () => {
			expect(slots.calcRound(100)).equal(1);
			expect(slots.calcRound(200)).equal(2);
			expect(slots.calcRound(303)).equal(3);
			return expect(slots.calcRound(304)).equal(4);
		});

		it('should calculate round number from Number.MAX_VALUE', async () => {
			const res = slots.calcRound(Number.MAX_VALUE);
			expect(_.isNumber(res)).to.be.ok;
			return expect(res).to.be.below(Number.MAX_VALUE);
		});
	});
});
