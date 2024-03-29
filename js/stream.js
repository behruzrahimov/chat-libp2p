/* eslint-disable no-console */

import { pipe } from "it-pipe";
import * as lp from "it-length-prefixed";
import map from "it-map";

function uint8ArrayToString(buf) {
  return new TextDecoder().decode(buf);
}
function uint8ArrayFromString(str) {
  return new TextEncoder().encode(str);
}
export function stdinToStream(stream) {
  // Read utf-8 from stdin
  process.stdin.setEncoding("utf8");
  pipe(
    // Read from stdin (the source)
    process.stdin,
    // Turn strings into buffers
    (source) => map(source, (string) => uint8ArrayFromString(string)),
    // Encode with length prefix (so receiving side knows how much data is coming)
    lp.encode(),
    // Write to the stream (the sink)
    stream.sink
  );
}

export function streamToConsole(stream) {
  pipe(
    // Read from the stream (the source)
    stream.source,
    // Decode length-prefixed data
    lp.decode(),
    // Turn buffers into strings
    (source) => map(source, (buf) => uint8ArrayToString(buf.subarray())),
    // Sink function
    async function (source) {
      // For each chunk of data
      for await (const msg of source) {
        // Output the data as a utf8 string
        console.log("> " + msg.toString().replace("\n", ""));
      }
    }
  );
}
