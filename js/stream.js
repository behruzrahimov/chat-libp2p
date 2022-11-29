import { pipe } from "it-pipe";
import * as lp from "it-length-prefixed";
import map from "it-map";
export function stdinToStream(stream) {
  process.stdin.setEncoding("utf8");
  pipe(
    process.stdin,
    (source) => map(source, (string) => string),
    lp.encode(),
    stream.sink
  );
}

export function streamToConsole(stream) {
  pipe(
    stream.source,
    lp.decode(),
    (source) => map(source, (buf) => buf.subarray()),
    async function (source) {
      for await (const msg of source) {
        console.log("> " + msg.toString().replace("\n", ""));
      }
    }
  );
}
