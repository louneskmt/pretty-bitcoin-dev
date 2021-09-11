import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Post from "App/Models/Post";

export default class PostsController {
  public async index() {
    return [
      {
        id: 1,
        title: "Hello world",
      },
      {
        id: 2,
        title: "Hello universe",
      },
    ];
  }

  public async show({ params }: HttpContextContract) {
    const { id } = params;

    const data = await Post.find(id);

    if (!data) return "404";

    return data;
  }
}
