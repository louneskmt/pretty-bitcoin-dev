import Fuse from "fuse.js";

import Post from "App/Models/Post";

interface Filters {
  id?: number;
  from_name?: string;
  from_address?: string;
  keys?: string[],
  pattern?: string;
}

class SearchService {
  public static async searchPost(filters: Filters) {
    const query = Post.query();

    if (filters.id) {
      query.where("id", filters.id);
    }

    if (filters.from_name) {
      query.where("from_name", filters.from_name);
    }

    if (filters.from_address) {
      query.where("from_address", filters.from_address);
    }

    let result: any = await query;
    if(filters.pattern) {
      if(filters.keys === undefined) {
        filters.keys = [ "subject", "content" ];
      }
      result = await SearchService.fuseSearch(result, filters.keys, filters.pattern);
    }

    return result;
  }

  public static async fuseSearch(data: Object[], keys: string[], pattern: string) {
    const options = {
      threshold: 0.3,
      keys
    };

    const fuse = new Fuse(data, options);
    const result = fuse.search(pattern).map(i => i.item);

    return result;
  }
}

export default SearchService;
