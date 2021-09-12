import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Post from "App/Models/Post";
import SearchService from "App/Services/SearchService";

export default class PostsController {
  public async index({}: HttpContextContract) {
    const posts = await Post.all();
    return posts;
  }

  public async getIds({}: HttpContextContract) {
    const query = Post.query();
    const list = await query.select("id").orderBy("id", "asc");
    const ids = list.map((post) => post.id);
    return ids;
  }

  public async search({ request }: HttpContextContract) {
    const filters = request.all();

    const result = await SearchService.searchPost(filters);

    return result;
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;

    const event = await Post.find(id);

    if (event) {
      return event.serialize();
    }

    response.safeStatus(404);
  }
}
