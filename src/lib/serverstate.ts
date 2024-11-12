import { type Cache, createTimedCache} from  '$lib/cache'



export const searchcache = createTimedCache<string>()
// map category id to category names
export const categoryId2Names = createTimedCache<string>()
export const title2category = createTimedCache<string>()