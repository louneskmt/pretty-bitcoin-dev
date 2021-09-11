import axios, { AxiosRequestConfig } from "axios";

import Helpers from "App/Helpers/helpers";

class PipermailService {
  public static async getLongIdFromUrl(url: string): Promise<string> {
    const options = <AxiosRequestConfig>{
      url,
      method: "GET",
      timeout: 10000,
    };

    try {
      const response = await Helpers.attempt(() => axios(options), {
        taskName: `getLongIdFromUrl for ${url}`,
      });

      if (response.status === 200) {
        const longId = decodeURIComponent(
          response.data.match(/"mailto:.*In-Reply-To=%3C(?<longId>.*)%3E"/).groups.longId
        );
        return longId;
      }

      throw new Error("Response code is not 200 OK.");
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log(`Error 404: ${url}`);
        return "";
      } else {
        console.log(`Error fetching ${url} longId.`);
        throw new Error(err);
      }
    }
  }

  public static async mapLongShortIds(urlsArray: Array<string>): Promise<Map<string, number>> {
    const map: Map<string, number> = new Map();

    for (const urls of Helpers.splitArray(urlsArray, 100)) {
      const promises: Promise<void>[] = [];

      urls.forEach((url) => {
        const id: number = Number(url.match(/.*\/(?<id>.*).html/)!.groups!.id);
        promises.push(
          new Promise((resolve, reject) => {
            PipermailService.getLongIdFromUrl(url)
              .then((longId: string) => {
                map.set(longId, id);
                resolve();
              })
              .catch((err) => reject(err));
          })
        );
      });

      await Promise.all(promises);
    }

    return map;
  }

  public static parseMessages(data: string) {
    const regex: RegExp =
      /From .* at .*\nFrom: (?<mail>.*) at (?<domain>.*) \((?<name>.*)\)\nDate: (?<date>.*)\nSubject: (?<subject>(?:.|\n|\t)+?(?=Message-ID|In-Reply-To|References))(?:In-Reply-To: <(?<inReplyTo>.*)>\n)?(?:References: (?<references>(?:.|\n|\t)+?(?=Message-ID)))?Message-ID: <(?<id>.*)>\n*(?<content>[\w\W]*?)(?=From|$)/gu;
    const matches = data.matchAll(regex);

    const messages: object[] = [];

    for (const match of matches) {
      const groups = match.groups!;

      groups.subject = groups.subject.replace(/\n|\t/gm, "");
      groups.content = groups.content.replace(/\n+$/g, "");

      const message = {
        longId: groups.id,
        fromAddress: `${groups.mail}@${groups.domain}`,
        fromName: groups.name,
        date: new Date(new Date(groups.date).toUTCString()),
        subject: groups.subject,
        inReplyTo: groups.inReplyTo ? groups.inReplyTo : "",
        references: groups.references
          ? Array.from(groups.references.matchAll(/<(?<id>.*)>/gm), (m) => m.groups!.id)
          : [],
        content: groups.content,
      };

      messages.push(message);
    }

    return messages;
  }
}

export default PipermailService;
