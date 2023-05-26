import { reactive, ref } from "vue";
import { getMainPlacesCount } from '@/response/api'

export const main_watcher = reactive(ref(false))
export const map_watcher = reactive(ref(false))
export const dynamics_watcher = reactive(ref(false))
export const lang_watcher = reactive(ref(false))
export const resource_watcher = reactive(ref(false))


export function main_watcher_updates() {
	if (main_watcher.value) {
		getMainPlacesCount()
		main_watcher.value = false
	}
}