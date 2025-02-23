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

const Promise = require('bluebird');
const blockVersion = require('../../../../../src/modules/chain/blocks/block_version');
const QueriesHelper = require('../../../common/integration/sql/queries_helper');
const localCommon = require('../../common');

describe('validateOwnChain', () => {
	let library;
	let Queries;
	let addTransactionsAndForgePromise;

	localCommon.beforeBlock('validate_own_chain_full_two_rounds', lib => {
		library = lib;
		Queries = new QueriesHelper(lib, lib.components.storage);

		addTransactionsAndForgePromise = Promise.promisify(
			localCommon.addTransactionsAndForge
		);
	});

	describe('forge 3 rounds (303 blocks) with version = 0', () => {
		before(() => {
			// Set current block version to 0
			blockVersion.currentBlockVersion = 0;
			library.modules.blocks.blocksVerify.exceptions = {
				...library.modules.blocks.exceptions,
				blockVersions: {
					0: {
						start: 1,
						end: 303,
					},
				},
			};

			// Not consider the genesis block
			return Promise.mapSeries([...Array(101 * 3 - 1)], async () => {
				return addTransactionsAndForgePromise(library, [], 0);
			});
		});

		it('blockchain should be at height 303', async () => {
			const lastBlock = library.modules.blocks.lastBlock;
			return expect(lastBlock.height).to.eql(303);
		});

		it('all blocks should have version = 0', async () => {
			const version = 0;

			return Queries.getAllBlocks().then(rows => {
				_.each(rows, row => {
					expect(row.version).to.be.equal(version);
				});
			});
		});

		describe('increase block version = 1 and exceptions for height = 101', () => {
			let validateOwnChainError = null;

			before(async () => {
				// Set current block version to 1
				blockVersion.currentBlockVersion = 1;
				// Set proper exceptions for blocks versions
				library.modules.blocks.blocksVerify.exceptions = {
					...library.modules.blocks.exceptions,
					blockVersions: {
						0: {
							start: 1,
							end: 101,
						},
					},
				};

				try {
					await library.modules.blocks.blocksVerify.requireBlockRewind(
						library.modules.blocks.lastBlock
					);
					library.modules.blocks._lastBlock = await library.modules.blocks.blocksProcess.recoverInvalidOwnChain(
						library.modules.blocks.lastBlock,
						() => {}
					);
				} catch (error) {
					validateOwnChainError = error;
				}
			});

			it('there should be no error during chain validation', async () => {
				return expect(validateOwnChainError).to.be.eql(null);
			});

			it('blockchain should be at height 101', async () => {
				const lastBlock = library.modules.blocks.lastBlock;
				return expect(lastBlock.height).to.eql(101);
			});

			it('remaining blocks have version = 0', async () => {
				return Queries.getAllBlocks().then(rows => {
					_.each(rows, row => {
						expect(row.version).to.be.equal(0);
					});
				});
			});

			describe('forge 5 more blocks', () => {
				before(() => {
					return Promise.mapSeries([...Array(5)], async () => {
						return addTransactionsAndForgePromise(library, [], 0);
					});
				});

				it('blockchain should be at height 106', async () => {
					const lastBlock = library.modules.blocks.lastBlock;
					return expect(lastBlock.height).to.eql(106);
				});

				it('last 5 blocks should have version = 1', async () => {
					return Queries.getAllBlocks().then(rows => {
						_.each(rows, row => {
							if (row.height > 101) {
								expect(row.version).to.be.equal(1);
							}
						});
					});
				});
			});
		});
	});
});
