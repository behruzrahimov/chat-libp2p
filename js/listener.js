import { createLibp2p } from "./libp2p.js";
import { stdinToStream, streamToConsole } from "./stream.js";
import { createFromJSON } from "@libp2p/peer-id-factory";
import peerIdListenerJson from "./peer-id-listener.js";

async function run() {
  const idListener = await createFromJSON(peerIdListenerJson);
  const nodeListener = await createLibp2p({
    peerId: idListener,
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/10333"],
    },
  });

  nodeListener.connectionManager.addEventListener("peer:connect", (evt) => {
    const connection = evt.detail;
    console.log("connected to: ", connection.remotePeer.toString());
  });

  await nodeListener.handle("/chat/1.0.0", async ({ stream }) => {
    stdinToStream(stream);
    streamToConsole(stream);
  });

  await nodeListener.start();

  console.log("Listener ready, listening on:");
  nodeListener.getMultiaddrs().forEach((ma) => {
    console.log(ma.toString());
  });
}

run();
