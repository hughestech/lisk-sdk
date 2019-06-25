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
import {
	calculateNewPeerBucketGroup,
	calculateTriedPeerBucketGroup,
} from './bucket_operations';

export class AddressBook {
	private readonly _bannedPeers: ReadonlyArray<P2PDiscoveredPeerInfo>;
	private readonly _newPeers: Map<number, Map<string, P2PPeerInfo>>;
	private readonly _triedPeers: Map<number, Map<string, P2PDiscoveredPeerInfo>>;
	public constructor() {
		this._newPeers = new Map();
		this._triedPeers = new Map();
		this._bannedPeers = [];
	}

	public static constructPeerIdFromPeerInfo = (peerInfo: P2PPeerInfo): string =>
		`${peerInfo.ipAddress}:${peerInfo.wsPort}`;

	public get newPeers(): ReadonlyArray<P2PPeerInfo> {
		const newPeersList = [...this._newPeers.values()].reduce(
			(peers, peerList) => [...peers, ...peerList.values()],
			[] as P2PPeerInfo[],
		);

		return newPeersList;
	}

	public get triedPeers(): ReadonlyArray<P2PDiscoveredPeerInfo> {
		const triedPeersList = [...this._triedPeers.values()].reduce(
			(peers, peerList) => [...peers, ...peerList.values()],
			[] as P2PDiscoveredPeerInfo[],
		);

		return triedPeersList;
	}

	public get bannedPeers(): ReadonlyArray<P2PDiscoveredPeerInfo> {
		return this._bannedPeers;
	}

	public addToNewPeers(peerInfo: P2PPeerInfo): void {
		if (this.updateNewPeer(peerInfo)) {
			return;
		}
		const bucketGroup = calculateNewPeerBucketGroup(peerInfo);
		const bucketPeers = this._newPeers.get(bucketGroup);
		const peerId = AddressBook.constructPeerIdFromPeerInfo(peerInfo);

		if (bucketPeers) {
			bucketPeers.set(peerId, peerInfo);
		} else {
			const peerSet = new Map<string, P2PPeerInfo>();
			this._newPeers.set(bucketGroup, peerSet.set(peerId, peerInfo));
		}
	}

	public addToTriedPeers(peerInfo: P2PDiscoveredPeerInfo): void {
		if (this.updateTriedPeer(peerInfo)) {
			return;
		}
		const bucketGroup = calculateTriedPeerBucketGroup(peerInfo);
		const bucketPeers = this._triedPeers.get(bucketGroup);
		const peerId = AddressBook.constructPeerIdFromPeerInfo(peerInfo);

		if (bucketPeers) {
			bucketPeers.set(peerId, peerInfo);
		} else {
			const peerSet = new Map<string, P2PDiscoveredPeerInfo>();
			this._triedPeers.set(bucketGroup, peerSet.set(peerId, peerInfo));
		}
	}

	public updateTriedPeer(peerInfo: P2PDiscoveredPeerInfo): boolean {
		// tslint:disable-next-line:no-let
		let ifExists = false;

		[...this._triedPeers.values()].forEach(peersMap => {
			const peerId = AddressBook.constructPeerIdFromPeerInfo(peerInfo);
			if (peersMap.has(peerId)) {
				peersMap.set(peerId, peerInfo);
				ifExists = true;

				return;
			}
		});

		return ifExists;
	}

	public updateNewPeer(peerInfo: P2PPeerInfo): boolean {
		// tslint:disable-next-line:no-let
		let ifExists = false;

		[...this._newPeers.values()].forEach(peersMap => {
			const peerId = AddressBook.constructPeerIdFromPeerInfo(peerInfo);
			if (peersMap.has(peerId)) {
				peersMap.set(peerId, peerInfo);
				ifExists = true;

				return;
			}
		});

		return ifExists;
	}

	public removeFromNewPeers(peerInfo: P2PPeerInfo): void {
		[...this._newPeers.values()].forEach(peersMap => {
			const peerId = AddressBook.constructPeerIdFromPeerInfo(peerInfo);
			peersMap.delete(peerId);
		});
	}

	public removeFromTriedPeers(peerInfo: P2PDiscoveredPeerInfo): void {
		[...this._triedPeers.values()].forEach(peersMap => {
			const peerId = AddressBook.constructPeerIdFromPeerInfo(peerInfo);
			peersMap.delete(peerId);
		});
	}

	public moveToNewPeers(peerInfo: P2PDiscoveredPeerInfo): void {
		this.removeFromTriedPeers(peerInfo);
		this.addToNewPeers(peerInfo);
	}

	public moveToTriedPeers(peerInfo: P2PDiscoveredPeerInfo): void {
		this.removeFromNewPeers(peerInfo);
		this.addToTriedPeers(peerInfo);
	}
}
