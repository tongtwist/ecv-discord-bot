import {z} from "zod"
import type {TJSONObject, TJSON, TJSONArray} from "../../../utils/JSON.spec"
import type {IChannel} from "./Channel.spec"
import Channel from "./Channel"
import type {TConfig, IChannelsManager} from "../ChannelsManager.spec"

export default class ChannelsManager implements IChannelsManager {
	static readonly configSchema = z.array(Channel.configSchema)

	static create(cfg: TConfig): IChannelsManager {
		const channels = new Map<string, IChannel>()
		for (const channelConfig of cfg) {
			channels.set(channelConfig.id, Channel.create(channelConfig))
		}
		return new ChannelsManager(channels)
	}

	private constructor(private readonly _channels: Map<string, any>) {}

	toJSON(): TJSON {
		const ret: TJSONArray = []
		for (const channel of this._channels.values()) {
			ret.push(channel.toJSON())
		}
		return ret
	}

	get(id: string): IChannel | undefined {
		return this._channels.get(id)
	}
}
