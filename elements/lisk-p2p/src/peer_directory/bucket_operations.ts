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
 *
 */
import { P2PDiscoveredPeerInfo, P2PPeerInfo } from '../p2p_types';

export const PEER_LIST_SIZE = {
	newPeer: {
		NEW_PEERS_LIST_SIZE: 128,
		NEW_PEERS_BUCKET_SIZE: 32,
	},
	triedPeers: {
		TRIED_PEERS_LIST_SIZE: 64,
		TRIED_PEERS_BUCKET_SIZE: 32,
	},
};
// TODO:Implementation of prefix and bucket calculation missing
export const calculateIPPrefix = (ipAddress: string): number => {
	const prefix = +ipAddress.split('.')[0];

	return prefix;
};
// TODO: Add logic to calculate bucket and add it to bucket group based on LIPS
export const calculateNewPeerBucketGroup = (peerInfo: P2PPeerInfo): number => {
	// TODO: Based on IP, IP prefix and hash of random node secret with bucket size of 128
	const { ipAddress } = peerInfo;
	const bucket = calculateIPPrefix(ipAddress);

	return bucket;
};

// TODO: Add logic to calculate bucket and add it to bucket group based on LIPS
export const calculateTriedPeerBucketGroup = (
	peerInfo: P2PDiscoveredPeerInfo,
): number => {
	// TODO: Based on IP, IP prefix and hash of random node secret with bucket of 64
	const { ipAddress } = peerInfo;
	const bucket = calculateIPPrefix(ipAddress);

	return bucket;
};
