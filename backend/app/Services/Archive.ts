import axios, { AxiosRequestConfig } from "axios";

import PostModel from "App/Models/Post";
import ArchiveModel from "App/Models/Archive";
import Helpers from "App/Helpers/helpers";
import PipermailService from "App/Services/PipermailService";

class Archive {
  public baseUrl: string;
  public date: string;
  public content: string;
  public model = ArchiveModel;

  constructor(date: string) {
    this.date = date;
    this.baseUrl = `http://lists.linuxfoundation.org/pipermail/bitcoin-dev/${this.date}`;
  }

  public async create() {
    await this.model.firstOrCreate({ date: this.date });
  }

  public async fetch() {
    const options = <AxiosRequestConfig>{
      url: `${this.baseUrl}.txt.gz`,
      method: "GET",
      responseType: "stream",
      timeout: 0,
    };

    try {
      this.log("Downloading archive...");

      const response = await Helpers.attempt(() => axios(options), {
        taskName: `download ${this.date}`,
      });
      this.content = await Helpers.decompress(response);

      const archive = { date: this.date, content: this.content };

      await this.model.updateOrCreate({ date: this.date }, archive);

      this.log("Downloaded!");

      return archive;
    } catch (err) {
      this.log("Error downloading.");
      throw new Error(err);
    }
  }

  public async getIdsList(): Promise<number[]> {
    // this.log("Fetching IDs...");

    const options = <AxiosRequestConfig>{
      url: `${this.baseUrl}/date.html`,
      method: "GET",
      timeout: 15000,
    };

    try {
      const response = await Helpers.attempt(() => axios(options), {
        taskName: `getIdsList for ${this.date}`,
      });

      if (response.status === 200) {
        const ids: number[] = [];

        let match;
        const pattern = /href=\"(?<id>.*).html\"/gi;
        while ((match = pattern.exec(response.data))) {
          ids.push(Number(match[1]));
        }

        // this.log("Done fetching Ids!");

        return ids;
      }

      throw new Error("Response code is not 200 OK.");
    } catch (err) {
      this.log("Error fetching Ids.");
      throw new Error(err);
    }
  }

  public async getMissingMessagesIds() {
    const ids: number[] = await this.getIdsList();
    const existingPosts: PostModel[] = await PostModel.findMany(ids);
    const existingIds: number[] = existingPosts.map((post) => post.id);

    return Helpers.substractArrays(Helpers.removeDuplicates(ids), existingIds);
  }

  public async getMapLongShortIds(): Promise<Map<string, number>> {
    const missingMessagesIds = await this.getMissingMessagesIds();
    const urls: string[] = missingMessagesIds.map(
      (id: number) => `${this.baseUrl}/${"0".repeat(6 - id.toString().length)}${id}.html`
    );

    this.log(`Getting ${urls.length} Ids...`);
    const mapIds: Map<string, number> = await PipermailService.mapLongShortIds(urls);
    this.log(`Done getting ${urls.length} Ids!`);

    return mapIds;
  }

  public async importMessages() {
    if (!this.content) {
      await this.fetch();
    }

    const messages: any[] = PipermailService.parseMessages(this.content);
    const mapIds: Map<string, number> = await this.getMapLongShortIds();

    let inserted: number = 0;
    for (const index in messages) {
      const message = messages[index];

      message.id = mapIds.get(message.longId);
      if (message.id === undefined) continue;

      const post = await PostModel.firstOrCreate({ id: message.id }, message).catch((err) => {
        throw new Error(`Error inserting message: ${err} ${message}`);
      });

      if (!post.$isPersisted) {
        this.log(`Post ID ${message.id} hasn't been inserted.`);
      } else {
        inserted += 1;
      }
    }

    this.log(`Inserted ${inserted}/${mapIds.size} documents.`);
  }

  public log(str) {
    console.log(`[${this.date.toUpperCase()}] ${str}`);
  }
}

export default Archive;
