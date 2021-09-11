import zlib from "zlib";
import moment from "moment";

export function attempt(
  fn: (...any) => Promise<any>,
  { retries = 5, interval = 500, taskName = "", attemptIndex = 1 } = {}
): Promise<any> {
  return new Promise((resolve, reject) => {
    fn()
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        if (attemptIndex >= retries) {
          console.log(`Task ${taskName} failed (Nth = ${attemptIndex}). Exiting...`);
          reject(err);
        } else {
          // console.log(`Task ${taskName} failed (Nth = ${attemptIndex}). Retrying...`);

          setTimeout(() => {
            attempt(fn, { attemptIndex: attemptIndex + 1, taskName })
              .then((response) => {
                resolve(response);
              })
              .catch((err) => reject(err));
          }, interval);
        }
      });
  });
}

export function decompress(pipeStream): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    const gzip = zlib.createGunzip();

    pipeStream.data.pipe(gzip);

    gzip.on("error", (err) => reject(err));
    gzip.on("data", (chunk) => chunks.push(chunk));
    gzip.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
  });
}

export function splitArray(array, chunkSize) {
  return Array(Math.ceil(array.length / chunkSize))
    .fill(null)
    .map(function (_, i) {
      return array.slice(i * chunkSize, i * chunkSize + chunkSize);
    });
}

export function substractArrays(array1, array2) {
  var hash = Object.create(null);
  array2.forEach(function (a) {
    hash[a] = (hash[a] || 0) + 1;
  });
  return array1.filter(function (a) {
    return !hash[a] || (hash[a]--, false);
  });
}

export function removeDuplicates(array) {
  return Array.from(new Set(array));
}

export function getMonthsArray(
  from: moment.Moment = moment("2011-06"),
  to: moment.Moment = moment()
): Array<string> {
  const dateArray: Array<string> = [];

  for (let m = from; m.isBefore(to); m.add(1, "month")) {
    const date = m.format("YYYY-MMMM");
    dateArray.push(date);
  }

  return dateArray;
}

export function printOverwrite(str) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(str);
}

export default {
  attempt,
  decompress,
  splitArray,
  substractArrays,
  removeDuplicates,
  getMonthsArray,
  printOverwrite,
};
