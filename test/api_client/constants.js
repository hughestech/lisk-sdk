/*
 * Copyright © 2017 Lisk Foundation
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
 *
 */
import {
	GET,
	POST,
	PUT,
	API_RECONNECT_MAX_RETRY_COUNT,
	BETANET_NETHASH,
	BETANET_NODES,
	TESTNET_NETHASH,
	TESTNET_NODES,
	MAINNET_NETHASH,
	MAINNET_NODES,
} from 'api_client/constants';

describe('api constants module', () => {
	it('GET should be a string', () => {
		return expect(GET).to.be.a('string');
	});

	it('POST should be a string', () => {
		return expect(POST).to.be.a('string');
	});

	it('PUT should be a string', () => {
		return expect(PUT).to.be.a('string');
	});

	it('API_RECONNECT_MAX_RETRY_COUNT should be an integer', () => {
		return expect(API_RECONNECT_MAX_RETRY_COUNT).to.be.an.integer;
	});

	it('BETANET_NETHASH should be a string', () => {
		return expect(BETANET_NETHASH).to.be.a('string');
	});

	it('BETANET_NODES should be an array of strings', () => {
		expect(BETANET_NODES).to.be.an('array');
		return BETANET_NODES.forEach(node => expect(node).to.be.a('string'));
	});

	it('TESTNET_NETHASH should be a string', () => {
		return expect(TESTNET_NETHASH).to.be.a('string');
	});

	it('TESTNET_NODES should be an array of strings', () => {
		expect(TESTNET_NODES).to.be.an('array');
		return TESTNET_NODES.forEach(node => expect(node).to.be.a('string'));
	});

	it('MAINNET_NETHASH should be a string', () => {
		return expect(MAINNET_NETHASH).to.be.a('string');
	});

	it('MAINNET_NODES should be an array of strings', () => {
		expect(MAINNET_NODES).to.be.an('array');
		return MAINNET_NODES.forEach(node => expect(node).to.be.a('string'));
	});
});
